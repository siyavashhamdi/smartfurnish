import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactElement,
} from "react";
import { Navigate } from "react-router-dom";
import { Box, Chip, Stack, TextField, Typography, useMediaQuery } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  getCoreRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";

import { USER_PRODUCT_INQUIRY_LIST_QUERY } from "../../graphql/queries/userProductInquiryList.query";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../lib/graphql/generated";
import { useDebounce } from "../../hooks/useDebounce";
import {
  useServerPaginatedQuery,
  type ServerPageResult,
} from "../../hooks/useServerPaginatedQuery";
import { useSnackbar } from "../../hooks/useSnackbar";
import { useTranslation } from "../../hooks/useTranslation";
import { APP_SHELL_ROUTES } from "../../routing/app-shell-routes";
import { normalizeFabricHexColor } from "../Products/fabric-selection.util";
import AppTooltip from "../../shared/AppTooltip";
import { sanitizeMobilePhoneInput } from "../../utilities/mobile-phone.util";
import EntityTableShell from "../../shared/crud/EntityTableShell";
import crudPrimitives from "../../shared/crud/styles/crudPrimitives.module.scss";
import DateTimeValue from "../../shared/display/DateTimeValue";
import JalaliDateFilterField from "../../shared/table/JalaliDateFilterField";
import {
  EMPTY_USER_PRODUCT_INQUIRY_LIST_FILTERS,
  buildUserProductInquiryListQueryVariables,
  hasUserProductInquiryFiltersApplied,
  mapUserProductInquiryListRowToRecord,
  type UserProductInquiryListFilters,
  type UserProductInquiryListItemRow,
  type UserProductInquiryListQuery,
  type UserProductInquiryListQueryVariables,
  type UserProductInquiryListRecord,
  type UserProductInquiryListSortField,
  type UserProductInquiryStatus,
  type UserProductInquiryStatusFilterTab,
  type SortingOrder,
} from "./inquiries-list.api";
import InquiriesStatusFilterTabs from "./InquiriesStatusFilterTabs";

const EMPTY_DISPLAY = "—";

const TABLE_TOOLBAR_OPTIONS = {
  showSearch: true,
  showColumnVisibility: true,
  showRefresh: true,
  showFilterButton: true,
} as const;

const COLUMN_WIDTH_BY_ID: Record<string, string> = {
  productTitle: "16rem",
  userPhone: "10rem",
  userFullName: "13rem",
  fabricLabel: "14rem",
  createdAt: "10rem",
  username: "11rem",
  status: "9rem",
  contactFullName: "13rem",
  contactPhone: "10rem",
  contactRequestedAt: "11rem",
  previewGeneratedAt: "11rem",
  updatedAt: "10rem",
};

const STATUS_LABEL: Record<UserProductInquiryStatus, string> = {
  PREVIEW_GENERATED: "تولید پیش‌نمایش",
  CALL_REQUESTED: "درخواست تماس",
  PENDING: "در انتظار",
  CONTACTED: "تماس‌گرفته‌شده",
  SALE_COMPLETED: "فروخته شده",
  CLOSED: "بسته‌شده",
  CANCELLED: "لغوشده",
};

const STATUS_COLOR: Record<
  UserProductInquiryStatus,
  "default" | "primary" | "success" | "warning" | "error" | "info"
> = {
  PREVIEW_GENERATED: "info",
  CALL_REQUESTED: "warning",
  PENDING: "warning",
  CONTACTED: "primary",
  SALE_COMPLETED: "success",
  CLOSED: "default",
  CANCELLED: "error",
};

const LATIN_TEXT_FILTER_KEYS = new Set<keyof UserProductInquiryListFilters>([
  "username",
  "userPhone",
  "contactPhone",
]);

const MOBILE_PHONE_FILTER_KEYS = new Set<keyof UserProductInquiryListFilters>([
  "userPhone",
  "contactPhone",
]);

const SORTABLE_FIELDS = new Set<UserProductInquiryListSortField>([
  "createdAt",
  "updatedAt",
  "status",
  "productTitle",
  "previewGeneratedAt",
  "contactRequestedAt",
]);

