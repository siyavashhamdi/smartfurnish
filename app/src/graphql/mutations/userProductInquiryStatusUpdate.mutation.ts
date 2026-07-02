import { gql } from "@apollo/client";

export const USER_PRODUCT_INQUIRY_STATUS_UPDATE_MUTATION = gql`
  mutation UserProductInquiryStatusUpdate($input: UserProductInquiryStatusUpdateGqlInput!) {
    userProductInquiryStatusUpdate(input: $input) {
      id
      status
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
      updatedAt
    }
  }
`;
