import { Field, Float, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ProductAiPreviewStagingDurationGqlResponse {
  @Field(() => Float, {
    description:
      "Estimated AI preview generation duration in seconds, maintained by the system",
  })
  durationSeconds: number;
}
