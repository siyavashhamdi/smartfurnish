import { IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { Field, InputType } from "@nestjs/graphql";
import { SessionClientContextGqlInput } from "./session-client-context.gql.input";

@InputType()
export class UserCreateAnonymousGqlInput {
  @Field(() => SessionClientContextGqlInput, {
    nullable: true,
    description: "Client device and browser context captured at session creation time",
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SessionClientContextGqlInput)
  clientContext?: SessionClientContextGqlInput;
}
