import { BadRequestException, UseGuards } from "@nestjs/common";
import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";

import { UserService } from "../../user.service";
import { OptionalGqlAuthGuard } from "../../../auth";
import {
  RateLimit,
  RateLimitGuard,
} from "../../../auth/guards/rate-limit.guard";
import { GraphQLContext } from "../../../../types/graphql-context.types";
import { GraphQLContextUtil } from "../../../../utils";
import { buildSessionClientContext } from "../../../../utils/session-client-context.util";
import { UserCreateAnonymousGqlInput } from "../inputs";
import { UserLoginGqlResponse } from "../responses";

@Resolver(() => UserLoginGqlResponse)
export class UserCreateAnonymousMutation {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => UserLoginGqlResponse, {
    name: "userCreateAnonymous",
    description:
      "Create an anonymous visitor account and start a JWT session without registration",
  })
  @UseGuards(OptionalGqlAuthGuard, RateLimitGuard)
  @RateLimit({ ttl: 60, limit: 10 })
  async createAnonymous(
    @Args("input", { nullable: true }) input: UserCreateAnonymousGqlInput | null,
    @Context() context: GraphQLContext,
  ): Promise<UserLoginGqlResponse> {
    const currentUser = GraphQLContextUtil.getUser(context, false);
    if (currentUser?.userId) {
      throw new BadRequestException("An authenticated session already exists.");
    }

    const createResult = await this.userService.createAnonymousUser(
      buildSessionClientContext(context.req, input?.clientContext),
    );

    return createResult;
  }
}
