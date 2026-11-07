import { cookies } from "next/headers";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  AUTH_COOKIE,
  AUTH_COOKIE_OPTIONS,
  signAuthToken,
} from "@/lib/server/auth-jwt";

/**
 * Exchanges the Better Auth session for a short-lived signed JWT and stores it
 * in an HTTPOnly cookie. Client-side JavaScript can never read this cookie.
 */
export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const token = await signAuthToken({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  });

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, AUTH_COOKIE_OPTIONS);

  return Response.json({ ok: true });
}

/** Clear the JWT cookie (used on logout). */
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, "", { ...AUTH_COOKIE_OPTIONS, maxAge: 0 });
  return Response.json({ ok: true });
}
