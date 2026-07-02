import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { Field, ID, InputType } from "@nestjs/graphql";
import { Types } from "mongoose";

import { toObjectId } from "../../../../transforms/object-id.transform";
import { IsObjectId } from "../../../../validators/is-object-id.validator";

@InputType()
export class UserProductInquiryHasActiveRequestGqlInput {
  @Field(() => ID, { description: "Product ID for the visit request check" })
  @IsObjectId({ message: "Product ID must be a valid MongoDB ObjectId" })
  @Transform(toObjectId)
  productId: Types.ObjectId;

  @Field({ description: "Contact mobile phone number to check" })
  @IsString({ message: "Phone must be a string" })
  @IsNotEmpty({ message: "Phone is required" })
  @MaxLength(32, { message: "Phone cannot be longer than 32 characters" })
  phone: string;
}
