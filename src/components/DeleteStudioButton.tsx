"use client";

import { useTransition, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Studio } from "@/lib/api";
import { deleteStudioAction, type DeleteStudioState } from "@/app/studios/[id]/actions";

/**
 * "Delete listing" button beside Edit on the studio detail page.
 * Opens a confirmation dialog; confirming posts to the server action,
 * which deletes the document from MongoDB via the StudioSpace API.
 * On success: toast + redirect to /studios.
 */
export default function DeleteStudioButton({ studio }: { studio: Studio }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    const handleDelete = (ev: FormEvent<HTMLFormElement>) => {
        ev.preventDefault();
        const formData = new FormData(ev.currentTarget);
        setError(null);

        startTransition(async () => {
            const result: DeleteStudioState = await deleteStudioAction(formData);

            if (result.ok) {
                setOpen(false);
                toast.success(`“${studio.title}” was deleted.`);
                router.push("/studios");
            } else {
                setError(result.error ?? "We couldn't delete that studio. Please try again.");
            }
        });
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
                <Trash2 className="size-4" aria-hidden />
                Delete listing
            </button>

            <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
                <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl outline-none">
                    <Dialog.Title className="text-xl font-semibold tracking-tight text-[#1b1b1a]">
                        Delete this listing?
                    </Dialog.Title>
                    <Dialog.Description className="mt-2 text-sm leading-relaxed text-[#7a776f]">
                        <span className="font-medium text-[#1b1b1a]">{studio.title}</span> will be
                        permanently removed from MongoDB. This can&apos;t be undone — bookings and
                        listing details won&apos;t be recoverable.
                    </Dialog.Description>

                    {error && (
                        <div
                            className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-700"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleDelete} className="mt-6 grid gap-3 sm:grid-cols-2">
                        <input type="hidden" name="id" value={studio.id} />
                        <Dialog.Close
                            disabled={pending}
                            className="rounded-xl border border-[#e7e3db] bg-white py-3 text-sm font-medium transition-colors hover:bg-[#f3f0ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/40 disabled:opacity-60"
                        >
                            Cancel
                        </Dialog.Close>
                        <button
                            type="submit"
                            disabled={pending}
                            className="rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 disabled:opacity-60"
                        >
                            {pending ? "Deleting…" : "Delete listing"}
                        </button>
                    </form>
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
