import { Args, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";

import { UserRole } from "../../../../enums";
import { GqlAuthGuard, Roles, RolesGuard } from "../../../auth";
import { UserProductInquiryService } from "../../user-product-inquiry.service";
import { UserProductInquiryDetailGqlInput } from "../inputs";
import { UserProductInquiryDetailGqlResponse } from "../responses";

@Resolver(() => UserProductInquiryDetailGqlResponse)
@UseGuards(GqlAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class UserProductInquiryDetailQuery {
  constructor(
    private readonly userProductInquiryService: UserProductInquiryService,
  ) {}

  @Query(() => UserProductInquiryDetailGqlResponse, {
    name: "userProductInquiryDetail",
    description:
      "Get full user product inquiry data for SUPER_ADMIN review, including preview, contact, and status history",
  })
  async findUserProductInquiryDetail(
    @Args("input") input: UserProductInquiryDetailGqlInput,
  ): Promise<UserProductInquiryDetailGqlResponse> {
    return this.userProductInquiryService.detail(input);
  }
}
