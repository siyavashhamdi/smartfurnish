import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { Field, ID, InputType } from "@nestjs/graphql";
import { Types } from "mongoose";

import { toObjectId } from "../../../../transforms/object-id.transform";
import { IsObjectId } from "../../../../validators/is-object-id.validator";

@InputType()
export class UserProductInquiryPreviewSubmitGqlInput {
  @Field(() => ID, { description: "Product ID used for the smart preview" })
  @IsObjectId({ message: "Product ID must be a valid MongoDB ObjectId" })
  @Transform(toObjectId)
  productId: Types.ObjectId;

  @Field(() => ID, {
    nullable: true,
    description:
      "Existing inquiry ID from a prior smart preview submit. When provided, appends a new preview generation to that inquiry.",
  })
  @IsOptional()
  @IsObjectId({ message: "Inquiry ID must be a valid MongoDB ObjectId" })
  @Transform(toObjectId)
  inquiryId?: Types.ObjectId;

  @Field({ description: "Selected fabric key" })
  @IsString({ message: "Fabric key must be a string" })
  @IsNotEmpty({ message: "Fabric key is required" })
  @MaxLength(128, { message: "Fabric key cannot be longer than 128 characters" })
  fabricKey: string;

  @Field({ description: "Selected fabric color key" })
  @IsString({ message: "Color key must be a string" })
  @IsNotEmpty({ message: "Color key is required" })
  @MaxLength(128, { message: "Color key cannot be longer than 128 characters" })
  colorKey: string;

  @Field(() => ID, { description: "Uploaded room environment photo file ID" })
  @IsObjectId({ message: "Environment file ID must be a valid MongoDB ObjectId" })
  @Transform(toObjectId)
  environmentFileId: Types.ObjectId;
}
