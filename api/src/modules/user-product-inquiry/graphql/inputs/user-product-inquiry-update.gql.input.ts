import { Transform, Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import {
  Field,
  Float,
  GraphQLISODateTime,
  ID,
  InputType,
} from "@nestjs/graphql";
import { Types } from "mongoose";

import { UserProductInquiryStatus } from "../../../../enums";
import {
  toObjectId,
  toObjectIdOptional,
} from "../../../../transforms/object-id.transform";
import { IsObjectId } from "../../../../validators/is-object-id.validator";

@InputType()
export class UserProductInquiryUpdateUserSnapshotGqlInput {
  @Field({ description: "User full name snapshot" })
  @IsString({ message: "Full name must be a string" })
  @IsNotEmpty({ message: "Full name is required" })
  @MaxLength(128, { message: "Full name cannot be longer than 128 characters" })
  fullName: string;

  @Field({ description: "Username snapshot" })
  @IsString({ message: "Username must be a string" })
  @IsNotEmpty({ message: "Username is required" })
  @MaxLength(64, { message: "Username cannot be longer than 64 characters" })
  username: string;

  @Field({ nullable: true, description: "User phone number snapshot" })
  @IsOptional()
  @IsString({ message: "Phone number must be a string" })
  @MaxLength(32, {
    message: "Phone number cannot be longer than 32 characters",
  })
  phoneNumber?: string | null;
}

@InputType()
export class UserProductInquiryUpdateProductSnapshotGqlInput {
  @Field({ description: "Product title snapshot" })
  @IsString({ message: "Product title must be a string" })
  @IsNotEmpty({ message: "Product title is required" })
  @MaxLength(256, {
    message: "Product title cannot be longer than 256 characters",
  })
  title: string;
}

@InputType()
export class UserProductInquiryUpdateFabricSnapshotGqlInput {
  @Field({ description: "Fabric key" })
  @IsString({ message: "Fabric key must be a string" })
  @IsNotEmpty({ message: "Fabric key is required" })
  @MaxLength(128, {
    message: "Fabric key cannot be longer than 128 characters",
  })
  fabricKey: string;

  @Field({ description: "Color key" })
  @IsString({ message: "Color key must be a string" })
  @IsNotEmpty({ message: "Color key is required" })
  @MaxLength(128, { message: "Color key cannot be longer than 128 characters" })
  colorKey: string;

  @Field({ description: "Fabric pattern name" })
  @IsString({ message: "Pattern name must be a string" })
  @IsNotEmpty({ message: "Pattern name is required" })
  @MaxLength(128, {
    message: "Pattern name cannot be longer than 128 characters",
  })
  patternName: string;

  @Field({ description: "Selected fabric color name" })
  @IsString({ message: "Color name must be a string" })
  @IsNotEmpty({ message: "Color name is required" })
  @MaxLength(128, {
    message: "Color name cannot be longer than 128 characters",
  })
  colorName: string;

  @Field({ nullable: true, description: "Selected fabric color hex code" })
  @IsOptional()
  @IsString({ message: "Color hex must be a string" })
  @MaxLength(16, { message: "Color hex cannot be longer than 16 characters" })
  colorHex?: string | null;

  @Field({ description: "Combined fabric and color label" })
  @IsString({ message: "Fabric label must be a string" })
  @IsNotEmpty({ message: "Fabric label is required" })
  @MaxLength(256, {
    message: "Fabric label cannot be longer than 256 characters",
  })
  label: string;
}

@InputType()
export class UserProductInquiryUpdateStatusHistoryContactedGqlInput {
  @Field(() => GraphQLISODateTime, { description: "When contact was made" })
  @IsDate({ message: "Contacted at must be an ISO date" })
  contactedAt: Date;

  @Field(() => ID, { description: "User ID who marked the inquiry contacted" })
  @IsObjectId({ message: "Contacted by must be a valid MongoDB ObjectId" })
  @Transform(toObjectId)
  contactedBy: Types.ObjectId;
}

@InputType()
export class UserProductInquiryUpdateStatusHistorySaleCompletedGqlInput {
  @Field(() => GraphQLISODateTime, {
    description: "When the sale was completed",
  })
  @IsDate({ message: "Completed at must be an ISO date" })
  completedAt: Date;

  @Field(() => ID, {
    description: "SUPER_ADMIN user ID who marked the sale completed",
  })
  @IsObjectId({ message: "Completed by must be a valid MongoDB ObjectId" })
  @Transform(toObjectId)
  completedBy: Types.ObjectId;

  @Field(() => Float, { description: "Final agreed sale price in IRT" })
  @Type(() => Number)
  @IsNumber({}, { message: "Final price must be a number" })
  @Min(0, { message: "Final price cannot be negative" })
  finalPriceIrt: number;
}

@InputType()
export class UserProductInquiryUpdateStatusHistoryEntryGqlInput {
  @Field(() => UserProductInquiryStatus, {
    description: "Status after this change",
  })
  @IsEnum(UserProductInquiryStatus, { message: "Status must be valid" })
  status: UserProductInquiryStatus;

  @Field({ description: "Reason for the status change" })
  @IsString({ message: "Reason must be a string" })
  @IsNotEmpty({ message: "Reason is required" })
  @MaxLength(512, { message: "Reason cannot be longer than 512 characters" })
  reason: string;

  @Field({ nullable: true, description: "Optional status change description" })
  @IsOptional()
  @IsString({ message: "Description must be a string" })
  @MaxLength(2000, {
    message: "Description cannot be longer than 2000 characters",
  })
  description?: string | null;

  @Field(() => GraphQLISODateTime, { description: "When the status changed" })
  @IsDate({ message: "Changed at must be an ISO date" })
  changedAt: Date;

  @Field(() => ID, {
    nullable: true,
    description: "User ID who changed the status",
  })
  @IsOptional()
  @IsObjectId({ message: "Changed by must be a valid MongoDB ObjectId" })
  @Transform(toObjectIdOptional)
  changedBy?: Types.ObjectId | null;

  @Field(() => UserProductInquiryUpdateStatusHistoryContactedGqlInput, {
    nullable: true,
    description: "Contact details when status is CONTACTED",
  })
  @ValidateIf(
    (entry: UserProductInquiryUpdateStatusHistoryEntryGqlInput) =>
      entry.contacted !== null && entry.contacted !== undefined,
  )
  @IsObject({ message: "Contact details must be an object when provided" })
  @ValidateNested()
  @Type(() => UserProductInquiryUpdateStatusHistoryContactedGqlInput)
  contacted?: UserProductInquiryUpdateStatusHistoryContactedGqlInput | null;

  @Field(() => UserProductInquiryUpdateStatusHistorySaleCompletedGqlInput, {
    nullable: true,
    description: "Sale completion details when status is SALE_COMPLETED",
  })
  @ValidateIf(
    (entry: UserProductInquiryUpdateStatusHistoryEntryGqlInput) =>
      entry.saleCompleted !== null && entry.saleCompleted !== undefined,
  )
  @IsObject({
    message: "Sale completion details must be an object when provided",
  })
  @ValidateNested()
  @Type(() => UserProductInquiryUpdateStatusHistorySaleCompletedGqlInput)
  saleCompleted?: UserProductInquiryUpdateStatusHistorySaleCompletedGqlInput | null;
}

@InputType()
export class UserProductInquiryUpdatePreviewModelGqlInput {
  @Field({ description: "AI provider name" })
  @IsString({ message: "Provider must be a string" })
  @IsNotEmpty({ message: "Provider is required" })
  @MaxLength(128, { message: "Provider cannot be longer than 128 characters" })
  provider: string;

  @Field({ description: "AI model name" })
  @IsString({ message: "Model must be a string" })
  @IsNotEmpty({ message: "Model is required" })
  @MaxLength(256, { message: "Model cannot be longer than 256 characters" })
  model: string;

  @Field({
    nullable: true,
    description: "Placement prompt used for generation",
  })
  @IsOptional()
  @IsString({ message: "Placement prompt must be a string" })
  @MaxLength(20000, {
    message: "Placement prompt cannot be longer than 20000 characters",
  })
  placementPrompt?: string | null;

  @Field({ nullable: true, description: "Aspect ratio used for generation" })
  @IsOptional()
  @IsString({ message: "Aspect ratio must be a string" })
  @MaxLength(32, {
    message: "Aspect ratio cannot be longer than 32 characters",
  })
  aspectRatio?: string | null;

  @Field({ nullable: true, description: "Image size used for generation" })
  @IsOptional()
  @IsString({ message: "Image size must be a string" })
  @MaxLength(32, { message: "Image size cannot be longer than 32 characters" })
  imageSize?: string | null;

  @Field({
    nullable: true,
    description: "Reasoning effort used for generation",
  })
  @IsOptional()
  @IsString({ message: "Reasoning effort must be a string" })
  @MaxLength(32, {
    message: "Reasoning effort cannot be longer than 32 characters",
  })
  reasoningEffort?: string | null;
}

@InputType()
export class UserProductInquiryUpdatePreviewGqlInput {
  @Field(() => ID, { description: "Uploaded room environment photo file ID" })
  @IsObjectId({
    message: "Environment file ID must be a valid MongoDB ObjectId",
  })
  @Transform(toObjectId)
  environmentFileId: Types.ObjectId;

  @Field(() => ID, { description: "Generated preview result image file ID" })
  @IsObjectId({ message: "Result file ID must be a valid MongoDB ObjectId" })
  @Transform(toObjectId)
  resultFileId: Types.ObjectId;

  @Field(() => ID, {
    nullable: true,
    description: "Source AI product image file ID",
  })
  @IsOptional()
  @IsObjectId({
    message: "Source product image file ID must be a valid MongoDB ObjectId",
  })
  @Transform(toObjectIdOptional)
  sourceProductImageFileId?: Types.ObjectId | null;

  @Field(() => GraphQLISODateTime, {
    description: "When the preview was generated",
  })
  @IsDate({ message: "Generated at must be an ISO date" })
  generatedAt: Date;

  @Field(() => Float, {
    nullable: true,
    description: "Preview generation duration in seconds",
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Duration seconds must be a number" })
  @Min(0, { message: "Duration seconds cannot be negative" })
  durationSeconds?: number | null;

  @Field(() => UserProductInquiryUpdatePreviewModelGqlInput, {
    description: "AI model metadata used for preview generation",
  })
  @IsObject({ message: "Preview model is required" })
  @ValidateNested()
  @Type(() => UserProductInquiryUpdatePreviewModelGqlInput)
  model: UserProductInquiryUpdatePreviewModelGqlInput;

  @Field(() => UserProductInquiryUpdateFabricSnapshotGqlInput, {
    description: "Selected fabric snapshot for this preview",
  })
  @IsObject({ message: "Fabric snapshot is required for each preview entry" })
  @ValidateNested()
  @Type(() => UserProductInquiryUpdateFabricSnapshotGqlInput)
  fabric: UserProductInquiryUpdateFabricSnapshotGqlInput;
}

@InputType()
export class UserProductInquiryUpdateContactGqlInput {
  @Field({ description: "Contact first name" })
  @IsString({ message: "First name must be a string" })
  @IsNotEmpty({ message: "First name is required" })
  @MaxLength(64, { message: "First name cannot be longer than 64 characters" })
  firstName: string;

  @Field({ description: "Contact last name" })
  @IsString({ message: "Last name must be a string" })
  @IsNotEmpty({ message: "Last name is required" })
  @MaxLength(64, { message: "Last name cannot be longer than 64 characters" })
  lastName: string;

  @Field({ description: "Contact phone number" })
  @IsString({ message: "Phone must be a string" })
  @IsNotEmpty({ message: "Phone is required" })
  @MaxLength(32, { message: "Phone cannot be longer than 32 characters" })
  phone: string;

  @Field(() => GraphQLISODateTime, {
    description: "When contact was requested",
  })
  @IsDate({ message: "Requested at must be an ISO date" })
  requestedAt: Date;

  @Field({ nullable: true, description: "Optional customer note" })
  @IsOptional()
  @IsString({ message: "Customer note must be a string" })
  @MaxLength(2000, {
    message: "Customer note cannot be longer than 2000 characters",
  })
  customerNote?: string | null;
}

@InputType()
export class UserProductInquiryUpdateGqlInput {
  @Field(() => ID, { description: "User product inquiry record ID" })
  @IsObjectId({ message: "Inquiry ID must be a valid MongoDB ObjectId" })
  @Transform(toObjectId)
  id: Types.ObjectId;

  @Field({ description: "Whether the inquiry is archived" })
  @IsBoolean({ message: "Archived flag must be boolean" })
  isArchived: boolean;

  @Field(() => ID, { description: "Owner user ID" })
  @IsObjectId({ message: "User ID must be a valid MongoDB ObjectId" })
  @Transform(toObjectId)
  userId: Types.ObjectId;

  @Field(() => ID, { description: "Related product ID" })
  @IsObjectId({ message: "Product ID must be a valid MongoDB ObjectId" })
  @Transform(toObjectId)
  productId: Types.ObjectId;

  @Field(() => UserProductInquiryUpdateUserSnapshotGqlInput, {
    description: "User snapshot",
  })
  @IsObject({ message: "User snapshot is required" })
  @ValidateNested()
  @Type(() => UserProductInquiryUpdateUserSnapshotGqlInput)
  user: UserProductInquiryUpdateUserSnapshotGqlInput;

  @Field(() => UserProductInquiryUpdateProductSnapshotGqlInput, {
    description: "Product snapshot",
  })
  @IsObject({ message: "Product snapshot is required" })
  @ValidateNested()
  @Type(() => UserProductInquiryUpdateProductSnapshotGqlInput)
  product: UserProductInquiryUpdateProductSnapshotGqlInput;

  @Field(() => UserProductInquiryStatus, {
    description: "Current inquiry status",
  })
  @IsEnum(UserProductInquiryStatus, { message: "Status must be valid" })
  status: UserProductInquiryStatus;

  @Field(() => [UserProductInquiryUpdateStatusHistoryEntryGqlInput], {
    description: "Full status change history replacement",
  })
  @IsArray({ message: "Status history must be an array" })
  @ArrayMinSize(1, {
    message: "Status history must contain at least one entry",
  })
  @ValidateNested({ each: true })
  @Type(() => UserProductInquiryUpdateStatusHistoryEntryGqlInput)
  statusHistory: UserProductInquiryUpdateStatusHistoryEntryGqlInput[];

  @Field(() => [UserProductInquiryUpdatePreviewGqlInput], {
    nullable: true,
    description: "AI preview generations. Use null to clear them.",
  })
  @ValidateIf(
    (input: UserProductInquiryUpdateGqlInput) => input.preview !== null,
  )
  @IsOptional()
  @IsArray({ message: "Preview must be an array when provided" })
  @ValidateNested({ each: true })
  @Type(() => UserProductInquiryUpdatePreviewGqlInput)
  preview?: UserProductInquiryUpdatePreviewGqlInput[] | null;

  @Field(() => UserProductInquiryUpdateContactGqlInput, {
    nullable: true,
    description: "Contact request details. Use null to clear it.",
  })
  @ValidateIf(
    (input: UserProductInquiryUpdateGqlInput) => input.contact !== null,
  )
  @IsOptional()
  @IsObject({ message: "Contact must be an object when provided" })
  @ValidateNested()
  @Type(() => UserProductInquiryUpdateContactGqlInput)
  contact?: UserProductInquiryUpdateContactGqlInput | null;
}
