import { gql } from "@apollo/client";

import { PRODUCT_ADMIN_LIST_SUMMARY_FIELDS } from "../fragments/productCatalog.fragment";

export const PRODUCT_LIST_QUERY = gql`
  query ProductList($input: ProductListGqlInput!) {
    productList(input: $input) {
      items {
        ${PRODUCT_ADMIN_LIST_SUMMARY_FIELDS}
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
