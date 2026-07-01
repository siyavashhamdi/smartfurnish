import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { Field, Float, ID, InputType, Int } from "@nestjs/graphql";
import { Types } from "mongoose";

import { ProductDiscountType } from "../../../../enums";
import {
  toNullableObjectId,
  toObjectIdArray,
} from "../../../../transforms/object-id.transform";
import { IsObjectId } from "../../../../validators/is-object-id.validator";

@InputType()
export class ProductDiscountGqlInput {
  @Field(() => ProductDiscountType, {
    description: "Discount calculation type",
  })
  @IsEnum(ProductDiscountType, {
    message: "Discount type must be PERCENTAGE or FIXED_AMOUNT_IRT",
  })
  type: ProductDiscountType;

  @Field(() => Float, {
    description:
      "Discount value. Percentage for PERCENTAGE, IRT amount for FIXED_AMOUNT_IRT",
  })
  @Type(() => Number)
  @IsNumber({}, { message: "Discount value must be a number" })
  @Min(0)
  value: number;
}

@InputType()
export class ProductVendorGqlInput {
  @Field({ description: "Vendor or seller name" })
  @IsString({ message: "Vendor name must be a string" })
  @IsNotEmpty({ message: "Vendor name is required" })
  name: string;

  @Field({ nullable: true, description: "Vendor phone number" })
  @IsOptional()
  @IsString({ message: "Vendor phone must be a string" })
  phone?: string | null;

  @Field({ nullable: true, description: "Vendor address" })
  @IsOptional()
  @IsString({ message: "Vendor address must be a string" })
  address?: string | null;

  @Field({ nullable: true, description: "Internal vendor notes" })
  @IsOptional()
  @IsString({ message: "Vendor notes must be a string" })
  notes?: string | null;
}

@InputType()
export class ProductMaterialProfileGqlInput {
  @Field({ nullable: true, description: "Primary texture" })
  @IsOptional()
  @IsString({ message: "Texture must be a string" })
  texture?: string | null;

  @Field({ nullable: true, description: "Primary material" })
  @IsOptional()
  @IsString({ message: "Primary material must be a string" })
  primaryMaterial?: string | null;

  @Field({ nullable: true, description: "Care instructions" })
  @IsOptional()
  @IsString({ message: "Care instructions must be a string" })
  careInstructions?: string | null;
}

@InputType()
export class ProductSetPieceDimensionGqlInput {
  @Field({ nullable: true, description: "Dimension label" })
  @IsOptional()
  @IsString({ message: "Dimension label must be a string" })
  label?: string | null;

  @Field({ nullable: true, description: "Display text for the dimension" })
  @IsOptional()
  @IsString({ message: "Dimension display text must be a string" })
  displayText?: string | null;

