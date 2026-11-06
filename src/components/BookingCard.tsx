"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import { ArrowRight, CalendarDays, CheckCircle2, Clock, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import {
    ApiError,
    createBooking,
    formatBookingDate,
    formatMoney,
    SERVICE_FEE_RATE,
    type Studio,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-client";
import { cn } from "cn";

const MIN_HOURS = 2;

const TIME_OPTIONS = [
    "08:00 AM",
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
    "07:00 PM",
    "08:00 PM",
];

function toMinutes(time: string): number {
    const [hm, period] = time.split(" ");
    const [h, m] = hm.split(":").map(Number);
    const hour24 = period === "PM" && h !== 12 ? h + 12 : period === "AM" && h === 12 ? 0 : h;
    return hour24 * 60 + m;
}

const fieldBox =
    "block rounded-xl border border-ss-line bg-ss-hover px-4 pb-3 pt-3 transition-colors focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20";
const fieldLabel = "block text-[11px] font-medium text-ss-muted";
const fieldInput =
    "mt-1 w-full bg-transparent text-[15px] text-ss-ink outline-none placeholder:text-ss-faint";

type Props = {
    studio: Studio;
};

/**
 * Sticky booking panel: date/time/crew selection with a live price breakdown
 * and a "Book Workspace Now" button that opens the booking modal.
 */
