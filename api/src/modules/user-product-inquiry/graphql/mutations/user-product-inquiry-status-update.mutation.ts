import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";

import { UserRole } from "../../../../enums";
import { GraphQLContext } from "../../../../types/graphql-context.types";
import { GqlAuthGuard, Roles, RolesGuard } from "../../../auth";
import { UserProductInquiryService } from "../../user-product-inquiry.service";
import { UserProductInquiryStatusUpdateGqlInput } from "../inputs";
import { UserProductInquiryDetailGqlResponse } from "../responses";

@Resolver(() => UserProductInquiryDetailGqlResponse)
@UseGuards(GqlAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class UserProductInquiryStatusUpdateMutation {
  constructor(
    private readonly userProductInquiryService: UserProductInquiryService,
  ) {}

  @Mutation(() => UserProductInquiryDetailGqlResponse, {
    name: "userProductInquiryStatusUpdate",
    description:
      "Update a user product inquiry status and optional status-change description. SUPER_ADMIN only.",
  })
  async updateUserProductInquiryStatus(
    @Args("input") input: UserProductInquiryStatusUpdateGqlInput,
    @Context() context: GraphQLContext,
  ): Promise<UserProductInquiryDetailGqlResponse> {
    return this.userProductInquiryService.updateStatus(
      input,
      context.req.user!.userId,
    );
  }
}
