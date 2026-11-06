import { createAuthClient } from "better-auth/react";

/** Same-origin client: no baseURL needed when the API lives in this Next app. */
export const authClient = createAuthClient();

export type AuthUser = { name: string; email: string };

/**
 * Session-backed replacement for the old demo hook. Keeps the `{ user, loading }`
 * shape the rest of the app already expects. Returning the session user itself
 * keeps its identity stable between renders (effects depend on `user`).
 */
export function useAuth(): { user: AuthUser | null; loading: boolean } {
  const { data, isPending } = authClient.useSession();

  return {
    user: data?.user ?? null,
    loading: isPending,
  };
}
