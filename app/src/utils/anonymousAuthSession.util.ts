import { LOCAL_STORAGE_KEYS } from "../constants";
import type { User } from "../contexts/AuthContext";
import { USER_CREATE_ANONYMOUS_MUTATION } from "../graphql/mutations/userCreateAnonymous.mutation";
import { apolloClient } from "../lib/apollo-client";
import type { UserCreateAnonymousMutation } from "../lib/graphql/generated/graphql";
import { collectSessionClientContextInput } from "./sessionClientContext.util";

let anonymousSessionRequest: Promise<User | null> | null = null;
let anonymousSessionCreationBlocked = false;

function mapAnonymousLoginUser(
  user: UserCreateAnonymousMutation["userCreateAnonymous"]["user"],
): User {
  return {
    id: String(user.id),
    username: user.username,
    roles: user.roles.map((role) => String(role)),
  };
}

function persistAnonymousAuthSession(accessToken: string, user: User): void {
  localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem("user", JSON.stringify(user));
}

export function abortAnonymousSessionCreation(): void {
  anonymousSessionCreationBlocked = true;
  anonymousSessionRequest = null;
}

export function resetAnonymousSessionCreationBlock(): void {
  anonymousSessionCreationBlocked = false;
  anonymousSessionRequest = null;
}

export function ensureAnonymousAuthSession(): Promise<User | null> {
  const existingToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  const existingUser = localStorage.getItem("user");

  if (existingToken && existingUser) {
    try {
      return Promise.resolve(JSON.parse(existingUser) as User);
    } catch {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem("user");
    }
  }

  if (anonymousSessionCreationBlocked) {
    return Promise.resolve(null);
  }

  if (!anonymousSessionRequest) {
    anonymousSessionRequest = (async () => {
      if (anonymousSessionCreationBlocked) {
        return null;
      }

      try {
        const clientContext = await collectSessionClientContextInput();
        if (anonymousSessionCreationBlocked) {
          return null;
        }

        const result = await apolloClient.mutate<UserCreateAnonymousMutation>({
          mutation: USER_CREATE_ANONYMOUS_MUTATION,
          variables: {
            input: {
              clientContext,
            },
          },
        });

        if (anonymousSessionCreationBlocked) {
          return null;
        }

        const payload = result.data?.userCreateAnonymous;
        const accessToken = payload?.accessToken?.trim();
        const user = payload?.user;

        if (!accessToken || !user) {
          console.warn("[Auth] Anonymous session creation returned an incomplete response.");
          return null;
        }

        const mappedUser = mapAnonymousLoginUser(user);
        persistAnonymousAuthSession(accessToken, mappedUser);
        return mappedUser;
      } catch (error: unknown) {
        console.warn("[Auth] Failed to create anonymous session.", error);
        return null;
      } finally {
        anonymousSessionRequest = null;
      }
    })();
  }

  return anonymousSessionRequest;
}
