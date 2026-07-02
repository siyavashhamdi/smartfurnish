import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { Types } from "mongoose";

import { FileAccessUrlGqlResponse } from "../../../file/graphql/responses";
import { ProductDiscountType } from "../../../../enums";
import { PaginationCursorResponse } from "../../../../common/pagination/response";

@ObjectType()
export class ProductDiscountGqlResponse {
  @Field(() => ProductDiscountType, {
    description: "Discount calculation type",
  })
  type: ProductDiscountType;

  @Field(() => Float, {
    description:
      "Discount value. Percentage for PERCENTAGE, IRT amount for FIXED_AMOUNT_IRT",
  })
  value: number;
}

@ObjectType()
export class ProductVendorGqlResponse {
  @Field({ description: "Vendor or seller name" })
  name: string;

  @Field({ nullable: true, description: "Vendor phone number" })
  phone?: string;

  @Field({ nullable: true, description: "Vendor address" })
  address?: string;

  @Field({ nullable: true, description: "Internal vendor notes" })
  notes?: string;
}

@ObjectType()
export class ProductMaterialProfileGqlResponse {
  @Field({ nullable: true, description: "Primary texture" })
  texture?: string;

  @Field({ nullable: true, description: "Primary material" })
  primaryMaterial?: string;

  @Field({ nullable: true, description: "Care instructions" })
  careInstructions?: string;
}

@ObjectType()
export class ProductSetPieceDimensionGqlResponse {
  @Field({ nullable: true, description: "Dimension label" })
  label?: string;

  @Field({ nullable: true, description: "Display text for the dimension" })
  displayText?: string;

  @Field(() => Float, { nullable: true, description: "Width in centimeters" })
  widthCm?: number;

  @Field(() => Float, { nullable: true, description: "Height in centimeters" })
  heightCm?: number;

  @Field(() => Float, { nullable: true, description: "Depth in centimeters" })
  depthCm?: number;

  @Field(() => Int, { nullable: true, description: "Sort order" })
  sortOrder?: number;
}

@ObjectType()
export class ProductFabricColorGqlResponse {
  @Field({ description: "Stable fabric color key" })
  key: string;

  @Field({ description: "Fabric color name" })
  name: string;

  @Field({ nullable: true, description: "Hex color code" })
  hexCode?: string;

  @Field(() => Int, { nullable: true, description: "Sort order" })
  sortOrder?: number;

  @Field({ description: "Whether end users can select this color" })
  isActive: boolean;

  @Field(() => Float, {
    nullable: true,
    description: "Color price in IRT",
  })
  priceIrt?: number;

  @Field(() => ProductDiscountGqlResponse, {
    nullable: true,
    description: "Optional color discount",
  })
  discount?: ProductDiscountGqlResponse;

  @Field(() => FileAccessUrlGqlResponse, {
    nullable: true,
    description: "Signed access descriptor for the AI product preview image",
  })
  aiProductImageAccessUrl?: FileAccessUrlGqlResponse;
}

@ObjectType()
export class ProductFabricGqlResponse {
  @Field({ description: "Stable fabric key" })
  key: string;

  @Field({ description: "Fabric pattern name" })
  patternName: string;

  @Field(() => Int, { nullable: true, description: "Sort order" })
  sortOrder?: number;

  @Field({ description: "Whether end users can select this pattern" })
  isActive: boolean;

  @Field(() => [ProductFabricColorGqlResponse], {
    description: "Selectable colors for this pattern",
  })
  colors: ProductFabricColorGqlResponse[];
}

@ObjectType()
export class ProductSetPieceGqlResponse {
  @Field({ description: "Stable set piece key" })
  key: string;

  @Field({ description: "Set piece name" })
  name: string;

  @Field({ nullable: true, description: "Set piece description" })
  description?: string;

  @Field(() => Int, { nullable: true, description: "Sort order" })
  sortOrder?: number;

  @Field(() => [FileAccessUrlGqlResponse], {
    description: "Signed access descriptors for set piece images",
  })
  imageAccessUrls: FileAccessUrlGqlResponse[];

  @Field(() => [ProductSetPieceDimensionGqlResponse], {
    description: "Dimensions for this set piece",
  })
  dimensions: ProductSetPieceDimensionGqlResponse[];

  @Field(() => Float, { nullable: true, description: "Weight in kilograms" })
  weightKg?: number;

  @Field(() => ProductMaterialProfileGqlResponse, {
    nullable: true,
    description: "Optional material profile for this set piece",
  })
  materialProfile?: ProductMaterialProfileGqlResponse;
}

@ObjectType()
export class ProductListReviewStatsGqlResponse {
  @Field(() => Int, {
    description:
      "Number of distinct users who have submitted at least one review for this product",
  })
  userCount: number;

  @Field(() => Int, {
    description: "Total review threads recorded for this product",
  })
  reviewCount: number;
}

@ObjectType()
export class ProductListSummaryGqlResponse {
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

  @Field(() => ProductDiscountGqlResponse, {
    nullable: true,
    description: "Computed discount for the lowest color offer",
  })
  discount?: ProductDiscountGqlResponse;

  @Field({ description: "Whether the product is active" })
  isActive: boolean;

  @Field(() => Float, {
    nullable: true,
    description: "Product display rank used for manual ordering",
  })
  sortOrder?: number;

  @Field(() => [String], { description: "Product tags" })
  tags: string[];

  @Field(() => ProductListReviewStatsGqlResponse, {
    nullable: true,
    description: "Review activity summary for SUPER_ADMIN list cards",
  })
  reviewStats?: ProductListReviewStatsGqlResponse;
}

@ObjectType()
export class ProductListGqlResponse {
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
    description: "Minimum active color price in IRT",
  })
  priceIrt?: number;

  @Field(() => ProductDiscountGqlResponse, {
    nullable: true,
    description: "Computed discount for the lowest color offer",
  })
  discount?: ProductDiscountGqlResponse;

  @Field({ description: "Whether the product is active" })
  isActive: boolean;

  @Field({
    description: "Whether learners can submit reviews for this product",
  })
  isReviewSubmissionEnabled: boolean;

  @Field({
    description:
      "Whether the reviews section is visible on the product detail page",
  })
  isReviewsSectionVisible: boolean;

  @Field(() => Float, {
    nullable: true,
    description: "Product display rank used for manual ordering",
  })
  sortOrder?: number;

  @Field(() => [String], { description: "Product tags" })
  tags: string[];

  @Field({
    nullable: true,
    description: "Internal notes visible to SUPER_ADMIN only",
  })
  notes?: string;

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
    description: "Admin-defined fabric pattern and color options",
  })
  fabrics: ProductFabricGqlResponse[];

  @Field({ nullable: true, description: "Date when the product was created" })
  createdAt?: Date;

  @Field({
    nullable: true,
    description: "Date when the product was last updated",
  })
  updatedAt?: Date;
}

@ObjectType()
export class ProductListPaginatedCursorGqlResponse {
  @Field(() => [ProductListSummaryGqlResponse], {
    description: "List of products",
  })
  items: ProductListSummaryGqlResponse[];

  @Field(() => PaginationCursorResponse, {
    description: "Pagination metadata",
  })
  pagination: PaginationCursorResponse;
}

/** @deprecated Use ProductDiscountGqlResponse */
export const ProductListDiscountGqlResponse = ProductDiscountGqlResponse;
