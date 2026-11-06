import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { listStudios, type Studio } from "@/lib/api";
import StudiosExplorer from "@/components/StudiosExplorer";

export const metadata: Metadata = {
    title: "Explore Studios",
    description: "Discover inspiring creative studios and book them by the hour.",
};

function StudiosSkeleton() {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
            {[0, 1, 2].map((i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-ss-line bg-ss-surface">
                    <div className="aspect-[4/3] bg-ss-sunk" />
                    <div className="space-y-3 p-5">
                        <div className="h-3 w-24 rounded bg-ss-sunk" />
                        <div className="h-5 w-3/4 rounded bg-ss-sunk" />
                        <div className="h-3 w-1/2 rounded bg-ss-sunk" />
                    </div>
                </div>
            ))}
        </div>
    );
}

async function StudiosGrid() {
    let studios: Studio[];
    let failed = false;

    try {
        studios = await listStudios();
    } catch {
        studios = [];
        failed = true;
    }

    if (failed) {
        return (
            <div className="rounded-2xl border border-red-300 bg-red-50 px-6 py-10 text-center">
                <p className="text-sm font-medium text-red-800">We couldn&apos;t load studios right now.</p>
                <p className="mt-1 text-sm text-red-700">
                    The StudioSpace server may be offline. Start it, then refresh this page.
                </p>
            </div>
        );
    }

    if (studios.length === 0) {
        return (
            <div className="rounded-2xl border border-ss-line bg-ss-surface px-6 py-16 text-center">
                <h2 className="text-xl font-semibold tracking-tight text-ss-ink">No studios yet.</h2>
                <p className="mt-2 text-sm text-ss-muted">
                    Be the first to share a space with the StudioSpace community.
                </p>
                <Link
                    href="/add-studio"
                    className="mt-6 inline-block rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                    List your studio
                </Link>
            </div>
        );
    }

    return <StudiosExplorer studios={studios} />;
}

export default function StudiosPage() {
    return (
        <main className="flex-1 bg-ss-bg text-ss-ink">
            <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8">
                <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-medium tracking-wide text-brand">Explore studios</p>
                        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                            Find your next room to make in.
                        </h1>
                        <p className="mt-2 max-w-xl text-[15px] text-ss-muted">
                            Photo studios, film stages, podcast lounges and more — booked by the hour.
                        </p>
                    </div>
                    <Link
                        href="/add-studio"
                        className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                    >
                        List your studio
                    </Link>
                </header>

                <Suspense fallback={<StudiosSkeleton />}>
                    <StudiosGrid />
                </Suspense>
            </div>
        </main>
    );
}
