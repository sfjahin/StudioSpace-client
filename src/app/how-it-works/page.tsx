import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Camera, CreditCard, Search, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works",
  description: "From discovering a studio to wrapping your shoot: how booking on StudioSpace works.",
};

const steps = [
  { icon: Search, title: "Discover spaces", body: "Filter studios by craft, location and hourly rate. Every listing shows amenities, capacity and the host." },
  { icon: CalendarCheck, title: "Select shoot hours", body: "Pick a date and your start and end time. Pricing is calculated live, with a 2-hour minimum." },
  { icon: CreditCard, title: "Book instantly", body: "Send your request with a clear price breakdown. Your booking starts as Pending until the host confirms." },
  { icon: Camera, title: "Create & produce", body: "Once confirmed, the slot is yours. Nobody else can book over it." },
];

const faqs = [
  { q: "Can two people book the same hour?", a: "No. Once a host confirms a booking, any request that overlaps that time is rejected with a clear message." },
  { q: "Can I cancel a booking?", a: "Yes. You can cancel any booking that is still Pending from the My Bookings page." },
  { q: "What is the security deposit?", a: "A refundable amount some hosts hold against equipment damage. It is shown on every studio page." },
];

export default function HowItWorksPage() {
  return (
    <main className="flex-1 bg-ss-bg">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">How it works</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-ss-ink sm:text-5xl">Less logistics. More creating.</h1>
        <p className="mt-4 max-w-2xl text-base text-ss-muted">
          StudioSpace connects creators with hosts who share their rooms by the hour. Here is the whole journey.
        </p>

        <ol className="mt-12 grid gap-5 sm:grid-cols-2">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="rounded-2xl border border-ss-line bg-ss-surface p-6">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-semibold text-ss-muted">Step {i + 1}</span>
              </div>
              <h2 className="mt-4 text-lg font-bold text-ss-ink">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ss-muted">{body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16 rounded-2xl border border-ss-line bg-ss-surface p-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-6 text-brand" />
            <h2 className="text-2xl font-bold text-ss-ink">Good to know</h2>
          </div>
          <dl className="mt-6 space-y-5">
            {faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-semibold text-ss-ink">{f.q}</dt>
                <dd className="mt-1 text-sm text-ss-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/studios" className="rounded-lg bg-brand px-6 py-3.5 text-sm font-medium text-white hover:bg-brand-dark">
            Explore Studios
          </Link>
          <Link href="/add-studio" className="inline-flex items-center gap-2 rounded-lg border border-ss-line px-6 py-3.5 text-sm font-medium text-ss-ink hover:bg-ss-hover">
            <Sparkles className="size-4" /> Host Your Space
          </Link>
        </div>
      </section>
    </main>
  );
}
