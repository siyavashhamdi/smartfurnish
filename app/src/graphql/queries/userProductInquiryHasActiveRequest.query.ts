import { gql } from "@apollo/client";

export const USER_PRODUCT_INQUIRY_HAS_ACTIVE_REQUEST_QUERY = gql`
  query UserProductInquiryHasActiveRequest(
    $input: UserProductInquiryHasActiveRequestGqlInput!
  ) {
    userProductInquiryHasActiveRequest(input: $input)
  }
`;
