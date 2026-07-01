import type { DraftFabric, DraftSetPiece, DraftVendor } from "./product-form-dialog/types";

export type ProductFormValidationSection = "intro" | "content";

export type ProductFormValidationResult =
  | { readonly valid: true }
  | {
      readonly valid: false;
      readonly message: string;
      readonly section: ProductFormValidationSection;
    };

type ValidateProductFormInput = {
  readonly title: string;
  readonly fabrics: DraftFabric[];
  readonly vendor: DraftVendor;
  readonly setPieces: DraftSetPiece[];
  readonly parseOptionalNumber: (value: string) => number | undefined;
};

function invalid(
  message: string,
  section: ProductFormValidationSection
): ProductFormValidationResult {
  return { valid: false, message, section };
}

export function validateProductForm(input: ValidateProductFormInput): ProductFormValidationResult {
  if (!input.title.trim()) {
    return invalid("عنوان محصول الزامی است.", "intro");
  }

  if (
    input.vendor.phone.trim() ||
    input.vendor.address.trim() ||
    input.vendor.notes.trim()
  ) {
    if (!input.vendor.name.trim()) {
      return invalid("نام فروشنده الزامی است.", "content");
    }
  }

  for (const piece of input.setPieces) {
    if (!piece.name.trim()) {
      return invalid("نام هر قطعه ست باید پر شود یا ردیف خالی حذف شود.", "content");
    }

    const parsedWeight = input.parseOptionalNumber(piece.weightKg);
    if (parsedWeight != null && parsedWeight < 0) {
      return invalid("وزن قطعه نمی‌تواند منفی باشد.", "content");
    }
  }

  for (const fabric of input.fabrics) {
    if (!fabric.patternName.trim()) {
      return invalid("نام هر طرح پارچه باید پر شود یا ردیف خالی حذف شود.", "content");
    }

    if (fabric.colors.length === 0) {
      return invalid(`طرح «${fabric.patternName.trim()}» باید حداقل یک رنگ داشته باشد.`, "content");
    }

    for (const color of fabric.colors) {
      if (!color.name.trim()) {
        return invalid(`نام رنگ در طرح «${fabric.patternName.trim()}» الزامی است.`, "content");
      }

      const parsedColorPrice = input.parseOptionalNumber(color.priceIrt);
      if (parsedColorPrice != null && parsedColorPrice < 0) {
        return invalid(
          `قیمت رنگ «${color.name.trim()}» در طرح «${fabric.patternName.trim()}» نمی‌تواند منفی باشد.`,
          "content"
        );
      }

      if (color.discountEnabled && (parsedColorPrice ?? 0) > 0) {
        const parsedDiscountValue = input.parseOptionalNumber(color.discountValue);
        if (parsedDiscountValue == null) {
          return invalid(
            `مقدار تخفیف رنگ «${color.name.trim()}» در طرح «${fabric.patternName.trim()}» الزامی است.`,
            "content"
          );
        }
        if (
          color.discountKind === "PERCENTAGE" &&
          (parsedDiscountValue <= 0 || parsedDiscountValue > 100)
        ) {
          return invalid(
            `مقدار تخفیف درصدی رنگ «${color.name.trim()}» باید بین ۰ تا ۱۰۰ باشد.`,
            "content"
          );
        }
        if (color.discountKind === "FIXED_AMOUNT_IRT" && parsedDiscountValue <= 0) {
          return invalid(
            `مقدار تخفیف ثابت رنگ «${color.name.trim()}» باید عددی مثبت باشد.`,
            "content"
          );
        }
        if (
          color.discountKind === "FIXED_AMOUNT_IRT" &&
          parsedColorPrice != null &&
          parsedDiscountValue > parsedColorPrice
        ) {
          return invalid(
            `مقدار تخفیف ثابت رنگ «${color.name.trim()}» نمی‌تواند بیشتر از قیمت همان رنگ باشد.`,
            "content"
          );
        }
      }
    }
  }

  return { valid: true };
}
