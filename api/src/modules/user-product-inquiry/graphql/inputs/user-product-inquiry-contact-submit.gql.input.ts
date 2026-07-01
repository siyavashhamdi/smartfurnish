import { Transform } from "class-transformer";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from "class-validator";
import { Field, ID, InputType } from "@nestjs/graphql";
import { Types } from "mongoose";

import { toObjectId } from "../../../../transforms/object-id.transform";
import { IsObjectId } from "../../../../validators/is-object-id.validator";

@InputType()
export class UserProductInquiryContactSubmitGqlInput {
  @Field(() => ID, { description: "Product ID for the visit request" })
  @IsObjectId({ message: "Product ID must be a valid MongoDB ObjectId" })
  @Transform(toObjectId)
  productId: Types.ObjectId;

  @Field(() => ID, {
    nullable: true,
    description:
      "Existing inquiry ID from smart preview submit. When omitted, the service creates a new inquiry or updates the latest pending preview inquiry for this product.",
  })
  @IsOptional()
  @IsObjectId({ message: "Inquiry ID must be a valid MongoDB ObjectId" })
  @Transform(toObjectId)
  inquiryId?: Types.ObjectId;

  @Field({
    nullable: true,
    description: "Selected fabric key when available from the product dialog",
  })
  @ValidateIf((input: UserProductInquiryContactSubmitGqlInput) =>
    Boolean(input.colorKey?.trim()),
  )
  @IsString({ message: "Fabric key must be a string" })
  @IsNotEmpty({ message: "Fabric key is required when color key is provided" })
  @MaxLength(128, { message: "Fabric key cannot be longer than 128 characters" })
  fabricKey?: string;

  @Field({
    nullable: true,
    description: "Selected fabric color key when available from the product dialog",
  })
  @ValidateIf((input: UserProductInquiryContactSubmitGqlInput) =>
    Boolean(input.fabricKey?.trim()),
  )
  @IsString({ message: "Color key must be a string" })
  @IsNotEmpty({ message: "Color key is required when fabric key is provided" })
  @MaxLength(128, { message: "Color key cannot be longer than 128 characters" })
  colorKey?: string;

  @Field({ description: "Contact full name" })
  @IsString({ message: "Full name must be a string" })
  @IsNotEmpty({ message: "Full name is required" })
  @MaxLength(128, { message: "Full name cannot be longer than 128 characters" })
  fullName: string;

  @Field({ description: "Contact mobile phone number" })
  @IsString({ message: "Phone must be a string" })
  @IsNotEmpty({ message: "Phone is required" })
  @MaxLength(32, { message: "Phone cannot be longer than 32 characters" })
  phone: string;
}
