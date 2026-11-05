"use server";

import { revalidatePath } from "next/cache";
import { ApiError, deleteStudio } from "@/lib/api";

/** Result of the delete action — serialized back to the client. */
export type DeleteStudioState = {
    ok: boolean;
    error?: string;
};

/** MongoDB ObjectId shape (24 hex chars) — reject anything else up front. */
const OBJECT_ID = /^[0-9a-f]{24}$/i;

/**
 * Server action: permanently delete a studio listing.
 *
 * Runs on the server and calls DELETE /studios/:id on the StudioSpace API
 * (studiospace-server), which removes the document from MongoDB.
 */
export async function deleteStudioAction(formData: FormData): Promise<DeleteStudioState> {
    const id = String(formData.get("id") ?? "").trim();

    if (!OBJECT_ID.test(id)) {
        return {
            ok: false,
            error: "This studio link isn't valid. Refresh the page and try again.",
        };
    }

    try {
        await deleteStudio(id);
    } catch (err) {
        return {
            ok: false,
            error:
                err instanceof ApiError
                    ? err.message
                    : "We couldn't delete that studio. Please try again.",
        };
    }

    revalidatePath("/studios");
    return { ok: true };
}
