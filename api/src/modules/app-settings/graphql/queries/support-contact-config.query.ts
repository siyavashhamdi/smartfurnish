import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";

import { AuthenticatedRoles, GqlAuthGuard, RolesGuard } from "../../../auth";
import { AppSettingsService } from "../../app-settings.service";
import { SupportContactConfigGqlResponse } from "../responses";

@Resolver(() => SupportContactConfigGqlResponse)
@UseGuards(GqlAuthGuard, RolesGuard)
@AuthenticatedRoles()
export class SupportContactConfigQuery {
  constructor(private readonly appSettingsService: AppSettingsService) {}

  @Query(() => SupportContactConfigGqlResponse, {
    name: "supportContactConfig",
    description: "Get configured support contact channels",
  })
  async getSupportContactConfig(): Promise<SupportContactConfigGqlResponse> {
    return this.appSettingsService.getSupportContactConfig();
  }
}
