import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";

import { AuthenticatedRoles, GqlAuthGuard, RolesGuard } from "../../../auth";
import { AppSettingsService } from "../../app-settings.service";
import { AppAboutPageConfigGqlResponse } from "../responses";

@Resolver(() => AppAboutPageConfigGqlResponse)
@UseGuards(GqlAuthGuard, RolesGuard)
@AuthenticatedRoles()
export class AppAboutPageConfigQuery {
  constructor(private readonly appSettingsService: AppSettingsService) {}

  @Query(() => AppAboutPageConfigGqlResponse, {
    name: "appAboutPageConfig",
    description: "Get configured about page HTML content",
  })
  async getAppAboutPageConfig(): Promise<AppAboutPageConfigGqlResponse> {
    return this.appSettingsService.getAppAboutPageConfig();
  }
}
