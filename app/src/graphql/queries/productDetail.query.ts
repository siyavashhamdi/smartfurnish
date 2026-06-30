import { gql } from "@apollo/client";

import { PRODUCT_ADMIN_DETAIL_FIELDS } from "../fragments/productCatalog.fragment";

export const PRODUCT_DETAIL_QUERY = gql`
  query ProductDetail($input: ProductDetailGqlInput!) {
    productDetail(input: $input) {
      ${PRODUCT_ADMIN_DETAIL_FIELDS}
    }
  }
`;
