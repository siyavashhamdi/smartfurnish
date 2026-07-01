import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";

import { UserRole } from "../../../../enums";
import { GraphQLContext } from "../../../../types/graphql-context.types";
import { GqlAuthGuard, Roles, RolesGuard } from "../../../auth";
import { UserProductInquiryService } from "../../user-product-inquiry.service";
import { UserProductInquiryClaimGqlInput } from "../inputs";
import { UserProductInquiryClaimGqlResponse } from "../responses";

@Resolver(() => UserProductInquiryClaimGqlResponse)
@UseGuards(GqlAuthGuard, RolesGuard)
@Roles(UserRole.ANONYMOUS)
export class UserProductInquiryClaimMutation {
  constructor(
    private readonly userProductInquiryService: UserProductInquiryService,
  ) {}

  @Mutation(() => UserProductInquiryClaimGqlResponse, {
    name: "userProductInquiryClaim",
    description:
      "Transfer an anonymous visitor inquiry to a newly registered user. Call with the anonymous session JWT and pass the signed-up user's access token in the input.",
  })
  async claimInquiry(
    @Args("input") input: UserProductInquiryClaimGqlInput,
    @Context() context: GraphQLContext,
  ): Promise<UserProductInquiryClaimGqlResponse> {
    const user = context.req.user!;

    return this.userProductInquiryService.claimInquiryForRegisteredUser(
      input,
      user.userId,
      user.sessionId,
    );
  }
}
