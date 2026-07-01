import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Field, ID, InputType } from "@nestjs/graphql";

import { UserProductInquiryStatus } from "../../../../enums";
import {
  OffsetPageOptionsParamsInput,
  PaginationOffsetInput,
} from "../../../../common/pagination/input";
import { UserProductInquiryListSortOptionInput } from "./user-product-inquiry-list-sort-option.gql.input";

@InputType()
export class UserProductInquiryListFilterInput {
  @Field({
    nullable: true,
    description:
      "Search query that matches user, product, fabric, or contact fields",
  })
  @IsOptional()
  @IsString({ message: "Query filter must be a string" })
  query?: string;

  @Field(() => ID, {
    nullable: true,
    description: "Filter inquiries by record ID",
  })
  @IsOptional()
  @IsMongoId({ message: "ID filter must be a valid Mongo ID" })
  id?: string;

  @Field(() => ID, {
    nullable: true,
    description: "Filter inquiries by user ID",
  })
  @IsOptional()
  @IsMongoId({ message: "User ID filter must be a valid Mongo ID" })
  userId?: string;

  @Field(() => ID, {
    nullable: true,
    description: "Filter inquiries by product ID",
  })
  @IsOptional()
  @IsMongoId({ message: "Product ID filter must be a valid Mongo ID" })
  productId?: string;

  @Field({ nullable: true, description: "Filter by user full name snapshot" })
  @IsOptional()
  @IsString({ message: "Full name filter must be a string" })
  userFullName?: string;

  @Field({ nullable: true, description: "Filter by username snapshot" })
  @IsOptional()
  @IsString({ message: "Username filter must be a string" })
  username?: string;

  @Field({ nullable: true, description: "Filter by user phone snapshot" })
  @IsOptional()
  @IsString({ message: "Phone filter must be a string" })
  userPhone?: string;

  @Field({ nullable: true, description: "Filter by product title snapshot" })
  @IsOptional()
  @IsString({ message: "Product title filter must be a string" })
  productTitle?: string;

  @Field({ nullable: true, description: "Filter by fabric label snapshot" })
  @IsOptional()
  @IsString({ message: "Fabric label filter must be a string" })
  fabricLabel?: string;

  @Field(() => UserProductInquiryStatus, {
    nullable: true,
    description: "Filter inquiries by status",
  })
  @IsOptional()
  @IsEnum(UserProductInquiryStatus, {
    message: "Status filter must be a valid inquiry status",
  })
  status?: UserProductInquiryStatus;

  @Field(() => Boolean, {
    nullable: true,
    description: "Filter by archived flag",
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: "Archived filter must be boolean" })
  isArchived?: boolean;

  @Field({ nullable: true, description: "Filter by contact first name" })
  @IsOptional()
  @IsString({ message: "Contact first name filter must be a string" })
  contactFirstName?: string;

  @Field({ nullable: true, description: "Filter by contact last name" })
  @IsOptional()
  @IsString({ message: "Contact last name filter must be a string" })
  contactLastName?: string;

  @Field({ nullable: true, description: "Filter by contact phone" })
  @IsOptional()
  @IsString({ message: "Contact phone filter must be a string" })
  contactPhone?: string;

  @Field({
    nullable: true,
    description: "Filter records created from this ISO date",
  })
  @IsOptional()
  @IsDateString({}, { message: "Created from filter must be an ISO date" })
  createdAtFrom?: string;

  @Field({
    nullable: true,
    description: "Filter records created until this ISO date",
  })
  @IsOptional()
  @IsDateString({}, { message: "Created to filter must be an ISO date" })
  createdAtTo?: string;

  @Field({
    nullable: true,
    description: "Filter records updated from this ISO date",
  })
  @IsOptional()
  @IsDateString({}, { message: "Updated from filter must be an ISO date" })
  updatedAtFrom?: string;

  @Field({
    nullable: true,
    description: "Filter records updated until this ISO date",
  })
  @IsOptional()
  @IsDateString({}, { message: "Updated to filter must be an ISO date" })
  updatedAtTo?: string;

  @Field({
    nullable: true,
    description: "Filter previews generated from this ISO date",
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: "Preview generated from filter must be an ISO date" },
  )
  previewGeneratedAtFrom?: string;

  @Field({
    nullable: true,
    description: "Filter previews generated until this ISO date",
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: "Preview generated to filter must be an ISO date" },
  )
  previewGeneratedAtTo?: string;

  @Field({
    nullable: true,
    description: "Filter contact requests from this ISO date",
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: "Contact requested from filter must be an ISO date" },
  )
  contactRequestedAtFrom?: string;

  @Field({
    nullable: true,
    description: "Filter contact requests until this ISO date",
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: "Contact requested to filter must be an ISO date" },
  )
  contactRequestedAtTo?: string;
}

@InputType()
export class UserProductInquiryListOffsetPageOptionsParamsInput extends OffsetPageOptionsParamsInput {
  @Field(() => UserProductInquiryListSortOptionInput, {
    nullable: true,
    description: "Sort options as a map of field names to sort order",
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserProductInquiryListSortOptionInput)
  sort?: UserProductInquiryListSortOptionInput;
}

@InputType()
export class UserProductInquiryListGqlInput extends PaginationOffsetInput<UserProductInquiryListFilterInput> {
  @Field(() => UserProductInquiryListFilterInput, {
    nullable: true,
    description: "Filter options for narrowing down the inquiry list",
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserProductInquiryListFilterInput)
  filters?: UserProductInquiryListFilterInput;

  @Field(() => UserProductInquiryListOffsetPageOptionsParamsInput, {
    nullable: true,
    description: "Offset pagination and sorting options",
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserProductInquiryListOffsetPageOptionsParamsInput)
  options?: UserProductInquiryListOffsetPageOptionsParamsInput;
}
