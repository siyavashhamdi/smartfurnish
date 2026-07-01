import { gql } from "@apollo/client";

export const USER_PRODUCT_INQUIRY_PREVIEW_SUBMIT_MUTATION = gql`
  mutation UserProductInquiryPreviewSubmit(
    $input: UserProductInquiryPreviewSubmitGqlInput!
  ) {
    userProductInquiryPreviewSubmit(input: $input) {
      id
      productId
      status
      image
      durationSeconds
      stagingDurationSeconds
      description
      environmentFileId
      resultFileId
      sourceProductImageFileId
      generatedAt
      aspectRatio
      imageSize
      product {
        id
        title
      }
      fabric {
        patternName
        colorName
        colorHex
        label
      }
    }
  }
`;