function selectUserProductInquiryListPage(
  data: UserProductInquiryListQuery | undefined
): ServerPageResult<UserProductInquiryListItemRow> | null {
  const page = data?.userProductInquiryList;
  if (!page) {
    return null;
  }

  const limit = Math.max(1, page.pagination.limit || 10);
  const skip = Math.max(0, page.pagination.skip || 0);
  const total = Math.max(0, page.pagination.total || 0);

  return {
    items: page.items,
    total,
    page: Math.floor(skip / limit) + 1,
    pageSize: limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

function sortingToServerSort(
  sorting: SortingState
): Partial<Record<UserProductInquiryListSortField, SortingOrder>> {
  const sort = sorting.find((item) =>
    SORTABLE_FIELDS.has(item.id as UserProductInquiryListSortField)
  );

  if (!sort) {
    return { createdAt: "DESC" };
  }

  return {
    [sort.id as UserProductInquiryListSortField]: sort.desc ? "DESC" : "ASC",
  };
}

function fabricCell(
  patternName: string,
  colorName: string,
  colorHex: string,
): ReactElement {
  const swatchColor = normalizeFabricHexColor(colorHex || null);
  const displayPatternName = patternName || EMPTY_DISPLAY;
  const displayColorName = colorName || EMPTY_DISPLAY;
  const hasColor = colorName.trim().length > 0 || Boolean(swatchColor);

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
        {displayPatternName}
      </Typography>
      {hasColor ? (
        <>
          <Typography color="text.secondary" variant="body2">
            —
          </Typography>
          <AppTooltip title={displayColorName} arrow placement="top">
            <Box
              component="span"
              sx={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                bgcolor: swatchColor ?? "transparent",
                border: "1px solid",
                borderColor: swatchColor ? "divider" : "text.disabled",
                flexShrink: 0,
              }}
            />
          </AppTooltip>
        </>
      ) : null}
    </Stack>
  );
}

function textCell(value: unknown, monospace = false): ReactElement {
  return (
    <Typography
      variant="body2"
      className={monospace ? crudPrimitives.tabularNums : undefined}
      sx={{ overflowWrap: "anywhere" }}
    >
      {String(value || EMPTY_DISPLAY)}
    </Typography>
  );
}

