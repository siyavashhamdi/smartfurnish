import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Types } from "mongoose";

@ObjectType()
export class UserProductInquiryClaimGqlResponse {
  @Field(() => ID, { description: "Claimed user product inquiry ID" })
  id: Types.ObjectId;
}
