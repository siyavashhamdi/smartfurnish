import type {
  ProductDiscountType,
  ProductFabricRow,
  ProductMaterialProfileRow,
  ProductSetPieceRow,
} from "./product-list.api";
import type { FileAccessUrl } from "../../utils/fileAccessUrl.util";

export type ProductDetailRecord = {
  readonly id: string;
  readonly title: string;
  readonly summary?: string | null;
  readonly fullDescription?: string | null;
  readonly coverImageAccessUrls: FileAccessUrl[];
  readonly priceIrt?: number | null;
  readonly discount?: {
    readonly type: ProductDiscountType;
    readonly value: number;
  } | null;
  readonly tags: string[];
  readonly isFree: boolean;
  readonly isPurchased: boolean;
  readonly purchaseStatus?: UserProductPurchaseStatus | null;
  readonly materialProfile?: ProductMaterialProfileRow | null;
  readonly setPieces: ProductSetPieceRow[];
  readonly fabrics: ProductFabricRow[];
  readonly isReviewSubmissionEnabled: boolean;
  readonly isReviewsSectionVisible: boolean;
};

export type UserProductDetailQuery = {
  product: ProductDetailRecord;
};

export type UserProductDetailQueryVariables = {
  input: {
    id: string;
  };
};

export type UserProductPaymentMethod = "GATEWAY" | "CARD_TO_CARD" | "CRYPTOCURRENCY" | "FREE";

export type UserProductPurchaseStatus =
  | "PENDING"
  | "PENDING_GATEWAY"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

export type CouponDiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export type PaymentCheckoutCard = {
  readonly cardNumber: string;
  readonly holderName: string;
  readonly bankName: string;
};

export type PaymentCheckoutCryptoWallet = {
  readonly address: string;
  readonly network: string;
};

export type PaymentCheckoutMethod = {
  readonly method: UserProductPaymentMethod;
  readonly isVisible: boolean;
  readonly isActive: boolean;
  readonly isRecommended: boolean;
};

export type UsdtIrtRateConfig = {
  readonly valueIrt: number;
  readonly feeUsdt: number;
  readonly coefficient: number;
};

export type PaymentCheckoutConfig = {
  readonly paymentCards: PaymentCheckoutCard[];
  readonly cryptoWallets: PaymentCheckoutCryptoWallet[];
  readonly paymentMethods: PaymentCheckoutMethod[];
  readonly usdtIrtRate: UsdtIrtRateConfig;
};

export type PaymentCheckoutConfigQuery = {
  readonly paymentCheckoutConfig: PaymentCheckoutConfig;
};

export type CouponValidateRecord = {
  readonly isValid: boolean;
  readonly message?: string | null;
  readonly couponId?: string | null;
  readonly code?: string | null;
  readonly title?: string | null;
  readonly discountType?: CouponDiscountType | null;
  readonly discountValue?: number | null;
  readonly amountIrt?: number | null;
  readonly productDiscountAmountIrt?: number | null;
  readonly payableAmountBeforeCouponIrt?: number | null;
  readonly couponDiscountAmountIrt?: number | null;
  readonly finalAmountIrt?: number | null;
};

export type CouponValidateQuery = {
  readonly couponValidate: CouponValidateRecord;
};

export type CouponValidateQueryVariables = {
  readonly input: {
    readonly productId: string;
    readonly code: string;
  };
};

export type UserProductPurchaseCurrency = "IRT" | "USDT";

export type ProductPurchaseSubmitRecord = {
  readonly id: string;
  readonly productId: string;
  readonly status: UserProductPurchaseStatus;
  readonly paymentMethod: UserProductPaymentMethod;
  readonly currency: UserProductPurchaseCurrency;
  readonly amountIrt: number;
  readonly discountAmountIrt?: number | null;
  readonly finalAmountIrt: number;
  readonly couponCode?: string | null;
  readonly paymentReference?: string | null;
  readonly transactionId?: string | null;
  readonly paymentUrl?: string | null;
  readonly paymentAuthority?: string | null;
  readonly isPurchased: boolean;
};

export type ProductPurchaseSubmitMutation = {
  readonly productPurchaseSubmit: ProductPurchaseSubmitRecord;
};

export type ProductPurchaseSubmitMutationVariables = {
  readonly input: {
    readonly productId: string;
    readonly paymentMethod: UserProductPaymentMethod;
    readonly couponCode?: string | null;
    readonly uploadedReceiptFileId?: string | null;
    readonly paymentReference?: string | null;
    readonly transactionId?: string | null;
  };
};

export function getDiscountedPrice(
  priceIrt?: number | null,
  discount?: ProductDetailRecord["discount"]
): number | null {
  if (!priceIrt || !discount || discount.value <= 0) {
    return null;
  }

  const discountAmount =
    discount.type === "PERCENTAGE"
      ? priceIrt * (Math.min(discount.value, 100) / 100)
      : discount.value;
  const discountedPrice = Math.max(0, Math.round(priceIrt - discountAmount));

  return discountedPrice < priceIrt ? discountedPrice : null;
}

export function formatProductPrice(priceIrt?: number | null): string {
  if (priceIrt == null || priceIrt === 0) {
    return "—";
  }
  return `${priceIrt.toLocaleString("fa-IR").replace(/\u066c/g, ",")} تومان`;
}

export const PRODUCT_PRICE_FROM_LABEL = "قیمت محصول از";

export function formatSetPieceDimensionText(
  dimension: ProductSetPieceRow["dimensions"][number]
): string {
  if (dimension.displayText?.trim()) {
    return dimension.displayText.trim();
  }

  const parts: string[] = [];
  if (typeof dimension.widthCm === "number") {
    parts.push(`عرض ${dimension.widthCm.toLocaleString("fa-IR")} سانتی‌متر`);
  }
  if (typeof dimension.heightCm === "number") {
    parts.push(`ارتفاع ${dimension.heightCm.toLocaleString("fa-IR")} سانتی‌متر`);
  }
  if (typeof dimension.depthCm === "number") {
    parts.push(`عمق ${dimension.depthCm.toLocaleString("fa-IR")} سانتی‌متر`);
  }

  if (parts.length > 0) {
    return parts.join(" × ");
  }

  return dimension.label?.trim() || "";
}
