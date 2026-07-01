import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Resolver } from "@nestjs/graphql";

import {
  OptionalGqlAuthGuard,
  OptionalAnonymousRoles,
  RolesGuard,
} from "../../../auth";
import {
  RateLimit,
  RateLimitGuard,
} from "../../../auth/guards/rate-limit.guard";
import { UserService } from "../../user.service";
import { UserRequestLoginCodeGqlInput } from "../inputs";
import { UserRequestLoginCodeGqlResponse } from "../responses";

@Resolver(() => UserRequestLoginCodeGqlResponse)
export class UserRequestLoginCodeMutation {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => UserRequestLoginCodeGqlResponse, {
    name: "requestLoginCode",
    description: "Request login code using username, email, or phone identity",
  })
  @UseGuards(OptionalGqlAuthGuard, RolesGuard, RateLimitGuard)
  @OptionalAnonymousRoles()
  @RateLimit({ ttl: 60, limit: 5 })
  async requestLoginCode(
    @Args("input") input: UserRequestLoginCodeGqlInput,
  ): Promise<UserRequestLoginCodeGqlResponse> {
    return this.userService.requestLoginCode(input.identity);
  }
}
