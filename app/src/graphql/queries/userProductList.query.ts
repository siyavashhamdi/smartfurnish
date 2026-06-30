import { gql } from "@apollo/client";

import { PRODUCT_LIST_SUMMARY_FIELDS } from "../fragments/productCatalog.fragment";

export const USER_PRODUCT_LIST_QUERY = gql`
  query UserProductList($input: ProductListGqlInput!) {
    productList: userProductList(input: $input) {
      items {
        ${PRODUCT_LIST_SUMMARY_FIELDS}
        isPurchased
      }
      pagination {
        limit
        total
        count
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;
