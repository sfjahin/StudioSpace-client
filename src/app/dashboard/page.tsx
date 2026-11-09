"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarCheck, Building2, Inbox, Loader2, Wallet } from "lucide-react";
import { useAuth } from "@/lib/auth-client";
import {
  ApiError,
  formatBookingDate,
  formatMoney,
  listHostBookings,
  listMyBookings,
  listStudios,
  updateBookingStatus,
  type Booking,
  type BookingStatus,
} from "@/lib/api";

const BADGE: Record<BookingStatus, string> = {
  Pending: "bg-[#fff4e0] text-[#9a5b00]",
  Confirmed: "bg-[#e9f7ee] text-[#1f7a3d]",
  Completed: "bg-[#e8f0fe] text-[#2a56b8]",
  Cancelled: "bg-[#fdecec] text-[#b42318]",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const email = user?.email ?? "";
  const [listings, setListings] = useState(0);
  const [mine, setMine] = useState<Booking[]>([]);
  const [requests, setRequests] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!email) return;
    let active = true;
    Promise.all([listStudios({ ownerEmail: email }), listMyBookings(email), listHostBookings(email)])
      .then(([studios, made, received]) => {
        if (!active) return;
        setListings(studios.length);
        setMine(made);
        setRequests(received);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "We couldn't load your dashboard."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [email]);

  async function change(b: Booking, status: BookingStatus) {
    setBusyId(b.id);
    try {
      const updated = await updateBookingStatus(b.id, email, status);
      setRequests((list) => list.map((r) => (r.id === updated.id ? updated : r)));
      toast.success(`Booking marked ${status.toLowerCase()}.`);
    } catch (err) {
      // A 409 here is the double-booking guard: show its clear message.
      toast.error(err instanceof ApiError ? err.message : "We couldn't update that booking.");
    } finally {
      setBusyId(null);
    }
  }

  const earned = requests.filter((r) => r.status === "Confirmed" || r.status === "Completed").reduce((n, r) => n + r.subtotal, 0);
  const stats = [
    { label: "My listings", value: String(listings), icon: Building2, href: "/my-listings" },
    { label: "My bookings", value: String(mine.length), icon: CalendarCheck, href: "/my-bookings" },
    { label: "Booking requests", value: String(requests.length), icon: Inbox, href: "#requests" },
    { label: "Earnings (confirmed)", value: formatMoney(earned), icon: Wallet, href: "#requests" },
  ];

  return (
    <main className="flex-1 bg-ss-bg">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Dashboard</p>
        <h1 className="mt-3 break-words text-3xl font-bold tracking-tight text-ss-ink sm:text-4xl">Welcome back, {user?.name.split(" ")[0]}.</h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, href }) => (
            <Link key={label} href={href} className="rounded-2xl border border-ss-line bg-ss-surface p-5 transition-shadow hover:shadow-md">
              <Icon className="size-5 text-brand" />
              <p className="mt-4 text-3xl font-bold text-ss-ink">{loading ? "–" : value}</p>
              <p className="mt-1 text-sm text-ss-muted">{label}</p>
            </Link>
          ))}
        </div>

        <section id="requests" className="mt-12 scroll-mt-28">
          <h2 className="text-2xl font-bold text-ss-ink">Booking requests for your studios</h2>
          {loading ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-ss-muted"><Loader2 className="size-4 animate-spin" /> Loading requests…</div>
          ) : requests.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-ss-line bg-ss-surface px-6 py-14 text-center">
              <Inbox className="mx-auto size-9 text-ss-faint" />
              <h3 className="mt-3 text-lg font-semibold text-ss-ink">No requests yet.</h3>
              <p className="mt-1 text-sm text-ss-muted">When someone books one of your studios it will show up here.</p>
              <Link href="/add-studio" className="mt-5 inline-block rounded-lg bg-brand px-5 py-3 text-sm font-medium text-white hover:bg-brand-dark">
                List a studio
              </Link>
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {requests.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ss-line bg-ss-surface p-5">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ss-ink">{b.studioTitle}</p>
                    <p className="mt-1 text-sm text-ss-muted">
                      {formatBookingDate(b.date)} · {b.startTime} – {b.endTime} · {b.userName} ({b.crewSize})
                    </p>
                    <p className="mt-1 text-sm font-medium text-ss-ink">{formatMoney(b.total)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${BADGE[b.status]}`}>{b.status}</span>
                    {busyId === b.id ? (
                      <Loader2 className="size-4 animate-spin text-ss-muted" />
                    ) : (
                      <>
                        {b.status === "Pending" && (
                          <button onClick={() => change(b, "Confirmed")} className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand-dark">Confirm</button>
                        )}
                        {b.status === "Confirmed" && (
                          <button onClick={() => change(b, "Completed")} className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand-dark">Mark completed</button>
                        )}
                        {(b.status === "Pending" || b.status === "Confirmed") && (
                          <button onClick={() => change(b, "Cancelled")} className="rounded-lg border border-ss-line px-3 py-2 text-xs font-semibold text-ss-ink hover:bg-ss-hover">Decline</button>
                        )}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
