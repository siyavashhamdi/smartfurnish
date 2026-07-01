import { parseJalaliParamDate } from "../../utilities/jalali-date-param.util";

export type UserProductInquiryStatus =
  | "PREVIEW_GENERATED"
  | "CALL_REQUESTED"
  | "PENDING"
  | "CONTACTED"
  | "SALE_COMPLETED"
  | "CLOSED"
  | "CANCELLED";

export type SortingOrder = "ASC" | "DESC";

export type UserProductInquiryStatusFilterTab = UserProductInquiryStatus | "ALL";

export const INQUIRY_STATUS_TAB_ORDER: readonly UserProductInquiryStatusFilterTab[] = [
  "PREVIEW_GENERATED",
  "CALL_REQUESTED",
  "PENDING",
  "CONTACTED",
  "SALE_COMPLETED",
  "CLOSED",
  "CANCELLED",
  "ALL",
];

export const DEFAULT_INQUIRY_STATUS_TAB_SELECTION: readonly UserProductInquiryStatus[] = [
  "CALL_REQUESTED",
];

export function hasInquiryStatusTabSelectionApplied(
  tabs: readonly UserProductInquiryStatus[],
): boolean {
  return (
    tabs.length === 0 ||
    tabs.length > 1 ||
    tabs[0] !== DEFAULT_INQUIRY_STATUS_TAB_SELECTION[0]
  );
}

export function resolveInquiryStatusTabSelection(
  current: readonly UserProductInquiryStatus[],
  tab: UserProductInquiryStatusFilterTab,
  additiveSelect: boolean,
): UserProductInquiryStatus[] {
  if (tab === "ALL") {
    return additiveSelect ? [...current] : [];
  }

  if (additiveSelect) {
    if (current.includes(tab)) {
      return current.filter((item) => item !== tab);
    }

    return [...current, tab];
  }

  return [tab];
}

export type UserProductInquiryListItemRow = {
  readonly id: string;
  readonly user: {
    readonly fullName: string;
    readonly username: string;
    readonly phoneNumber?: string | null;
  };
  readonly product: {
    readonly title: string;
  };
  readonly fabric?: {
    readonly patternName: string;
    readonly colorName: string;
    readonly colorHex?: string | null;
  } | null;
  readonly status: UserProductInquiryStatus;
  readonly contact?: {
    readonly firstName: string;
    readonly lastName: string;
    readonly phone: string;
    readonly requestedAt: string;
  } | null;
  readonly previewGeneratedAt?: string | null;
  readonly previewCount: number;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
};

