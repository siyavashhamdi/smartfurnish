import { USER_PRODUCT_DETAIL_QUERY } from "../graphql/queries/userProductDetail.query";
import { apolloClient } from "./apollo-client";
import { getIsOfflineMode } from "./offline-state";
import { isNativeAndroidShell } from "../utils/nativePlatform.util";

const prefetchedProductDetailIds = new Set<string>();

/** Warms Apollo cache for a single product detail ahead of navigation. */
export function prefetchUserProductDetail(productId: string): void {
  const normalizedId = productId.trim();
  if (!normalizedId || getIsOfflineMode() || isNativeAndroidShell()) {
    return;
  }

  if (prefetchedProductDetailIds.has(normalizedId)) {
    return;
  }

  prefetchedProductDetailIds.add(normalizedId);

  void apolloClient
    .query({
      query: USER_PRODUCT_DETAIL_QUERY,
      variables: { input: { id: normalizedId } },
      fetchPolicy: "cache-first",
    })
    .catch(() => {
      prefetchedProductDetailIds.delete(normalizedId);
    });
}
