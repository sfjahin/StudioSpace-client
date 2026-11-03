import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ApiError, formatMoney, getStudio, priceBreakdown, type Studio } from "@/lib/api";

export const metadata: Metadata = {
    title: "Studio — StudioSpace",
};

function DetailSkeleton() {
    return (
        <div className="animate-pulse space-y-6" aria-hidden>
            <div className="aspect-[16/9] rounded-2xl bg-[#eeeae2]" />
            <div className="h-8 w-2/3 rounded bg-[#eeeae2]" />
            <div className="h-4 w-1/3 rounded bg-[#eeeae2]" />
        </div>
    );
}

function Spec({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-[#e7e3db] bg-white px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#8f8c85]">{label}</p>
            <p className="mt-1 text-[15px] font-medium text-[#1b1b1a]">{value}</p>
        </div>
    );
}

async function StudioDetail({ id }: { id: string }) {
    let studio: Studio;

    try {
        studio = await getStudio(id);
    } catch (err) {
        if (err instanceof ApiError && err.status === 404) notFound();
        return (
            <div className="rounded-2xl border border-red-300 bg-red-50 px-6 py-10 text-center">
                <p className="text-sm font-medium text-red-800">We couldn&apos;t load this studio right now.</p>
                <p className="mt-1 text-sm text-red-700">
                    The StudioSpace server may be offline. Try again in a moment.
                </p>
            </div>
        );
    }

    const pricing = priceBreakdown(studio.hourlyRate);

    return (
        <article className="space-y-8">
            <div className="overflow-hidden rounded-2xl border border-[#e7e3db] bg-[#f0ece4]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={studio.imageUrl}
                    alt={studio.title}
                    className="aspect-[16/9] w-full object-cover"
                />
            </div>

            <header>
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#FF5A1F]">
                    {studio.category}
                </p>
                <h1 className="mt-1.5 text-4xl font-semibold tracking-tight sm:text-5xl">{studio.title}</h1>
                <p className="mt-2 text-[15px] text-[#7a776f]">{studio.address}</p>
            </header>

            <div className="grid gap-4 sm:grid-cols-3">
                <Spec label="Hourly rate" value={formatMoney(studio.hourlyRate)} />
                <Spec label="Max capacity" value={`${studio.maxCapacity} people`} />
                <Spec label="Security deposit" value={formatMoney(studio.securityDeposit)} />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <div className="space-y-6">
                    <section className="rounded-2xl border border-[#e7e3db] bg-white p-6">
                        <h2 className="text-xl font-semibold tracking-tight">About this space</h2>
                        <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-[#4d4a45]">
                            {studio.overview}
                        </p>
                    </section>

                    {studio.amenities.length > 0 && (
                        <section className="rounded-2xl border border-[#e7e3db] bg-white p-6">
                            <h2 className="text-xl font-semibold tracking-tight">Amenities</h2>
                            <ul className="mt-4 flex flex-wrap gap-2">
                                {studio.amenities.map((a) => (
                                    <li
                                        key={a}
                                        className="rounded-full border border-[#e7e3db] bg-[#f7f5f1] px-3 py-1.5 text-sm text-[#4d4a45]"
                                    >
                                        {a}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
                    <div className="rounded-2xl border border-[#e7e3db] bg-white p-6">
                        <p className="text-sm text-[#7a776f]">Example: {pricing.hours}-hour booking</p>
                        <dl className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-[#7a776f]">
                                    {pricing.hours} hours × {formatMoney(studio.hourlyRate)}
                                </dt>
                                <dd className="font-medium">{formatMoney(pricing.subtotal)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-[#7a776f]">Guest service fee</dt>
                                <dd className="font-medium">{formatMoney(pricing.fee)}</dd>
                            </div>
                            <div className="mt-2 flex justify-between border-t border-[#e7e3db] pt-3 text-base">
                                <dt className="font-semibold">Total</dt>
                                <dd className="font-semibold">{formatMoney(pricing.total)}</dd>
                            </div>
                        </dl>
                        <p className="mt-3 text-xs text-[#8f8c85]">
                            Plus a refundable {formatMoney(studio.securityDeposit)} security deposit.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-[#e7e3db] bg-white p-6">
                        <h2 className="text-sm font-semibold text-[#1b1b1a]">Hosted by</h2>
                        <p className="mt-2 text-[15px] text-[#4d4a45]">{studio.hostName || "StudioSpace host"}</p>
                    </div>
                </aside>
            </div>
        </article>
    );
}

export default function StudioPage({ params }: PageProps<"/studios/[id]">) {
    return (
        <main className="flex-1 bg-[#f7f5f1] text-[#1b1b1a]">
            <div className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-8">
                <Link
                    href="/studios"
                    className="mb-6 inline-block text-sm font-medium text-[#FF5A1F] hover:underline"
                >
                    ← All studios
                </Link>
                <Suspense fallback={<DetailSkeleton />}>
                    <StudioDetailFromParams params={params} />
                </Suspense>
            </div>
        </main>
    );
}

async function StudioDetailFromParams({
    params,
}: {
    params: PageProps<"/studios/[id]">["params"];
}) {
    const { id } = await params;
    return <StudioDetail id={id} />;
}

