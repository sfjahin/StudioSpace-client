"use server";

import { revalidatePath } from "next/cache";
import { getAuthFromCookies } from "@/lib/server/auth-jwt";
import { deleteStudioForUser } from "@/lib/server/studios";

/** Result of the delete action — serialized back to the client. */
export type DeleteStudioState = {
    ok: boolean;
    error?: string;
};

/**
 * Server action: permanently delete a studio listing.
 *
 * Reads the HTTPOnly JWT cookie, rejects unauthenticated callers, and only
 * deletes when the signed-in user owns the listing.
 */
export async function deleteStudioAction(formData: FormData): Promise<DeleteStudioState> {
    const user = await getAuthFromCookies();
    if (!user) {
        return {
            ok: false,
            error: "Your session has expired. Please log in and try again.",
        };
    }

    const id = String(formData.get("id") ?? "").trim();
    const result = await deleteStudioForUser(id, user.email);

    if (!result.ok) {
        return { ok: false, error: result.message };
    }

    revalidatePath("/studios");
    return { ok: true };
}
