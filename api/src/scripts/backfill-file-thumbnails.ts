/**
 * Backfill thumbnailFileId for existing raster images in the files collection.
 *
 * Downloads each original from MinIO, generates a WebP thumbnail (same pipeline as
 * upload), stores the thumbnail as a separate files row, and links it on the source.
 *
 * Run from api/:
 *   npm run migrate:file-thumbnails
 *   npm run migrate:file-thumbnails -- --dry-run
 *   npm run migrate:file-thumbnails -- --limit=50
 *   npm run migrate:file-thumbnails -- --file-id=<mongoId>
 */
import { randomUUID } from "crypto";
import { basename, extname } from "path";
import { resolve } from "path";
import { config } from "dotenv";
import { Client as MinioClient } from "minio";
import mongoose, { Types } from "mongoose";
import type { Readable } from "stream";

import { SecurityConfig } from "../config/security.config";
import { ImageCompressionService } from "../modules/file/image-compression.service";
import { THUMBNAIL_FILE_NAME_SUFFIX } from "../modules/file/image-thumbnail.constants";

config({ path: resolve(process.cwd(), ".env") });

type StoredFileRecord = {
  _id: Types.ObjectId;
  name: string;
  mimeType: string;
  sizeBytes: number;
  path: string;
  bucket: string;
  objectKey: string;
  uploadedAt?: Date;
  thumbnailFileId?: Types.ObjectId | null;
  audit?: {
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  };
};

type MinioEnv = {
  endpoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
};

type ScriptOptions = {
  dryRun: boolean;
  limit?: number;
  fileId?: string;
};

type BackfillStats = {
  scanned: number;
  eligible: number;
  created: number;
  skipped: number;
  failed: number;
};

const imageCompressionService = new ImageCompressionService();

function parseScriptOptions(): ScriptOptions {
  const dryRun = process.argv.includes("--dry-run");
  const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
  const fileIdArg = process.argv.find((arg) => arg.startsWith("--file-id="));

  const limitValue = limitArg?.split("=")[1]?.trim();
  const parsedLimit = limitValue ? Number.parseInt(limitValue, 10) : undefined;
  const limit =
    parsedLimit != null && Number.isFinite(parsedLimit) && parsedLimit > 0
      ? parsedLimit
      : undefined;

  const fileId = fileIdArg?.split("=")[1]?.trim() || undefined;

  return { dryRun, limit, fileId };
}

function getRequiredEnv(name: "MONGODB_URI" | "MONGODB_DATABASE"): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getMinioEnv(): MinioEnv {
  const rawEndpoint = process.env.MINIO_ENDPOINT?.replace(
    /^https?:\/\//,
    "",
  )?.split("/")[0];
  const rawPort = Number.parseInt(process.env.MINIO_PORT || "9000", 10);
  const rawUseSSL = process.env.MINIO_USE_SSL === "true";
  const shouldUseConsoleHostMapping =
    rawEndpoint?.startsWith("minio.") && rawPort === 443;

  const endpoint = shouldUseConsoleHostMapping
    ? rawEndpoint!.replace(/^minio\./, "")
    : rawEndpoint;
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;
  const bucket = process.env.MINIO_BUCKET;

  if (!endpoint || !accessKey || !secretKey || !bucket) {
    throw new Error(
      "MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, and MINIO_BUCKET are required.",
    );
  }

  return {
    endpoint,
    port: shouldUseConsoleHostMapping ? 9000 : rawPort,
    useSSL: shouldUseConsoleHostMapping ? false : rawUseSSL,
    accessKey,
    secretKey,
    bucket,
  };
}

function createMinioClient(minioEnv: MinioEnv): MinioClient {
  return new MinioClient({
    endPoint: minioEnv.endpoint,
    port: minioEnv.port,
    useSSL: minioEnv.useSSL,
    accessKey: minioEnv.accessKey,
    secretKey: minioEnv.secretKey,
  });
}

function buildThumbnailObjectName(uploadedAt: Date): string {
  const year = uploadedAt.getUTCFullYear();
  const month = String(uploadedAt.getUTCMonth() + 1).padStart(2, "0");
  const day = String(uploadedAt.getUTCDate()).padStart(2, "0");

  return `${year}/${month}/${day}/${randomUUID()}${THUMBNAIL_FILE_NAME_SUFFIX}`;
}

