import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";

import { GraphQLContext } from "../../../../types/graphql-context.types";
import {
  GqlAuthGuard,
  EndUserOrAnonymousRoles,
  RolesGuard,
} from "../../../auth";
import { UserProductInquiryService } from "../../user-product-inquiry.service";
import { UserProductInquiryContactSubmitGqlInput } from "../inputs";
import { UserProductInquiryContactSubmitGqlResponse } from "../responses";

@Resolver(() => UserProductInquiryContactSubmitGqlResponse)
@UseGuards(GqlAuthGuard, RolesGuard)
@EndUserOrAnonymousRoles()
export class UserProductInquiryContactSubmitMutation {
  constructor(
    private readonly userProductInquiryService: UserProductInquiryService,
  ) {}

  @Mutation(() => UserProductInquiryContactSubmitGqlResponse, {
    name: "userProductInquiryContactSubmit",
    description:
      "Create or update a user product inquiry with in-person visit contact details. Updates an existing preview inquiry when available; otherwise creates a new call-request inquiry.",
  })
  async submitContact(
    @Args("input") input: UserProductInquiryContactSubmitGqlInput,
    @Context() context: GraphQLContext,
  ): Promise<UserProductInquiryContactSubmitGqlResponse> {
    const user = context.req.user!;

    return this.userProductInquiryService.submitContact(input, user.userId);
  }
}