export default function BookingCard({ studio }: Props) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState("");
    const [start, setStart] = useState("10:00 AM");
    const [end, setEnd] = useState("02:00 PM");
    const [crew, setCrew] = useState(Math.min(6, studio.maxCapacity));
    const [note, setNote] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hours = Math.max((toMinutes(end) - toMinutes(start)) / 60, MIN_HOURS);

    const invalidRange = toMinutes(end) <= toMinutes(start);

    const subtotal = studio.hourlyRate * hours;
    const fee = subtotal * SERVICE_FEE_RATE;
    const total = subtotal + fee;

    const canBook = Boolean(date) && !invalidRange && !!user;

    const reset = () => {
        setConfirmed(false);
        setDate("");
        setNote("");
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canBook || !user) return;

        setError(null);
        setSubmitting(true);
        try {
            await createBooking({
                studioId: studio.id,
                userName: user.name,
                userEmail: user.email,
                date,
                startTime: start,
                endTime: end,
                crewSize: crew,
                note: note.trim(),
            });
            toast.success("Booking request sent. Status: Pending.");
            setConfirmed(true);
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : "We couldn't send your booking request. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const closeAndReset = (next: boolean) => {
        setOpen(next);
        if (!next) reset();
    };

    const crewOptions = Array.from({ length: studio.maxCapacity }, (_, i) => i + 1);

    return (
        <>
            <div className="rounded-2xl border border-ss-line bg-ss-surface p-6">
                <p className="text-3xl font-semibold tracking-tight text-ss-ink">
                    {formatMoney(studio.hourlyRate)}
                    <span className="text-base font-normal text-ss-muted"> / hour</span>
                </p>
                <p className="mt-1 text-[13px] text-ss-muted">
                    {MIN_HOURS}-hour minimum · No hidden studio fees
                </p>

                <div className="mt-5 space-y-3">
                    <label className={fieldBox}>
                        <span className={fieldLabel}>Date</span>
                        <span className="relative flex items-center">
                            <CalendarDays className="absolute left-0 size-4 text-ss-muted" aria-hidden />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className={cn(fieldInput, "pl-6")}
                                required
                            />
                        </span>
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                        <label className={fieldBox}>
                            <span className={fieldLabel}>Start</span>
                            <select
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                className={fieldInput}
                            >
                                {TIME_OPTIONS.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className={fieldBox}>
                            <span className={fieldLabel}>End</span>
                            <select
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                                className={cn(fieldInput, invalidRange && "text-red-600")}
                            >
                                {TIME_OPTIONS.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <label className={fieldBox}>
                        <span className={fieldLabel}>Crew size</span>
                        <span className="relative flex items-center">
                            <Users className="absolute left-0 size-4 text-ss-muted" aria-hidden />
                            <select
                                value={crew}
                                onChange={(e) => setCrew(Number(e.target.value))}
                                className={cn(fieldInput, "pl-6")}
                            >
                                {crewOptions.map((n) => (
                                    <option key={n} value={n}>
                                        {n} {n === 1 ? "person" : "people"}
                                    </option>
                                ))}
                            </select>
                        </span>
                    </label>
                </div>

                {invalidRange && (
                    <p className="mt-3 text-[13px] text-red-600" role="alert">
                        End time must be after the start time.
                    </p>
                )}


                <dl className="mt-5 space-y-2.5 text-sm">
                    <div className="flex justify-between">
                        <dt className="text-ss-muted">
                            {formatMoney(studio.hourlyRate)} × {hours} hours
                        </dt>
                        <dd className="font-medium text-ss-ink">{formatMoney(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-ss-muted">
                            Service fee ({Math.round(SERVICE_FEE_RATE * 100)}%)
                        </dt>
                        <dd className="font-medium text-ss-ink">{formatMoney(fee)}</dd>
                    </div>
                    <div className="flex justify-between border-t border-ss-line pt-3">
                        <dt className="font-semibold text-ss-ink">Total</dt>
                        <dd className="font-semibold text-ss-ink">{formatMoney(total)}</dd>
                    </div>
                </dl>

                {user ? (
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        disabled={!canBook}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Book Workspace Now
                        <ArrowRight className="size-4" />
                    </button>
                ) : (
                    <Link
                        href={`/login?next=${encodeURIComponent(`/studios/${studio.id}`)}`}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
                    >
                        Log in to book
                        <ArrowRight className="size-4" />
                    </Link>
                )}
                {!date && user && (
                    <p className="mt-2 text-center text-[12px] text-ss-muted">
                        Pick a date to continue.
                    </p>
                )}

                <p className="mt-4 text-center text-[12px] leading-relaxed text-ss-muted">
                    You won&apos;t be charged until the host accepts. A{" "}
                    {formatMoney(studio.securityDeposit)} refundable deposit is authorized
                    separately.
                </p>

                <div className="mt-4 space-y-2 border-t border-ss-line pt-4 text-[13px] text-ss-soft">
                    <p className="flex items-start gap-2">
                        <Clock className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                        Free cancellation up to 48 hours before your session.
                    </p>
                    <p className="flex items-start gap-2">
                        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                        Protected payments. Verified spaces. Support from real people, whenever
                        you need it.
                    </p>
                </div>
            </div>

            {/* Booking modal */}
            <Dialog.Root open={open} onOpenChange={closeAndReset}>
                <Dialog.Portal>
                    <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
                    <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 max-h-[88vh] w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-ss-surface p-6 shadow-2xl outline-none">
                        {confirmed ? (
                            <div className="py-6 text-center">
                                <CheckCircle2
                                    className="mx-auto size-12 text-brand"
                                    aria-hidden
                                />
                                <Dialog.Title className="mt-4 text-xl font-semibold tracking-tight text-ss-ink">
                                    Request sent to the host
                                </Dialog.Title>
                                <Dialog.Description className="mt-2 text-sm leading-relaxed text-ss-muted">
                                    Your booking request for {studio.title} is saved with the
                                    status <span className="font-medium text-ss-ink">Pending</span>.
                                    You can follow it, or cancel it while it&apos;s pending, from My
                                    Bookings.
                                </Dialog.Description>
                                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={() => closeAndReset(false)}
                                        className="rounded-xl border border-ss-line bg-ss-surface py-3 text-sm font-medium transition-colors hover:bg-ss-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                                    >
                                        Back to studio
                                    </button>
                                    <Link
                                        href="/my-bookings"
                                        className="rounded-xl bg-brand py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
                                    >
                                        View my bookings
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <Dialog.Title className="text-xl font-semibold tracking-tight text-ss-ink">
                                            Confirm your booking
                                        </Dialog.Title>
                                        <Dialog.Description className="mt-1 text-sm text-ss-muted">
                                            Review the details below. Nothing is charged until the
                                            host accepts your request.
                                        </Dialog.Description>
                                    </div>
                                    <Dialog.Close
                                        aria-label="Close"
                                        className="flex size-8 shrink-0 items-center justify-center rounded-full text-ss-muted transition hover:bg-ss-hover hover:text-ss-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                                    >
                                        ✕
                                    </Dialog.Close>
                                </div>

                                <div className="mt-5 rounded-xl border border-ss-line bg-ss-bg p-4">
                                    <p className="text-sm font-semibold text-ss-ink">
                                        {studio.title}
                                    </p>
                                    <p className="mt-0.5 text-[13px] text-ss-muted">
                                        {studio.address}
                                    </p>
                                    <dl className="mt-3 space-y-1.5 text-[13px]">
                                        <div className="flex justify-between">
                                            <dt className="text-ss-muted">Date</dt>
                                            <dd className="font-medium text-ss-ink">
                                                {formatBookingDate(date)}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-ss-muted">Time</dt>
                                            <dd className="font-medium text-ss-ink">
                                                {start} – {end} ({hours} hours)
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-ss-muted">Crew size</dt>
                                            <dd className="font-medium text-ss-ink">
                                                {crew} {crew === 1 ? "person" : "people"}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between border-t border-ss-line pt-2">
                                            <dt className="font-semibold text-ss-ink">Total</dt>
                                            <dd className="font-semibold text-ss-ink">
                                                {formatMoney(total)}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                                    {error && (
                                        <div
                                            className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-700"
                                            role="alert"
                                        >
                                            {error}
                                        </div>
                                    )}
                                    <label className={fieldBox}>
                                        <span className={fieldLabel}>Your name</span>
                                        <input
                                            type="text"
                                            readOnly
                                            value={user?.name ?? ""}
                                            className={cn(fieldInput, "cursor-not-allowed text-ss-muted")}
                                        />
                                    </label>
                                    <label className={fieldBox}>
                                        <span className={fieldLabel}>Email</span>
                                        <input
                                            type="email"
                                            readOnly
                                            value={user?.email ?? ""}
                                            className={cn(fieldInput, "cursor-not-allowed text-ss-muted")}
                                        />
                                    </label>
                                    <label className={fieldBox}>
                                        <span className={fieldLabel}>Note for the host (optional)</span>
                                        <textarea
                                            rows={3}
                                            maxLength={500}
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            placeholder="Tell the host about your project…"
                                            className={cn(fieldInput, "resize-y")}
                                        />
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={!canBook || submitting}
                                        className="w-full rounded-xl bg-brand py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 disabled:opacity-50"
                                    >
                                        {submitting ? "Sending…" : "Send booking request"}
                                    </button>
                                    <p className="text-center text-[12px] text-ss-muted">
                                        Free cancellation up to 48 hours before your session.
                                    </p>
                                </form>
                            </>
                        )}
                    </Dialog.Popup>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
}
