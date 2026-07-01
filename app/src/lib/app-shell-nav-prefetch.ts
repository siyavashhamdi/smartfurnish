import type { DocumentNode } from "@apollo/client";
import { print } from "graphql";
import { APP_PRIVACY_POLICY_PAGE_QUERY } from "../graphql/queries/appPrivacyPolicyPageConfig.query";
import { APP_TERMS_OF_USE_PAGE_QUERY } from "../graphql/queries/appTermsOfUsePageConfig.query";
import { SUPPORT_CONTACT_QUERY } from "../graphql/queries/supportContactConfig.query";
import {
  filterAppShellNavItems,
  resolveAppShellNavPath,
  type AppShellNavContext,
  type AppShellNavItemDefinition,
  APP_SHELL_NAV_ITEMS,
} from "../layouts/app-shell-nav-items";
import { UserRole } from "./graphql/generated";
import { APP_SHELL_ROUTES } from "../routing/app-shell-routes";
import { apolloClient } from "./apollo-client";
import { getIsOfflineMode } from "./offline-state";
import { resolveGraphqlHttpUrl } from "../utils/apiBaseUrl.util";
import { isNativeAndroidShell } from "../utils/nativePlatform.util";

type PrefetchOperation = {
  readonly query: DocumentNode;
  readonly variables?: Record<string, unknown>;
};

export type AppShellNavPrefetchContext = AppShellNavContext & {
  readonly userId: string | null;
  readonly isEndUser: boolean;
};

export const LOGGED_OUT_NAV_PREFETCH_CONTEXT: AppShellNavPrefetchContext = {
  roles: [],
  isAuthenticated: false,
  userId: null,
  isEndUser: false,
};

let lastPrefetchedAuthKey: string | null = null;
let pendingPrefetchHandle: number | null = null;
let pendingPrefetchUsesIdleCallback = false;
let logoutCacheCleanupInProgress = false;
const logoutCacheCleanupEndListeners = new Set<() => void>();

/** Marks logout cache cleanup as active and cancels any deferred nav prefetch. */
export function beginLogoutCacheCleanup(): void {
  logoutCacheCleanupInProgress = true;
  resetAppShellNavPrefetchState();
}

export function endLogoutCacheCleanup(): void {
  if (!logoutCacheCleanupInProgress) {
    return;
  }

  logoutCacheCleanupInProgress = false;

  for (const listener of logoutCacheCleanupEndListeners) {
    listener();
  }
}

export function subscribeLogoutCacheCleanupEnd(listener: () => void): () => void {
  logoutCacheCleanupEndListeners.add(listener);
  return () => {
    logoutCacheCleanupEndListeners.delete(listener);
  };
}

export function isLogoutCacheCleanupInProgress(): boolean {
  return logoutCacheCleanupInProgress;
}

function shouldSkipPrefetch(): boolean {
  return getIsOfflineMode() || isNativeAndroidShell() || logoutCacheCleanupInProgress;
}

function buildAuthPrefetchKey(context: AppShellNavPrefetchContext): string {
  return `${context.userId ?? "anon"}:${[...context.roles].sort().join(",")}`;
}

/** Clears prefetch dedupe state and cancels any idle prefetch from the previous session. */
export function resetAppShellNavPrefetchState(): void {
  lastPrefetchedAuthKey = null;

  if (pendingPrefetchHandle === null || typeof window === "undefined") {
    return;
  }

  if (pendingPrefetchUsesIdleCallback && typeof window.cancelIdleCallback === "function") {
    window.cancelIdleCallback(pendingPrefetchHandle);
  } else {
    window.clearTimeout(pendingPrefetchHandle);
  }

  pendingPrefetchHandle = null;
  pendingPrefetchUsesIdleCallback = false;
}

function prefetchQuery(operation: PrefetchOperation): Promise<void> {
  return apolloClient
    .query({
      query: operation.query,
      variables: operation.variables,
      fetchPolicy: "network-only",
    })
    .then(() => undefined)
    .catch(() => undefined);
}

