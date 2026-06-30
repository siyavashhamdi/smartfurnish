import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  isProductAiPreviewRoutePathname,
  productAiPreviewRoutePath,
  productDetailPath,
} from "../../routing/product-route-path";

export function useProductAiPreviewRoute(productId: string): {
  readonly isOpen: boolean;
  readonly open: () => void;
  readonly close: () => void;
} {
  const location = useLocation();
  const navigate = useNavigate();
  const isOpen = Boolean(productId) && isProductAiPreviewRoutePathname(location.pathname);

  const open = useCallback((): void => {
    if (!productId) {
      return;
    }

    navigate({
      pathname: productAiPreviewRoutePath(productId),
      search: location.search,
    });
  }, [location.search, navigate, productId]);

  const close = useCallback((): void => {
    if (!productId) {
      return;
    }

    navigate({
      pathname: productDetailPath(productId),
      search: location.search,
    });
  }, [location.search, navigate, productId]);

  return { isOpen, open, close };
}
