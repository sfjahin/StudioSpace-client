import Image from "next/image";
import { ArrowUpRight, CircleCheck } from "lucide-react";

const perks = [
  "Protected with $1M host liability coverage",
  "Secure payments, paid straight to you",
  "Real humans. Real support. Every step.",
];

export default function HostsSection() {
  return (
    <section className="bg-[#1c1c1c]">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
          <Image
            src="/images/hosts.jpg"
            alt="A bright loft studio available for hosts"
            fill
            sizes="(max-width: 1024px) 100vw, 600px"
            className="object-cover"
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Made for hosts, too
          </p>
          <h2 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
            Your space.
            <br />
            Someone&rsquo;s next big thing.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
            Turn your creative space into a new source of income. We take care
            of the details, so you can keep doing what you love.
          </p>

          <ul className="mt-8 space-y-4">
            {perks.map((perk) => (
              <li
                key={perk}
                className="flex items-center gap-3 text-sm text-zinc-200"
              >
                <CircleCheck className="h-5 w-5 shrink-0 text-brand" />
                {perk}
              </li>
            ))}
          </ul>

          <a
            href="/become-a-host"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#e64d25]"
          >
            Become a host
            <ArrowUpRight className="h-4 w-4" />
          </a>

          <p className="mt-6 text-xs text-zinc-500">
            Coverage applies to eligible bookings. Terms and exclusions apply.
          </p>
        </div>
      </div>
    </section>
  );
}
