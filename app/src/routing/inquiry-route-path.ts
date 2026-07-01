import { APP_SHELL_ROUTES } from "./app-shell-routes";

export const INQUIRY_ROUTE_ID_PARAM = "inquiryId";

export const INQUIRY_VIEW_ROUTE_SEGMENT = "view";
export const INQUIRY_HISTORY_ROUTE_SEGMENT = "history";

export const INQUIRY_VIEW_PAGE_ROUTE_REGEX = /^\/inquiries\/view\/([^/]+)$/;
export const INQUIRY_HISTORY_PAGE_ROUTE_REGEX = /^\/inquiries\/history\/([^/]+)$/;

function normalizePathname(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

export function inquiryViewPath(inquiryId: string): string {
  return `${APP_SHELL_ROUTES.inquiries}/${INQUIRY_VIEW_ROUTE_SEGMENT}/${inquiryId}`;
}

export function inquiryHistoryPath(inquiryId: string): string {
  return `${APP_SHELL_ROUTES.inquiries}/${INQUIRY_HISTORY_ROUTE_SEGMENT}/${inquiryId}`;
}

export function readInquiryViewIdFromPathname(pathname: string): string | undefined {
  return INQUIRY_VIEW_PAGE_ROUTE_REGEX.exec(normalizePathname(pathname))?.[1];
}

export function readInquiryHistoryIdFromPathname(pathname: string): string | undefined {
  return INQUIRY_HISTORY_PAGE_ROUTE_REGEX.exec(normalizePathname(pathname))?.[1];
}

export function isInquiryViewRoutePathname(pathname: string): boolean {
  return INQUIRY_VIEW_PAGE_ROUTE_REGEX.test(normalizePathname(pathname));
}

export function isInquiryHistoryRoutePathname(pathname: string): boolean {
  return INQUIRY_HISTORY_PAGE_ROUTE_REGEX.test(normalizePathname(pathname));
}
