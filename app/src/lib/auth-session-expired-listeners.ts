import { LOCAL_STORAGE_KEYS } from "../constants";

type AuthSessionExpiredListener = () => void;

const listeners = new Set<AuthSessionExpiredListener>();

export const subscribeAuthSessionExpired = (listener: AuthSessionExpiredListener): (() => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const notifyAuthSessionExpired = (): void => {
  localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem("user");

  listeners.forEach((listener) => {
    listener();
  });
};
