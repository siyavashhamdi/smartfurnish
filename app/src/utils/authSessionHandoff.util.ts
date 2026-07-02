import type { User } from "../contexts/AuthContext";
import { LOCAL_STORAGE_KEYS } from "../constants";
import {
  beginLogoutCacheCleanup,
  endLogoutCacheCleanup,
} from "../lib/app-shell-nav-prefetch";
import { resetApolloClientCache } from "../lib/apollo-client";
import { disposeGraphqlWsClient } from "../lib/graphql-ws-client";
import { isNativeCapacitorShell } from "./apiBaseUrl.util";
import { clearPresentedNotificationIds } from "./presented-notification-ids.util";
import { unregisterWebPushSubscriptionFromServer } from "./pushSubscription.util";

let authSessionHandoffInProgress = false;
const authSessionHandoffEndListeners = new Set<() => void>();

export function isAuthSessionHandoffInProgress(): boolean {
  return authSessionHandoffInProgress;
}

export function subscribeAuthSessionHandoffEnd(listener: () => void): () => void {
  authSessionHandoffEndListeners.add(listener);
  return () => {
    authSessionHandoffEndListeners.delete(listener);
  };
}

function notifyAuthSessionHandoffEnd(): void {
  for (const listener of authSessionHandoffEndListeners) {
    listener();
  }
}

export function readStoredAuthUserId(): string | null {
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    return null;
  }

  try {
    return (JSON.parse(userStr) as User).id ?? null;
  } catch {
    return null;
  }
}

export function captureAuthSessionHandoffContext(): {
  readonly previousUserId: string | null;
  readonly previousToken: string | null;
} {
  return {
    previousUserId: readStoredAuthUserId(),
    previousToken: localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN),
  };
}

/** Drop the old WebSocket session without blocking login on client.dispose(). */
export function beginAuthSessionHandoff(): void {
  authSessionHandoffInProgress = true;
  void disposeGraphqlWsClient().finally(() => {
    authSessionHandoffInProgress = false;
    notifyAuthSessionHandoffEnd();
  });
}

export function finalizeAuthIdentityChange(options: {
  readonly previousUserId: string | null;
  readonly previousToken: string | null;
  readonly newUserId: string;
}): void {
  const identityChanged =
    Boolean(options.previousUserId) && options.previousUserId !== options.newUserId;

  if (identityChanged) {
    clearPresentedNotificationIds();

    if (options.previousToken) {
      void (async () => {
        try {
          if (!isNativeCapacitorShell()) {
            await unregisterWebPushSubscriptionFromServer({
              authToken: options.previousToken,
            });
          }
        } catch (error: unknown) {
          console.warn("[Auth] Failed to unregister Web Push during identity handoff.", error);
        }
      })();
    }
  }

  schedulePostLoginCacheReset();
}

function schedulePostLoginCacheReset(): void {
  void (async () => {
    beginLogoutCacheCleanup();

    try {
      await resetApolloClientCache();
    } catch (error: unknown) {
      console.warn("[Auth] Failed to reset client cache after login.", error);
    } finally {
      endLogoutCacheCleanup();
    }
  })();
}
