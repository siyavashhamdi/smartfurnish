import type { NotificationMode } from "../lib/graphql/generated/graphql";

function resolveNotificationKind(payload: Record<string, unknown> | null | undefined): string | null {
  const notificationKind = payload?.notificationKind;
  if (typeof notificationKind !== "string") {
    return null;
  }

  const normalized = notificationKind.trim();
  return normalized.length > 0 ? normalized : null;
}

export function resolveNotificationDisplayMode(
  mode: NotificationMode,
  payload?: Record<string, unknown> | null,
): NotificationMode {
  switch (resolveNotificationKind(payload)) {
    case "INQUIRY_CONTACT_SUBMITTED":
    case "INQUIRY_UNDER_REVIEW":
      return "SUCCESS";
    case "INQUIRY_CANCELLED":
      return "WARNING";
    default:
      return mode;
  }
}
