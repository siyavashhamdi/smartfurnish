import { UseGuards } from "@nestjs/common";
import { Args, Context, Query, Resolver } from "@nestjs/graphql";

import { GraphQLContext } from "../../../../types/graphql-context.types";
import { AuthenticatedRoles, GqlAuthGuard, RolesGuard } from "../../../auth";
import { assertEndUserOrAnonymousAccess, isEndUserRole } from "../../../../utils/end-user-access.util";
import { GraphQLContextUtil } from "../../../../utils";
import { ProductService } from "../../product.service";
import { UserProductDetailGqlInput } from "../inputs";
import { UserProductDetailGqlResponse } from "../responses";

@Resolver(() => UserProductDetailGqlResponse)
export class UserProductDetailQuery {
  constructor(private readonly productService: ProductService) {}

  @Query(() => UserProductDetailGqlResponse, {
    name: "userProductDetail",
    description:
      "Get active furniture product details for anonymous users and END_USER accounts",
  })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @AuthenticatedRoles()
  async findUserProductDetail(
    @Args("input") input: UserProductDetailGqlInput,
    @Context() context: GraphQLContext,
  ): Promise<UserProductDetailGqlResponse> {
    const user = GraphQLContextUtil.getUser(context);
    assertEndUserOrAnonymousAccess(user);
    const isEndUser = isEndUserRole(user?.roles);

    return this.productService.detailForUser(
      input,
      isEndUser ? user!.userId : undefined,
    );
  }
}
