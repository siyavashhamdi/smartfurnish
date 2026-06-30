import { Module } from "@nestjs/common";

import { AuthModule } from "../auth";
import { AppSettingsModule } from "../app-settings";
import { FileModule } from "../file";
import { ProductModule } from "../product";
import { ProductAiPreviewController } from "./product-ai-preview.controller";
import { ProductAiPreviewStagingDurationQuery } from "./graphql/queries";
import { OpenRouterImageGenerationService } from "./services/openrouter-image-generation.service";
import { ProductAiPreviewService } from "./services/product-ai-preview.service";

@Module({
  imports: [AuthModule, AppSettingsModule, FileModule, ProductModule],
  controllers: [ProductAiPreviewController],
  providers: [
    ProductAiPreviewService,
    OpenRouterImageGenerationService,
    ProductAiPreviewStagingDurationQuery,
  ],
})
export class ProductAiPreviewModule {}
