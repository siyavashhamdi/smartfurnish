import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  buildProductAiPreviewSearch,
  readProductAiPreviewStepFromSearch,
  type ProductAiPreviewStepId,
} from "./product-ai-preview.steps";
import {
  isProductAiPreviewRoutePathname,
  productAiPreviewRoutePath,
  productDetailPath,
} from "../../routing/product-route-path";

export function useProductAiPreviewRoute(productId: string): {
  readonly isOpen: boolean;
  readonly initialStepId: ProductAiPreviewStepId | undefined;
  readonly open: () => void;
  readonly openToStep: (stepId: ProductAiPreviewStepId) => void;
  readonly close: () => void;
} {
  const location = useLocation();
  const navigate = useNavigate();
  const isOpen = Boolean(productId) && isProductAiPreviewRoutePathname(location.pathname);
  const initialStepId = readProductAiPreviewStepFromSearch(location.search);

  const openToStep = useCallback(
    (stepId: ProductAiPreviewStepId): void => {
      if (!productId) {
        return;
      }

      const nextPathname = productAiPreviewRoutePath(productId);
      const nextSearch = buildProductAiPreviewSearch(location.search, stepId);

      navigate(
        {
          pathname: nextPathname,
          search: nextSearch,
        },
        {
          replace: location.pathname === nextPathname,
        },
      );
    },
    [location.pathname, location.search, navigate, productId],
  );

  const open = useCallback((): void => {
    openToStep("setup");
  }, [openToStep]);

  const close = useCallback((): void => {
    if (!productId) {
      return;
    }

    navigate(
      {
        pathname: productDetailPath(productId),
        search: buildProductAiPreviewSearch(location.search, null),
      },
      { replace: true },
    );
  }, [location.search, navigate, productId]);

  return { isOpen, initialStepId, open, openToStep, close };
}
