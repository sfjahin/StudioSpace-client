import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description: "StudioSpace is a peer-to-peer marketplace that gives every maker room to work.",
};

const values = [
  { title: "Room for everyone", body: "A garage podcast booth and a cinema sound stage deserve the same visibility and the same fair pricing." },
  { title: "Transparent by default", body: "Hourly rate, security deposit, service fee and total are shown before you send a request." },
  { title: "Hosts are partners", body: "Hosts set their own rates and decide which bookings to confirm, backed by liability protection." },
];

export default function AboutPage() {
  return (
    <main className="flex-1 bg-ss-bg">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">About us</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-ss-ink sm:text-5xl">Our mission is room to make.</h1>
        <p className="mt-5 text-base leading-relaxed text-ss-muted">
          Great work needs the right room: the right light, the right acoustics, the right walls. StudioSpace is a
          peer-to-peer marketplace where photographers, filmmakers, podcasters, musicians and artists rent creative
          spaces from the people who built them, by the hour.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-ss-line bg-ss-surface p-6">
              <h2 className="text-base font-bold text-ss-ink">{v.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ss-muted">{v.body}</p>
            </div>
          ))}
        </div>

        <div id="terms" className="mt-16 scroll-mt-24 rounded-2xl border border-ss-line bg-ss-surface p-8">
          <h2 className="text-2xl font-bold text-ss-ink">Terms &amp; privacy</h2>
          <p className="mt-3 text-sm leading-relaxed text-ss-muted">
            By using StudioSpace you agree to treat every space with care, honour confirmed bookings, and communicate
            respectfully with hosts and creators. We only store the details needed to run your listings and bookings,
            and we never sell your information.
          </p>
        </div>

        <Link href="/studios" className="mt-10 inline-block rounded-lg bg-brand px-6 py-3.5 text-sm font-medium text-white hover:bg-brand-dark">
          Explore Studios
        </Link>
      </section>
    </main>
  );
}
