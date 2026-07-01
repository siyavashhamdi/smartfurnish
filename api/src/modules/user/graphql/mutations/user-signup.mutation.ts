import { UseGuards } from "@nestjs/common";
import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";

import { UserService } from "../../user.service";
import {
  RateLimit,
  RateLimitGuard,
} from "../../../auth/guards/rate-limit.guard";
import { OptionalGqlAuthGuard, OptionalAnonymousRoles, RolesGuard } from "../../../auth";
import { GraphQLContext } from "../../../../types/graphql-context.types";
import { GraphQLContextUtil } from "../../../../utils";
import { buildSessionClientContext } from "../../../../utils/session-client-context.util";
import { UserSignupGqlInput } from "../inputs";
import { UserLoginGqlResponse } from "../responses";

@Resolver(() => UserLoginGqlResponse)
export class UserSignupMutation {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => UserLoginGqlResponse, {
    name: "userSignup",
    description:
      "Create an END_USER account using username/email/mobile and start a session",
  })
  @UseGuards(OptionalGqlAuthGuard, RolesGuard, RateLimitGuard)
  @OptionalAnonymousRoles()
  @RateLimit({ ttl: 60, limit: 5 })
  async signup(
    @Args("input") input: UserSignupGqlInput,
    @Context() context: GraphQLContext,
  ): Promise<UserLoginGqlResponse> {
    const currentUser = GraphQLContextUtil.getUser(context, false);
    const signupResult = await this.userService.signup(
      input,
      buildSessionClientContext(context.req, input.clientContext),
      currentUser?.sessionId,
    );

    return signupResult;
  }
}
