import { Field, Float, GraphQLISODateTime, ID, ObjectType } from "@nestjs/graphql";
import { Types } from "mongoose";

import { FileAccessUrlGqlResponse } from "../../../file/graphql/responses";
import { UserProductInquiryStatus, UserRole } from "../../../../enums";

@ObjectType()
export class UserProductInquiryDetailUserSnapshotGqlResponse {
  @Field({ description: "User full name snapshot" })
  fullName: string;

  @Field({ description: "Username snapshot" })
  username: string;

  @Field({ nullable: true, description: "User phone number snapshot" })
  phoneNumber?: string;

  @Field(() => [UserRole], { description: "Current user roles" })
  roles: UserRole[];
}

@ObjectType()
export class UserProductInquiryDetailProductSnapshotGqlResponse {
  @Field({ description: "Product title snapshot" })
  title: string;

  @Field(() => [FileAccessUrlGqlResponse], {
    description: "Current product cover image access URLs",
  })
  coverImageAccessUrls: FileAccessUrlGqlResponse[];
}

@ObjectType()
export class UserProductInquiryDetailFabricSnapshotGqlResponse {
  @Field({ description: "Fabric key" })
  fabricKey: string;

  @Field({ description: "Color key" })
  colorKey: string;

  @Field({ description: "Fabric pattern name" })
  patternName: string;

  @Field({ description: "Selected fabric color name" })
  colorName: string;

  @Field({ nullable: true, description: "Selected fabric color hex code" })
  colorHex?: string;

  @Field({ description: "Combined fabric and color label" })
  label: string;
}

@ObjectType()
export class UserProductInquiryDetailStatusHistoryPayloadGqlResponse {
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "When contact was made",
  })
  contactedAt?: Date;

  @Field(() => ID, {
    nullable: true,
    description: "User ID who marked the inquiry contacted",
  })
  contactedBy?: Types.ObjectId;

  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "When the sale was completed",
  })
  completedAt?: Date;

  @Field(() => ID, {
    nullable: true,
    description: "SUPER_ADMIN user ID who marked the sale completed",
  })
  completedBy?: Types.ObjectId;
}

@ObjectType()
export class UserProductInquiryDetailStatusHistoryEntryGqlResponse {
  @Field(() => UserProductInquiryStatus, { description: "Status after this change" })
  status: UserProductInquiryStatus;

  @Field({ description: "Reason for the status change" })
  reason: string;

  @Field({ nullable: true, description: "Optional status change description" })
  description?: string;

  @Field(() => GraphQLISODateTime, { description: "When the status changed" })
  changedAt: Date;

  @Field(() => ID, {
    nullable: true,
    description: "User ID who changed the status",
  })
  changedBy?: Types.ObjectId;

  @Field(() => UserProductInquiryDetailStatusHistoryPayloadGqlResponse, {
    nullable: true,
    description: "Optional payload for status-specific metadata",
  })
  payload?: UserProductInquiryDetailStatusHistoryPayloadGqlResponse;
}

@ObjectType()
export class UserProductInquiryDetailPreviewModelGqlResponse {
  @Field({ description: "AI provider name" })
  provider: string;

  @Field({ description: "AI model name" })
  model: string;

  @Field({ nullable: true, description: "Placement prompt used for generation" })
  placementPrompt?: string;

  @Field({ nullable: true, description: "Aspect ratio used for generation" })
  aspectRatio?: string;

  @Field({ nullable: true, description: "Image size used for generation" })
  imageSize?: string;

  @Field({ nullable: true, description: "Reasoning effort used for generation" })
  reasoningEffort?: string;
}

@ObjectType()
export class UserProductInquiryDetailPreviewGqlResponse {
  @Field(() => ID, { description: "Uploaded room environment photo file ID" })
  environmentFileId: Types.ObjectId;

  @Field(() => ID, { description: "Generated preview result image file ID" })
  resultFileId: Types.ObjectId;

  @Field(() => ID, {
    nullable: true,
    description: "Source AI product image file ID",
  })
  sourceProductImageFileId?: Types.ObjectId;

