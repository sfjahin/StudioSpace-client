import { getAuthFromRequest } from "@/lib/server/auth-jwt";
import { createBookingForUser, listBookingsForApi } from "@/lib/server/bookings";

/** List bookings. Guests see their own; hosts add `?ownerEmail=` to see requests for their studios. */
export async function GET(request: Request) {
  const user = await getAuthFromRequest(request);
  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const ownerEmail = searchParams.get("ownerEmail")?.trim();
  if (ownerEmail && ownerEmail.toLowerCase() !== user.email.toLowerCase()) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const bookings = await listBookingsForApi(
      ownerEmail ? { ownerEmail: user.email } : { userEmail: user.email }
    );
    return Response.json({ bookings });
  } catch (err) {
    console.error("Failed to list bookings:", err);
    return Response.json({ message: "We couldn't load your bookings." }, { status: 500 });
  }
}

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