/** Uses raw fetch so logout cache clears cannot abort in-flight prefetch requests. */
async function prefetchQueryDetached(operation: PrefetchOperation): Promise<void> {
  try {
    const response = await fetch(resolveGraphqlHttpUrl(), {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        query: print(operation.query),
        variables: operation.variables ?? {},
      }),
    });

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as { data?: Record<string, unknown> };
    if (!payload.data) {
      return;
    }

    apolloClient.writeQuery({
      query: operation.query,
      variables: operation.variables,
      data: payload.data,
    });
  } catch {
    // Ignore prefetch failures during logout recovery.
  }
}

function buildPrefetchOperationsForItem(
  item: AppShellNavItemDefinition,
  context: AppShellNavPrefetchContext
): readonly PrefetchOperation[] {
  const isSuperAdmin = context.roles.includes(UserRole.SUPER_ADMIN);

  switch (item.id) {
    case "products":
    case "payments":
    case "notifications":
    case "inquiries":
      return [];
    case "support": {
      const path = resolveAppShellNavPath(item, context);

      if (path === APP_SHELL_ROUTES.supportTickets) {
        return [];
      }

      return [{ query: SUPPORT_CONTACT_QUERY }];
    }
    case "more":
      if (isSuperAdmin) {
        return [];
      }

      return [{ query: APP_PRIVACY_POLICY_PAGE_QUERY }, { query: APP_TERMS_OF_USE_PAGE_QUERY }];
    case "profile":
      return [];
    default:
      return [];
  }
}

export function buildAppShellNavPrefetchOperations(
  context: AppShellNavPrefetchContext
): readonly PrefetchOperation[] {
  const visibleItems = filterAppShellNavItems(APP_SHELL_NAV_ITEMS, context);

  return visibleItems.flatMap((item) => buildPrefetchOperationsForItem(item, context));
}

/** Warms Apollo cache for a single nav target (e.g. on hover/touch before navigation). */
export function prefetchAppShellNavItemData(
  item: AppShellNavItemDefinition,
  context: AppShellNavPrefetchContext
): void {
  if (shouldSkipPrefetch()) {
    return;
  }

  const operations = buildPrefetchOperationsForItem(item, context);
  if (operations.length === 0) {
    return;
  }

  void Promise.all(operations.map(prefetchQuery));
}

export function scheduleAppShellNavPrefetch(context: AppShellNavPrefetchContext): void {
  if (shouldSkipPrefetch()) {
    return;
  }

  const authKey = buildAuthPrefetchKey(context);
  if (lastPrefetchedAuthKey === authKey) {
    return;
  }

  lastPrefetchedAuthKey = authKey;

  const operations = buildAppShellNavPrefetchOperations(context);
  if (operations.length === 0) {
    return;
  }

  const run = (): void => {
    pendingPrefetchHandle = null;
    pendingPrefetchUsesIdleCallback = false;
    void Promise.all(operations.map(prefetchQuery));
  };

  if (typeof window.requestIdleCallback === "function") {
    pendingPrefetchUsesIdleCallback = true;
    pendingPrefetchHandle = window.requestIdleCallback(run, { timeout: 8_000 });
    return;
  }

  pendingPrefetchUsesIdleCallback = false;
  pendingPrefetchHandle = window.setTimeout(run, 3_000);
}

/** Prefetches nav data immediately after logout, using fetch so clearStore cannot abort requests. */
export async function runAppShellNavPrefetchNow(
  context: AppShellNavPrefetchContext
): Promise<void> {
  if (getIsOfflineMode() || isNativeAndroidShell()) {
    return;
  }

  lastPrefetchedAuthKey = buildAuthPrefetchKey(context);

  const operations = buildAppShellNavPrefetchOperations(context);
  if (operations.length === 0) {
    return;
  }

  await Promise.all(operations.map(prefetchQueryDetached));
}
