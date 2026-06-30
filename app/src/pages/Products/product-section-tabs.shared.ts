export type ProductSectionTab = "intro" | "content" | "reviews";

export type ProductDetailSectionTab =
  | "intro"
  | "setPieces"
  | "material"
  | "fabrics"
  | "reviews";

export const PRODUCT_FORM_SECTION_TABS: ReadonlyArray<{
  readonly value: ProductSectionTab;
  readonly label: string;
}> = [
  { value: "intro", label: "اطلاعات اصلی" },
  { value: "content", label: "کاتالوگ" },
  { value: "reviews", label: "امتیاز و نظرات" },
];

export const PRODUCT_DETAIL_SECTION_TABS: ReadonlyArray<{
  readonly value: ProductDetailSectionTab;
  readonly label: string;
}> = [
  { value: "intro", label: "معرفی" },
  { value: "setPieces", label: "قطعات" },
  { value: "material", label: "متریال" },
  { value: "fabrics", label: "پارچه‌ها" },
  { value: "reviews", label: "امتیاز و نظرات" },
];

export const PRODUCT_DETAIL_SECTION_TARGETS: Record<ProductDetailSectionTab, string> = {
  intro: "product-intro",
  setPieces: "product-set-pieces",
  material: "product-material",
  fabrics: "product-fabrics",
  reviews: "product-reviews",
};

export const PRODUCT_FORM_SECTION_TARGETS: Record<ProductSectionTab, string> = {
  intro: "product-form-intro",
  content: "product-form-content",
  reviews: "product-form-reviews",
};

type ProductDetailTabVisibilityInput = {
  readonly fabricsCount: number;
  readonly setPiecesCount: number;
  readonly hasMaterialProfile: boolean;
  readonly showReviews: boolean;
};

export function buildVisibleProductDetailTabs({
  fabricsCount,
  setPiecesCount,
  hasMaterialProfile,
  showReviews,
}: ProductDetailTabVisibilityInput): ProductDetailSectionTab[] {
  const tabs: ProductDetailSectionTab[] = ["intro"];

  if (setPiecesCount > 0) {
    tabs.push("setPieces");
  }
  if (hasMaterialProfile) {
    tabs.push("material");
  }
  if (fabricsCount > 0) {
    tabs.push("fabrics");
  }
  if (showReviews) {
    tabs.push("reviews");
  }

  return tabs;
}

export function resolveProductDetailSectionTabDefinition(tab: ProductDetailSectionTab) {
  return PRODUCT_DETAIL_SECTION_TABS.find((entry) => entry.value === tab);
}
