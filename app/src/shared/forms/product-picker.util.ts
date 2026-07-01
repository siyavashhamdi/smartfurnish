import type { ProductListItemRow } from "../../pages/Products/product-list.api";
import { getPrimaryCoverImageAccessUrl } from "../../pages/Products/product-list.api";
import {
  getDiscountedColorPriceIrt,
  resolveProductListPricing,
} from "../../pages/Products/product-pricing.util";
import type { EntityAutocompleteOption } from "./EntityAutocompleteField";

export type ProductPickerOption = EntityAutocompleteOption & {
  readonly row?: ProductListItemRow;
};

export function calculateDiscountedProductPrice(
  product: Pick<ProductListItemRow, "priceIrt" | "discount" | "fabrics">
): number {
  if (product.fabrics?.length) {
    const listPricing = resolveProductListPricing(product, { activeOnly: true });
    const priceIrt = listPricing.priceIrt ?? 0;
    if (priceIrt <= 0) {
      return 0;
    }

    const discountedPrice = getDiscountedColorPriceIrt({
      priceIrt,
      discount: listPricing.discount,
    });

    return discountedPrice ?? priceIrt;
  }

  const price = product.priceIrt ?? 0;
  if (price <= 0) {
    return 0;
  }

  const discount = product.discount;
  if (!discount || discount.value <= 0) {
    return price;
  }

  if (discount.type === "PERCENTAGE") {
    return Math.max(0, price - Math.round(price * (Math.min(discount.value, 100) / 100)));
  }

  return Math.max(0, price - Math.min(price, discount.value));
}

export function formatProductPickerPrice(amount: number): string {
  return `${amount.toLocaleString("fa-IR").replace(/\u066c/g, ",")} تومان`;
}

export function mapProductRowToPickerOption(row: ProductListItemRow): ProductPickerOption {
  const finalPrice = calculateDiscountedProductPrice(row);

  return {
    id: row.id,
    label: row.title,
    subtitle: formatProductPickerPrice(finalPrice),
    imageAccessUrl: getPrimaryCoverImageAccessUrl(row.coverImageAccessUrls ?? []),
    row,
  };
}

export function createFallbackProductPickerOption(productId: string): ProductPickerOption {
  return {
    id: productId,
    label: productId,
    subtitle: productId,
    imageUrl: null,
  };
}
