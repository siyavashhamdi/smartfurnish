import { LOCAL_STORAGE_KEYS } from "../constants";
import { abortAnonymousSessionCreation } from "../utils/anonymousAuthSession.util";

const UNAUTHENTICATED_RELOAD_GUARD_KEY = "sf:unauthenticated-reload-guard";

export function clearUnauthenticatedReloadGuard(): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(UNAUTHENTICATED_RELOAD_GUARD_KEY);
}

export function reloadPageOnUnauthenticated(): void {
  if (typeof window === "undefined") {
    return;
  }

  if (sessionStorage.getItem(UNAUTHENTICATED_RELOAD_GUARD_KEY) === "1") {
    return;
  }

  sessionStorage.setItem(UNAUTHENTICATED_RELOAD_GUARD_KEY, "1");
  abortAnonymousSessionCreation();
  localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem("user");
  window.location.reload();
}
