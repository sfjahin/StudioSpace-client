import { getAuthFromRequest } from "@/lib/server/auth-jwt";
import { createStudioForUser, listStudiosForApi } from "@/lib/server/studios";

/** List studios. Supports ?ownerEmail=, ?category= and ?limit=. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ownerEmail = searchParams.get("ownerEmail")?.trim() || undefined;
  const category = searchParams.get("category")?.trim() || undefined;
  const rawLimit = Number.parseInt(searchParams.get("limit") ?? "", 10);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : undefined;

  try {
    const studios = await listStudiosForApi({ ownerEmail, category, limit });
    return Response.json({ studios });
  } catch (err) {
    console.error("Failed to list studios:", err);
    return Response.json({ message: "We couldn't load studios." }, { status: 500 });
  }
}

/** Create a studio. Requires a valid JWT in the HTTPOnly cookie. */
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

  const result = await createStudioForUser(body, { name: user.name, email: user.email });
  if (!result.ok) {
    return Response.json(
      { message: result.message, ...(result.fields ? { fields: result.fields } : {}) },
      { status: result.status }
    );
  }

  return Response.json(result.data, { status: 201 });
}
