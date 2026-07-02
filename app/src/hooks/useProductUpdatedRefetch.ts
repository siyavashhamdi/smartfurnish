import { useEffect, useRef } from "react";

import { subscribeGeneralUpdates } from "../lib/general-updates-listeners";
import { parseProductUpdatedLiveUpdateProductId } from "../utilities/product-updated-live-update.util";

type UseProductUpdatedRefetchOptions = {
  readonly enabled?: boolean;
  readonly productId?: string | null;
  readonly refetch: () => void;
};

/**
 * Refetches product data when a catalog update is published for a product.
 *
 * Omit `productId` to refetch on any product update (e.g. showroom list).
 * Pass `productId` to refetch only when that product was updated.
 */
export function useProductUpdatedRefetch({
  enabled = false,
  productId,
  refetch,
}: UseProductUpdatedRefetchOptions): void {
  const productIdRef = useRef(productId);
  const refetchRef = useRef(refetch);

  useEffect(() => {
    productIdRef.current = productId;
  }, [productId]);

  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    return subscribeGeneralUpdates((event) => {
      const updatedProductId = parseProductUpdatedLiveUpdateProductId(event);
      if (!updatedProductId) {
        return;
      }

      const activeProductId = productIdRef.current?.trim() || null;
      if (activeProductId && updatedProductId !== activeProductId) {
        return;
      }

      refetchRef.current();
    });
  }, [enabled]);
}
