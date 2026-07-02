import { Transform, Type } from "class-transformer";
import {
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
import { toObjectId } from "../../../../transforms/object-id.transform";
import { IsObjectId } from "../../../../validators/is-object-id.validator";

@InputType()
export class UserProductInquiryStatusUpdateContactedGqlInput {
  @Field(() => GraphQLISODateTime, { description: "When contact was made" })
  @IsDate({ message: "Contacted at must be an ISO date" })
  contactedAt: Date;

  @Field(() => ID, { description: "SUPER_ADMIN user ID who made the contact" })
  @IsObjectId({ message: "Contacted by must be a valid MongoDB ObjectId" })
  @Transform(toObjectId)
  contactedBy: Types.ObjectId;
}

@InputType()
export class UserProductInquiryStatusUpdateSaleCompletedGqlInput {
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
export class UserProductInquiryStatusUpdateGqlInput {
  @Field(() => ID, { description: "User product inquiry record ID" })
  @IsObjectId({ message: "Inquiry ID must be a valid MongoDB ObjectId" })
  @Transform(toObjectId)
  id: Types.ObjectId;

  @Field(() => UserProductInquiryStatus, {
    description: "New inquiry status",
  })
  @IsEnum(UserProductInquiryStatus, {
    message: "Status must be a valid inquiry status",
  })
  status: UserProductInquiryStatus;

  @Field({
    nullable: true,
    description:
      "Optional status-change description stored on the new history entry",
  })
  @IsOptional()
  @IsString({ message: "Description must be a string" })
  @MaxLength(2000, {
    message: "Description cannot be longer than 2000 characters",
  })
  description?: string | null;

  @Field(() => UserProductInquiryStatusUpdateContactedGqlInput, {
    nullable: true,
    description: "Contact details required when status is CONTACTED",
  })
  @ValidateIf(
    (input: UserProductInquiryStatusUpdateGqlInput) =>
      input.status === UserProductInquiryStatus.CONTACTED,
  )
  @IsNotEmpty({
    message: "Contact details are required when status is CONTACTED",
  })
  @IsObject({ message: "Contact details must be an object" })
  @ValidateNested()
  @Type(() => UserProductInquiryStatusUpdateContactedGqlInput)
  contacted?: UserProductInquiryStatusUpdateContactedGqlInput | null;

  @Field(() => UserProductInquiryStatusUpdateSaleCompletedGqlInput, {
    nullable: true,
    description:
      "Sale completion details required when status is SALE_COMPLETED",
  })
  @ValidateIf(
    (input: UserProductInquiryStatusUpdateGqlInput) =>
      input.status === UserProductInquiryStatus.SALE_COMPLETED,
  )
  @IsNotEmpty({
    message:
      "Sale completion details are required when status is SALE_COMPLETED",
  })
  @IsObject({ message: "Sale completion details must be an object" })
  @ValidateNested()
  @Type(() => UserProductInquiryStatusUpdateSaleCompletedGqlInput)
  saleCompleted?: UserProductInquiryStatusUpdateSaleCompletedGqlInput | null;
}
