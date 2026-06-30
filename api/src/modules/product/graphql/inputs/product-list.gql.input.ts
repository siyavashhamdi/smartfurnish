import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { Field, Float, ID, InputType } from "@nestjs/graphql";

import {
  CursorPageOptionsParamsInput,
  PaginationCursorInput,
} from "../../../../common/pagination/input";
import { ProductListSortOptionInput } from "./product-list-sort-option.gql.input";

@InputType()
export class ProductListFilterInput {
  @Field({
    nullable: true,
    description:
      "Search query that matches title, summary, full description, tags, vendor, materials, and set piece names",
  })
  @IsOptional()
  @IsString({ message: "Query filter must be a string" })
  query?: string;

  @Field({ nullable: true, description: "Filter products by title" })
  @IsOptional()
  @IsString({ message: "Title filter must be a string" })
  title?: string;

  @Field({ nullable: true, description: "Filter products by summary" })
  @IsOptional()
  @IsString({ message: "Summary filter must be a string" })
  summary?: string;

  @Field({ nullable: true, description: "Filter products by full description" })
  @IsOptional()
  @IsString({ message: "Full description filter must be a string" })
  fullDescription?: string;

  @Field(() => Boolean, {
    nullable: true,
    description: "Filter by active state",
  })
  @IsOptional()
  @IsBoolean({ message: "isActive filter must be a boolean" })
  isActive?: boolean;

  @Field(() => [String], {
    nullable: true,
    description: "Return products that contain at least one of these tags",
  })
  @IsOptional()
  @IsArray({ message: "tagsAny filter must be an array" })
  @IsString({ each: true, message: "Each tag must be a string" })
  tagsAny?: string[];

  @Field(() => [String], {
    nullable: true,
    description: "Return products that contain every tag in this list",
  })
  @IsOptional()
  @IsArray({ message: "tagsAll filter must be an array" })
  @IsString({ each: true, message: "Each tag must be a string" })
  tagsAll?: string[];

  @Field(() => Float, {
    nullable: true,
    description: "Minimum price in IRT",
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Minimum price must be a number" })
  @Min(0)
  minPriceIrt?: number;

  @Field(() => Float, {
    nullable: true,
    description: "Maximum price in IRT",
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Maximum price must be a number" })
  @Min(0)
  maxPriceIrt?: number;

  @Field(() => Boolean, {
    nullable: true,
    description:
      "Filter products by whether a paid price is set. true = priceIrt > 0, false = unset/null or priceIrt <= 0.",
  })
  @IsOptional()
  @IsBoolean({ message: "hasPrice filter must be a boolean" })
  hasPrice?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description:
      "Filter by whether the current user has purchased the product. Used by userProductList.",
  })
  @IsOptional()
  @IsBoolean({ message: "isPurchased filter must be a boolean" })
  isPurchased?: boolean;

  @Field(() => ID, {
    nullable: true,
    description:
      "Scope the product list for a specific user by excluding products they have already paid for.",
  })
  @IsOptional()
  @IsMongoId({ message: "includeUserId must be a valid Mongo ID" })
  includeUserId?: string;
}

@InputType()
export class ProductListCursorPageOptionsParamsInput extends CursorPageOptionsParamsInput {
  @Field(() => ProductListSortOptionInput, {
    nullable: true,
    description: "Sort options as a map of field names to sort order",
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductListSortOptionInput)
  sort?: ProductListSortOptionInput;
}

@InputType()
export class ProductListGqlInput extends PaginationCursorInput<ProductListFilterInput> {
  @Field(() => ProductListFilterInput, {
    nullable: true,
    description: "Filter options for narrowing down the product list",
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductListFilterInput)
  filters?: ProductListFilterInput;

  @Field(() => ProductListCursorPageOptionsParamsInput, {
    nullable: true,
    description: "Pagination and sorting options",
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductListCursorPageOptionsParamsInput)
  options?: ProductListCursorPageOptionsParamsInput;
}
