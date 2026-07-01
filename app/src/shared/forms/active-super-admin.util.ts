import { type UserListItemRow } from "../../pages/UsersManagement/users-management-list.api";
import { UserRole } from "../../lib/graphql/generated";
import type { FileAccessUrl } from "../../utils/fileAccessUrl.util";

export type ActiveSuperAdminOption = {
  readonly id: string;
  readonly label: string;
  readonly subtitle: string;
  readonly imageAccessUrl?: FileAccessUrl | null;
  readonly row?: UserListItemRow;
};

export const ACTIVE_SUPER_ADMIN_COMBOBOX_LABEL = "سوپر ادمین";
export const ACTIVE_SUPER_ADMIN_COMBOBOX_PLACEHOLDER =
  "جستجو براساس نام، نام کاربری، ایمیل یا موبایل";
export const ACTIVE_SUPER_ADMIN_COMBOBOX_NO_OPTIONS_TEXT =
  "کاربر فعال با نقش سوپر ادمین پیدا نشد.";

export const ACTIVE_SUPER_ADMIN_DEFAULT_OPTIONS_LIMIT = 10;
export const ACTIVE_SUPER_ADMIN_SEARCH_OPTIONS_LIMIT = 200;

function getUserFullName(row: UserListItemRow): string {
  const parts = [row.profile?.firstName?.trim(), row.profile?.lastName?.trim()].filter(
    (part): part is string => Boolean(part),
  );
  return parts.length > 0 ? parts.join(" ") : row.username;
}

export function userToActiveSuperAdminOption(row: UserListItemRow): ActiveSuperAdminOption {
  const email = row.profile?.email?.trim();
  return {
    id: row.id,
    label: getUserFullName(row),
    subtitle: [row.username, email].filter(Boolean).join(" | "),
    imageAccessUrl: row.profile?.avatarAccessUrl as FileAccessUrl | null | undefined,
    row,
  };
}

export function mapActiveSuperAdminListItems(
  items: readonly UserListItemRow[],
): ActiveSuperAdminOption[] {
  return items
    .filter((user) => user.roles.includes(UserRole.SUPER_ADMIN))
    .map(userToActiveSuperAdminOption);
}

export function buildActiveSuperAdminOptionFromAuthUser(user: {
  readonly id: string;
  readonly username: string;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
}): ActiveSuperAdminOption {
  const label =
    [user.firstName?.trim(), user.lastName?.trim()].filter(Boolean).join(" ").trim() ||
    user.username;

  return {
    id: user.id,
    label,
    subtitle: user.username,
  };
}
