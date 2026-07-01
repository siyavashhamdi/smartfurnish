import { gql } from "@apollo/client";

import { FILE_ACCESS_URL_FIELDS } from "../fragments/fileAccessUrl.fragment";

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
      resultFileAccessUrl {
        ${FILE_ACCESS_URL_FIELDS}
      }
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