const InquiriesList = (): ReactElement => {
  const isMobile = useMediaQuery((muiTheme: Theme) => muiTheme.breakpoints.down("md"));
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showError } = useSnackbar();
  const isSuperAdmin = user?.roles?.includes(UserRole.SUPER_ADMIN) === true;
  const hasShownLoadErrorRef = useRef(false);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [activeStatusTab, setActiveStatusTab] =
    useState<UserProductInquiryStatusFilterTab>("ALL");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    productTitle: true,
    userPhone: true,
    userFullName: true,
    fabricLabel: true,
    createdAt: true,
    username: false,
    status: false,
    contactFullName: false,
    contactPhone: false,
    contactRequestedAt: false,
    previewGeneratedAt: false,
    updatedAt: false,
  });
  const [showColumnFilters, setShowColumnFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [appliedFilters, setAppliedFilters] = useState<UserProductInquiryListFilters>(
    EMPTY_USER_PRODUCT_INQUIRY_LIST_FILTERS
  );
  const [pendingFilters, setPendingFilters] = useState<UserProductInquiryListFilters>(
    EMPTY_USER_PRODUCT_INQUIRY_LIST_FILTERS
  );
  const debouncedPendingFilters = useDebounce(pendingFilters, 500);
  const applyFiltersRef = useRef<(() => void) | null>(null);
  const serverSort = useMemo(() => sortingToServerSort(sorting), [sorting]);

  const hasAppliedFilters = useMemo(
    () =>
      activeStatusTab !== "ALL" ||
      debouncedSearchQuery.trim() !== "" ||
      hasUserProductInquiryFiltersApplied(appliedFilters),
    [activeStatusTab, appliedFilters, debouncedSearchQuery]
  );

  const buildVariables = useCallback(
    ({ page, pageSize }: { page: number; pageSize: number }) =>
      buildUserProductInquiryListQueryVariables(
        debouncedSearchQuery,
        appliedFilters,
        serverSort,
        page,
        pageSize,
        activeStatusTab
      ),
    [activeStatusTab, appliedFilters, debouncedSearchQuery, serverSort]
  );

  const {
    items: rows,
    loading,
    error,
    onRefresh,
    pagination,
  } = useServerPaginatedQuery<
    UserProductInquiryListQuery,
    UserProductInquiryListQueryVariables,
    UserProductInquiryListItemRow,
    UserProductInquiryListRecord
  >({
    query: USER_PRODUCT_INQUIRY_LIST_QUERY,
    variables: buildVariables,
    selectPage: selectUserProductInquiryListPage,
    mapItem: mapUserProductInquiryListRowToRecord,
    resetPageDeps: [debouncedSearchQuery, appliedFilters, serverSort, activeStatusTab],
    skip: !isSuperAdmin,
  });

  useEffect(() => {
    if (!error) {
      hasShownLoadErrorRef.current = false;
      return;
    }
    if (hasShownLoadErrorRef.current) {
      return;
    }
    showError(t("errors.general.loadData"));
    hasShownLoadErrorRef.current = true;
  }, [error, showError, t]);

  useEffect(() => {
    applyFiltersRef.current = () => setAppliedFilters({ ...pendingFilters });
  });

  useEffect(() => {
    if (!showColumnFilters) {
      return;
    }
    applyFiltersRef.current?.();
  }, [debouncedPendingFilters, showColumnFilters]);

  const setFilterValue = <K extends keyof UserProductInquiryListFilters>(
    key: K,
    value: UserProductInquiryListFilters[K]
  ): void => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = (): void => {
    setSearchQuery("");
  };

  const handleApplyFilters = (): void => {
    setAppliedFilters({ ...pendingFilters });
  };

  const handleClearFilters = (): void => {
    setSearchQuery("");
    setPendingFilters(EMPTY_USER_PRODUCT_INQUIRY_LIST_FILTERS);
    setAppliedFilters(EMPTY_USER_PRODUCT_INQUIRY_LIST_FILTERS);
    setActiveStatusTab("ALL");
  };

  const handleStatusTabChange = (tab: UserProductInquiryStatusFilterTab): void => {
    setActiveStatusTab(tab);
  };

  const renderTextFilter = (
    key: keyof UserProductInquiryListFilters,
    label: string
  ): ReactElement => {
    const latin = LATIN_TEXT_FILTER_KEYS.has(key);
    const numericPhone = MOBILE_PHONE_FILTER_KEYS.has(key);

    return (
      <TextField
        size="small"
        fullWidth
        aria-label={label}
        value={pendingFilters[key]}
        onChange={(event) => {
          const rawValue = event.target.value;
          const nextValue = numericPhone ? sanitizeMobilePhoneInput(rawValue) : rawValue;
          setFilterValue(key, nextValue as UserProductInquiryListFilters[typeof key]);
        }}
        inputProps={
          latin
            ? {
                className: crudPrimitives.latinText,
                dir: "ltr",
                ...(numericPhone ? { inputMode: "numeric" as const } : {}),
              }
            : undefined
        }
      />
    );
  };

  const renderDateFilter = (
    fromKey: keyof UserProductInquiryListFilters,
    toKey: keyof UserProductInquiryListFilters,
    fromLabel: string,
    toLabel: string
  ): ReactElement => (
    <Stack spacing={0.5}>
      <JalaliDateFilterField
        label={fromLabel}
        ariaLabel={fromLabel}
        value={String(pendingFilters[fromKey] || "")}
        onChange={(value) =>
          setFilterValue(fromKey, value as UserProductInquiryListFilters[typeof fromKey])
        }
      />
      <JalaliDateFilterField
        label={toLabel}
        ariaLabel={toLabel}
        value={String(pendingFilters[toKey] || "")}
        onChange={(value) =>
          setFilterValue(toKey, value as UserProductInquiryListFilters[typeof toKey])
        }
      />
    </Stack>
  );

  const renderFilterCell = (
    column: Column<UserProductInquiryListRecord, unknown>
  ): ReactElement | null => {
    const label = String(column.columnDef.header ?? column.id);

    switch (column.id) {
      case "userFullName":
        return renderTextFilter("userFullName", label);
      case "username":
        return renderTextFilter("username", label);
      case "userPhone":
        return renderTextFilter("userPhone", label);
      case "productTitle":
        return renderTextFilter("productTitle", label);
      case "fabricLabel":
        return renderTextFilter("fabricLabel", label);
      case "contactFullName":
        return (
          <Stack spacing={0.5}>
            {renderTextFilter("contactFirstName", t("table.pages.inquiries.filters.contactFirstName"))}
            {renderTextFilter("contactLastName", t("table.pages.inquiries.filters.contactLastName"))}
          </Stack>
        );
      case "contactPhone":
        return renderTextFilter("contactPhone", label);
      case "contactRequestedAt":
        return renderDateFilter(
          "contactRequestedAtFrom",
          "contactRequestedAtTo",
          t("table.pages.inquiries.filters.contactRequestedAtFrom"),
          t("table.pages.inquiries.filters.contactRequestedAtTo")
        );
      case "previewGeneratedAt":
        return renderDateFilter(
          "previewGeneratedAtFrom",
          "previewGeneratedAtTo",
          t("table.pages.inquiries.filters.previewGeneratedAtFrom"),
          t("table.pages.inquiries.filters.previewGeneratedAtTo")
        );
      case "createdAt":
        return renderDateFilter(
          "createdAtFrom",
          "createdAtTo",
          t("table.pages.inquiries.filters.createdAtFrom"),
          t("table.pages.inquiries.filters.createdAtTo")
        );
      case "updatedAt":
        return renderDateFilter(
          "updatedAtFrom",
          "updatedAtTo",
          t("table.pages.inquiries.filters.updatedAtFrom"),
          t("table.pages.inquiries.filters.updatedAtTo")
        );
      default:
        return null;
    }
  };

  const columns = useMemo<ColumnDef<UserProductInquiryListRecord>[]>(
    () => [
      {
        accessorKey: "productTitle",
        header: t("table.pages.inquiries.columns.productTitle"),
        cell: (info) => textCell(info.getValue()),
      },
      {
        accessorKey: "userPhone",
        header: t("table.pages.inquiries.columns.userPhone"),
        cell: (info) => textCell(info.getValue(), true),
      },
      {
        accessorKey: "userFullName",
        header: t("table.pages.inquiries.columns.userFullName"),
        cell: (info) => textCell(info.getValue()),
      },
      {
        id: "fabricLabel",
        accessorFn: (row) => row.fabricPatternName,
        header: t("table.pages.inquiries.columns.fabricLabel"),
        cell: (info) =>
          fabricCell(
            info.row.original.fabricPatternName,
            info.row.original.fabricColorName,
            info.row.original.fabricColorHex,
          ),
      },
      {
        accessorKey: "createdAt",
        header: t("table.pages.inquiries.columns.createdAt"),
        cell: (info) => <DateTimeValue value={info.getValue() as string} />,
      },
      {
        accessorKey: "username",
        header: t("table.pages.inquiries.columns.username"),
        cell: (info) => (
          <Typography variant="body2" className={crudPrimitives.latinText}>
            {String(info.getValue() || EMPTY_DISPLAY)}
          </Typography>
        ),
      },
      {
        accessorKey: "status",
        header: t("table.pages.inquiries.columns.status"),
        cell: (info) => {
          const status = info.getValue() as UserProductInquiryStatus;
          return (
            <Chip
              size="small"
              variant="outlined"
              color={STATUS_COLOR[status] ?? "default"}
              label={STATUS_LABEL[status] ?? status}
            />
          );
        },
      },
      {
        accessorKey: "contactFullName",
        header: t("table.pages.inquiries.columns.contactFullName"),
        cell: (info) => textCell(info.getValue()),
      },
      {
        accessorKey: "contactPhone",
        header: t("table.pages.inquiries.columns.contactPhone"),
        cell: (info) => textCell(info.getValue(), true),
      },
      {
        accessorKey: "contactRequestedAt",
        header: t("table.pages.inquiries.columns.contactRequestedAt"),
        cell: (info) => <DateTimeValue value={info.getValue() as string} />,
      },
      {
        accessorKey: "previewGeneratedAt",
        header: t("table.pages.inquiries.columns.previewGeneratedAt"),
        cell: (info) => <DateTimeValue value={info.getValue() as string} />,
      },
      {
        accessorKey: "updatedAt",
        header: t("table.pages.inquiries.columns.updatedAt"),
        cell: (info) => <DateTimeValue value={info.getValue() as string} />,
      },
    ],
    [t]
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: pagination.totalPages,
  });

  if (!isSuperAdmin) {
    return <Navigate to={APP_SHELL_ROUTES.products} replace />;
  }

  return (
    <EntityTableShell<UserProductInquiryListRecord>
      table={table}
      pagedRows={table.getRowModel().rows}
      isMobile={isMobile}
      searchValue={searchQuery}
      onSearchChange={handleSearchChange}
      onClearSearch={handleClearSearch}
      onRefresh={onRefresh}
      loading={loading}
      toolbarOptions={TABLE_TOOLBAR_OPTIONS}
      filtersBelowToolbar={
        <InquiriesStatusFilterTabs
          activeTab={activeStatusTab}
          onChange={handleStatusTabChange}
        />
      }
      showColumnFilters={showColumnFilters}
      onShowColumnFiltersChange={setShowColumnFilters}
      onApplyFilters={handleApplyFilters}
      onClearFilters={handleClearFilters}
      renderFilterCell={renderFilterCell}
      columnWidthById={COLUMN_WIDTH_BY_ID}
      columnLayoutMode="fixed"
      noDataLabel={error ? t("errors.general.loadData") : undefined}
      hasActiveFilters={hasAppliedFilters}
      pagination={pagination}
    />
  );
};

export default InquiriesList;
