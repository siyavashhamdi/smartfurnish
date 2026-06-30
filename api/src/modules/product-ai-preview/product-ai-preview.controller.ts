import {
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  Body,
} from "@nestjs/common";
import type { Response } from "express";

import { EXCEPTION_CONSTANT } from "../../constants/exception.constant";
import { AuthenticatedRequest } from "../../types/graphql-context.types";
import {
  RateLimit,
  RateLimitGuard,
  RestAuthGuard,
} from "../auth";
import { StageProductAiPreviewDto } from "./dto/stage-product-ai-preview.dto";
import { ProductAiPreviewService } from "./services/product-ai-preview.service";
import {
  initSseResponse,
  wantsEventStream,
  writeSseError,
  writeSseEvent,
} from "./utils/sse.util";

@Controller("products/ai-preview")
export class ProductAiPreviewController {
  constructor(
    private readonly productAiPreviewService: ProductAiPreviewService,
  ) {}

  @Post("stage")
  @UseGuards(RestAuthGuard, RateLimitGuard)
  @RateLimit({ ttl: 60, limit: 5 })
  async stageRoom(
    @Body() body: StageProductAiPreviewDto,
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
  ): Promise<void> {
    const ownerUserId = request.user?.userId;
    if (!ownerUserId) {
      throw new UnauthorizedException(EXCEPTION_CONSTANT.UNAUTHENTICATED);
    }

    const streamProgress = wantsEventStream(request.headers.accept);

    try {
      if (streamProgress) {
        initSseResponse(response);
      }

      const result = await this.productAiPreviewService.runPreview(
        {
          colorKey: body.colorKey,
          environmentFileId: body.environmentFileId,
          fabricKey: body.fabricKey,
          ownerUserId,
          productId: body.productId,
        },
        streamProgress
          ? (progress) => {
              writeSseEvent(response, "progress", progress);
            }
          : undefined,
      );

      if (streamProgress) {
        writeSseEvent(response, "complete", result);
        response.end();
        return;
      }

      response.status(200).json(result);
    } catch (error) {
      if (streamProgress && response.headersSent) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to generate AI room preview.";
        writeSseError(response, message);
        response.end();
        return;
      }

      throw error;
    }
  }
}
