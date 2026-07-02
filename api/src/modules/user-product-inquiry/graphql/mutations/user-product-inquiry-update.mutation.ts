import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";

import { UserRole } from "../../../../enums";
import { GqlAuthGuard, Roles, RolesGuard } from "../../../auth";
import { UserProductInquiryService } from "../../user-product-inquiry.service";
import { UserProductInquiryUpdateGqlInput } from "../inputs";
import { UserProductInquiryDetailGqlResponse } from "../responses";

@Resolver(() => UserProductInquiryDetailGqlResponse)
@UseGuards(GqlAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class UserProductInquiryUpdateMutation {
  constructor(
    private readonly userProductInquiryService: UserProductInquiryService,
  ) {}

  @Mutation(() => UserProductInquiryDetailGqlResponse, {
    name: "userProductInquiryUpdate",
    description:
      "Replace all editable fields on a user product inquiry. SUPER_ADMIN only. Schema validation enforces status, preview, contact, and status-history contacted/saleCompleted consistency rules.",
  })
  async updateUserProductInquiry(
    @Args("input") input: UserProductInquiryUpdateGqlInput,
  ): Promise<UserProductInquiryDetailGqlResponse> {
    return this.userProductInquiryService.update(input);
  }
}
