import { Field, Float, ID, ObjectType } from "@nestjs/graphql";
import { Types } from "mongoose";

import { FileAccessUrlGqlResponse } from "../../../file/graphql/responses";
import { PaginationCursorResponse } from "../../../../common/pagination/response";
import { ProductDiscountType } from "../../../../enums";
import { ProductDiscountGqlResponse } from "./product-list.gql.response";

@ObjectType()
export class UserProductListDiscountGqlResponse extends ProductDiscountGqlResponse {}

@ObjectType()
export class UserProductListGqlResponse {
  @Field(() => ID, { description: "Product ID" })
  id: Types.ObjectId;

  @Field({ description: "Product title" })
  title: string;

  @Field({ nullable: true, description: "Short product summary" })
  summary?: string;

  @Field(() => [FileAccessUrlGqlResponse], {
    description: "Signed access descriptors for product cover images",
  })
  coverImageAccessUrls: FileAccessUrlGqlResponse[];

  @Field(() => Float, {
    nullable: true,
    description: "Minimum active color price in IRT",
  })
  priceIrt?: number;

  @Field(() => UserProductListDiscountGqlResponse, {
    nullable: true,
    description: "Computed discount for the lowest active color offer",
  })
  discount?: UserProductListDiscountGqlResponse;

  @Field(() => [String], { description: "Product tags" })
  tags: string[];

  @Field({
    description:
      "Whether the current END_USER has a paid purchase for this product",
  })
  isPurchased: boolean;
}

@ObjectType()
export class UserProductListPaginatedCursorGqlResponse {
  @Field(() => [UserProductListGqlResponse], {
    description: "List of products for anonymous and end-user views",
  })
  items: UserProductListGqlResponse[];

  @Field(() => PaginationCursorResponse, {
    description: "Pagination metadata",
  })
  pagination: PaginationCursorResponse;
}
