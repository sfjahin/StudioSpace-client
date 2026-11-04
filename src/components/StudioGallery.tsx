"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { cn } from "cn";

type Props = {
    images: string[];
    alt: string;
};

/**
 * Gallery carousel: a large stage image with prev/next controls, a thumbnail
 * rail, and a "View all photos" lightbox that shows the full set.
 */
export default function StudioGallery({ images, alt }: Props) {
    const [index, setIndex] = useState(0);
    const [open, setOpen] = useState(false);
    const count = images.length;

    const go = (dir: 1 | -1) => {
        setIndex((i) => (i + dir + count) % count);
    };

    const stage = images[index];
    const side = [images[(index + 1) % count], images[(index + 2) % count]];

    return (
        <div className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
                {/* Main stage */}
                <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-[#e7e3db] bg-[#f0ece4] lg:aspect-auto lg:h-full lg:min-h-[360px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={stage}
                        alt={`${alt} — photo ${index + 1} of ${count}`}
                        className="h-full w-full object-cover"
                    />

                    {count > 1 && (
                        <>
                            <button
                                type="button"
                                aria-label="Previous photo"
                                onClick={() => go(-1)}
                                className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1b1b1a] shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/50"
                            >
                                <ChevronLeft className="size-5" />
                            </button>
                            <button
                                type="button"
                                aria-label="Next photo"
                                onClick={() => go(1)}
                                className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1b1b1a] shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/50"
                            >
                                <ChevronRight className="size-5" />
                            </button>
                        </>
                    )}

                    <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white">
                        {index + 1} / {count}
                    </span>

                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="absolute bottom-3 right-3 flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-[13px] font-medium text-[#1b1b1a] shadow-sm transition hover:bg-[#f7f5f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/50"
                    >
                        <Images className="size-4" />
                        View all {count} photos
                    </button>
                </div>

                {/* Side thumbnails (desktop) */}
                <div className="hidden gap-3 lg:grid lg:grid-rows-2">
                    {side.map((src, i) => (
                        <button
                            key={`${src}-${i}`}
                            type="button"
                            onClick={() => setIndex((index + 1 + i) % count)}
                            aria-label={`Show photo ${((index + 1 + i) % count) + 1}`}
                            className="relative overflow-hidden rounded-2xl border border-[#e7e3db] bg-[#f0ece4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/50"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={src}
                                alt={`${alt} — thumbnail ${((index + 1 + i) % count) + 1}`}
                                className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Thumbnail rail (mobile / all sizes) */}
            {count > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
                    {images.map((src, i) => (
                        <button
                            key={`${src}-${i}`}
                            type="button"
                            onClick={() => setIndex(i)}
                            aria-label={`Show photo ${i + 1}`}
                            aria-current={i === index}
                            className={cn(
                                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 bg-[#f0ece4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/50",
                                i === index ? "border-[#FF5A1F]" : "border-transparent opacity-70"
                            )}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="" className="h-full w-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Portal>
                    <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/75" />
                    <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 flex max-h-[88vh] w-[92vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-[#1c1b1a] outline-none">
                        <div className="flex items-center justify-between px-5 py-4">
                            <Dialog.Title className="text-sm font-semibold text-white">
                                {alt}
                            </Dialog.Title>
                            <Dialog.Close
                                aria-label="Close gallery"
                                className="flex size-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            >
                                <X className="size-5" />
                            </Dialog.Close>
                        </div>

                        <div className="relative min-h-0 flex-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={images[index]}
                                alt={`${alt} — photo ${index + 1} of ${count}`}
                                className="h-full max-h-[64vh] w-full object-contain"
                            />
                            {count > 1 && (
                                <>
                                    <button
                                        type="button"
                                        aria-label="Previous photo"
                                        onClick={() => go(-1)}
                                        className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                    >
                                        <ChevronLeft className="size-5" />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Next photo"
                                        onClick={() => go(1)}
                                        className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                    >
                                        <ChevronRight className="size-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto px-5 py-4">
                            {images.map((src, i) => (
                                <button
                                    key={`${src}-${i}`}
                                    type="button"
                                    onClick={() => setIndex(i)}
                                    aria-label={`Show photo ${i + 1}`}
                                    aria-current={i === index}
                                    className={cn(
                                        "h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                                        i === index ? "border-[#FF5A1F]" : "border-transparent opacity-60 hover:opacity-100"
                                    )}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={src} alt="" className="h-full w-full object-cover" />
                                </button>
                            ))}
                            <span className="ml-auto shrink-0 text-xs text-white/70">
                                {index + 1} of {count}
                            </span>
                        </div>
                    </Dialog.Popup>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
