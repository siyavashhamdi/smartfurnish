import { UserRole } from "../lib/graphql/generated";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "سوپر ادمین",
  [UserRole.END_USER]: "کاربر",
};

export function getUserRoleLabel(role: string): string {
  return USER_ROLE_LABELS[role as UserRole] ?? role;
}

/** Elevated roles are shown on profile; end-users see no role badge. */
export function getProfileDisplayRoles(
  roles: readonly string[] | undefined | null
): readonly string[] {
  if (!roles?.length) {
    return [];
  }

  const hasElevatedRole = roles.some((role) => role === UserRole.SUPER_ADMIN);
  if (hasElevatedRole) {
    return roles.filter((role) => role !== UserRole.END_USER);
  }

  return [];
}
