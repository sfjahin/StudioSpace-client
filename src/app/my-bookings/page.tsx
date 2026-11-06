"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import {
    ApiError,
    cancelBooking,
    formatBookingDate,
    formatMoney,
    listMyBookings,
    type Booking,
    type BookingStatus,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-client";

/* ------------------------------ Status badge ------------------------------ */

const STATUS_STYLES: Record<BookingStatus, string> = {
    Pending: "bg-[#fff4e0] text-[#9a5b00]",
    Confirmed: "bg-[#e9f7ee] text-[#1f7a3d]",
    Completed: "bg-[#e8f0fe] text-[#2a56b8]",
    Cancelled: "bg-[#fdecec] text-[#b42318]",
};

function StatusBadge({ status }: { status: BookingStatus }) {
    return (
        <span
            className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                STATUS_STYLES[status] ?? "bg-ss-hover text-ss-muted"
            }`}
        >
            {status}
        </span>
    );
}

/* --------------------------------- Cards --------------------------------- */

function BookingCard({
    booking,
    onRequestCancel,
}: {
    booking: Booking;
    onRequestCancel: (booking: Booking) => void;
}) {
    return (
        <article className="flex flex-col overflow-hidden rounded-2xl border border-ss-line bg-ss-surface sm:flex-row">
            <Link
                href={`/studios/${booking.studioId}`}
                aria-label={`View ${booking.studioTitle}`}
                className="block aspect-[16/9] shrink-0 overflow-hidden bg-ss-sunk sm:aspect-auto sm:w-56 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40"
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={booking.studioImage}
                    alt={booking.studioTitle}
                    className="h-full w-full object-cover"
                />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-brand">
                            {booking.studioCategory}
                        </p>
                        <h2 className="mt-1 truncate text-lg font-semibold tracking-tight text-ss-ink">
                            <Link href={`/studios/${booking.studioId}`} className="hover:underline">
                                {booking.studioTitle}
                            </Link>
                        </h2>
                    </div>
                    <StatusBadge status={booking.status} />
                </div>

                <p className="mt-1 flex items-start gap-1.5 text-sm text-ss-muted">
                    <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                    <span className="line-clamp-1">{booking.studioAddress}</span>
                </p>

                <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="size-4 shrink-0 text-brand" aria-hidden />
                        <dt className="sr-only">Date</dt>
                        <dd className="text-ss-ink">{formatBookingDate(booking.date)}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="size-4 shrink-0 text-brand" aria-hidden />
                        <dt className="sr-only">Time</dt>
                        <dd className="text-ss-ink">
                            {booking.startTime} – {booking.endTime}{" "}
                            <span className="text-ss-muted">({booking.hours} hrs)</span>
                        </dd>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="size-4 shrink-0 text-brand" aria-hidden />
                        <dt className="sr-only">Crew size</dt>
                        <dd className="text-ss-ink">
                            {booking.crewSize} {booking.crewSize === 1 ? "person" : "people"}
                        </dd>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 shrink-0 text-center font-semibold text-brand" aria-hidden>
                            $
                        </span>
                        <dt className="sr-only">Total</dt>
                        <dd className="font-semibold text-ss-ink">
                            {formatMoney(booking.total)}
                            <span className="font-normal text-ss-muted"> total</span>
                        </dd>
                    </div>
                </dl>

                {booking.note && (
                    <p className="mt-3 line-clamp-2 rounded-lg bg-ss-bg px-3 py-2 text-[13px] text-ss-soft">
                        Your note: {booking.note}
                    </p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ss-line pt-4">
                    <p className="text-xs text-ss-muted">
                        Requested{" "}
                        {new Date(booking.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </p>
                    {booking.status === "Pending" && (
                        <button
                            type="button"
                            onClick={() => onRequestCancel(booking)}
                            className="rounded-xl border border-red-200 bg-ss-surface px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                        >
                            Cancel Booking
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

/* --------------------------- Cancel confirmation -------------------------- */

function CancelConfirmDialog({
    booking,
    userEmail,
    onClose,
    onCancelled,
}: {
    booking: Booking | null;
    userEmail: string;
    onClose: () => void;
    onCancelled: (updated: Booking) => void;
}) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const close = () => {
        setError(null);
        setSubmitting(false);
        onClose();
    };

    const handleCancel = async () => {
        if (!booking) return;
        setError(null);
        setSubmitting(true);
        try {
            const updated = await cancelBooking(booking.id, userEmail);
            toast.success(`Your booking at “${booking.studioTitle}” was cancelled.`);
            onCancelled(updated);
            onClose();
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : "We couldn't cancel that booking. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog.Root
            open={booking !== null}
            onOpenChange={(open) => {
                if (!open) close();
            }}
        >
            <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
                <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-ss-surface p-6 shadow-2xl outline-none">
                    <Dialog.Title className="text-xl font-semibold tracking-tight text-ss-ink">
                        Cancel this booking?
                    </Dialog.Title>
                    <Dialog.Description className="mt-2 text-sm leading-relaxed text-ss-muted">
                        {booking ? (
                            <>
                                Your request for{" "}
                                <span className="font-medium text-ss-ink">{booking.studioTitle}</span>{" "}
                                on {formatBookingDate(booking.date)} ({booking.startTime} –{" "}
                                {booking.endTime}) will be cancelled and the time slot released.
                            </>
                        ) : null}
                    </Dialog.Description>

                    {error && (
                        <div
                            className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-700"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <Dialog.Close
                            disabled={submitting}
                            className="rounded-xl border border-ss-line bg-ss-surface py-3 text-sm font-medium transition-colors hover:bg-ss-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-60"
                        >
                            Keep booking
                        </Dialog.Close>
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={submitting}
                            className="rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 disabled:opacity-60"
                        >
                            {submitting ? "Cancelling…" : "Cancel booking"}
                        </button>
                    </div>
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

function BookingsSkeleton() {
    return (
        <div className="space-y-5" aria-hidden>
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className="h-44 animate-pulse rounded-2xl border border-ss-line bg-ss-surface"
                />
            ))}
        </div>
    );
}

/* --------------------------------- Page ---------------------------------- */

export default function MyBookingsPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    const [bookings, setBookings] = useState<Booking[] | null>(null); // null = loading
    const [failed, setFailed] = useState(false);
    const [pendingCancel, setPendingCancel] = useState<Booking | null>(null);

    // Private route guard
    useEffect(() => {
        if (!loading && !user) router.replace("/login?next=/my-bookings");
    }, [loading, user, router]);

    // Load this user's reservations
    useEffect(() => {
        if (!user) return;
        let cancelled = false;

        listMyBookings(user.email)
            .then((list) => {
                if (!cancelled) setBookings(list);
            })
            .catch(() => {
                if (cancelled) return;
                setFailed(true);
                setBookings([]);
            });

        return () => {
            cancelled = true;
        };
    }, [user]);

    const handleCancelled = (updated: Booking) => {
        setBookings((prev) => (prev ? prev.map((b) => (b.id === updated.id ? updated : b)) : prev));
    };

    if (loading || !user) {
        return (
            <div className="grid min-h-screen place-items-center bg-ss-bg text-sm text-ss-muted">
                Checking your account…
            </div>
        );
    }

    return (
        <main className="flex-1 bg-ss-bg text-ss-ink">
            <div className="mx-auto max-w-5xl px-5 pb-20 pt-10 sm:px-8">
                <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-medium tracking-wide text-brand">
                            Your account / My bookings
                        </p>
                        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                            Your bookings.
                        </h1>
                        <p className="mt-2 max-w-xl text-[15px] text-ss-muted">
                            Every workspace you&apos;ve reserved with {user.email}. Pending requests can be
                            cancelled any time before the host confirms them.
                        </p>
                    </div>
                    <Link
                        href="/studios"
                        className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
                    >
                        Explore studios
                    </Link>
                </header>

                {bookings === null ? (
                    <BookingsSkeleton />
                ) : failed ? (
                    <div className="rounded-2xl border border-red-300 bg-red-50 px-6 py-10 text-center">
                        <p className="text-sm font-medium text-red-800">
                            We couldn&apos;t load your bookings right now.
                        </p>
                        <p className="mt-1 text-sm text-red-700">
                            The StudioSpace server may be offline. Start it, then refresh this page.
                        </p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="rounded-2xl border border-ss-line bg-ss-surface px-6 py-16 text-center">
                        <h2 className="text-xl font-semibold tracking-tight text-ss-ink">
                            No bookings yet.
                        </h2>
                        <p className="mt-2 text-sm text-ss-muted">
                            Find a space you love and your reservation will show up here.
                        </p>
                        <Link
                            href="/studios"
                            className="mt-6 inline-block rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                        >
                            Explore studios
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {bookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                onRequestCancel={setPendingCancel}
                            />
                        ))}
                    </div>
                )}
            </div>

            <CancelConfirmDialog
                booking={pendingCancel}
                userEmail={user.email}
                onClose={() => setPendingCancel(null)}
                onCancelled={handleCancelled}
            />
        </main>
    );
}
