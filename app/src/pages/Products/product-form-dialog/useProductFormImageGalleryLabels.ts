import { useMemo } from "react";

import { useTranslation } from "../../../hooks/useTranslation";

export type ProductFormImageGalleryVariant = "cover" | "setPiece";

export type ProductFormImageGalleryLabels = {
  readonly defaultTitle: string;
  readonly slideLabel: (index: number) => string;
  readonly addButton: string;
  readonly removeLabel: string;
  readonly dropTitle: string;
  readonly mobileDropTitle: string;
  readonly dropHint: string;
  readonly mobileDropHint: string;
  readonly thumbnailsHint: string;
  readonly thumbnailsAriaLabel: string;
};

export function useProductFormImageGalleryLabels(
  variant: ProductFormImageGalleryVariant = "cover",
): ProductFormImageGalleryLabels {
  const { t } = useTranslation();

  return useMemo(() => {
    const baseKey = "pages.products.form.imageGallery";
    const variantKey = `${baseKey}.${variant}`;

    return {
      defaultTitle: t(`${variantKey}.defaultTitle`),
      slideLabel: (index) => t(`${variantKey}.slideLabel`, { index: index + 1 }),
      addButton: t(`${baseKey}.addButton`),
      removeLabel: t(`${variantKey}.removeLabel`),
      dropTitle: t(`${variantKey}.dropTitle`),
      mobileDropTitle: t(`${variantKey}.mobileDropTitle`),
      dropHint: t(`${baseKey}.dropHint`),
      mobileDropHint: t(`${baseKey}.mobileDropHint`),
      thumbnailsHint: t(`${baseKey}.thumbnailsHint`),
      thumbnailsAriaLabel: t(`${variantKey}.thumbnailsAriaLabel`),
    };
  }, [t, variant]);
}
