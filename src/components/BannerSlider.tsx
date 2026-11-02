"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Keyboard } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";

import { slides } from "./banner-slides";

import "swiper/css";

type BannerSliderProps = {
  onSwiper: (swiper: SwiperClass) => void;
  onSlideChange: (activeIndex: number) => void;
};

export default function BannerSlider({
  onSwiper,
  onSlideChange,
}: BannerSliderProps) {
  return (
    <Swiper
      modules={[Autoplay, Keyboard]}
      loop
      speed={700}
      autoplay={{ delay: 6000, disableOnInteraction: false }}
      keyboard={{ enabled: true }}
      onSwiper={onSwiper}
      onSlideChange={(s) => onSlideChange(s.realIndex)}
      className="h-full w-full"
    >
      {slides.map((slide, index) => (
        <SwiperSlide key={slide.label}>
          <div className="relative h-full w-full">
            <Image
              src={slide.image}
              alt={slide.label}
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
