import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
<<<<<<< HEAD
import { listStudios, type Studio } from "@/lib/api";
import StudiosExplorer from "@/components/StudiosExplorer";
=======
import { MapPin, Star } from "lucide-react";
import { formatMoney, listStudios, type Studio } from "@/lib/api";
import { averageRating, buildReviews } from "@/lib/studio-detail";
>>>>>>> 6a0b7a52d7fcf34f22d7a10e3b9bfa737da6529f

export const metadata: Metadata = {
    title: "Explore Studios",
    description: "Discover inspiring creative studios and book them by the hour.",
};

<<<<<<< HEAD
=======
function StudioCard({ studio }: { studio: Studio }) {
    const rating = averageRating(buildReviews(studio));

    return (
        <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#e7e3db] bg-white transition-shadow hover:shadow-lg">
            <Link
                href={`/studios/${studio.id}`}
                aria-label={`View ${studio.title}`}
                className="relative block aspect-[4/3] overflow-hidden bg-[#f0ece4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF5A1F]/40"
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={studio.imageUrl}
                    alt={studio.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#FF5A1F] shadow-sm">
                    {studio.category}
                </span>
            </Link>
            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold tracking-tight text-[#1b1b1a]">
                        {studio.title}
                    </h2>
                    <span
                        className="flex shrink-0 items-center gap-1 pt-1 text-sm font-medium text-[#1b1b1a]"
                        aria-label={`Rated ${rating.toFixed(2)} out of 5`}
                    >
                        <Star className="size-3.5 fill-[#FF5A1F] text-[#FF5A1F]" aria-hidden />
                        {rating.toFixed(2)}
                    </span>
                </div>
                <p className="mt-1.5 flex items-start gap-1.5 text-sm text-[#7a776f]">
                    <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                    <span className="line-clamp-2">{studio.address}</span>
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#1b1b1a]">
                        {formatMoney(studio.hourlyRate)}
                        <span className="font-normal text-[#7a776f]"> / hour</span>
                    </span>
                    <span className="text-[#7a776f]">Fits {studio.maxCapacity}</span>
                </div>
                <Link
                    href={`/studios/${studio.id}`}
                    className="mt-5 rounded-xl bg-[#FF5A1F] py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#e84e15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/40 focus-visible:ring-offset-2"
                >
                    View Details
                </Link>
            </div>
        </article>
    );
}

>>>>>>> 6a0b7a52d7fcf34f22d7a10e3b9bfa737da6529f
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
