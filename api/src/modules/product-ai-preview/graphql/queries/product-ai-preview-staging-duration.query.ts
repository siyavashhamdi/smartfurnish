import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";

import { AuthenticatedRoles, GqlAuthGuard, RolesGuard } from "../../../auth";
import { AppSettingsService } from "../../../app-settings";
import { ProductAiPreviewStagingDurationGqlResponse } from "../responses/product-ai-preview-staging-duration.gql.response";

@Resolver(() => ProductAiPreviewStagingDurationGqlResponse)
@UseGuards(GqlAuthGuard, RolesGuard)
@AuthenticatedRoles()
export class ProductAiPreviewStagingDurationQuery {
  constructor(private readonly appSettingsService: AppSettingsService) {}

  @Query(() => ProductAiPreviewStagingDurationGqlResponse, {
    name: "productAiPreviewStagingDuration",
    description:
      "Estimated AI product preview generation duration in seconds. Value is read from app settings and updated by the system after each successful generation.",
  })
  async getProductAiPreviewStagingDuration(): Promise<ProductAiPreviewStagingDurationGqlResponse> {
    const durationSeconds =
      await this.appSettingsService.getProductAiPreviewStagingDurationSeconds();

    return { durationSeconds };
  }
}
