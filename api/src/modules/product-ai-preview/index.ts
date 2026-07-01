import { Module } from "@nestjs/common";

import { AppSettingsModule } from "../app-settings";
import { FileModule } from "../file";
import { ProductModule } from "../product";
import { OpenRouterImageGenerationService } from "./services/openrouter-image-generation.service";
import { ProductAiPreviewService } from "./services/product-ai-preview.service";

@Module({
  imports: [AppSettingsModule, FileModule, ProductModule],
  providers: [ProductAiPreviewService, OpenRouterImageGenerationService],
  exports: [ProductAiPreviewService],
})
export class ProductAiPreviewModule {}
