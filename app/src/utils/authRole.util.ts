import { UserRole } from "../lib/graphql/generated";

export function isAnonymousUser(roles: readonly string[] | undefined | null): boolean {
  return roles?.includes(UserRole.ANONYMOUS) === true;
}

export function isEndUserRole(roles: readonly string[]): boolean {
  return roles.includes(UserRole.END_USER) && !roles.includes(UserRole.SUPER_ADMIN);
}

export function isSuperAdminRole(roles: readonly string[]): boolean {
  return roles.includes(UserRole.SUPER_ADMIN);
}
