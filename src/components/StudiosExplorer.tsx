"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SearchX } from "lucide-react";
import { CATEGORIES, type Studio } from "@/lib/api";
import StudioCard from "@/components/StudioCard";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

/** Search, category filter and sort for the Explore page. State lives in the URL so links are shareable. */
export default function StudiosExplorer({ studios }: { studios: Studio[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const sort = params.get("sort") ?? "newest";

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  }

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = studios.filter((s) => {
      if (category && s.category !== category) return false;
      if (!term) return true;
      return [s.title, s.address, s.category, ...(s.amenities ?? [])].some((v) => v.toLowerCase().includes(term));
    });
    if (sort === "price-asc") list.sort((a, b) => a.hourlyRate - b.hourlyRate);
    if (sort === "price-desc") list.sort((a, b) => b.hourlyRate - a.hourlyRate);
    return list;
  }, [studios, q, category, sort]);

  const field =
    "h-11 rounded-xl border border-ss-line bg-ss-surface px-3 text-sm text-ss-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <>
      <div className="mb-8 grid gap-3 md:grid-cols-[1fr_200px_200px]">
        <label className="relative block">
          <span className="sr-only">Search studios</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ss-muted" />
          <input
            type="search"
            defaultValue={q}
            key={q}
            onChange={(e) => setParam("q", e.target.value)}
            placeholder="Search by name, city or amenity"
            className={`${field} w-full pl-9`}
          />
        </label>
        <select
          aria-label="Filter by category"
          value={category}
          onChange={(e) => setParam("category", e.target.value)}
          className={field}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select aria-label="Sort studios" value={sort} onChange={(e) => setParam("sort", e.target.value)} className={field}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-5 text-sm text-ss-muted" aria-live="polite">
        {visible.length} {visible.length === 1 ? "studio" : "studios"}
        {category ? ` in ${category}` : ""}
      </p>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-ss-line bg-ss-surface px-6 py-16 text-center">
          <SearchX className="mx-auto size-10 text-ss-faint" aria-hidden />
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-ss-ink">No studios match that search.</h2>
          <p className="mt-2 text-sm text-ss-muted">Try a different keyword or clear your filters.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/studios"
              className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Clear filters
            </Link>
            <Link
              href="/add-studio"
              className="rounded-xl border border-ss-line px-5 py-3 text-sm font-semibold text-ss-ink hover:bg-ss-hover"
            >
              List your studio
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((s) => (
            <StudioCard key={s.id} studio={s} />
          ))}
        </div>
      )}
    </>
  );
}
