import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";

import { GraphQLContext } from "../../../../types/graphql-context.types";
import {
  GqlAuthGuard,
  EndUserOrAnonymousRoles,
  RolesGuard,
} from "../../../auth";
import { UserProductInquiryService } from "../../user-product-inquiry.service";
import { UserProductInquiryPreviewSubmitGqlInput } from "../inputs";
import { UserProductInquiryPreviewSubmitGqlResponse } from "../responses";

@Resolver(() => UserProductInquiryPreviewSubmitGqlResponse)
@UseGuards(GqlAuthGuard, RolesGuard)
@EndUserOrAnonymousRoles()
export class UserProductInquiryPreviewSubmitMutation {
  constructor(
    private readonly userProductInquiryService: UserProductInquiryService,
  ) {}

  @Mutation(() => UserProductInquiryPreviewSubmitGqlResponse, {
    name: "userProductInquiryPreviewSubmit",
    description:
      "Persist a smart product preview inquiry after AI preview generation",
  })
  async submitPreview(
    @Args("input") input: UserProductInquiryPreviewSubmitGqlInput,
    @Context() context: GraphQLContext,
  ): Promise<UserProductInquiryPreviewSubmitGqlResponse> {
    const user = context.req.user!;

    return this.userProductInquiryService.submitPreview(input, user.userId);
  }
}
