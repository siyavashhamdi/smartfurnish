import { Args, Context, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";

import { AuthenticatedRoles, GqlAuthGuard, RolesGuard } from "../../../auth";
import { assertEndUserOrAnonymousAccess, isEndUserRole } from "../../../../utils/end-user-access.util";
import { GraphQLContextUtil } from "../../../../utils";
import { GraphQLContext } from "../../../../types/graphql-context.types";
import { ProductService } from "../../product.service";
import { ProductListGqlInput } from "../inputs";
import {
  UserProductListGqlResponse,
  UserProductListPaginatedCursorGqlResponse,
} from "../responses";

@Resolver(() => UserProductListGqlResponse)
export class UserProductListQuery {
  constructor(private readonly productService: ProductService) {}

  @Query(() => UserProductListPaginatedCursorGqlResponse, {
    name: "userProductList",
    description:
      "Get active products for anonymous users and END_USER views with purchase state",
  })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @AuthenticatedRoles()
  async findUserProducts(
    @Args("input") input: ProductListGqlInput,
    @Context() context: GraphQLContext,
  ): Promise<UserProductListPaginatedCursorGqlResponse> {
    const user = GraphQLContextUtil.getUser(context);
    assertEndUserOrAnonymousAccess(user);
    const isEndUser = isEndUserRole(user?.roles);

    return this.productService.listForUser(
      input,
      isEndUser ? user!.userId : undefined,
    );
  }
}
