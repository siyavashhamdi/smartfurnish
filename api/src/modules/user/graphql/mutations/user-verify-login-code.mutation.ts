import { UseGuards } from "@nestjs/common";
import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";

import {
  RateLimit,
  RateLimitGuard,
} from "../../../auth/guards/rate-limit.guard";
import { OptionalGqlAuthGuard, OptionalAnonymousRoles, RolesGuard } from "../../../auth";
import { UserService } from "../../user.service";
import { UserVerifyLoginCodeGqlInput } from "../inputs";
import { UserVerifyLoginCodeGqlResponse } from "../responses";
import { GraphQLContext } from "../../../../types/graphql-context.types";
import { GraphQLContextUtil } from "../../../../utils";
import { buildSessionClientContext } from "../../../../utils/session-client-context.util";

@Resolver(() => UserVerifyLoginCodeGqlResponse)
export class UserVerifyLoginCodeMutation {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => UserVerifyLoginCodeGqlResponse, {
    name: "verifyLoginCode",
    description: "Verify SMS login code and create an authenticated session",
  })
  @UseGuards(OptionalGqlAuthGuard, RolesGuard, RateLimitGuard)
  @OptionalAnonymousRoles()
  @RateLimit({ ttl: 60, limit: 5 })
  async verifyLoginCode(
    @Args("input") input: UserVerifyLoginCodeGqlInput,
    @Context() context: GraphQLContext,
  ): Promise<UserVerifyLoginCodeGqlResponse> {
    const currentUser = GraphQLContextUtil.getUser(context, false);
    return this.userService.verifyLoginCode(
      input.identity,
      input.code,
      input.rememberMe || false,
      buildSessionClientContext(context.req, input.clientContext),
      currentUser?.sessionId,
    );
  }
}
