import { Args, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";

import { UserRole } from "../../../../enums";
import { GqlAuthGuard, Roles, RolesGuard } from "../../../auth";
import { UserProductInquiryService } from "../../user-product-inquiry.service";
import { UserProductInquiryListGqlInput } from "../inputs";
import {
  UserProductInquiryListSummaryGqlResponse,
  UserProductInquiryListPaginatedOffsetGqlResponse,
} from "../responses";

@Resolver(() => UserProductInquiryListSummaryGqlResponse)
@UseGuards(GqlAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class UserProductInquiryListQuery {
  constructor(
    private readonly userProductInquiryService: UserProductInquiryService,
  ) {}

  @Query(() => UserProductInquiryListPaginatedOffsetGqlResponse, {
    name: "userProductInquiryList",
    description:
      "Get a paginated, filterable, sortable SUPER_ADMIN list of user product inquiries",
  })
  async findUserProductInquiries(
    @Args("input") input: UserProductInquiryListGqlInput,
  ): Promise<UserProductInquiryListPaginatedOffsetGqlResponse> {
    return this.userProductInquiryService.list(input);
  }
}
