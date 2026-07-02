import { getDiscountedColorPriceIrt } from "./product-pricing.util";
import type { ProductFabricColorRow, ProductFabricRow } from "./product-list.api";

export type FabricColorSelectionRef = {
  readonly fabricKey: string;
  readonly colorKey: string;
};

export function normalizeFabricHexColor(hexCode?: string | null): string | null {
  const trimmed = hexCode?.trim();
  if (!trimmed) {
    return null;
  }

  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(withHash) ? withHash : null;
}

export function expandFabricHexToSixDigits(hexCode?: string | null): string | null {
  const normalized = normalizeFabricHexColor(hexCode);
  if (!normalized) {
    return null;
  }

  if (/^#[0-9A-Fa-f]{6}$/.test(normalized)) {
    return normalized.toUpperCase();
  }

  if (/^#[0-9A-Fa-f]{3}$/.test(normalized)) {
    const [, red, green, blue] = normalized;
    return `#${red}${red}${green}${green}${blue}${blue}`.toUpperCase();
  }

  if (/^#[0-9A-Fa-f]{8}$/.test(normalized)) {
    return normalized.slice(0, 7).toUpperCase();
  }

  return null;
}

export function formatFabricHexForColorInput(
  hexCode: string,
  fallback = "#94A3B8",
): string {
  return expandFabricHexToSixDigits(hexCode) ?? fallback;
}

export function sanitizeFabricHexDraft(value: string): string {
  const withoutInvalid = value.replace(/[^#0-9A-Fa-f]/g, "");
  const hashIndex = withoutInvalid.indexOf("#");
  if (hashIndex === -1) {
    return withoutInvalid;
  }

  return `#${withoutInvalid.slice(hashIndex + 1).replace(/#/g, "")}`;
}

export function getActiveFabrics(fabrics: readonly ProductFabricRow[]): ProductFabricRow[] {
  return [...fabrics]
    .filter((fabric) => fabric.isActive)
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));
}

export function getActiveColorsForFabric(fabric: ProductFabricRow): ProductFabricColorRow[] {
  return [...fabric.colors]
    .filter((color) => color.isActive)
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));
}

export function getFirstActiveColorKey(fabric: ProductFabricRow): string | null {
  return getActiveColorsForFabric(fabric)[0]?.key ?? null;
}

function compareColorPricing(
  leftDiscountedPrice: number,
  leftPriceIrt: number,
  rightDiscountedPrice: number,
  rightPriceIrt: number,
): number {
  if (leftDiscountedPrice !== rightDiscountedPrice) {
    return leftDiscountedPrice - rightDiscountedPrice;
  }

  return leftPriceIrt - rightPriceIrt;
}

export function resolveLowestPricedColorKeyForFabric(
  fabric: ProductFabricRow,
): string | null {
  let bestColor: ProductFabricColorRow | null = null;
  let bestDiscountedPrice: number | null = null;

  for (const color of getActiveColorsForFabric(fabric)) {
    const discountedPrice = getDiscountedColorPriceIrt(color);
    if (discountedPrice == null) {
      continue;
    }

    if (
      bestColor == null ||
      bestDiscountedPrice == null ||
      compareColorPricing(
        discountedPrice,
        color.priceIrt ?? 0,
        bestDiscountedPrice,
        bestColor.priceIrt ?? 0,
      ) < 0
    ) {
      bestColor = color;
      bestDiscountedPrice = discountedPrice;
    }
  }

  return bestColor?.key ?? getFirstActiveColorKey(fabric);
}

export function resolveLowestPricedColorSelection(
  fabrics: readonly ProductFabricRow[],
): FabricColorSelectionRef | null {
  let bestFabric: ProductFabricRow | null = null;
  let bestColor: ProductFabricColorRow | null = null;
  let bestDiscountedPrice: number | null = null;

  for (const fabric of getActiveFabrics(fabrics)) {
    for (const color of getActiveColorsForFabric(fabric)) {
      const discountedPrice = getDiscountedColorPriceIrt(color);
      if (discountedPrice == null) {
        continue;
      }

      if (
        bestColor == null ||
        bestDiscountedPrice == null ||
        compareColorPricing(
          discountedPrice,
          color.priceIrt ?? 0,
          bestDiscountedPrice,
          bestColor.priceIrt ?? 0,
        ) < 0
      ) {
        bestFabric = fabric;
        bestColor = color;
        bestDiscountedPrice = discountedPrice;
      }
    }
  }

  if (!bestFabric || !bestColor) {
    const fallbackFabric = getActiveFabrics(fabrics)[0];
    if (!fallbackFabric) {
      return null;
    }

    const fallbackColorKey = getFirstActiveColorKey(fallbackFabric);
    if (!fallbackColorKey) {
      return null;
    }

    return {
      fabricKey: fallbackFabric.key,
      colorKey: fallbackColorKey,
    };
  }

  return {
    fabricKey: bestFabric.key,
    colorKey: bestColor.key,
  };
}
