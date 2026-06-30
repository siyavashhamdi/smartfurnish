import type { ProductFabricColorRow, ProductFabricRow } from "./product-list.api";

export function normalizeFabricHexColor(hexCode?: string | null): string | null {
  const trimmed = hexCode?.trim();
  if (!trimmed) {
    return null;
  }

  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return /^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/.test(withHash) ? withHash : null;
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
