"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { Swiper as SwiperClass } from "swiper";
import { ArrowLeft, ArrowRight, ArrowUpRight, Star } from "lucide-react";
import { slides } from "./banner-slides";
import Link from "next/link";

// Swiper runs `new Date()` during construction (Autoplay module), which fails
// Next 16 cacheComponents prerendering — load it client-only instead.
const BannerSlider = dynamic(() => import("./BannerSlider"), {
  ssr: false,
});

export default function Banner() {
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="bg-ss-sunk">
      <section className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900">
          <div className="h-[540px] w-full sm:h-[560px] lg:h-[600px]">
            <BannerSlider
              onSwiper={setSwiper}
              onSlideChange={setActiveIndex}
            />
          </div>

          {/* Static hero copy. z-10 must beat `.swiper { z-index: 1 }` from swiper.css,
            otherwise slide images cover the overlay once the slider mounts. */}
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-center px-5 pb-32 pt-8 sm:px-10 sm:pb-28 sm:pt-10 lg:px-14">
            <div className="flex items-center gap-3">
              <span className="hidden h-px w-8 shrink-0 bg-brand sm:block" />
              <span className="text-[10px] font-semibold leading-relaxed tracking-[0.14em] text-white sm:text-xs sm:tracking-[0.18em]">
                FOR THE MAKERS. THE DOERS. THE DREAMERS.
              </span>
            </div>
            <h1 className="mt-5 max-w-2xl text-[28px] font-bold leading-[1.05] tracking-tight text-white sm:mt-8 sm:text-5xl md:text-6xl lg:text-[68px]">
              Your vision.
              <br />
              The right space.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85 sm:mt-6 sm:text-base lg:text-lg">
              Discover inspiring studios from local creatives. Book by the hour.
              Make something that matters.
            </p>
            <div className="pointer-events-auto mt-6 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                href="/studios"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark sm:w-auto"
              >
                Explore Studios
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/add-studio"
                className="w-full rounded-lg bg-ss-surface px-6 py-3.5 text-center text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 sm:w-auto"
              >
                Host Your Space
              </Link>
            </div>
          </div>

          {/* Slide counter, label, progress + navigation. Also z-10, same reason as above. */}
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 px-5 pb-5 sm:px-10 sm:pb-8 lg:px-14">
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-white/70 sm:text-xs">
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(slides.length).padStart(2, "0")}
              </p>
              <p className="mt-1.5 truncate text-xs font-medium text-white sm:mt-2 sm:text-sm">
                {slides[activeIndex].label}
              </p>
              <div className="mt-2.5 flex gap-1.5 sm:mt-3 sm:gap-2">
                {slides.map((slide, index) => (
                  <button
                    key={slide.label}
                    type="button"
                    aria-label={`Go to slide ${index + 1}`}
                    onClick={() => swiper?.slideToLoop(index)}
                    className={`h-1 rounded-full transition-all ${index === activeIndex
                        ? "w-6 bg-brand sm:w-8"
                        : "w-1.5 bg-white/40 hover:bg-white/70 sm:w-4"
                      }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex shrink-0 gap-2 sm:gap-3">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => swiper?.slidePrev()}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 sm:h-11 sm:w-11"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => swiper?.slideNext()}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 sm:h-11 sm:w-11"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex flex-col items-center justify-between gap-2.5 px-1 py-6 text-center text-sm sm:flex-row sm:gap-4 sm:text-left">
          <p className="font-semibold text-zinc-900">
            Good spaces. Great things happen.
          </p>
          <p className="flex items-center gap-1.5 text-ss-muted">
            <Star className="h-3.5 w-3.5 fill-brand text-brand" />
            4.9 from 2,400+ creatives
          </p>
          <p className="text-ss-muted">1,200+ spaces · 24 creative cities</p>
        </div>
      </section>
    </div>
  );
}
