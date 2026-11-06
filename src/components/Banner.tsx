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
      <section className="container mx-auto max-w-7xl px-6 pt-8">
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900">
          <div className="h-[520px] w-full sm:h-[560px]">
            <BannerSlider
              onSwiper={setSwiper}
              onSlideChange={setActiveIndex}
            />
          </div>

          {/* Static hero copy. z-10 must beat `.swiper { z-index: 1 }` from swiper.css,
            otherwise slide images cover the overlay once the slider mounts. */}
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-center px-8 pb-24 pt-10 sm:px-14">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-brand" />
              <span className="text-xs font-semibold tracking-[0.18em] text-white">
                FOR THE MAKERS. THE DOERS. THE DREAMERS.
              </span>
            </div>
            <h1 className="mt-8 max-w-2xl text-5xl font-bold leading-[1.03] tracking-tight text-white sm:text-6xl lg:text-[68px]">
              Your vision.
              <br />
              The right space.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/85 sm:text-lg">
              Discover inspiring studios from local creatives. Book by the hour.
              Make something that matters.
            </p>
            <div className="pointer-events-auto mt-9 flex flex-wrap gap-4">
              <Link
                href="/studios"
                className="flex items-center gap-2 rounded-lg bg-brand px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
              >
                Explore Studios
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/add-studio"
                className="rounded-lg bg-ss-surface px-6 py-3.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
              >
                Host Your Space
              </Link>
            </div>
          </div>

          {/* Slide counter, label, progress + navigation. Also z-10, same reason as above. */}
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-8 pb-8 sm:px-14">
            <div>
              <p className="text-xs font-medium text-white/70">
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(slides.length).padStart(2, "0")}
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {slides[activeIndex].label}
              </p>
              <div className="mt-3 flex gap-2">
                {slides.map((slide, index) => (
                  <button
                    key={slide.label}
                    type="button"
                    aria-label={`Go to slide ${index + 1}`}
                    onClick={() => swiper?.slideToLoop(index)}
                    className={`h-1 rounded-full transition-all ${index === activeIndex
                        ? "w-8 bg-brand"
                        : "w-4 bg-white/40 hover:bg-white/70"
                      }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => swiper?.slidePrev()}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => swiper?.slideNext()}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex flex-col items-center justify-between gap-4 px-1 py-6 text-sm sm:flex-row">
          <p className="font-semibold text-zinc-900">
            Good spaces. Great things happen.
          </p>
          <p className="flex items-center gap-1.5 text-white/50">
            <Star className="h-3.5 w-3.5 fill-brand text-brand" />
            4.9 from 2,400+ creatives
          </p>
          <p className="text-white/50">1,200+ spaces · 24 creative cities</p>
        </div>
      </section>
    </div>
  );
}
