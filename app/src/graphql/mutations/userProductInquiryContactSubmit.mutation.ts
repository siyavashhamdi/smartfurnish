import { gql } from "@apollo/client";

export const USER_PRODUCT_INQUIRY_CONTACT_SUBMIT_MUTATION = gql`
  mutation UserProductInquiryContactSubmit(
    $input: UserProductInquiryContactSubmitGqlInput!
  ) {
    userProductInquiryContactSubmit(input: $input) {
      id
      status
      contact {
        firstName
        lastName
        phone
        requestedAt
      }
    }
  }
`;
