import type { FileAccessUrl } from "../../utils/fileAccessUrl.util";

export type ProductDiscountType = "PERCENTAGE" | "FIXED_AMOUNT_IRT";
export type SortOrder = "ASC" | "DESC";

export type ProductMaterialProfileRow = {
  readonly texture?: string | null;
  readonly primaryMaterial?: string | null;
  readonly careInstructions?: string | null;
};

export type ProductVendorRow = {
  readonly name: string;
  readonly phone?: string | null;
  readonly address?: string | null;
  readonly notes?: string | null;
};

export type ProductSetPieceDimensionRow = {
  readonly label?: string | null;
  readonly displayText?: string | null;
  readonly widthCm?: number | null;
  readonly heightCm?: number | null;
  readonly depthCm?: number | null;
  readonly sortOrder?: number | null;
};

export type ProductFabricColorRow = {
  readonly key: string;
  readonly name: string;
  readonly hexCode?: string | null;
  readonly priceIrt?: number | null;
  readonly discount?: {
    readonly type: ProductDiscountType;
    readonly value: number;
  } | null;
  readonly sortOrder?: number | null;
  readonly isActive: boolean;
  readonly aiProductImageAccessUrl?: FileAccessUrl | null;
};

export type ProductFabricRow = {
  readonly key: string;
  readonly patternName: string;
  readonly sortOrder?: number | null;
  readonly isActive: boolean;
  readonly colors: ProductFabricColorRow[];
};

export type ProductSetPieceRow = {
  readonly key: string;
  readonly name: string;
  readonly description?: string | null;
  readonly sortOrder?: number | null;
  readonly imageAccessUrls: FileAccessUrl[];
  readonly dimensions: ProductSetPieceDimensionRow[];
  readonly weightKg?: number | null;
  readonly materialProfile?: ProductMaterialProfileRow | null;
};

export type ProductListItemRow = {
  readonly id: string;
  readonly title: string;
  readonly summary?: string | null;
  readonly coverImageAccessUrls: FileAccessUrl[];
  readonly priceIrt?: number | null;
  readonly discount?: {
    readonly type: ProductDiscountType;
    readonly value: number;
  } | null;
  readonly isActive?: boolean;
  readonly sortOrder?: number | null;
  readonly tags: string[];
  readonly guaranteePeriodInMonths?: number | null;
  readonly reviewStats?: {
    readonly userCount: number;
    readonly reviewCount: number;
  } | null;
  readonly isPurchased?: boolean | null;
};

export type ProductDetailItemRow = {
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
  readonly isActive?: boolean;
  readonly isReviewSubmissionEnabled?: boolean;
  readonly isReviewsSectionVisible?: boolean;
  readonly sortOrder?: number | null;
  readonly tags: string[];
  readonly guaranteePeriodInMonths?: number | null;
  readonly notes?: string | null;
  readonly vendor?: ProductVendorRow | null;
  readonly materialProfile?: ProductMaterialProfileRow | null;
  readonly setPieces: ProductSetPieceRow[];
  readonly fabrics: ProductFabricRow[];
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
};

export type ProductDetailQuery = {
  productDetail: ProductDetailItemRow;
};

export type ProductDetailQueryVariables = {
  input: {
    id: string;
  };
};

