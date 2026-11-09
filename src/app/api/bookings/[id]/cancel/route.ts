import { getAuthFromRequest } from "@/lib/server/auth-jwt";
import { cancelBookingForUser } from "@/lib/server/bookings";

/** Cancel one of the signed-in guest's own pending bookings. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthFromRequest(request);
  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const result = await cancelBookingForUser(id, user.email);

  if (!result.ok) {
    return Response.json({ message: result.message }, { status: result.status });
  }

  return Response.json(result.data);
}
