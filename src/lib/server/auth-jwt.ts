import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

/** Name of the HTTPOnly cookie that carries the signed JWT. */
export const AUTH_COOKIE = "studiospace_jwt";

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const encoder = new TextEncoder();

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

function secretKey() {
  const secret = process.env.JWT_SECRET ?? process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET or BETTER_AUTH_SECRET must be set.");
  }
  return encoder.encode(secret);
}

export async function signAuthToken(user: AuthUser) {
  return new SignJWT({ email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function verifyAuthToken(token: string | undefined | null): Promise<AuthUser | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (!payload.sub || typeof payload.email !== "string") return null;

    return {
      id: payload.sub,
      email: payload.email,
      name:
        typeof payload.name === "string" && payload.name.trim()
          ? payload.name
          : payload.email.split("@")[0],
    };
  } catch {
    return null;
  }
}

function readCookie(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
}

/** Read and verify the JWT from an incoming Route Handler request. */
export async function getAuthFromRequest(request: Request) {
  return verifyAuthToken(readCookie(request.headers.get("cookie"), AUTH_COOKIE));
}

/** Read and verify the JWT from the Next.js cookie store (Server Actions/RSC). */
export async function getAuthFromCookies() {
  const store = await cookies();
  return verifyAuthToken(store.get(AUTH_COOKIE)?.value);
}

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: TOKEN_TTL_SECONDS,
};
