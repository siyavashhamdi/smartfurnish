import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";

import { AuthenticatedRoles, GqlAuthGuard, RolesGuard } from "../../../auth";
import { AppSettingsService } from "../../app-settings.service";
import { AppTermsOfUsePageConfigGqlResponse } from "../responses";

@Resolver(() => AppTermsOfUsePageConfigGqlResponse)
@UseGuards(GqlAuthGuard, RolesGuard)
@AuthenticatedRoles()
export class AppTermsOfUsePageConfigQuery {
  constructor(private readonly appSettingsService: AppSettingsService) {}

  @Query(() => AppTermsOfUsePageConfigGqlResponse, {
    name: "appTermsOfUsePageConfig",
    description: "Get configured terms of use HTML content",
  })
  async getAppTermsOfUsePageConfig(): Promise<AppTermsOfUsePageConfigGqlResponse> {
    return this.appSettingsService.getAppTermsOfUsePageConfig();
  }
}
