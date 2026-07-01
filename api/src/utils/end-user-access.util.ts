import { ForbiddenException } from "@nestjs/common";

import { EXCEPTION_CONSTANT } from "../constants/exception.constant";
import { UserRole } from "../enums";

type EndUserAccessRoles = readonly string[] | undefined;

export function isAnonymousRole(roles: EndUserAccessRoles): boolean {
  return roles?.includes(UserRole.ANONYMOUS) === true;
}

export function isEndUserRole(roles: EndUserAccessRoles): boolean {
  return roles?.includes(UserRole.END_USER) === true;
}

/** Allows unauthenticated, END_USER, and ANONYMOUS viewers on public product endpoints. */
export function assertEndUserOrAnonymousAccess(
  user?: { roles?: readonly string[] },
): void {
  if (!user) {
    return;
  }

  if (isEndUserRole(user.roles) || isAnonymousRole(user.roles)) {
    return;
  }

  throw new ForbiddenException(EXCEPTION_CONSTANT.END_USER_OR_ANONYMOUS_ONLY);
}
