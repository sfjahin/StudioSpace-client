"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { formatMoney, listStudios, type Studio } from "@/lib/api";
import { useAuth } from "@/lib/auth";

/* --------------------------------- Cards --------------------------------- */

function ListingCard({ studio }: { studio: Studio }) {
    return (
        <article className="flex flex-col overflow-hidden rounded-2xl border border-[#e7e3db] bg-white">
            <Link
                href={`/studios/${studio.id}`}
                className="group aspect-[4/3] overflow-hidden bg-[#f0ece4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/40"
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={studio.imageUrl}
                    alt={studio.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
            </Link>
            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-[#FF5A1F]">
                            {studio.category}
                        </p>
                        <h2 className="mt-1.5 truncate text-lg font-semibold tracking-tight text-[#1b1b1a]">
                            {studio.title}
                        </h2>
                    </div>
                    <span className="shrink-0 rounded-md bg-[#e9f7ee] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#1f7a3d]">
                        Live
                    </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-[#7a776f]">{studio.address}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#1b1b1a]">
                        {formatMoney(studio.hourlyRate)}
                        <span className="font-normal text-[#7a776f]"> / hour</span>
                    </span>
                    <span className="text-[#7a776f]">Fits {studio.maxCapacity}</span>
                </div>
                <div className="mt-4 grid gap-2 border-t border-[#e7e3db] pt-4 sm:grid-cols-2">
                    <Link
                        href={`/studios/${studio.id}`}
                        className="rounded-xl border border-[#e7e3db] bg-white py-2.5 text-center text-sm font-medium transition-colors hover:bg-[#f3f0ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/40"
                    >
                        View
                    </Link>
                    <Link
                        href={`/studios/edit/${studio.id}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#FF5A1F] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e84e15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/40 focus-visible:ring-offset-2"
                    >
                        <Pencil className="size-3.5" aria-hidden />
                        Edit
                    </Link>
                </div>
            </div>
        </article>
    );
}

function ListingsSkeleton() {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className="animate-pulse overflow-hidden rounded-2xl border border-[#e7e3db] bg-white"
                >
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

/* --------------------------------- Page ---------------------------------- */

export default function MyListingsPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    const [studios, setStudios] = useState<Studio[] | null>(null); // null = loading
    const [failed, setFailed] = useState(false);

    // Private route guard
    useEffect(() => {
        if (!loading && !user) router.replace("/login?next=/my-listings");
    }, [loading, user, router]);

    // Load this host's listings.
    useEffect(() => {
        if (!user) return;
        let cancelled = false;

        listStudios()
            .then((all) => {
                if (cancelled) return;
                const mine = all.filter(
                    (s) =>
                        !!s.hostEmail &&
                        s.hostEmail.toLowerCase() === user.email.toLowerCase()
                );
                setStudios(mine);
            })
            .catch(() => {
                if (cancelled) return;
                setFailed(true);
                setStudios([]);
            });

        return () => {
            cancelled = true;
        };
    }, [user]);

    if (loading || !user) {
        return (
            <div className="grid min-h-screen place-items-center bg-[#f7f5f1] text-sm text-[#7a776f]">
                Checking your account…
            </div>
        );
    }

    return (
        <main className="flex-1 bg-[#f7f5f1] text-[#1b1b1a]">
            <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8">
                {/* Header */}
                <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-medium tracking-wide text-[#FF5A1F]">
                            Host workspace / My listings
                        </p>
                        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                            Your listings.
                        </h1>
                        <p className="mt-2 max-w-xl text-[15px] text-[#7a776f]">
                            Everything you publish with {user.email} — edit details, pricing and
                            photos whenever you need.
                        </p>
                    </div>
                    <Link
                        href="/add-studio"
                        className="rounded-xl bg-[#FF5A1F] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e84e15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/40 focus-visible:ring-offset-2"
                    >
                        List your studio
                    </Link>
                </header>

                {studios === null ? (
                    <ListingsSkeleton />
                ) : failed ? (
                    <div className="rounded-2xl border border-red-300 bg-red-50 px-6 py-10 text-center">
                        <p className="text-sm font-medium text-red-800">
                            We couldn&apos;t load your listings right now.
                        </p>
                        <p className="mt-1 text-sm text-red-700">
                            The StudioSpace server may be offline. Start it, then refresh this page.
                        </p>
                    </div>
                ) : studios.length === 0 ? (
                    <div className="rounded-2xl border border-[#e7e3db] bg-white px-6 py-16 text-center">
                        <h2 className="text-xl font-semibold tracking-tight text-[#1b1b1a]">
                            No listings yet.
                        </h2>
                        <p className="mt-2 text-sm text-[#7a776f]">
                            Studios you publish will show up here, ready to edit any time.
                        </p>
                        <Link
                            href="/add-studio"
                            className="mt-6 inline-block rounded-xl bg-[#FF5A1F] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e84e15]"
                        >
                            List your studio
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {studios.map((studio) => (
                            <ListingCard key={studio.id} studio={studio} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
