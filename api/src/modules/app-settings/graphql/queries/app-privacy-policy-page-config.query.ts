import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";

import { AuthenticatedRoles, GqlAuthGuard, RolesGuard } from "../../../auth";
import { AppSettingsService } from "../../app-settings.service";
import { AppPrivacyPolicyPageConfigGqlResponse } from "../responses";

@Resolver(() => AppPrivacyPolicyPageConfigGqlResponse)
@UseGuards(GqlAuthGuard, RolesGuard)
@AuthenticatedRoles()
export class AppPrivacyPolicyPageConfigQuery {
  constructor(private readonly appSettingsService: AppSettingsService) {}

  @Query(() => AppPrivacyPolicyPageConfigGqlResponse, {
    name: "appPrivacyPolicyPageConfig",
    description: "Get configured privacy policy HTML content",
  })
  async getAppPrivacyPolicyPageConfig(): Promise<AppPrivacyPolicyPageConfigGqlResponse> {
    return this.appSettingsService.getAppPrivacyPolicyPageConfig();
  }
}
