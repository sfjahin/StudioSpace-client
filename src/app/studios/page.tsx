import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { formatMoney, listStudios, type Studio } from "@/lib/api";

export const metadata: Metadata = {
    title: "Explore studios — StudioSpace",
    description: "Discover inspiring creative studios and book them by the hour.",
};

function StudioCard({ studio }: { studio: Studio }) {
    return (
        <Link
            href={`/studios/${studio.id}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-[#e7e3db] bg-white transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/40"
        >
            <div className="aspect-[4/3] overflow-hidden bg-[#f0ece4]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={studio.imageUrl}
                    alt={studio.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
            </div>
            <div className="flex flex-1 flex-col p-5">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#FF5A1F]">
                    {studio.category}
                </p>
                <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-[#1b1b1a]">
                    {studio.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-[#7a776f]">{studio.address}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#1b1b1a]">
                        {formatMoney(studio.hourlyRate)}
                        <span className="font-normal text-[#7a776f]"> / hour</span>
                    </span>
                    <span className="text-[#7a776f]">Fits {studio.maxCapacity}</span>
                </div>
            </div>
        </Link>
    );
}

function StudiosSkeleton() {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
            {[0, 1, 2].map((i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-[#e7e3db] bg-white">
                    <div className="aspect-[4/3] bg-[#eeeae2]" />
                    <div className="space-y-3 p-5">
                        <div className="h-3 w-24 rounded bg-[#eeeae2]" />
                        <div className="h-5 w-3/4 rounded bg-[#eeeae2]" />
                        <div className="h-3 w-1/2 rounded bg-[#eeeae2]" />
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
            <div className="rounded-2xl border border-[#e7e3db] bg-white px-6 py-16 text-center">
                <h2 className="text-xl font-semibold tracking-tight text-[#1b1b1a]">No studios yet.</h2>
                <p className="mt-2 text-sm text-[#7a776f]">
                    Be the first to share a space with the StudioSpace community.
                </p>
                <Link
                    href="/add-studio"
                    className="mt-6 inline-block rounded-xl bg-[#FF5A1F] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e84e15]"
                >
                    List your studio
                </Link>
            </div>
        );
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {studios.map((studio) => (
                <StudioCard key={studio.id} studio={studio} />
            ))}
        </div>
    );
}

export default function StudiosPage() {
    return (
        <main className="flex-1 bg-[#f7f5f1] text-[#1b1b1a]">
            <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8">
                <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-medium tracking-wide text-[#FF5A1F]">Explore studios</p>
                        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                            Find your next room to make in.
                        </h1>
                        <p className="mt-2 max-w-xl text-[15px] text-[#7a776f]">
                            Photo studios, film stages, podcast lounges and more — booked by the hour.
                        </p>
                    </div>
                    <Link
                        href="/add-studio"
                        className="rounded-xl bg-[#FF5A1F] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e84e15]"
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
