import { Args, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";

import {
  GqlAuthGuard,
  EndUserOrAnonymousRoles,
  RolesGuard,
} from "../../../auth";
import { UserProductInquiryService } from "../../user-product-inquiry.service";
import { UserProductInquiryHasActiveRequestGqlInput } from "../inputs";

@Resolver()
@UseGuards(GqlAuthGuard, RolesGuard)
@EndUserOrAnonymousRoles()
export class UserProductInquiryHasActiveRequestQuery {
  constructor(
    private readonly userProductInquiryService: UserProductInquiryService,
  ) {}

  @Query(() => Boolean, {
    name: "userProductInquiryHasActiveRequest",
    description:
      "Returns true when at least one non-terminal inquiry with contact details exists for the given product and phone number",
  })
  async hasActiveRequest(
    @Args("input") input: UserProductInquiryHasActiveRequestGqlInput,
  ): Promise<boolean> {
    return this.userProductInquiryService.hasActiveInquiryRequest(input);
  }
}
