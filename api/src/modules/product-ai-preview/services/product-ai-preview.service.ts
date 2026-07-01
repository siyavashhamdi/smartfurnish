import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Types } from "mongoose";

import { FileService } from "../../file/file.service";
import { FILE_UPLOAD_POLICIES } from "../../file/file-upload-policy.constants";
import { assertFileAllowedByPolicy } from "../../file/file-upload-policy.util";
import { AppSettingsService } from "../../app-settings";
import { ProductService } from "../../product/product.service";
import {
  getStagingStep,
  type StagingProgressEvent,
  type StagingStepId,
} from "../constants/staging-steps.constants";
import type { InputImage } from "../types/input-image.types";
import { prepareEnvironmentImage } from "../utils/environment-image.util";
import { buildPlacementPrompt } from "../utils/placement-prompt.util";
import { combineReferenceImages } from "../utils/reference-image.util";
import {
  cropGeneratedImageToEnvironmentPanel,
  readPreviewImageContent,
} from "../utils/result-image.util";
import { OpenRouterImageGenerationService } from "./openrouter-image-generation.service";

export type ProductAiPreviewProgressCallback = (
  event: StagingProgressEvent,
) => void;

export interface RunProductAiPreviewInput {
  readonly productId: string;
  readonly fabricKey: string;
  readonly colorKey: string;
  readonly environmentFileId: string;
  readonly ownerUserId: Types.ObjectId;
}

export interface ProductAiPreviewResult {
  readonly image: string;
  readonly durationSeconds: number;
  readonly description: string | null;
  readonly environmentFileId: string;
  readonly resultFileId: string;
  readonly sourceProductImageFileId: string;
  readonly generatedAt: string;
  readonly aspectRatio?: string;
  readonly imageSize: string;
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
}

@Injectable()
export class ProductAiPreviewService {
  constructor(
    private readonly productService: ProductService,
    private readonly fileService: FileService,
    private readonly appSettingsService: AppSettingsService,
    private readonly openRouterImageGenerationService: OpenRouterImageGenerationService,
  ) {}

  private emitProgress(
    onProgress: ProductAiPreviewProgressCallback | undefined,
    stepId: StagingStepId,
  ): void {
    const step = getStagingStep(stepId);
    onProgress?.({
      step: step.id,
      label: step.label,
      percent: step.percent,
    });
  }

  async runPreview(
    input: RunProductAiPreviewInput,
    onProgress?: ProductAiPreviewProgressCallback,
  ): Promise<ProductAiPreviewResult> {
    const startedAt = Date.now();

    this.emitProgress(onProgress, "validate-upload");

    const productId = input.productId.trim();
    const fabricKey = input.fabricKey.trim();
    const colorKey = input.colorKey.trim();
    const environmentFileId = input.environmentFileId.trim();

    const product = await this.productService.findActiveProductById(productId);

    if (!product) {
      throw new NotFoundException("Product not found.");
    }

    const fabric = (product.fabrics ?? []).find(
      (entry) => entry.key === fabricKey && entry.isActive,
    );

    if (!fabric) {
      throw new BadRequestException("Selected fabric pattern is not available.");
    }

    const color = (fabric.colors ?? []).find(
      (entry) => entry.key === colorKey && entry.isActive,
    );

    if (!color) {
      throw new BadRequestException("Selected fabric color is not available.");
    }

    if (!color.aiProductImageFileId) {
      throw new BadRequestException(
        "Selected color does not have an AI product image configured.",
      );
    }

    this.emitProgress(onProgress, "load-product-image");

    const { buffer: environmentBuffer, storedFile: environmentStoredFile } =
      await this.fileService.downloadActiveBufferByIdForOwner(
        environmentFileId,
        input.ownerUserId,
      );

    assertFileAllowedByPolicy({
      mimeType: environmentStoredFile.mimeType,
      fileName: environmentStoredFile.name,
      sizeBytes: environmentStoredFile.sizeBytes,
      policy: FILE_UPLOAD_POLICIES.AI_PREVIEW_ROOM,
    });

    const environment = await prepareEnvironmentImage({
      buffer: environmentBuffer,
      mimeType: environmentStoredFile.mimeType,
    });
    const { buffer: productImageBuffer, storedFile } =
      await this.fileService.downloadBufferById(
        color.aiProductImageFileId.toString(),
      );

    const productImage: InputImage = {
      buffer: productImageBuffer,
      mimeType: storedFile.mimeType,
    };

    const previewContext = {
      productTitle: product.title,
      patternName: fabric.patternName,
      colorName: color.name,
      colorHex: color.hexCode,
      materialTexture: product.materialProfile?.texture,
      primaryMaterial: product.materialProfile?.primaryMaterial,
    };

    this.emitProgress(onProgress, "prepare-instructions");

    const reference = await combineReferenceImages(productImage, environment);
    const openRouterConfig = await this.appSettingsService.getOpenRouterConfig();
    const placementPrompt = buildPlacementPrompt(
      openRouterConfig?.placementPrompt,
      previewContext,
    );

    this.emitProgress(onProgress, "generate-image");

    const generationResult =
      await this.openRouterImageGenerationService.generateImage({
        aspectRatio: reference.environmentAspectRatio,
        imageSize: "0.5K",
        images: [reference.image],
        prompt: placementPrompt,
      });

    this.emitProgress(onProgress, "process-result");

    const croppedImageUrl = await cropGeneratedImageToEnvironmentPanel(
      generationResult.imageUrl,
      reference.layout,
    );

    const { buffer: resultBuffer, mimeType: resultMimeType } =
      await readPreviewImageContent(croppedImageUrl);
    const uploadedResult = await this.fileService.uploadFromBuffer({
      name: `ai-preview-result-${productId}.jpg`,
      mimeType: resultMimeType.startsWith("image/")
        ? resultMimeType
        : "image/jpeg",
      buffer: resultBuffer,
    });
    const resultFileId = uploadedResult.accessUrl?.fileId?.toString();

    if (!resultFileId) {
      throw new BadRequestException(
        "AI preview result file could not be stored.",
      );
    }

    const generatedAt = new Date();
    const durationSeconds = (Date.now() - startedAt) / 1000;
    await this.appSettingsService.updateProductAiPreviewStagingDurationSeconds(
      durationSeconds,
    );

    const fabricLabel = `${fabric.patternName} — ${color.name}`;

    this.emitProgress(onProgress, "complete");

    return {
      description: generationResult.description ?? null,
      durationSeconds,
      environmentFileId,
      generatedAt: generatedAt.toISOString(),
      image: croppedImageUrl,
      imageSize: "0.5K",
      resultFileId,
      sourceProductImageFileId: color.aiProductImageFileId.toString(),
      ...(reference.environmentAspectRatio
        ? { aspectRatio: reference.environmentAspectRatio }
        : {}),
      product: {
        id: product._id.toString(),
        title: product.title,
      },
      fabric: {
        colorHex: color.hexCode,
        colorName: color.name,
        label: fabricLabel,
        patternName: fabric.patternName,
      },
    };
  }
}
