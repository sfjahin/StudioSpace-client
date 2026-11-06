/** Branded loading placeholders shared by route loading.tsx files and Suspense fallbacks. */
export function CardGridSkeleton({ count = 6, withHeading = false }: { count?: number; withHeading?: boolean }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-12" aria-busy="true" aria-label="Loading studios">
      {withHeading && (
        <div className="mb-10 animate-pulse space-y-3">
          <div className="h-3 w-32 rounded bg-ss-sunk" />
          <div className="h-10 w-2/3 max-w-lg rounded bg-ss-sunk" />
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-ss-line bg-ss-surface">
            <div className="aspect-[4/3] bg-ss-sunk" />
            <div className="space-y-3 p-5">
              <div className="h-5 w-3/4 rounded bg-ss-sunk" />
              <div className="h-3 w-1/2 rounded bg-ss-sunk" />
              <div className="h-10 w-full rounded-xl bg-ss-sunk" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 animate-pulse space-y-6 px-6 py-12" aria-busy="true" aria-label="Loading">
      <div className="h-3 w-28 rounded bg-ss-sunk" />
      <div className="h-10 w-2/3 max-w-xl rounded bg-ss-sunk" />
      <div className="h-72 w-full rounded-2xl bg-ss-sunk" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-24 rounded-2xl bg-ss-sunk" />
        <div className="h-24 rounded-2xl bg-ss-sunk" />
        <div className="h-24 rounded-2xl bg-ss-sunk" />
      </div>
    </div>
  );
}
