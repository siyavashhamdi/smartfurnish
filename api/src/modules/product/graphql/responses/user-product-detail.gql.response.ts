import {
  Field,
  Float,
  ID,
  ObjectType,
} from "@nestjs/graphql";
import { Types } from "mongoose";

import { FileAccessUrlGqlResponse } from "../../../file/graphql/responses";
import {
  ProductDiscountType,
  UserProductPurchaseStatus,
} from "../../../../enums";
import {
  ProductDiscountGqlResponse,
  ProductFabricGqlResponse,
  ProductMaterialProfileGqlResponse,
  ProductSetPieceGqlResponse,
  ProductVendorGqlResponse,
} from "./product-list.gql.response";
import { UserProductListDiscountGqlResponse } from "./user-product-list.gql.response";

@ObjectType()
export class UserProductDetailGqlResponse {
  @Field(() => ID, { description: "Product ID" })
  id: Types.ObjectId;

  @Field({ description: "Product title" })
  title: string;

  @Field({ nullable: true, description: "Short product summary" })
  summary?: string;

  @Field({ nullable: true, description: "Full product description" })
  fullDescription?: string;

  @Field(() => [FileAccessUrlGqlResponse], {
    description: "Signed access descriptors for product cover images",
  })
  coverImageAccessUrls: FileAccessUrlGqlResponse[];

  @Field(() => Float, {
    nullable: true,
    description: "Product price in IRT",
  })
  priceIrt?: number;

  @Field(() => UserProductListDiscountGqlResponse, {
    nullable: true,
    description: "Optional public product discount",
  })
  discount?: {
    type: ProductDiscountType;
    value: number;
  };

  @Field(() => [String], { description: "Product tags" })
  tags: string[];

  @Field({ description: "Whether this product is free to access" })
  isFree: boolean;

  @Field({
    description:
      "Whether the current END_USER has a paid purchase for this product",
  })
  isPurchased: boolean;

  @Field(() => UserProductPurchaseStatus, {
    nullable: true,
    description: "Current END_USER purchase status for this product, if any",
  })
  purchaseStatus?: UserProductPurchaseStatus;

  @Field(() => ProductVendorGqlResponse, {
    nullable: true,
    description: "Vendor or seller information",
  })
  vendor?: ProductVendorGqlResponse;

  @Field(() => ProductMaterialProfileGqlResponse, {
    nullable: true,
    description: "Material and texture profile",
  })
  materialProfile?: ProductMaterialProfileGqlResponse;

  @Field(() => [ProductSetPieceGqlResponse], {
    description: "Set pieces included in this product",
  })
  setPieces: ProductSetPieceGqlResponse[];

  @Field(() => [ProductFabricGqlResponse], {
    description: "Active fabric pattern and color options selectable by users",
  })
  fabrics: ProductFabricGqlResponse[];

  @Field({
    description: "Whether learners can submit reviews for this product",
  })
  isReviewSubmissionEnabled: boolean;

  @Field({
    description:
      "Whether the reviews section is visible on the product detail page",
  })
  isReviewsSectionVisible: boolean;
}
