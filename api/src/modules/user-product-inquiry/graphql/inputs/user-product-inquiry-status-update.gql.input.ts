import { Transform, Type } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { Field, GraphQLISODateTime, ID, InputType } from "@nestjs/graphql";
import { Types } from "mongoose";

import { UserProductInquiryStatus } from "../../../../enums";
import { toObjectId, toObjectIdOptional } from "../../../../transforms/object-id.transform";
import { IsObjectId } from "../../../../validators/is-object-id.validator";

@InputType()
export class UserProductInquiryStatusUpdatePayloadGqlInput {
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "When contact was made",
  })
  @IsOptional()
  @IsDate({ message: "Contacted at must be an ISO date" })
  contactedAt?: Date;

  @Field(() => ID, {
    nullable: true,
    description: "SUPER_ADMIN user ID who made the contact",
  })
  @IsOptional()
  @IsObjectId({ message: "Contacted by must be a valid MongoDB ObjectId" })
  @Transform(toObjectIdOptional)
  contactedBy?: Types.ObjectId;

  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "When the sale was completed",
  })
  @IsOptional()
  @IsDate({ message: "Completed at must be an ISO date" })
  completedAt?: Date;

  @Field(() => ID, {
    nullable: true,
    description: "SUPER_ADMIN user ID who marked the sale completed",
  })
  @IsOptional()
  @IsObjectId({ message: "Completed by must be a valid MongoDB ObjectId" })
  @Transform(toObjectIdOptional)
  completedBy?: Types.ObjectId;
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
    description: "Optional status-change description stored on the new history entry",
  })
  @IsOptional()
  @IsString({ message: "Description must be a string" })
  @MaxLength(2000, {
    message: "Description cannot be longer than 2000 characters",
  })
  description?: string | null;

  @Field(() => UserProductInquiryStatusUpdatePayloadGqlInput, {
    nullable: true,
    description: "Status payload required when status is CONTACTED or SALE_COMPLETED",
  })
  @ValidateIf(
    (input: UserProductInquiryStatusUpdateGqlInput) =>
      input.status === UserProductInquiryStatus.CONTACTED ||
      input.status === UserProductInquiryStatus.SALE_COMPLETED,
  )
  @IsNotEmpty({
    message: "Status payload is required when status is CONTACTED or SALE_COMPLETED",
  })
  @IsObject({ message: "Contact payload must be an object" })
  @ValidateNested()
  @Type(() => UserProductInquiryStatusUpdatePayloadGqlInput)
  payload?: UserProductInquiryStatusUpdatePayloadGqlInput | null;
}
