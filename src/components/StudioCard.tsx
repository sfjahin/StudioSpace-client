import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { formatMoney, type Studio } from "@/lib/api";
import { averageRating, buildReviews } from "@/lib/studio-detail";

/** One studio in a grid. Fixed image ratio + flex column keeps every card the same size. */
export default function StudioCard({ studio }: { studio: Studio }) {
  const rating = averageRating(buildReviews(studio));

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ss-line bg-ss-surface transition-shadow hover:shadow-lg">
      <Link
        href={`/studios/${studio.id}`}
        aria-label={`View ${studio.title}`}
        className="relative block aspect-[4/3] overflow-hidden bg-ss-sunk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={studio.imageUrl}
          alt={studio.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand shadow-sm">
          {studio.category}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-ss-ink">{studio.title}</h3>
          <span
            className="flex shrink-0 items-center gap-1 rounded-full bg-ss-sunk px-2 py-0.5 text-sm font-medium text-ss-ink"
            aria-label={`Rated ${rating.toFixed(2)} out of 5`}
          >
            <Star className="size-3.5 fill-brand text-brand" aria-hidden />
            {rating.toFixed(1)}
          </span>
        </div>
        <p className="mt-1.5 flex items-start gap-1.5 text-sm text-ss-muted">
          <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span className="line-clamp-1">{studio.address}</span>
        </p>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="font-semibold text-ss-ink">
            {formatMoney(studio.hourlyRate)}
            <span className="font-normal text-ss-muted"> / hr</span>
          </span>
          <span className="text-ss-muted">Fits {studio.maxCapacity}</span>
        </div>
        <Link
          href={`/studios/${studio.id}`}
          className="mt-auto rounded-xl bg-brand py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
          style={{ marginTop: "1.25rem" }}
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
