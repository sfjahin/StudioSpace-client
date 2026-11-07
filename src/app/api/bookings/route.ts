import { getAuthFromRequest } from "@/lib/server/auth-jwt";
import { createBookingForUser } from "@/lib/server/bookings";

/**
 * Create a booking. Requires a valid JWT in the HTTPOnly cookie.
 * Prices and user identity are derived server-side; confirmed overlaps are rejected.
 */
export async function POST(request: Request) {
  const user = await getAuthFromRequest(request);
  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Send a valid JSON body." }, { status: 400 });
  }

  const result = await createBookingForUser(body, user);
  if (!result.ok) {
    return Response.json(
      { message: result.message, ...(result.fields ? { fields: result.fields } : {}) },
      { status: result.status }
    );
  }

  return Response.json(result.data, { status: 201 });
}
