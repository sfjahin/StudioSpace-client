import Link from "next/link";
import { Home, Search } from "lucide-react";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <svg viewBox="0 0 320 200" className="w-full max-w-sm" role="img" aria-label="A studio spotlight pointing at an empty stage">
        <rect x="20" y="168" width="280" height="10" rx="5" fill="var(--ss-sunk)" />
        <polygon points="160,40 80,168 240,168" fill="#ff592c" opacity="0.16" />
        <rect x="120" y="14" width="80" height="34" rx="8" fill="var(--ss-ink)" />
        <circle cx="160" cy="31" r="11" fill="#ff592c" />
        <rect x="154" y="2" width="12" height="12" fill="var(--ss-ink)" />
        <g fill="none" stroke="var(--ss-faint)" strokeWidth="3" strokeLinecap="round">
          <path d="M132 140c0-16 56-16 56 0" />
          <circle cx="160" cy="118" r="12" />
        </g>
        <text x="160" y="196" textAnchor="middle" fontSize="12" fill="var(--ss-muted)">Nobody here but the lights.</text>
      </svg>

      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-brand">Error 404</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-ss-ink sm:text-5xl">This set is empty.</h1>
      <p className="mt-4 max-w-md text-base text-ss-muted">
        The page you&apos;re looking for has moved, been struck, or never existed. Let&apos;s get you back to the studio.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          <Home className="size-4" /> Return to Home
        </Link>
        <Link
          href="/studios"
          className="inline-flex items-center gap-2 rounded-lg border border-ss-line px-6 py-3.5 text-sm font-medium text-ss-ink transition-colors hover:bg-ss-hover"
        >
          <Search className="size-4" /> Explore Studios
        </Link>
      </div>
    </main>
  );
}
