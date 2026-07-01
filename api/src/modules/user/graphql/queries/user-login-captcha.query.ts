import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";

import { OptionalGqlAuthGuard, RolesGuard } from "../../../auth";
import {
  RateLimit,
  RateLimitGuard,
} from "../../../auth/guards/rate-limit.guard";
import { UserCaptchaService } from "../../user-captcha.service";
import { UserLoginCaptchaGqlResponse } from "../responses/user-login-captcha.gql.response";

@Resolver(() => UserLoginCaptchaGqlResponse)
export class UserLoginCaptchaQuery {
  constructor(private readonly userCaptchaService: UserCaptchaService) {}

  @Query(() => UserLoginCaptchaGqlResponse, {
    name: "userLoginCaptcha",
    description: "Generate a captcha challenge for password login",
  })
  @UseGuards(OptionalGqlAuthGuard, RolesGuard, RateLimitGuard)
  @RateLimit({ ttl: 60, limit: 30 })
  userLoginCaptcha(): UserLoginCaptchaGqlResponse {
    return this.userCaptchaService.issueCaptcha();
  }
}
