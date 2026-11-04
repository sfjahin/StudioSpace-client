"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import type { Review } from "@/lib/studio-detail";

type Props = {
    reviews: Review[];
    rating: number;
    scores: { label: string; value: string }[];
};

function Stars({ rating, className }: { rating: number; className?: string }) {
    return (
        <span className={className} aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    className={
                        n <= Math.round(rating)
                            ? "inline-block size-3.5 fill-[#1b1b1a] text-[#1b1b1a]"
                            : "inline-block size-3.5 fill-[#e7e3db] text-[#e7e3db]"
                    }
                    aria-hidden
                />
            ))}
        </span>
    );
}

/** Reviews list with a "Read all" expander. */
export default function ReviewsSection({ reviews, rating, scores }: Props) {
    const [expanded, setExpanded] = useState(false);
    const visible = expanded ? reviews : reviews.slice(0, 2);

    return (
        <section aria-labelledby="reviews-heading">
            <h2
                id="reviews-heading"
                className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-[#1b1b1a]"
            >
                <Star className="size-6 fill-[#1b1b1a] text-[#1b1b1a]" aria-hidden />
                {rating.toFixed(2)} · {reviews.length} creative experiences
            </h2>

            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                {scores.map((s) => (
                    <p key={s.label} className="text-[#4d4a45]">
                        <span className="font-medium text-[#1b1b1a]">{s.label}</span>{" "}
                        <span className="ml-1 font-semibold text-[#1b1b1a]">{s.value}</span>
                    </p>
                ))}
            </div>

            <ul className="mt-6 space-y-6">
                {visible.map((r) => (
                    <li key={r.id}>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-sm font-semibold text-[#1b1b1a]">{r.name}</span>
                            <span className="text-[#c9c5bc]" aria-hidden>
                                ·
                            </span>
                            <Stars rating={r.rating} />
                        </div>
                        <p className="mt-1 text-[13px] text-[#8f8c85]">{r.date}</p>
                        <p className="mt-2 text-[15px] leading-relaxed text-[#4d4a45]">{r.text}</p>
                    </li>
                ))}
            </ul>

            {reviews.length > 2 && (
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="mt-6 rounded-xl border border-[#e7e3db] bg-white px-5 py-3 text-sm font-medium text-[#1b1b1a] transition-colors hover:bg-[#f3f0ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/40"
                >
                    {expanded
                        ? "Show fewer reviews"
                        : `Read all ${reviews.length} reviews`}
                </button>
            )}
        </section>
    );
}
