import { gql } from "@apollo/client";

export const USER_PRODUCT_INQUIRY_CLAIM_MUTATION = gql`
  mutation UserProductInquiryClaim($input: UserProductInquiryClaimGqlInput!) {
    userProductInquiryClaim(input: $input) {
      id
    }
  }
`;
