import { getAuthFromRequest } from "@/lib/server/auth-jwt";
import { deleteStudioForUser } from "@/lib/server/studios";

/** Delete a studio. Only its owner may do this, and only with a valid JWT. */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthFromRequest(request);
  if (!user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const result = await deleteStudioForUser(id, user.email);

  if (!result.ok) {
    return Response.json({ message: result.message }, { status: result.status });
  }

  return Response.json(result.data);
}
