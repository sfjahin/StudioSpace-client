import { useEffect } from "react";
import { createAuthClient } from "better-auth/react";

/** Same-origin client: no baseURL needed when the API lives in this Next app. */
export const authClient = createAuthClient();

export type AuthUser = { name: string; email: string };

let jwtSync: Promise<boolean> | null = null;

/**
 * Ask the server to exchange the Better Auth session for an HTTPOnly JWT
 * cookie. Deduped so several `useAuth` consumers don't fire parallel requests.
 */
export function syncAuthJwt(force = false): Promise<boolean> {
  if (!force && jwtSync) return jwtSync;

  jwtSync = fetch("/api/auth/jwt", {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
  })
    .then((res) => res.ok)
    .catch(() => false);

  return jwtSync;
}

/** Clear the HTTPOnly JWT cookie on logout. */
export async function clearAuthJwt() {
  jwtSync = null;
  try {
    await fetch("/api/auth/jwt", {
      method: "DELETE",
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    // The Better Auth session is already gone; the cookie expires on its own.
  }
}

/**
 * Session-backed replacement for the old demo hook. Keeps the `{ user, loading }`
 * shape the rest of the app already expects. Returning the session user itself
 * keeps its identity stable between renders (effects depend on `user`).
 */
export function useAuth(): { user: AuthUser | null; loading: boolean } {
  const { data, isPending } = authClient.useSession();
  const userId = data?.user?.id;

  // Covers page reloads and OAuth redirects, where the session cookie exists
  // but the JWT may be missing or expired.
  useEffect(() => {
    if (userId) void syncAuthJwt();
  }, [userId]);

  return {
    user: data?.user ?? null,
    loading: isPending,
  };
}
