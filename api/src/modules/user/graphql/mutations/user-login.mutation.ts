import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Resolver, Context } from "@nestjs/graphql";

import { UserService } from "../../user.service";
import {
  RateLimitGuard,
  RateLimit,
} from "../../../auth/guards/rate-limit.guard";
import { OptionalGqlAuthGuard, OptionalAnonymousRoles, RolesGuard } from "../../../auth";
import { UserLoginGqlInput } from "../inputs";
import { UserLoginGqlResponse } from "../responses";
import { GraphQLContext } from "../../../../types/graphql-context.types";
import { GraphQLContextUtil } from "../../../../utils";
import { buildSessionClientContext } from "../../../../utils/session-client-context.util";

@Resolver(() => UserLoginGqlResponse)
export class UserLoginMutation {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => UserLoginGqlResponse, {
    name: "userLogin",
    description: "Login and get JWT access token",
  })
  @UseGuards(OptionalGqlAuthGuard, RolesGuard, RateLimitGuard)
  @OptionalAnonymousRoles()
  @RateLimit({ ttl: 60, limit: 5 }) // 5 login attempts per minute per IP
  async login(
    @Args("input") input: UserLoginGqlInput,
    @Context() context: GraphQLContext,
  ): Promise<UserLoginGqlResponse> {
    const currentUser = GraphQLContextUtil.getUser(context, false);
    const loginResult = await this.userService.login(
      input.identity,
      input.password,
      input.captchaId,
      input.captchaValue,
      input.rememberMe || false,
      buildSessionClientContext(context.req, input.clientContext),
      currentUser?.sessionId,
    );

    return loginResult;
  }
}
