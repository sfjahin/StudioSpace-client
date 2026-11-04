import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
    ArrowUpRight,
    Armchair,
    Bath,
    Building2,
    Camera,
    Car,
    CircleCheck,
    Coffee,
    Lightbulb,
    MessageCircle,
    Music,
    PawPrint,
    Sofa,
    Sparkles,
    Volume2,
    Wifi,
    Wind,
    type LucideIcon,
} from "lucide-react";
import { ApiError, formatMoney, getStudio, type Studio } from "@/lib/api";
import {
    averageRating,
    buildGallery,
    buildHost,
    buildReviews,
    buildSpecs,
    ratingScores,
    splitOverview,
    squareFeet,
} from "@/lib/studio-detail";
import BookingCard from "@/components/BookingCard";
import EditStudioButton from "@/components/EditStudioButton";
import ReviewsSection from "@/components/ReviewsSection";
import StudioGallery from "@/components/StudioGallery";

export const metadata: Metadata = {
    title: "Studio — StudioSpace",
    description: "Full workspace specifications, amenities, reviews and booking.",
};

function DetailSkeleton() {
    return (
        <div className="animate-pulse space-y-8" aria-hidden>
            <div className="space-y-3">
                <div className="h-4 w-40 rounded bg-[#eeeae2]" />
                <div className="h-10 w-2/3 rounded bg-[#eeeae2]" />
                <div className="h-4 w-1/3 rounded bg-[#eeeae2]" />
            </div>
            <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
                <div className="aspect-[16/10] rounded-2xl bg-[#eeeae2]" />
                <div className="hidden gap-3 lg:grid lg:grid-rows-2">
                    <div className="rounded-2xl bg-[#eeeae2]" />
                    <div className="rounded-2xl bg-[#eeeae2]" />
                </div>
            </div>
            <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
                <div className="space-y-4">
                    <div className="h-6 w-1/2 rounded bg-[#eeeae2]" />
                    <div className="h-4 w-full rounded bg-[#eeeae2]" />
                    <div className="h-4 w-5/6 rounded bg-[#eeeae2]" />
                </div>
                <div className="aspect-[3/4] rounded-2xl bg-[#eeeae2]" />
            </div>
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

/* ------------------------------ Amenity icons ----------------------------- */

const AMENITY_ICONS: [RegExp, LucideIcon][] = [
    [/wi-?fi|internet/i, Wifi],
    [/daylight|natural light|sun|window/i, Lightbulb],
    [/light/i, Lightbulb],
    [/air|cool|heat|climate|vent/i, Wind],
    [/kitchen|coffee|tea|refresh/i, Coffee],
    [/sound|audio|stereo|speaker|bluetooth/i, Volume2],
    [/photo|camera|lens/i, Camera],
    [/music|guitar|piano|drum|record/i, Music],
    [/podcast|microphone|mic/i, Sparkles],
    [/furniture|prop|sofa|couch/i, Sofa],
    [/chair/i, Armchair],
    [/elevator|freight|load/i, Building2],
    [/park|car/i, Car],
    [/restroom|bathroom|shower|toilet/i, Bath],
    [/pet|dog|cat|animal/i, PawPrint],
];

function amenityIcon(name: string): LucideIcon {
    for (const [pattern, Icon] of AMENITY_ICONS) {
        if (pattern.test(name)) return Icon;
    }
    return Sparkles;
}

/* --------------------------------- Page ---------------------------------- */

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

    const gallery = buildGallery(studio);
    const reviews = buildReviews(studio);
    const rating = averageRating(reviews);
    const scores = ratingScores(rating);
    const host = buildHost(studio);
    const specs = buildSpecs(studio);
    const { lead, paragraphs } = splitOverview(studio.overview);

    return (
        <article className="space-y-8">
            {/* Breadcrumb */}
            <nav
                aria-label="Breadcrumb"
                className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[#8f8c85]"
            >
                <Link href="/studios" className="transition-colors hover:text-[#1b1b1a]">
                    Explore studios
                </Link>
                <span aria-hidden>/</span>
                <span>{studio.category}</span>
                <span aria-hidden>/</span>
                <span className="text-[#4d4a45]" aria-current="page">
                    {studio.title}
                </span>
            </nav>

            {/* Header */}
            <header>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="inline-block rounded-md bg-[#FFF0E9] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#FF5A1F]">
                            Guest favorite
                        </p>
                        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                            {studio.title}
                        </h1>
                        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-[#4d4a45]">
                            <span className="flex items-center gap-1.5 font-medium text-[#1b1b1a]">
                                <span aria-hidden>★</span>
                                {rating.toFixed(2)}
                                <span className="font-normal text-[#7a776f]">
                                    ({reviews.length} reviews)
                                </span>
                            </span>
                            <span className="text-[#c9c5bc]" aria-hidden>
                                ·
                            </span>
                            <span>{studio.address}</span>
                            <span className="text-[#c9c5bc]" aria-hidden>
                                ·
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CircleCheck className="size-4 text-[#FF5A1F]" aria-hidden />
                                Verified space
                            </span>
                        </p>
                    </div>
                    <EditStudioButton studio={studio} />
                </div>
            </header>

            {/* Gallery */}
            <StudioGallery images={gallery} alt={studio.title} />

            {/* Content + booking */}
            <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
                <div className="min-w-0 space-y-10">
                    {/* Overview */}
                    <section aria-labelledby="overview-heading">
                        <h2
                            id="overview-heading"
                            className="text-2xl font-semibold tracking-tight text-[#1b1b1a]"
                        >
                            {lead}
                        </h2>
                        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#7a776f]">
                            <span>{squareFeet(studio).toLocaleString("en-US")} sq ft</span>
                            <span className="text-[#c9c5bc]" aria-hidden>
                                ·
                            </span>
                            <span>Up to {studio.maxCapacity} people</span>
                            <span className="text-[#c9c5bc]" aria-hidden>
                                ·
                            </span>
                            <span>2-hour minimum</span>
                            <span className="text-[#c9c5bc]" aria-hidden>
                                ·
                            </span>
                            <span>{studio.category}</span>
                        </p>
                        <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[#4d4a45]">
                            {paragraphs.map((p, i) => (
                                <p key={i}>{p}</p>
                            ))}
                            {paragraphs.length === 0 && <p>{studio.overview}</p>}
                        </div>
                    </section>

                    <hr className="border-[#e7e3db]" />

                    {/* Specifications */}
                    <section aria-labelledby="specs-heading">
                        <h2
                            id="specs-heading"
                            className="text-2xl font-semibold tracking-tight text-[#1b1b1a]"
                        >
                            Workspace specifications
                        </h2>
                        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {specs.map((s) => (
                                <Spec key={s.label} label={s.label} value={s.value} />
                            ))}
                        </dl>
                    </section>

                    <hr className="border-[#e7e3db]" />

                    {/* Amenities */}
                    <section aria-labelledby="amenities-heading">
                        <h2
                            id="amenities-heading"
                            className="text-2xl font-semibold tracking-tight text-[#1b1b1a]"
                        >
                            Everything you need to get into flow.
                        </h2>
                        {studio.amenities.length > 0 ? (
                            <ul className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                                {studio.amenities.map((a) => {
                                    const Icon = amenityIcon(a);
                                    return (
                                        <li
                                            key={a}
                                            className="flex items-center gap-3 text-[15px] text-[#4d4a45]"
                                        >
                                            <Icon
                                                className="size-4.5 shrink-0 text-[#FF5A1F]"
                                                aria-hidden
                                            />
                                            {a}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="mt-4 text-sm text-[#7a776f]">
                                The host hasn&apos;t listed amenities for this space yet.
                            </p>
                        )}
                    </section>

                    <hr className="border-[#e7e3db]" />

                    {/* Host */}
                    <section
                        aria-labelledby="host-heading"
                        className="rounded-2xl border border-[#e7e3db] bg-white p-6"
                    >
                        <div className="flex items-start gap-4">
                            <div
                                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#FFE9DF] text-sm font-semibold text-[#FF5A1F]"
                                aria-hidden
                            >
                                {host.initials}
                            </div>
                            <div className="min-w-0">
                                <h2
                                    id="host-heading"
                                    className="text-lg font-semibold tracking-tight text-[#1b1b1a]"
                                >
                                    Hosted by {host.name}
                                </h2>
                                <p className="mt-0.5 text-sm text-[#7a776f]">{host.line}</p>
                                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#4d4a45]">
                                    <span className="flex items-center gap-1.5">
                                        <CircleCheck className="size-3.5 text-[#FF5A1F]" aria-hidden />
                                        Verified host
                                    </span>
                                    <span className="text-[#c9c5bc]" aria-hidden>
                                        ·
                                    </span>
                                    <span>{host.responseRate}% response rate</span>
                                    <span className="text-[#c9c5bc]" aria-hidden>
                                        ·
                                    </span>
                                    <span>Replies {host.replyTime}</span>
                                </p>
                                {host.email && (
                                    <a
                                        href={`mailto:${host.email}`}
                                        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#FF5A1F] transition-colors hover:text-[#e84e15]"
                                    >
                                        Message {host.firstName}
                                        <ArrowUpRight className="size-4" aria-hidden />
                                    </a>
                                )}
                                {!host.email && (
                                    <p className="mt-3 inline-flex items-center gap-1 text-sm text-[#8f8c85]">
                                        <MessageCircle className="size-4" aria-hidden />
                                        Contact via the booking form
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Reviews */}
                    <ReviewsSection reviews={reviews} rating={rating} scores={scores} />

                    <hr className="border-[#e7e3db]" />

                    {/* Good to know */}
                    <section aria-labelledby="good-to-know-heading">
                        <h2
                            id="good-to-know-heading"
                            className="text-2xl font-semibold tracking-tight text-[#1b1b1a]"
                        >
                            Good to know before you go.
                        </h2>
                        <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-[#4d4a45]">
                            <p>
                                No smoking, glitter, or open flames. Leave the space as you found
                                it. Overtime is billed at {formatMoney(studio.hourlyRate)}/hour,
                                subject to availability. Free cancellation up to 48 hours before
                                your session.
                            </p>
                            <p>
                                Located at {studio.address}. The exact unit details and access
                                instructions are shared after your booking is confirmed. A{" "}
                                {formatMoney(studio.securityDeposit)} refundable deposit is
                                authorized separately and released after checkout.
                            </p>
                        </div>
                    </section>
                </div>

                {/* Booking sidebar */}
                <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
                    <BookingCard studio={studio} />
                </aside>
            </div>
        </article>
    );
}

export default function StudioPage({ params }: PageProps<"/studios/[id]">) {
    return (
        <main className="flex-1 bg-[#f7f5f1] text-[#1b1b1a]">
            <div className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-8">
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