function buildThumbnailFileName(sourceName: string): string {
  const baseName = basename(sourceName, extname(sourceName)) || "image";
  return `${baseName}${THUMBNAIL_FILE_NAME_SUFFIX}`;
}

function isStoredThumbnailRow(file: StoredFileRecord): boolean {
  if (file.name.endsWith(THUMBNAIL_FILE_NAME_SUFFIX)) {
    return true;
  }

  return file.objectKey.endsWith(THUMBNAIL_FILE_NAME_SUFFIX);
}

function resolveUploadedAt(file: StoredFileRecord): Date {
  return file.uploadedAt ?? file.audit?.createdAt ?? new Date();
}

async function readStreamToBuffer(
  stream: Readable,
  maxSizeBytes: number,
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let totalLength = 0;

  for await (const chunk of stream) {
    const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalLength += bufferChunk.length;

    if (totalLength > maxSizeBytes) {
      throw new Error(
        `Object exceeds max readable size (${maxSizeBytes} bytes).`,
      );
    }

    chunks.push(bufferChunk);
  }

  return Buffer.concat(chunks, totalLength);
}

async function loadReferencedThumbnailIds(
  filesCollection: mongoose.mongo.Collection<StoredFileRecord>,
): Promise<Types.ObjectId[]> {
  const values = await filesCollection.distinct("thumbnailFileId", {
    thumbnailFileId: { $exists: true, $ne: null },
    "audit.deletedAt": { $exists: false },
  });

  return values
    .map((value) => {
      if (value instanceof Types.ObjectId) {
        return value;
      }

      const asString = String(value).trim();
      return Types.ObjectId.isValid(asString)
        ? new Types.ObjectId(asString)
        : null;
    })
    .filter((value): value is Types.ObjectId => value != null);
}

function buildCandidateQuery(
  referencedThumbnailIds: Types.ObjectId[],
  fileId?: string,
): Record<string, unknown> {
  const query: Record<string, unknown> = {
    $or: [{ thumbnailFileId: { $exists: false } }, { thumbnailFileId: null }],
    "audit.deletedAt": { $exists: false },
  };

  if (referencedThumbnailIds.length > 0) {
    query._id = { $nin: referencedThumbnailIds };
  }

  if (fileId) {
    if (!Types.ObjectId.isValid(fileId)) {
      throw new Error(`Invalid --file-id value: ${fileId}`);
    }

    query._id = new Types.ObjectId(fileId);
  }

  return query;
}

