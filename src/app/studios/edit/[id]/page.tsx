"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { ApiError, getStudio, type Studio } from "@/lib/api";
import { useAuth } from "@/lib/auth-client";
import StudioEditForm from "@/components/StudioEditForm";

/* ------------------------------ Private route ----------------------------- */

export default function EditStudioPage({ params }: PageProps<"/studios/edit/[id]">) {
    const { id } = use(params);
    const router = useRouter();
    const { user, loading } = useAuth();

    const [studio, setStudio] = useState<Studio | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Private route guard
    useEffect(() => {
        if (!loading && !user) router.replace(`/login?next=/studios/edit/${id}`);
    }, [loading, user, router, id]);

    // Load the existing listing so the form can start pre-filled.
    useEffect(() => {
        let cancelled = false;

        getStudio(id)
            .then((s) => {
                if (!cancelled) setStudio(s);
            })
            .catch((err) => {
                if (cancelled) return;
                setLoadError(
                    err instanceof ApiError && err.status === 404
                        ? "This listing no longer exists. It may have been removed."
                        : "We couldn't load this listing. Make sure the StudioSpace server is running, then refresh."
                );
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    if (loading || !user) {
        return (
            <div className="grid min-h-screen place-items-center bg-ss-bg text-sm text-ss-muted">
                Checking your account…
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-ss-bg text-ss-ink">
            <div className="mx-auto max-w-3xl px-5 pb-20 pt-10 sm:px-8">
                {/* Header */}
                <header className="mb-8">
                    <p className="text-xs font-medium tracking-wide text-brand">
                        Host workspace / Edit listing
                    </p>
                    <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                        Update your listing.
                    </h1>
                    <p className="mt-2 max-w-xl text-[15px] text-ss-muted">
                        Keep prices, photos and details fresh so creatives always know what
                        they&apos;re booking.
                    </p>
                    <Link
                        href={`/studios/${id}`}
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-dark"
                    >
                        <ArrowLeft className="size-4" aria-hidden />
                        Back to listing
                    </Link>
                </header>

                {loadError ? (
                    <div className="rounded-2xl border border-red-300 bg-red-50 px-6 py-10 text-center">
                        <p className="text-sm font-medium text-red-800">{loadError}</p>
                        <Link
                            href="/my-listings"
                            className="mt-4 inline-block text-sm font-medium text-brand hover:underline"
                        >
                            Go to my listings
                        </Link>
                    </div>
                ) : !studio ? (
                    <div className="space-y-4" role="status">
                        <span className="sr-only">Loading your listing…</span>
                        <div className="h-20 animate-pulse rounded-2xl bg-ss-sunk" aria-hidden />
                        <div className="h-72 animate-pulse rounded-2xl bg-ss-sunk" aria-hidden />
                        <div className="h-72 animate-pulse rounded-2xl bg-ss-sunk" aria-hidden />
                    </div>
                ) : (
                    <StudioEditForm
                        studio={studio}
                        onCancel={() => router.push(`/studios/${studio.id}`)}
                    />
                )}
            </div>
        </main>
    );
}
