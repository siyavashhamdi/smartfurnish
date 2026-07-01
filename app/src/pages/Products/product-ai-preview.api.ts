import { LOCAL_STORAGE_KEYS } from "../../constants";
import {
  FILE_UPLOAD_POLICY,
  FILE_UPLOAD_POLICY_MAX_SIZE_BYTES,
} from "../../constants/fileUploadPolicies";
import { PRODUCT_AI_PREVIEW_STAGING_DURATION_QUERY } from "../../graphql/queries/productAiPreviewStagingDuration.query";
import { apolloClient } from "../../lib/apollo-client";
import { resolveApiUrl } from "../../utils/apiBaseUrl.util";
import { getFileIdFromAccessUrl } from "../../utils/fileAccessUrl.util";
import { FileUploadError, uploadFile } from "../../utils/fileUpload.util";
import { resolveErrorMessageFromCode } from "../../utilities/graphql-error.util";
import { reloadPageOnUnauthenticated } from "../../lib/auth-unauthenticated-reload.util";

export type ProductAiPreviewProgress = {
  readonly step: string;
  readonly label: string;
  readonly percent: number;
};

export type ProductAiPreviewStageResult = {
  readonly image: string;
  readonly durationSeconds: number;
  readonly description: string | null;
  readonly product: {
    readonly id: string;
    readonly title: string;
  };
  readonly fabric: {
    readonly patternName: string;
    readonly colorName: string;
    readonly colorHex?: string;
    readonly label: string;
  };
};

type ApiEnvelope<T> = {
  readonly success?: boolean;
  readonly data?: T;
};

type ProductAiPreviewStagingDurationQueryResult = {
  readonly productAiPreviewStagingDuration?: {
    readonly durationSeconds?: number;
  };
};

type SseErrorPayload = {
  readonly message?: string;
};

const STAGE_PATH = "/api/v1/products/ai-preview/stage";
const ROOM_PHOTO_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

async function parseError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ApiEnvelope<{
      readonly message?: string | string[];
      readonly error?: string;
    }> & {
      readonly message?: string | string[];
      readonly error?: { readonly message?: string };
    };

    const nestedMessage = payload.data?.message ?? payload.message;
    const errorMessage = payload.error?.message;

    if (typeof errorMessage === "string" && errorMessage.trim()) {
      return errorMessage.trim();
    }

    if (Array.isArray(nestedMessage) && nestedMessage.length > 0) {
      return nestedMessage.join(" ");
    }

    if (typeof nestedMessage === "string" && nestedMessage.trim()) {
      return nestedMessage.trim();
    }

    return `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

const AI_PREVIEW_FALLBACK_MESSAGE =
  "امکان تولید پیش‌نمایش هوشمند وجود ندارد. لطفاً بعداً دوباره تلاش کنید.";

function resolveAiPreviewErrorMessage(
  code: string | undefined,
  fallback = AI_PREVIEW_FALLBACK_MESSAGE,
): string {
  const normalizedCode = code?.trim();
  if (!normalizedCode) {
    return fallback;
  }

  if (/^[A-Z][A-Z0-9_]+$/.test(normalizedCode)) {
    return resolveErrorMessageFromCode(normalizedCode);
  }

  return fallback;
}

export function getProductAiPreviewErrorMessage(
  error: unknown,
  fallback: string = AI_PREVIEW_FALLBACK_MESSAGE,
): string {
  if (error instanceof Error && error.message.trim()) {
    return resolveAiPreviewErrorMessage(error.message, fallback);
  }

  if (typeof error === "string" && error.trim()) {
    return resolveAiPreviewErrorMessage(error, fallback);
  }

  return fallback;
}

function parseSseBlock(block: string): { event: string; data: string } | null {
  const lines = block.split("\n").filter(Boolean);
  let event = "message";
  let data = "";

  for (const line of lines) {
    if (line.startsWith("event:")) {
      event = line.slice("event:".length).trim();
    }

    if (line.startsWith("data:")) {
      data = line.slice("data:".length).trim();
    }
  }

  if (!data) {
    return null;
  }

  return { event, data };
}

async function readStageStream(
  response: Response,
  onProgress?: (progress: ProductAiPreviewProgress) => void,
): Promise<ProductAiPreviewStageResult> {
  if (!response.body) {
    throw new Error("Streaming response is not supported in this browser.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: ProductAiPreviewStageResult | null = null;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";

    for (const block of blocks) {
      const parsed = parseSseBlock(block);

      if (!parsed) {
        continue;
      }

      if (parsed.event === "progress") {
        onProgress?.(JSON.parse(parsed.data) as ProductAiPreviewProgress);
        continue;
      }

      if (parsed.event === "error") {
        const payload = JSON.parse(parsed.data) as SseErrorPayload;
        const message = payload.message?.trim();

        if (message) {
          throw new Error(resolveAiPreviewErrorMessage(message));
        }

        throw new Error(resolveAiPreviewErrorMessage("PRODUCT_AI_PREVIEW_GENERATION_FAILED"));
      }

      if (parsed.event === "complete") {
        result = JSON.parse(parsed.data) as ProductAiPreviewStageResult;
        onProgress?.({
          step: "complete",
          label: "پیش‌نمایش هوشمند آماده است.",
          percent: 100,
        });
      }
    }
  }

  if (!result) {
    throw new Error("Generation finished without a result.");
  }

  return result;
}

export async function fetchProductAiPreviewStagingDurationSeconds(): Promise<number> {
  const result = await apolloClient.query<ProductAiPreviewStagingDurationQueryResult>({
    query: PRODUCT_AI_PREVIEW_STAGING_DURATION_QUERY,
    fetchPolicy: "network-only",
  });

  const durationSeconds = result.data?.productAiPreviewStagingDuration?.durationSeconds;

  if (typeof durationSeconds !== "number" || !Number.isFinite(durationSeconds)) {
    throw new Error("Staging duration is unavailable.");
  }

  return durationSeconds;
}

export async function uploadProductAiPreviewRoomPhoto(
  file: File,
  accessToken?: string | null,
): Promise<string> {
  const uploadedEnvironment = await uploadFile(file, {
    accessToken,
    policy: FILE_UPLOAD_POLICY.AI_PREVIEW_ROOM,
    accept: ROOM_PHOTO_ACCEPT,
    maxSizeBytes: FILE_UPLOAD_POLICY_MAX_SIZE_BYTES.AI_PREVIEW_ROOM,
  });
  const environmentFileId = getFileIdFromAccessUrl(uploadedEnvironment.accessUrl);

  if (!environmentFileId) {
    throw new Error("Room photo upload did not return a file id.");
  }

  return environmentFileId;
}

export async function stageProductAiPreview(params: {
  readonly productId: string;
  readonly fabricKey: string;
  readonly colorKey: string;
  readonly environmentFileId: string;
  readonly accessToken?: string | null;
  readonly onProgress?: (progress: ProductAiPreviewProgress) => void;
}): Promise<ProductAiPreviewStageResult> {
  const token =
    params.accessToken?.trim() ||
    localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) {
    throw new FileUploadError(resolveErrorMessageFromCode("UNAUTHENTICATED"), 401);
  }

  const response = await fetch(resolveApiUrl(STAGE_PATH), {
    method: "POST",
    headers: {
      Accept: "text/event-stream",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      colorKey: params.colorKey,
      environmentFileId: params.environmentFileId,
      fabricKey: params.fabricKey,
      productId: params.productId,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      reloadPageOnUnauthenticated();
    }
    throw new Error(await parseError(response));
  }

  return readStageStream(response, params.onProgress);
}