async function createThumbnailForFile(params: {
  sourceFile: StoredFileRecord;
  minioClient: MinioClient;
  filesCollection: mongoose.mongo.Collection<StoredFileRecord>;
  dryRun: boolean;
}): Promise<"created" | "skipped"> {
  const { sourceFile, minioClient, filesCollection, dryRun } = params;

  if (isStoredThumbnailRow(sourceFile)) {
    return "skipped";
  }

  if (
    !imageCompressionService.shouldGenerateThumbnail(
      sourceFile.mimeType,
      sourceFile.name,
    )
  ) {
    return "skipped";
  }

  if (dryRun) {
    console.log(
      `[dry-run] Would create thumbnail for ${sourceFile._id.toString()} (${sourceFile.name})`,
    );
    return "created";
  }

  const maxReadableBytes = Math.max(
    SecurityConfig.getMaxRequestSize(),
    sourceFile.sizeBytes,
  );
  const stream = await minioClient.getObject(
    sourceFile.bucket,
    sourceFile.objectKey,
  );
  const sourceBuffer = await readStreamToBuffer(stream, maxReadableBytes);

  const thumbnailOutcome = await imageCompressionService.generateThumbnail(
    sourceBuffer,
    sourceFile.mimeType,
    sourceFile.name,
  );

  if (!thumbnailOutcome) {
    throw new Error("Thumbnail generation returned no output.");
  }

  const uploadedAt = resolveUploadedAt(sourceFile);
  const objectKey = buildThumbnailObjectName(uploadedAt);
  const thumbnailName = buildThumbnailFileName(sourceFile.name);
  const bucket = sourceFile.bucket;

  await minioClient.putObject(
    bucket,
    objectKey,
    thumbnailOutcome.buffer,
    thumbnailOutcome.buffer.length,
    {
      "Content-Type": thumbnailOutcome.mimeType,
      "X-Amz-Meta-Original-Name": encodeURIComponent(thumbnailName),
    },
  );

  const thumbnailFileId = new Types.ObjectId();
  const now = new Date();
  const thumbnailRecord: StoredFileRecord = {
    _id: thumbnailFileId,
    name: thumbnailName,
    mimeType: thumbnailOutcome.mimeType,
    sizeBytes: thumbnailOutcome.buffer.length,
    path: `${bucket}/${objectKey}`,
    bucket,
    objectKey,
    uploadedAt,
    audit: {
      createdAt: now,
      updatedAt: now,
    },
  };

  await filesCollection.insertOne(thumbnailRecord);

  const updateResult = await filesCollection.updateOne(
    {
      _id: sourceFile._id,
      $or: [{ thumbnailFileId: { $exists: false } }, { thumbnailFileId: null }],
    },
    {
      $set: {
        thumbnailFileId,
        "audit.updatedAt": now,
      },
    },
  );

  if (updateResult.modifiedCount !== 1) {
    throw new Error(
      "Thumbnail row was created but source file was not updated (possibly already linked).",
    );
  }

  console.log(
    `Created thumbnail ${thumbnailFileId.toString()} for ${sourceFile._id.toString()} (${sourceFile.name})`,
  );

  return "created";
}

async function backfillFileThumbnails(): Promise<void> {
  const options = parseScriptOptions();
  const uri = getRequiredEnv("MONGODB_URI");
  const databaseName = getRequiredEnv("MONGODB_DATABASE");
  const minioEnv = getMinioEnv();
  const minioClient = createMinioClient(minioEnv);

  await mongoose.connect(uri, { dbName: databaseName });
  const filesCollection =
    mongoose.connection.db.collection<StoredFileRecord>("files");

  const referencedThumbnailIds =
    await loadReferencedThumbnailIds(filesCollection);
  const query = buildCandidateQuery(referencedThumbnailIds, options.fileId);
  const cursor = filesCollection.find(query).sort({ "audit.createdAt": 1 });

  const stats: BackfillStats = {
    scanned: 0,
    eligible: 0,
    created: 0,
    skipped: 0,
    failed: 0,
  };

  console.log(
    `Starting file thumbnail backfill${options.dryRun ? " (dry run)" : ""}...`,
  );
  if (options.fileId) {
    console.log(`Filtering to file id: ${options.fileId}`);
  }
  if (options.limit) {
    console.log(`Processing at most ${options.limit} eligible file(s).`);
  }

  for await (const file of cursor) {
    if (options.limit != null && stats.created >= options.limit) {
      break;
    }

    stats.scanned += 1;

    if (isStoredThumbnailRow(file)) {
      stats.skipped += 1;
      continue;
    }

    if (
      !imageCompressionService.shouldGenerateThumbnail(file.mimeType, file.name)
    ) {
      stats.skipped += 1;
      continue;
    }

    stats.eligible += 1;

    try {
      const outcome = await createThumbnailForFile({
        sourceFile: file,
        minioClient,
        filesCollection,
        dryRun: options.dryRun,
      });

      if (outcome === "created") {
        stats.created += 1;
      } else {
        stats.skipped += 1;
      }
    } catch (error) {
      stats.failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `Failed for ${file._id.toString()} (${file.name}): ${message}`,
      );
    }
  }

  console.log(
    [
      "File thumbnail backfill complete.",
      `Scanned ${stats.scanned}.`,
      `Eligible ${stats.eligible}.`,
      `${options.dryRun ? "Would create" : "Created"} ${stats.created}.`,
      `Skipped ${stats.skipped}.`,
      `Failed ${stats.failed}.`,
    ].join(" "),
  );

  await mongoose.disconnect();
}

void backfillFileThumbnails().catch((error: unknown) => {
  console.error("File thumbnail backfill failed.", error);
  process.exitCode = 1;
});
