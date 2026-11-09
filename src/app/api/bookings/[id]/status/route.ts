import { getAuthFromRequest } from "@/lib/server/auth-jwt";
import { updateBookingStatusForUser } from "@/lib/server/bookings";

/** Host moves a booking along: Pending -> Confirmed -> Completed, or Cancelled. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const input = (body ?? {}) as Record<string, unknown>;
  const status = typeof input.status === "string" ? input.status : "";

  const { id } = await params;
  const result = await updateBookingStatusForUser(id, user.email, status);

  if (!result.ok) {
    return Response.json({ message: result.message }, { status: result.status });
  }

  return Response.json(result.data);
}
