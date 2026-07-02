import { gql } from "@apollo/client";

import { FILE_ACCESS_URL_FIELDS } from "../fragments/fileAccessUrl.fragment";

export const USER_PRODUCT_INQUIRY_DETAIL_QUERY = gql`
  query UserProductInquiryDetail($input: UserProductInquiryDetailGqlInput!) {
    userProductInquiryDetail(input: $input) {
      id
      isArchived
      userId
      productId
      status
      user {
        fullName
        username
        phoneNumber
        roles
      }
      product {
        title
        coverImageAccessUrls {
          ${FILE_ACCESS_URL_FIELDS}
        }
      }
      statusHistory {
        status
        reason
        description
        changedAt
        changedBy
        contacted {
          contactedAt
          contactedBy
        }
        saleCompleted {
          completedAt
          completedBy
          finalPriceIrt
        }
      }
      preview {
        environmentFileId
        resultFileId
        sourceProductImageFileId
        generatedAt
        durationSeconds
        model {
          provider
          model
          aspectRatio
          imageSize
          reasoningEffort
        }
        fabric {
          fabricKey
          colorKey
          patternName
          colorName
          colorHex
          label
        }
        environmentFileAccessUrl {
          ${FILE_ACCESS_URL_FIELDS}
        }
        resultFileAccessUrl {
          ${FILE_ACCESS_URL_FIELDS}
        }
        sourceProductImageFileAccessUrl {
          ${FILE_ACCESS_URL_FIELDS}
        }
      }
      contact {
        firstName
        lastName
        phone
        requestedAt
        customerNote
      }
      relatedActiveInquiries {
        id
        status
        firstName
        lastName
        phone
        requestedAt
      }
      createdAt
      updatedAt
      createdBy
      updatedBy
    }
  }
`;
