import type { UserProductInquiryStatus } from "./inquiries-list.api";

export const INQUIRY_STATUS_OPTIONS: readonly UserProductInquiryStatus[] = [
  "PREVIEW_GENERATED",
  "CALL_REQUESTED",
  "PENDING",
  "CONTACTED",
  "SALE_COMPLETED",
  "CLOSED",
  "CANCELLED",
] as const;

export const INQUIRY_STATUS_LABEL: Record<UserProductInquiryStatus, string> = {
  PREVIEW_GENERATED: "تولید پیش‌نمایش",
  CALL_REQUESTED: "درخواست تماس",
  PENDING: "در انتظار",
  CONTACTED: "تماس‌گرفته‌شده",
  SALE_COMPLETED: "فروخته شده",
  CLOSED: "بسته‌شده",
  CANCELLED: "لغوشده",
};

export const INQUIRY_STATUS_COLOR: Record<
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