export type ProductListQuery = {
  productList: {
    items: ProductListItemRow[];
    pagination: {
      limit: number;
      total: number;
      count: number;
      startCursor?: string | null;
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
};

type ProductListFilterInput = {
  query?: string | null;
  isActive?: boolean | null;
  hasPrice?: boolean | null;
  isPurchased?: boolean | null;
  includeUserId?: string | null;
  minPriceIrt?: number | null;
  maxPriceIrt?: number | null;
  tagsAny?: string[] | null;
};

type ProductListSortInput = {
  createdAt?: SortOrder;
  updatedAt?: SortOrder;
  title?: SortOrder;
  priceIrt?: SortOrder;
  isActive?: SortOrder;
  sortOrder?: SortOrder;
};

export type ProductListQueryVariables = {
  input: {
    filters?: ProductListFilterInput;
    options: {
      limit: number;
      startCursor?: string | null;
      sort?: ProductListSortInput;
    };
  };
};

export type ProductListRecord = {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly coverImageAccessUrls: FileAccessUrl[];
  readonly priceIrt: number | null;
  readonly discount: {
    readonly type: ProductDiscountType;
    readonly value: number;
  } | null;
  readonly isActive: boolean;
  readonly sortOrder: number;
  readonly tags: string[];
  readonly guaranteePeriodInMonths: number;
  readonly reviewStats: {
    readonly userCount: number;
    readonly reviewCount: number;
  } | null;
  readonly isPurchased: boolean;
};

export type ProductEditRecord = {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly fullDescription: string;
  readonly coverImageAccessUrls: FileAccessUrl[];
  readonly priceIrt: number | null;
  readonly discount: {
    readonly type: ProductDiscountType;
    readonly value: number;
  } | null;
  readonly isActive: boolean;
  readonly isReviewSubmissionEnabled: boolean;
  readonly isReviewsSectionVisible: boolean;
  readonly sortOrder: number | null;
  readonly tags: string[];
  readonly guaranteePeriodInMonths: number;
  readonly notes: string;
  readonly vendor: ProductVendorRow | null;
  readonly materialProfile: ProductMaterialProfileRow | null;
  readonly setPieces: ProductSetPieceRow[];
  readonly fabrics: ProductFabricRow[];
};

export type ProductListFilters = {
  readonly query: string;
  readonly isActive: "ALL" | "ACTIVE" | "INACTIVE";
  readonly hasPrice: "ALL" | "WITH_PRICE" | "FREE_OR_UNSET";
  readonly isPurchased: "ALL" | "YES" | "NO";
  readonly minPriceIrt: string;
  readonly maxPriceIrt: string;
  readonly tagsAny: string;
};

export type ProductSortField =
  | "sortOrder"
  | "createdAt"
  | "updatedAt"
  | "title"
  | "priceIrt"
  | "isActive";

export type ProductListSort = {
  readonly field: ProductSortField;
  readonly order: SortOrder;
};

export const DEFAULT_PRODUCT_LIST_FILTERS: ProductListFilters = {
  query: "",
  isActive: "ALL",
  hasPrice: "ALL",
  isPurchased: "ALL",
  minPriceIrt: "",
  maxPriceIrt: "",
  tagsAny: "",
};

export const DEFAULT_PRODUCT_LIST_SORT: ProductListSort = {
  field: "sortOrder",
  order: "DESC",
};

export function getPrimaryCoverImageAccessUrl(
  coverImageAccessUrls: readonly FileAccessUrl[]
): FileAccessUrl | null {
  return coverImageAccessUrls[0] ?? null;
}

export function isProductFreeForList(
  item: Pick<ProductListRecord, "priceIrt" | "discount">
): boolean {
  const price = item.priceIrt ?? 0;
  if (price <= 0) {
    return true;
  }

  const discount = item.discount;
  if (!discount || discount.value <= 0) {
    return false;
  }

  if (discount.type === "PERCENTAGE") {
    return discount.value >= 100;
  }

  return discount.value >= price;
}

function trimToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function parseNumber(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseTags(value: string): string[] | null {
  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 0 ? Array.from(new Set(parts)) : null;
}

export function mapProductListRowToRecord(row: ProductListItemRow): ProductListRecord {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary?.trim() || "",
    coverImageAccessUrls: row.coverImageAccessUrls ?? [],
    priceIrt: typeof row.priceIrt === "number" ? row.priceIrt : null,
    discount:
      row.discount && typeof row.discount.value === "number"
        ? {
            type: row.discount.type,
            value: row.discount.value,
          }
        : null,
    isActive: row.isActive ?? true,
    sortOrder: typeof row.sortOrder === "number" ? row.sortOrder : 0,
    tags: row.tags || [],
    guaranteePeriodInMonths:
      typeof row.guaranteePeriodInMonths === "number" && row.guaranteePeriodInMonths > 0
        ? row.guaranteePeriodInMonths
        : 0,
    reviewStats:
      row.reviewStats &&
      typeof row.reviewStats.userCount === "number" &&
      typeof row.reviewStats.reviewCount === "number"
        ? {
            userCount: row.reviewStats.userCount,
            reviewCount: row.reviewStats.reviewCount,
          }
        : null,
    isPurchased: row.isPurchased === true,
  };
}

export function mapProductDetailRowToRecord(row: ProductDetailItemRow): ProductEditRecord {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary?.trim() || "",
    fullDescription: row.fullDescription?.trim() || "",
    coverImageAccessUrls: row.coverImageAccessUrls ?? [],
    priceIrt: typeof row.priceIrt === "number" ? row.priceIrt : null,
    discount:
      row.discount && typeof row.discount.value === "number"
        ? {
            type: row.discount.type,
            value: row.discount.value,
          }
        : null,
    isActive: row.isActive ?? true,
    isReviewSubmissionEnabled: row.isReviewSubmissionEnabled !== false,
    isReviewsSectionVisible: row.isReviewsSectionVisible !== false,
    sortOrder: typeof row.sortOrder === "number" ? row.sortOrder : null,
    tags: row.tags || [],
    guaranteePeriodInMonths:
      typeof row.guaranteePeriodInMonths === "number" && row.guaranteePeriodInMonths >= 0
        ? row.guaranteePeriodInMonths
        : 0,
    notes: row.notes?.trim() || "",
    vendor: row.vendor ?? null,
    materialProfile: row.materialProfile ?? null,
    setPieces: row.setPieces ?? [],
    fabrics: row.fabrics ?? [],
  };
}

export function buildProductListQueryVariables(
  filters: ProductListFilters,
  sort: ProductListSort,
  pageSize: number,
  startCursor?: string | null
): ProductListQueryVariables {
  const query = trimToNull(filters.query);
  const tagsAny = parseTags(filters.tagsAny);
  const minPriceIrt = parseNumber(filters.minPriceIrt);
  const maxPriceIrt = parseNumber(filters.maxPriceIrt);

  return {
    input: {
      filters: {
        query,
        isActive: filters.isActive === "ALL" ? null : filters.isActive === "ACTIVE",
        hasPrice: filters.hasPrice === "ALL" ? null : filters.hasPrice === "WITH_PRICE",
        isPurchased: filters.isPurchased === "ALL" ? null : filters.isPurchased === "YES",
        minPriceIrt,
        maxPriceIrt,
        tagsAny,
      },
      options: {
        limit: pageSize,
        startCursor: startCursor || null,
        sort: {
          [sort.field]: sort.order,
        },
      },
    },
  };
}
