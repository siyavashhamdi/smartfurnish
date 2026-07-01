import type { ProductDiscountType, ProductFabricRow } from "./product-list.api";

export type ProductDiscountSource = {
  readonly type: ProductDiscountType;
  readonly value: number;
};

type ColorPricingSource = {
  readonly isActive?: boolean;
  readonly priceIrt?: number | null;
  readonly discount?: ProductDiscountSource | null;
};

type FabricPricingSource = {
  readonly isActive?: boolean;
  readonly colors?: ReadonlyArray<ColorPricingSource> | null;
};

export type ProductColorPriceSource = {
  readonly fabrics?: ReadonlyArray<FabricPricingSource> | null;
};

export type ProductListPricing = {
  readonly priceIrt: number | null;
  readonly discount?: ProductDiscountSource | null;
};

type ColorPricingEntry = {
  readonly priceIrt: number;
  readonly discountedPriceIrt: number;
  readonly discount?: ProductDiscountSource;
};

export function calculateColorDiscountAmount(
  priceIrt: number,
  discount?: ProductDiscountSource | null,
): number {
  if (!discount || discount.value <= 0 || priceIrt <= 0) {
    return 0;
  }

  if (discount.type === "PERCENTAGE") {
    return Math.min(
      priceIrt,
      Math.round(priceIrt * (Math.min(discount.value, 100) / 100)),
    );
  }

  return Math.min(priceIrt, discount.value);
}

export function getDiscountedColorPriceIrt(
  color: ColorPricingSource,
): number | null {
  if (typeof color.priceIrt !== "number" || color.priceIrt <= 0) {
    return null;
  }

  const discountAmount = calculateColorDiscountAmount(color.priceIrt, color.discount);
  const discountedPrice = Math.max(0, Math.round(color.priceIrt - discountAmount));

  return discountedPrice < color.priceIrt ? discountedPrice : color.priceIrt;
}

function collectColorPricingEntries(
  product: ProductColorPriceSource,
  options?: { readonly activeOnly?: boolean },
): ColorPricingEntry[] {
  const activeOnly = options?.activeOnly ?? false;
  const entries: ColorPricingEntry[] = [];

  for (const fabric of product.fabrics ?? []) {
    if (activeOnly && fabric.isActive === false) {
      continue;
    }

    for (const color of fabric.colors ?? []) {
      if (activeOnly && color.isActive === false) {
        continue;
      }

      if (typeof color.priceIrt !== "number" || color.priceIrt <= 0) {
        continue;
      }

      const discountedPriceIrt = getDiscountedColorPriceIrt(color);
      if (discountedPriceIrt == null) {
        continue;
      }

      const discount =
        color.discount && color.discount.value > 0 ? color.discount : undefined;

      entries.push({
        priceIrt: color.priceIrt,
        discountedPriceIrt,
        discount,
      });
    }
  }

  return entries;
}

export function collectProductColorPrices(
  product: ProductColorPriceSource,
  options?: { readonly activeOnly?: boolean },
): number[] {
  return collectColorPricingEntries(product, options).map((entry) => entry.priceIrt);
}

export function resolveProductMinPriceIrt(
  product: ProductColorPriceSource,
  options?: { readonly activeOnly?: boolean },
): number | null {
  const prices = collectProductColorPrices(product, options);
  if (prices.length === 0) {
    return null;
  }

  return Math.min(...prices);
}

export function resolveProductListPricing(
  product: ProductColorPriceSource,
  options?: { readonly activeOnly?: boolean },
): ProductListPricing {
  const entries = collectColorPricingEntries(product, options);
  if (entries.length === 0) {
    return { priceIrt: null };
  }

  const bestOffer = entries.reduce((currentBest, entry) => {
    if (entry.discountedPriceIrt < currentBest.discountedPriceIrt) {
      return entry;
    }

    if (
      entry.discountedPriceIrt === currentBest.discountedPriceIrt &&
      entry.priceIrt < currentBest.priceIrt
    ) {
      return entry;
    }

    return currentBest;
  });

  return {
    priceIrt: bestOffer.priceIrt,
    discount: bestOffer.discount ?? null,
  };
}

export function resolveColorPricing(
  color: ColorPricingSource | null | undefined,
): ProductListPricing {
  if (!color || typeof color.priceIrt !== "number" || color.priceIrt <= 0) {
    return { priceIrt: null };
  }

  return {
    priceIrt: color.priceIrt,
    discount: color.discount && color.discount.value > 0 ? color.discount : null,
  };
}

export function resolveProductDisplayPriceIrt(
  product: ProductColorPriceSource & { readonly priceIrt?: number | null },
  options?: { readonly activeOnly?: boolean },
): number | null {
  if (typeof product.priceIrt === "number" && product.priceIrt > 0) {
    return product.priceIrt;
  }

  return resolveProductMinPriceIrt(product, options);
}

export function resolveFabricsMinPriceIrt(
  fabrics: readonly ProductFabricRow[],
  options?: { readonly activeOnly?: boolean },
): number | null {
  return resolveProductMinPriceIrt({ fabrics }, options);
}

export function isProductFreeForColors(
  product: ProductColorPriceSource,
  options?: { readonly activeOnly?: boolean },
): boolean {
  const entries = collectColorPricingEntries(product, options);
  if (entries.length === 0) {
    return true;
  }

  return Math.min(...entries.map((entry) => entry.discountedPriceIrt)) <= 0;
}
