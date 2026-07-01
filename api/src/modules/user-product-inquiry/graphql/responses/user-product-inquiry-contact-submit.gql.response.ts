import { Field, GraphQLISODateTime, ID, ObjectType } from "@nestjs/graphql";
import { Types } from "mongoose";

import { UserProductInquiryStatus } from "../../../../enums";

@ObjectType()
export class UserProductInquiryContactSubmitContactGqlResponse {
  @Field({ description: "Contact first name" })
  firstName: string;

  @Field({ description: "Contact last name" })
  lastName: string;

  @Field({ description: "Contact phone number" })
  phone: string;

  @Field(() => GraphQLISODateTime, {
    description: "Date when contact was requested",
  })
  requestedAt: Date;
}

@ObjectType()
export class UserProductInquiryContactSubmitGqlResponse {
  @Field(() => ID, { description: "Updated user product inquiry ID" })
  id: Types.ObjectId;

  @Field(() => UserProductInquiryStatus, {
    description: "Inquiry status after contact submission",
  })
  status: UserProductInquiryStatus;

  @Field(() => UserProductInquiryContactSubmitContactGqlResponse, {
    description: "Submitted contact details",
  })
  contact: UserProductInquiryContactSubmitContactGqlResponse;
}
