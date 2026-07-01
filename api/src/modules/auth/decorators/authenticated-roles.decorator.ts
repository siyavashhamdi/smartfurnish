import { SetMetadata, applyDecorators } from "@nestjs/common";

import { UserRole } from "../../../enums";

import { Roles } from "./roles.decorator";

export const OPTIONAL_AUTH_KEY = "optionalAuth";

/** Any authenticated session, including anonymous visitor JWTs. */
export const AUTHENTICATED_USER_ROLES = [
  UserRole.ANONYMOUS,
  UserRole.END_USER,
  UserRole.SUPER_ADMIN,
] as const;

export const AuthenticatedRoles = () => Roles(...AUTHENTICATED_USER_ROLES);

/** Registered accounts only — excludes anonymous visitor sessions. */
export const REGISTERED_USER_ROLES = [
  UserRole.END_USER,
  UserRole.SUPER_ADMIN,
] as const;

export const RegisteredUserRoles = () => Roles(...REGISTERED_USER_ROLES);

/** END_USER-facing features that anonymous visitors may also access. */
export const END_USER_OR_ANONYMOUS_ROLES = [
  UserRole.ANONYMOUS,
  UserRole.END_USER,
] as const;

export const EndUserOrAnonymousRoles = () =>
  Roles(...END_USER_OR_ANONYMOUS_ROLES);

/**
 * Visitor-only auth entry points: unauthenticated requests are allowed;
 * when a JWT is present it must be an anonymous visitor session.
 */
export const OptionalAnonymousRoles = () =>
  applyDecorators(Roles(UserRole.ANONYMOUS), SetMetadata(OPTIONAL_AUTH_KEY, true));
