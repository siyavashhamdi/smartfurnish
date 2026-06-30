import { gql } from "@apollo/client";

import { PRODUCT_USER_DETAIL_FIELDS } from "../fragments/productCatalog.fragment";

export const USER_PRODUCT_DETAIL_QUERY = gql`
  query UserProductDetail($input: UserProductDetailGqlInput!) {
    product: userProductDetail(input: $input) {
      ${PRODUCT_USER_DETAIL_FIELDS}
    }
  }
`;