  @Field(() => Float, { nullable: true, description: "Width in centimeters" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Width must be a number" })
  @Min(0)
  widthCm?: number | null;

  @Field(() => Float, { nullable: true, description: "Height in centimeters" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Height must be a number" })
  @Min(0)
  heightCm?: number | null;

  @Field(() => Float, { nullable: true, description: "Depth in centimeters" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Depth must be a number" })
  @Min(0)
  depthCm?: number | null;

  @Field(() => Int, { nullable: true, description: "Sort order" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Dimension sort order must be a number" })
  sortOrder?: number;
}

@InputType()
export class ProductFabricColorGqlInput {
  @Field({ description: "Fabric color name" })
  @IsString({ message: "Fabric color name must be a string" })
  @IsNotEmpty({ message: "Fabric color name is required" })
  name: string;

  @Field({ nullable: true, description: "Hex color code" })
  @IsOptional()
  @IsString({ message: "Hex code must be a string" })
  hexCode?: string | null;

  @Field(() => Int, { nullable: true, description: "Sort order" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Color sort order must be a number" })
  sortOrder?: number;

  @Field(() => Boolean, {
    nullable: true,
    description: "Whether end users can select this color",
  })
  @IsOptional()
  @IsBoolean({ message: "Color isActive must be a boolean" })
  isActive?: boolean;

  @Field(() => Float, {
    nullable: true,
    description: "Color price in IRT",
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Color price must be a number" })
  @Min(0)
  priceIrt?: number | null;

  @Field(() => ProductDiscountGqlInput, {
    nullable: true,
    description: "Optional color discount",
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductDiscountGqlInput)
  discount?: ProductDiscountGqlInput | null;

  @Field(() => ID, {
    nullable: true,
    description: "Stored file ID for the AI product preview image",
  })
  @IsOptional()
  @IsObjectId({
    message: "AI product image file ID must be a valid MongoDB ObjectId",
  })
  @Transform(toNullableObjectId)
  aiProductImageFileId?: Types.ObjectId | null;
}

@InputType()
export class ProductFabricGqlInput {
  @Field({ description: "Fabric pattern name" })
  @IsString({ message: "Fabric pattern name must be a string" })
  @IsNotEmpty({ message: "Fabric pattern name is required" })
  patternName: string;

  @Field(() => Int, { nullable: true, description: "Sort order" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Fabric sort order must be a number" })
  sortOrder?: number;

  @Field(() => Boolean, {
    nullable: true,
    description: "Whether end users can select this pattern",
  })
  @IsOptional()
  @IsBoolean({ message: "Fabric isActive must be a boolean" })
  isActive?: boolean;

  @Field(() => [ProductFabricColorGqlInput], {
    description: "Selectable colors for this pattern",
  })
  @IsArray({ message: "Fabric colors must be an array" })
  @ValidateNested({ each: true })
  @Type(() => ProductFabricColorGqlInput)
  colors: ProductFabricColorGqlInput[];
}

@InputType()
export class ProductSetPieceGqlInput {
  @Field({ description: "Set piece name" })
  @IsString({ message: "Set piece name must be a string" })
  @IsNotEmpty({ message: "Set piece name is required" })
  name: string;

  @Field({ nullable: true, description: "Set piece description" })
  @IsOptional()
  @IsString({ message: "Set piece description must be a string" })
  description?: string | null;

  @Field(() => Int, { nullable: true, description: "Sort order" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Set piece sort order must be a number" })
  sortOrder?: number;

  @Field(() => [ID], {
    nullable: true,
    description: "Stored file IDs attached to this set piece",
  })
  @IsOptional()
  @IsArray({ message: "Set piece image file IDs must be an array" })
  @IsObjectId({
    each: true,
    message: "Each set piece image file ID must be a valid MongoDB ObjectId",
  })
  @Transform(toObjectIdArray)
  imageFileIds?: Types.ObjectId[];

  @Field(() => [ProductSetPieceDimensionGqlInput], {
    nullable: true,
    description: "Dimensions for this set piece",
  })
  @IsOptional()
  @IsArray({ message: "Set piece dimensions must be an array" })
  @ValidateNested({ each: true })
  @Type(() => ProductSetPieceDimensionGqlInput)
  dimensions?: ProductSetPieceDimensionGqlInput[];

  @Field(() => Float, { nullable: true, description: "Weight in kilograms" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Set piece weight must be a number" })
  @Min(0)
  weightKg?: number | null;

  @Field(() => ProductMaterialProfileGqlInput, {
    nullable: true,
    description: "Optional material profile for this set piece",
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductMaterialProfileGqlInput)
  materialProfile?: ProductMaterialProfileGqlInput | null;
}

@InputType({ isAbstract: true })
export class ProductWriteGqlInput {
  @Field({ description: "Product title" })
  @IsString({ message: "Product title must be a string" })
  @IsNotEmpty({ message: "Product title is required" })
  title: string;

  @Field({ nullable: true, description: "Short product summary for list cards" })
  @IsOptional()
  @IsString({ message: "Product summary must be a string" })
  summary?: string | null;

  @Field({ nullable: true, description: "Full product description" })
  @IsOptional()
  @IsString({ message: "Product full description must be a string" })
  fullDescription?: string | null;

  @Field(() => [ID], {
    nullable: true,
    description: "Ordered stored file IDs used as product cover images",
  })
  @IsOptional()
  @IsArray({ message: "Cover image file IDs must be an array" })
  @IsObjectId({
    each: true,
    message: "Each cover image file ID must be a valid MongoDB ObjectId",
  })
  @Transform(toObjectIdArray)
  coverImageFileIds?: Types.ObjectId[];

  @Field(() => Boolean, {
    nullable: true,
    description: "Whether the product is active",
  })
  @IsOptional()
  @IsBoolean({ message: "Product isActive must be a boolean" })
  isActive?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description: "Whether learners can submit reviews for this product",
  })
  @IsOptional()
  @IsBoolean({ message: "Product isReviewSubmissionEnabled must be a boolean" })
  isReviewSubmissionEnabled?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description:
      "Whether the reviews section is visible on the product detail page",
  })
  @IsOptional()
  @IsBoolean({ message: "Product isReviewsSectionVisible must be a boolean" })
  isReviewsSectionVisible?: boolean;

  @Field(() => Float, {
    nullable: true,
    description: "Product display rank used for manual ordering",
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Product sort order must be a number" })
  sortOrder?: number;

  @Field(() => [String], {
    nullable: true,
    description: "Product tags",
  })
  @IsOptional()
  @IsArray({ message: "Product tags must be an array" })
  @IsString({ each: true, message: "Each product tag must be a string" })
  tags?: string[];

  @Field({ nullable: true, description: "Internal notes visible to SUPER_ADMIN" })
  @IsOptional()
  @IsString({ message: "Admin notes must be a string" })
  notes?: string | null;

  @Field(() => ProductVendorGqlInput, {
    nullable: true,
    description: "Vendor or seller information",
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductVendorGqlInput)
  vendor?: ProductVendorGqlInput | null;

  @Field(() => ProductMaterialProfileGqlInput, {
    nullable: true,
    description: "Material and texture profile",
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductMaterialProfileGqlInput)
  materialProfile?: ProductMaterialProfileGqlInput | null;

  @Field(() => [ProductSetPieceGqlInput], {
    nullable: true,
    description: "Set pieces included in this product",
  })
  @IsOptional()
  @IsArray({ message: "Set pieces must be an array" })
  @ValidateNested({ each: true })
  @Type(() => ProductSetPieceGqlInput)
  setPieces?: ProductSetPieceGqlInput[];

  @Field(() => [ProductFabricGqlInput], {
    nullable: true,
    description: "Admin-defined fabric pattern and color options",
  })
  @IsOptional()
  @IsArray({ message: "Fabrics must be an array" })
  @ValidateNested({ each: true })
  @Type(() => ProductFabricGqlInput)
  fabrics?: ProductFabricGqlInput[];
}
