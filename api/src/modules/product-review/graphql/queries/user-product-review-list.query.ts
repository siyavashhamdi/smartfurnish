import { UseGuards } from "@nestjs/common";
import { Args, Context, Query, Resolver } from "@nestjs/graphql";
import { Types } from "mongoose";

import { AuthenticatedRoles, GqlAuthGuard, RolesGuard } from "../../../auth";
import { GraphQLContext } from "../../../../types/graphql-context.types";
import { GraphQLContextUtil } from "../../../../utils";
import { assertEndUserOrAnonymousAccess, isEndUserRole } from "../../../../utils/end-user-access.util";
import { ProductReviewService } from "../../product-review.service";
import { UserProductReviewListGqlInput } from "../inputs";
import {
  UserProductReviewListGqlResponse,
  UserProductReviewListPaginatedCursorGqlResponse,
} from "../responses";

@Resolver(() => UserProductReviewListGqlResponse)
export class UserProductReviewListQuery {
  constructor(private readonly productReviewService: ProductReviewService) {}

  @Query(() => UserProductReviewListPaginatedCursorGqlResponse, {
    name: "userProductReviewList",
    description:
      "Get a cursor-paginated list of public product reviews for anonymous users and END_USER accounts",
  })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @AuthenticatedRoles()
  async findUserProductReviews(
    @Args("input") input: UserProductReviewListGqlInput,
    @Context() context: GraphQLContext,
  ): Promise<UserProductReviewListPaginatedCursorGqlResponse> {
    const user = GraphQLContextUtil.getUser(context);
    assertEndUserOrAnonymousAccess(user);
    const isEndUser = isEndUserRole(user?.roles);

    return this.productReviewService.listForEndUser(
      input,
      isEndUser ? new Types.ObjectId(user!.userId) : undefined,
    );
  }
}
