import { Field, Float, GraphQLISODateTime, ID, ObjectType } from "@nestjs/graphql";
import { Types } from "mongoose";

import { UserProductInquiryStatus } from "../../../../enums";

@ObjectType()
export class UserProductInquiryPreviewSubmitProductGqlResponse {
  @Field(() => ID, { description: "Product ID for the generated preview" })
  id: Types.ObjectId;

  @Field({ description: "Product title at preview generation time" })
  title: string;
}

@ObjectType()
export class UserProductInquiryPreviewSubmitFabricGqlResponse {
  @Field({ description: "Fabric pattern name" })
  patternName: string;

  @Field({ description: "Selected fabric color name" })
  colorName: string;

  @Field({
    nullable: true,
    description: "Selected fabric color hex code",
  })
  colorHex?: string;

  @Field({ description: "Combined fabric and color label" })
  label: string;
}

@ObjectType()
export class UserProductInquiryPreviewSubmitGqlResponse {
  @Field(() => ID, { description: "Created user product inquiry ID" })
  id: Types.ObjectId;

  @Field(() => ID, { description: "Product ID for the inquiry" })
  productId: Types.ObjectId;

  @Field(() => UserProductInquiryStatus, {
    description: "Inquiry status after preview submission",
  })
  status: UserProductInquiryStatus;

  @Field({ description: "Generated preview image URL" })
  image: string;

  @Field(() => Float, {
    description: "Preview generation duration in seconds for this run",
  })
  durationSeconds: number;

  @Field(() => Float, {
    description:
      "Estimated preview generation duration in seconds for progress UI",
  })
  stagingDurationSeconds: number;

  @Field({
    nullable: true,
    description: "Optional AI generation description",
  })
  description?: string | null;

  @Field(() => ID, { description: "Uploaded room environment photo file ID" })
  environmentFileId: Types.ObjectId;

  @Field(() => ID, { description: "Stored AI preview result image file ID" })
  resultFileId: Types.ObjectId;

  @Field(() => ID, {
    description: "Source AI product image file ID used for generation",
  })
  sourceProductImageFileId: Types.ObjectId;

  @Field(() => GraphQLISODateTime, {
    description: "When the preview was generated",
  })
  generatedAt: Date;

  @Field({
    nullable: true,
    description: "Aspect ratio used for preview generation",
  })
  aspectRatio?: string;

  @Field({ description: "Image size used for preview generation" })
  imageSize: string;

  @Field(() => UserProductInquiryPreviewSubmitProductGqlResponse, {
    description: "Product snapshot for the generated preview",
  })
  product: UserProductInquiryPreviewSubmitProductGqlResponse;

  @Field(() => UserProductInquiryPreviewSubmitFabricGqlResponse, {
    description: "Fabric snapshot for the generated preview",
  })
  fabric: UserProductInquiryPreviewSubmitFabricGqlResponse;
}
