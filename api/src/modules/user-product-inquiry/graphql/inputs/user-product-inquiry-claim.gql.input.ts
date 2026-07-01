import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";
import { Field, ID, InputType } from "@nestjs/graphql";
import { Types } from "mongoose";

import { toObjectId } from "../../../../transforms/object-id.transform";
import { IsObjectId } from "../../../../validators/is-object-id.validator";

@InputType()
export class UserProductInquiryClaimGqlInput {
  @Field(() => ID, { description: "Inquiry ID to transfer to the signed-up user" })
  @IsObjectId({ message: "Inquiry ID must be a valid MongoDB ObjectId" })
  @Transform(toObjectId)
  inquiryId: Types.ObjectId;

  @Field({
    description:
      "Access token issued for the newly registered user after signup",
  })
  @IsString({ message: "Access token must be a string" })
  @IsNotEmpty({ message: "Access token is required" })
  accessToken: string;
}
