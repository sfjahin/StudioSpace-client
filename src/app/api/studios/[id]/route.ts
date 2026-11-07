import { getAuthFromRequest } from "@/lib/server/auth-jwt";
import {
  deleteStudioForUser,
  getStudioForApi,
  updateStudioForUser,
} from "@/lib/server/studios";

/** Load one studio by id. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const studio = await getStudioForApi(id);

  if (!studio) {
    return Response.json({ message: "Studio not found." }, { status: 404 });
  }

  return Response.json(studio);
}

/** Update a studio. Only its owner may do this, and only with a valid JWT. */
export async function PUT(
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

  const { id } = await params;
  const result = await updateStudioForUser(id, body, { name: user.name, email: user.email });

  if (!result.ok) {
    return Response.json(
      { message: result.message, ...(result.fields ? { fields: result.fields } : {}) },
      { status: result.status }
    );
  }

  return Response.json(result.data);
}

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