export type UserProductInquiryListRecord = {
  readonly id: string;
  readonly userFullName: string;
  readonly username: string;
  readonly userPhone: string;
  readonly productTitle: string;
  readonly fabricPatternName: string;
  readonly fabricColorName: string;
  readonly fabricColorHex: string;
  readonly status: UserProductInquiryStatus;
  readonly contactFullName: string;
  readonly contactPhone: string;
  readonly contactRequestedAt: string;
  readonly previewGeneratedAt: string;
  readonly previewCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type UserProductInquiryListQuery = {
  userProductInquiryList: {
    items: UserProductInquiryListItemRow[];
    pagination: {
      limit: number;
      skip: number;
      total: number;
      count: number;
    };
  };
};

export type UserProductInquiryListSortField =
  | "createdAt"
  | "updatedAt"
  | "status"
  | "productTitle"
  | "previewGeneratedAt"
  | "contactRequestedAt";

export type UserProductInquiryListFilters = {
  query: string;
  userFullName: string;
  username: string;
  userPhone: string;
  productTitle: string;
  fabricLabel: string;
  status: UserProductInquiryStatus | "ALL";
  contactFirstName: string;
  contactLastName: string;
  contactPhone: string;
  createdAtFrom: string;
  createdAtTo: string;
  updatedAtFrom: string;
  updatedAtTo: string;
  previewGeneratedAtFrom: string;
  previewGeneratedAtTo: string;
  contactRequestedAtFrom: string;
  contactRequestedAtTo: string;
};

export type UserProductInquiryListQueryVariables = {
  input: {
    filters?: {
      query?: string | null;
      userFullName?: string | null;
      username?: string | null;
      userPhone?: string | null;
      productTitle?: string | null;
      fabricLabel?: string | null;
      status?: UserProductInquiryStatus | null;
      statuses?: UserProductInquiryStatus[] | null;
      contactFirstName?: string | null;
      contactLastName?: string | null;
      contactPhone?: string | null;
      createdAtFrom?: string | null;
      createdAtTo?: string | null;
      updatedAtFrom?: string | null;
      updatedAtTo?: string | null;
      previewGeneratedAtFrom?: string | null;
      previewGeneratedAtTo?: string | null;
      contactRequestedAtFrom?: string | null;
      contactRequestedAtTo?: string | null;
    };
    options: {
      limit: number;
      skip: number;
      sort?: Partial<Record<UserProductInquiryListSortField, SortingOrder>>;
    };
  };
};

const EMPTY_DISPLAY = "—";

export const EMPTY_USER_PRODUCT_INQUIRY_LIST_FILTERS: UserProductInquiryListFilters = {
  query: "",
  userFullName: "",
  username: "",
  userPhone: "",
  productTitle: "",
  fabricLabel: "",
  status: "ALL",
  contactFirstName: "",
  contactLastName: "",
  contactPhone: "",
  createdAtFrom: "",
  createdAtTo: "",
  updatedAtFrom: "",
  updatedAtTo: "",
  previewGeneratedAtFrom: "",
  previewGeneratedAtTo: "",
  contactRequestedAtFrom: "",
  contactRequestedAtTo: "",
};

function display(value: unknown): string {
  if (value == null) {
    return EMPTY_DISPLAY;
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : EMPTY_DISPLAY;
}

function trimToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function dateFilterToIsoDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = parseJalaliParamDate(trimmed);
  return parsed ? parsed.toISOString() : null;
}

export function hasUserProductInquiryFiltersApplied(
  filters: UserProductInquiryListFilters
): boolean {
  return Object.entries(filters).some(([key, value]) => {
    if (key === "status") {
      return value !== "ALL";
    }

    return String(value).trim() !== "";
  });
}

export function mapUserProductInquiryListRowToRecord(
  row: UserProductInquiryListItemRow
): UserProductInquiryListRecord {
  const contactFullName = row.contact
    ? `${row.contact.firstName} ${row.contact.lastName}`.trim()
    : "";

  return {
    id: String(row.id),
    userFullName: display(row.user.fullName),
    username: display(row.user.username),
    userPhone: display(row.user.phoneNumber),
    productTitle: display(row.product.title),
    fabricPatternName: display(row.fabric?.patternName),
    fabricColorName: display(row.fabric?.colorName),
    fabricColorHex: row.fabric?.colorHex?.trim() ?? "",
    status: row.status,
    contactFullName: display(contactFullName),
    contactPhone: display(row.contact?.phone),
    contactRequestedAt: display(row.contact?.requestedAt),
    previewGeneratedAt: display(row.previewGeneratedAt),
    previewCount: row.previewCount ?? 0,
    createdAt: display(row.createdAt),
    updatedAt: display(row.updatedAt),
  };
}

export function buildUserProductInquiryListQueryVariables(
  search: string,
  filters: UserProductInquiryListFilters,
  sort: Partial<Record<UserProductInquiryListSortField, SortingOrder>>,
  page: number,
  pageSize: number,
  activeStatusTabs: readonly UserProductInquiryStatus[] = DEFAULT_INQUIRY_STATUS_TAB_SELECTION,
): UserProductInquiryListQueryVariables {
  return {
    input: {
      filters: {
        query: trimToNull(search),
        userFullName: trimToNull(filters.userFullName),
        username: trimToNull(filters.username),
        userPhone: trimToNull(filters.userPhone),
        productTitle: trimToNull(filters.productTitle),
        fabricLabel: trimToNull(filters.fabricLabel),
        statuses: activeStatusTabs.length > 0 ? [...activeStatusTabs] : null,
        contactFirstName: trimToNull(filters.contactFirstName),
        contactLastName: trimToNull(filters.contactLastName),
        contactPhone: trimToNull(filters.contactPhone),
        createdAtFrom: dateFilterToIsoDate(filters.createdAtFrom),
        createdAtTo: dateFilterToIsoDate(filters.createdAtTo),
        updatedAtFrom: dateFilterToIsoDate(filters.updatedAtFrom),
        updatedAtTo: dateFilterToIsoDate(filters.updatedAtTo),
        previewGeneratedAtFrom: dateFilterToIsoDate(filters.previewGeneratedAtFrom),
        previewGeneratedAtTo: dateFilterToIsoDate(filters.previewGeneratedAtTo),
        contactRequestedAtFrom: dateFilterToIsoDate(filters.contactRequestedAtFrom),
        contactRequestedAtTo: dateFilterToIsoDate(filters.contactRequestedAtTo),
      },
      options: {
        limit: pageSize,
        skip: Math.max(0, (page - 1) * pageSize),
        sort,
      },
    },
  };
}
