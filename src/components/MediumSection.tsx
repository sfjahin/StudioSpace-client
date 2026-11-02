import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const mediums = [
  {
    title: "Photography",
    subtitle: "Light, angles, possibility.",
    image: "/images/medium-photo.jpg",
    href: "/studios/photography",
  },
  {
    title: "Film & video",
    subtitle: "Set the scene.",
    image: "/images/medium-film.jpg",
    href: "/studios/film-video",
  },
  {
    title: "Podcast",
    subtitle: "Conversations worth hearing.",
    image: "/images/medium-podcast.jpg",
    href: "/studios/podcast",
  },
  {
    title: "Music",
    subtitle: "Find your frequency.",
    image: "/images/medium-music.jpg",
    href: "/studios/music",
  },
  {
    title: "Art & making",
    subtitle: "Make room for the unexpected.",
    image: "/images/medium-art.jpg",
    href: "/studios/art-making",
  },
];

export default function MediumSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
        Find your medium
      </p>
      <h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
        Whatever you make, make it here.
      </h2>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {mediums.map((medium) => (
          <a
            key={medium.title}
            href={medium.href}
            className="group relative aspect-[6/5] overflow-hidden rounded-xl bg-zinc-900"
          >
            <Image
              src={medium.image}
              alt={medium.title}
              fill
              sizes="(max-width: 1200px) 100vw, 220px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <span className="flex items-center gap-1.5 text-base font-bold text-white">
                {medium.title}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
              <span className="mt-1 block text-xs text-white/70">
                {medium.subtitle}
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