  @Field(() => GraphQLISODateTime, { description: "When the preview was generated" })
  generatedAt: Date;

  @Field(() => Float, {
    nullable: true,
    description: "Preview generation duration in seconds",
  })
  durationSeconds?: number;

  @Field(() => UserProductInquiryDetailPreviewModelGqlResponse, {
    description: "AI model metadata used for preview generation",
  })
  model: UserProductInquiryDetailPreviewModelGqlResponse;

  @Field(() => UserProductInquiryDetailFabricSnapshotGqlResponse, {
    description: "Selected fabric snapshot for this preview",
  })
  fabric: UserProductInquiryDetailFabricSnapshotGqlResponse;

  @Field(() => FileAccessUrlGqlResponse, {
    nullable: true,
    description: "Signed access descriptor for the room environment photo",
  })
  environmentFileAccessUrl?: FileAccessUrlGqlResponse;

  @Field(() => FileAccessUrlGqlResponse, {
    nullable: true,
    description: "Signed access descriptor for the generated preview image",
  })
  resultFileAccessUrl?: FileAccessUrlGqlResponse;

  @Field(() => FileAccessUrlGqlResponse, {
    nullable: true,
    description: "Signed access descriptor for the source product image",
  })
  sourceProductImageFileAccessUrl?: FileAccessUrlGqlResponse;
}

@ObjectType()
export class UserProductInquiryDetailContactGqlResponse {
  @Field({ description: "Contact first name" })
  firstName: string;

  @Field({ description: "Contact last name" })
  lastName: string;

  @Field({ description: "Contact phone number" })
  phone: string;

  @Field(() => GraphQLISODateTime, { description: "When contact was requested" })
  requestedAt: Date;

  @Field({ nullable: true, description: "Optional customer note" })
  customerNote?: string;
}

@ObjectType()
export class UserProductInquiryDetailGqlResponse {
  @Field(() => ID, { description: "User product inquiry record ID" })
  id: Types.ObjectId;

  @Field({ description: "Whether the inquiry is archived" })
  isArchived: boolean;

  @Field(() => ID, { description: "Owner user ID" })
  userId: Types.ObjectId;

  @Field(() => ID, { description: "Related product ID" })
  productId: Types.ObjectId;

  @Field(() => UserProductInquiryDetailUserSnapshotGqlResponse, {
    description: "User snapshot captured when the inquiry was created",
  })
  user: UserProductInquiryDetailUserSnapshotGqlResponse;

  @Field(() => UserProductInquiryDetailProductSnapshotGqlResponse, {
    description: "Product snapshot captured when the inquiry was created",
  })
  product: UserProductInquiryDetailProductSnapshotGqlResponse;

  @Field(() => UserProductInquiryStatus, { description: "Current inquiry status" })
  status: UserProductInquiryStatus;

  @Field(() => [UserProductInquiryDetailStatusHistoryEntryGqlResponse], {
    description: "Chronological status change history",
  })
  statusHistory: UserProductInquiryDetailStatusHistoryEntryGqlResponse[];

  @Field(() => [UserProductInquiryDetailPreviewGqlResponse], {
    nullable: true,
    description: "AI preview generations, if any",
  })
  preview?: UserProductInquiryDetailPreviewGqlResponse[];

  @Field(() => UserProductInquiryDetailContactGqlResponse, {
    nullable: true,
    description: "Contact request details, if any",
  })
  contact?: UserProductInquiryDetailContactGqlResponse;

  @Field(() => GraphQLISODateTime, { nullable: true, description: "Inquiry created date" })
  createdAt?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true, description: "Inquiry last update date" })
  updatedAt?: Date;

  @Field(() => ID, {
    nullable: true,
    description: "User ID who created the inquiry",
  })
  createdBy?: Types.ObjectId;

  @Field(() => ID, {
    nullable: true,
    description: "User ID who last updated the inquiry",
  })
  updatedBy?: Types.ObjectId;
}
