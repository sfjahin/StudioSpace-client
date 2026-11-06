import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listStudios, type Studio } from "@/lib/api";
import StudioCard from "@/components/StudioCard";

/** Home page: the six newest studios, fetched from MongoDB (server applies .limit(6)). */
export default async function FeaturedStudios() {
  let studios: Studio[] = [];
  let failed = false;

  try {
    studios = await listStudios({ limit: 6 });
  } catch {
    failed = true;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Featured studios</p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-ss-ink sm:text-5xl">
            Fresh rooms, ready to book.
          </h2>
        </div>
        <Link
          href="/studios"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark"
        >
          See all studios <ArrowRight className="size-4" />
        </Link>
      </div>

      {failed ? (
        <div className="mt-10 rounded-2xl border border-red-300 bg-red-50 px-6 py-10 text-center text-sm font-medium text-red-800">
          We couldn&apos;t load featured studios right now. Please refresh in a moment.
        </div>
      ) : studios.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-ss-line bg-ss-surface px-6 py-14 text-center">
          <h3 className="text-xl font-semibold text-ss-ink">No studios listed yet.</h3>
          <p className="mt-2 text-sm text-ss-muted">Be the first to share a space with the community.</p>
          <Link
            href="/add-studio"
            className="mt-6 inline-block rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            List your studio
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {studios.map((s) => (
            <StudioCard key={s.id} studio={s} />
          ))}
        </div>
      )}
    </section>
  );
}
