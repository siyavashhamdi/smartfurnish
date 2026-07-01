import { gql } from "@apollo/client";

export const USER_PRODUCT_INQUIRY_LIST_QUERY = gql`
  query UserProductInquiryList($input: UserProductInquiryListGqlInput!) {
    userProductInquiryList(input: $input) {
      items {
        id
        user {
          fullName
          username
          phoneNumber
        }
        product {
          title
        }
        fabric {
          patternName
          colorName
          colorHex
        }
        status
        contact {
          firstName
          lastName
          phone
          requestedAt
        }
        previewGeneratedAt
        previewCount
        createdAt
        updatedAt
      }
      pagination {
        limit
        skip
        total
        count
      }
    }
  }
`;
