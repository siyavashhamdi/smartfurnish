import type { DiscountKind, DraftFabric, DraftSetPiece, DraftVendor } from "./product-form-dialog/types";

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
  readonly parsedPriceIrt: number | undefined;
  readonly discountEnabled: boolean;
  readonly hasPositivePrice: boolean;
  readonly discountKind: DiscountKind;
  readonly discountValue: string;
  readonly vendor: DraftVendor;
  readonly setPieces: DraftSetPiece[];
  readonly fabrics: DraftFabric[];
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

  if (input.parsedPriceIrt != null && input.parsedPriceIrt < 0) {
    return invalid("قیمت محصول نمی‌تواند منفی باشد.", "intro");
  }

  if (input.discountEnabled && input.hasPositivePrice) {
    const parsedDiscountValue = input.parseOptionalNumber(input.discountValue);
    if (parsedDiscountValue == null) {
      return invalid("مقدار تخفیف الزامی است.", "intro");
    }
    if (
      input.discountKind === "PERCENTAGE" &&
      (parsedDiscountValue <= 0 || parsedDiscountValue > 100)
    ) {
      return invalid("مقدار تخفیف درصدی باید بین ۰ تا ۱۰۰ باشد.", "intro");
    }
    if (input.discountKind === "FIXED_AMOUNT_IRT" && parsedDiscountValue <= 0) {
      return invalid("مقدار تخفیف ثابت باید عددی مثبت باشد.", "intro");
    }
    if (
      input.discountKind === "FIXED_AMOUNT_IRT" &&
      input.parsedPriceIrt != null &&
      parsedDiscountValue > input.parsedPriceIrt
    ) {
      return invalid("مقدار تخفیف ثابت نمی‌تواند بیشتر از قیمت محصول باشد.", "intro");
    }
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
    }
  }

  return { valid: true };
}
