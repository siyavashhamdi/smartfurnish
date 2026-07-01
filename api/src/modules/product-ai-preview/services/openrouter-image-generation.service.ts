import {
  BadGatewayException,
  Injectable,
  Logger,
  PayloadTooLargeException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { EXCEPTION_CONSTANT } from "../../../constants/exception.constant";
import { AppSettingsService } from "../../app-settings";
import type {
  GenerateImageOptions,
  GenerateImageResult,
  InputImage,
} from "../types/input-image.types";

type OpenRouterMessageContent =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "image_url";
      image_url: {
        url: string;
      };
    };

type OpenRouterChatRequest = {
  model: string;
  messages: Array<{
    role: "user" | "system" | "assistant";
    content: string | OpenRouterMessageContent[];
  }>;
  reasoning?: {
    effort?: "low" | "medium" | "high" | "xhigh";
  };
  image_config?: {
    aspect_ratio?: string;
    image_size?: string;
  };
};

type OpenRouterChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
      images?: Array<{
        image_url?: {
          url?: string;
        };
      }>;
    };
  }>;
  error?: {
    message?: string;
    code?: number;
  };
};

const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";
const MAX_REQUEST_BYTES = 4.5 * 1024 * 1024;
const AI_PREVIEW_GENERATION_FAILED =
  EXCEPTION_CONSTANT.PRODUCT_AI_PREVIEW_GENERATION_FAILED;
const TEMP_SAMPLE_IMAGE_CANDIDATE_PATHS = [
  join(process.cwd(), "../app/public/logo.png"),
  join(process.cwd(), "app/public/logo.png"),
  join(__dirname, "../../../../../app/public/logo.png"),
] as const;

@Injectable()
export class OpenRouterImageGenerationService {
  private readonly logger = new Logger(OpenRouterImageGenerationService.name);

  constructor(private readonly appSettingsService: AppSettingsService) {}

  private failGeneration(reason: string, detail?: unknown): never {
    this.logger.error(reason, detail instanceof Error ? detail.stack : detail);
    throw new BadGatewayException(AI_PREVIEW_GENERATION_FAILED);
  }

  private toDataUrl(image: InputImage): string {
    const base64 = image.buffer.toString("base64");
    return `data:${image.mimeType};base64,${base64}`;
  }

  private buildHeaders(apiKey: string): Record<string, string> {
    return {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
  }

  private extractGeneratedImage(
    response: OpenRouterChatResponse,
    model: string,
  ): GenerateImageResult {
    const message = response.choices?.[0]?.message;
    const imageUrl = message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      this.failGeneration(
        `OpenRouter did not return a generated image for model "${model}".`,
      );
    }

    return {
      description:
        typeof message?.content === "string" ? message.content : undefined,
      imageUrl,
    };
  }

  private estimatePayloadSize(
    prompt: string,
    images: readonly InputImage[],
  ): number {
    const base64Size = images.reduce(
      (total, image) => total + Math.ceil((image.buffer.length * 4) / 3),
      0,
    );

    return prompt.length + base64Size + 2048;
  }

  async generateImage(
    options: GenerateImageOptions,
  ): Promise<GenerateImageResult> {
    const tempSampleImagePath = TEMP_SAMPLE_IMAGE_CANDIDATE_PATHS.find((path) =>
      existsSync(path),
    );

    if (!tempSampleImagePath) {
      this.failGeneration(
        "Temporary sample image not found. Expected app/public/logo.png.",
      );
    }

    const tempSampleImageBuffer = readFileSync(tempSampleImagePath);

    return {
      description:
        "Temporary sample image (AI generation bypassed for testing).",
      imageUrl: `data:image/png;base64,${tempSampleImageBuffer.toString("base64")}`,
    };

    const openRouterConfig = await this.appSettingsService.getOpenRouterConfig();

    if (!openRouterConfig) {
      this.logger.error("AI preview generation requested without OpenRouter config.");
      throw new ServiceUnavailableException(AI_PREVIEW_GENERATION_FAILED);
    }

    const apiKey = openRouterConfig.apiKey;
    const model = options.model?.trim() || openRouterConfig.model;
    const estimatedSize = this.estimatePayloadSize(
      options.prompt,
      options.images,
    );

    if (estimatedSize > MAX_REQUEST_BYTES) {
      throw new PayloadTooLargeException(
        "Combined image payload is too large for the selected model. Upload a smaller room photo.",
      );
    }

    const content: OpenRouterMessageContent[] = [
      { type: "text", text: options.prompt },
      ...options.images.map((image) => ({
        type: "image_url" as const,
        image_url: {
          url: this.toDataUrl(image),
        },
      })),
    ];

    const isRiverflowModel = model.includes("riverflow");

    const body: OpenRouterChatRequest = {
      model,
      messages: [
        {
          role: "user",
          content,
        },
      ],
      ...(isRiverflowModel
        ? {
            reasoning: {
              effort: "high" as const,
            },
          }
        : {}),
    };

    if (options.aspectRatio || options.imageSize) {
      body.image_config = {
        ...(options.aspectRatio ? { aspect_ratio: options.aspectRatio } : {}),
        ...(options.imageSize ? { image_size: options.imageSize } : {}),
      };
    }

    let response: Response;
    try {
      response = await fetch(OPENROUTER_CHAT_URL, {
        method: "POST",
        headers: this.buildHeaders(apiKey),
        body: JSON.stringify(body),
      });
    } catch (error) {
      this.failGeneration("OpenRouter request failed.", error);
    }

    const payload = (await response.json()) as OpenRouterChatResponse;

    if (!response.ok) {
      this.failGeneration(
        `OpenRouter request failed with status ${response.status}.`,
        payload.error?.message ?? payload,
      );
    }

    return this.extractGeneratedImage(payload, model);
  }
}
