"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Pencil } from "lucide-react";
import type { Studio } from "@/lib/api";
import StudioEditForm from "./StudioEditForm";

/**
 * "Edit listing" button on the studio detail page.
 * Opens a popup with the pre-filled edit form; saving PUTs to the API,
 * shows a success toast and redirects to /my-listings.
 */
export default function EditStudioButton({ studio }: { studio: Studio }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-ss-line bg-ss-surface px-4 py-2.5 text-sm font-medium text-ss-ink transition-colors hover:bg-ss-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
                <Pencil className="size-4 text-brand" aria-hidden />
                Edit listing
            </button>

            <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
                <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 flex max-h-[88vh] w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-ss-surface shadow-2xl outline-none">
                    <div className="flex items-start justify-between gap-4 border-b border-ss-line px-6 py-5">
                        <div className="min-w-0">
                            <Dialog.Title className="text-xl font-semibold tracking-tight text-ss-ink">
                                Edit listing
                            </Dialog.Title>
                            <Dialog.Description className="mt-1 text-sm text-ss-muted">
                                Update how creatives see {studio.title}. Changes are saved to your
                                listing right away.
                            </Dialog.Description>
                        </div>
                        <Dialog.Close
                            aria-label="Close"
                            className="flex size-8 shrink-0 items-center justify-center rounded-full text-ss-muted transition hover:bg-ss-hover hover:text-ss-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                        >
                            ✕
                        </Dialog.Close>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                        <StudioEditForm
                            studio={studio}
                            variant="dialog"
                            onCancel={() => setOpen(false)}
                        />
                    </div>
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
