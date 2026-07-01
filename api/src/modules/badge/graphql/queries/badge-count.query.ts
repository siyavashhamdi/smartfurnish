import { UseGuards } from "@nestjs/common";
import { Context, Query, Resolver } from "@nestjs/graphql";

import { GraphQLContext } from "../../../../types/graphql-context.types";
import { AuthenticatedRoles, GqlAuthGuard, RolesGuard } from "../../../auth";
import { GraphQLContextUtil } from "../../../../utils";
import { BadgeService } from "../../badge.service";
import { BadgeCountGqlResponse } from "../responses";

@Resolver(() => BadgeCountGqlResponse)
export class BadgeCountQuery {
  constructor(private readonly badgeService: BadgeService) {}

  @Query(() => BadgeCountGqlResponse, {
    name: "badgeCount",
    description:
      "Get role-aware sidebar badge counts. Anonymous users receive active product count only.",
  })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @AuthenticatedRoles()
  async getBadgeCount(
    @Context() context: GraphQLContext,
  ): Promise<BadgeCountGqlResponse> {
    const user = GraphQLContextUtil.getUser(context);

    return this.badgeService.getCount(user);
  }
}
