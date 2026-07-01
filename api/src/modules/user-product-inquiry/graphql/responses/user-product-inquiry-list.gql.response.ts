import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Types } from "mongoose";

import { PaginationOffsetResponse } from "../../../../common/pagination/response";
import { UserProductInquiryStatus } from "../../../../enums";

@ObjectType()
export class UserProductInquiryListUserSummaryGqlResponse {
  @Field({ description: "User full name snapshot" })
  fullName: string;

  @Field({ description: "Username snapshot" })
  username: string;

  @Field({ nullable: true, description: "User phone number snapshot" })
  phoneNumber?: string;
}

@ObjectType()
export class UserProductInquiryListProductSummaryGqlResponse {
  @Field({ description: "Product title snapshot" })
  title: string;
}

@ObjectType()
export class UserProductInquiryListFabricSummaryGqlResponse {
  @Field({ description: "Fabric pattern name" })
  patternName: string;

  @Field({ description: "Selected fabric color name" })
  colorName: string;

  @Field({
    nullable: true,
    description: "Selected fabric color hex code",
  })
  colorHex?: string;
}

@ObjectType()
export class UserProductInquiryListContactSummaryGqlResponse {
  @Field({ description: "Contact first name" })
  firstName: string;

  @Field({ description: "Contact last name" })
  lastName: string;

  @Field({ description: "Contact phone number" })
  phone: string;

  @Field({ description: "Date when contact was requested" })
  requestedAt: Date;
}

@ObjectType()
export class UserProductInquiryListSummaryGqlResponse {
  @Field(() => ID, { description: "User product inquiry record ID" })
  id: Types.ObjectId;

  @Field(() => UserProductInquiryListUserSummaryGqlResponse, {
    description: "User snapshot captured when the inquiry was created",
  })
  user: UserProductInquiryListUserSummaryGqlResponse;

  @Field(() => UserProductInquiryListProductSummaryGqlResponse, {
    description: "Product snapshot captured when the inquiry was created",
  })
  product: UserProductInquiryListProductSummaryGqlResponse;

  @Field(() => UserProductInquiryListFabricSummaryGqlResponse, {
    nullable: true,
    description: "Selected fabric snapshot, if any",
  })
  fabric?: UserProductInquiryListFabricSummaryGqlResponse;

  @Field(() => UserProductInquiryStatus, { description: "Inquiry status" })
  status: UserProductInquiryStatus;

  @Field(() => UserProductInquiryListContactSummaryGqlResponse, {
    nullable: true,
    description: "Contact request details, if any",
  })
  contact?: UserProductInquiryListContactSummaryGqlResponse;

  @Field({
    nullable: true,
    description: "Date when the AI preview was generated",
  })
  previewGeneratedAt?: Date;

  @Field({ nullable: true, description: "Inquiry created date" })
  createdAt?: Date;

  @Field({ nullable: true, description: "Inquiry last update date" })
  updatedAt?: Date;
}

@ObjectType()
export class UserProductInquiryListPaginatedOffsetGqlResponse {
  @Field(() => [UserProductInquiryListSummaryGqlResponse], {
    description: "List of user product inquiries",
  })
  items: UserProductInquiryListSummaryGqlResponse[];

  @Field(() => PaginationOffsetResponse, {
    description: "Pagination metadata",
  })
  pagination: PaginationOffsetResponse;
}
