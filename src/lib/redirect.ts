/**
 * Only allow same-app, single-slash paths as a post-auth destination.
 * Falls back to the dashboard for empty, absolute, or protocol-relative URLs.
 */
export function safeNext(value: string | null, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
