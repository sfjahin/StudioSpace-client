"use client";

export type AuthUser = { name: string; email: string };

// Stable reference so effects that depend on `user` don't re-run every render.
const DEMO_USER: AuthUser = { name: "Maya Chen", email: "maya@example.com" };

export function useAuth(): { user: AuthUser | null; loading: boolean } {
  // TODO: swap for your auth provider, e.g. `const { data, status } = useSession()`
  return { user: DEMO_USER, loading: false };
}
