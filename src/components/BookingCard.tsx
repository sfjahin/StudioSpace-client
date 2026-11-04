"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { ArrowRight, CalendarDays, CheckCircle2, Clock, ShieldCheck, Users } from "lucide-react";
import { formatMoney, SERVICE_FEE_RATE, type Studio } from "@/lib/api";
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
    "block rounded-xl border border-[#e7e3db] bg-[#f3f0ea] px-4 pb-3 pt-3 transition-colors focus-within:border-[#FF5A1F] focus-within:ring-2 focus-within:ring-[#FF5A1F]/20";
const fieldLabel = "block text-[11px] font-medium text-[#6f6c66]";
const fieldInput =
    "mt-1 w-full bg-transparent text-[15px] text-[#1b1b1a] outline-none placeholder:text-[#a8a59e]";

type Props = {
    studio: Studio;
};

/**
 * Sticky booking panel: date/time/crew selection with a live price breakdown
 * and a "Book Workspace Now" button that opens the booking modal.
 */
export default function BookingCard({ studio }: Props) {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState("");
    const [start, setStart] = useState("10:00 AM");
    const [end, setEnd] = useState("02:00 PM");
    const [crew, setCrew] = useState(Math.min(6, studio.maxCapacity));
    const [confirmed, setConfirmed] = useState(false);

    const hours = Math.max((toMinutes(end) - toMinutes(start)) / 60, MIN_HOURS);

    const invalidRange = toMinutes(end) <= toMinutes(start);

    const subtotal = studio.hourlyRate * hours;
    const fee = subtotal * SERVICE_FEE_RATE;
    const total = subtotal + fee;

    const canBook = Boolean(date) && !invalidRange;

    const reset = () => {
        setConfirmed(false);
        setDate("");
    };

    const closeAndReset = (next: boolean) => {
        setOpen(next);
        if (!next) reset();
    };

    const crewOptions = Array.from({ length: studio.maxCapacity }, (_, i) => i + 1);

    return (
        <>
            <div className="rounded-2xl border border-[#e7e3db] bg-white p-6">
                <p className="text-3xl font-semibold tracking-tight text-[#1b1b1a]">
                    {formatMoney(studio.hourlyRate)}
                    <span className="text-base font-normal text-[#7a776f]"> / hour</span>
                </p>
                <p className="mt-1 text-[13px] text-[#7a776f]">
                    {MIN_HOURS}-hour minimum · No hidden studio fees
                </p>

                <div className="mt-5 space-y-3">
                    <label className={fieldBox}>
                        <span className={fieldLabel}>Date</span>
                        <span className="relative flex items-center">
                            <CalendarDays className="absolute left-0 size-4 text-[#8f8c85]" aria-hidden />
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
                            <Users className="absolute left-0 size-4 text-[#8f8c85]" aria-hidden />
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
                        <dt className="text-[#7a776f]">
                            {formatMoney(studio.hourlyRate)} × {hours} hours
                        </dt>
                        <dd className="font-medium text-[#1b1b1a]">{formatMoney(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-[#7a776f]">
                            Service fee ({Math.round(SERVICE_FEE_RATE * 100)}%)
                        </dt>
                        <dd className="font-medium text-[#1b1b1a]">{formatMoney(fee)}</dd>
                    </div>
                    <div className="flex justify-between border-t border-[#e7e3db] pt-3">
                        <dt className="font-semibold text-[#1b1b1a]">Total</dt>
                        <dd className="font-semibold text-[#1b1b1a]">{formatMoney(total)}</dd>
                    </div>
                </dl>

                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    disabled={!canBook}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A1F] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#e84e15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Book Workspace Now
                    <ArrowRight className="size-4" />
                </button>
                {!date && (
                    <p className="mt-2 text-center text-[12px] text-[#8f8c85]">
                        Pick a date to continue.
                    </p>
                )}

                <p className="mt-4 text-center text-[12px] leading-relaxed text-[#8f8c85]">
                    You won&apos;t be charged until the host accepts. A{" "}
                    {formatMoney(studio.securityDeposit)} refundable deposit is authorized
                    separately.
                </p>

                <div className="mt-4 space-y-2 border-t border-[#e7e3db] pt-4 text-[13px] text-[#4d4a45]">
                    <p className="flex items-start gap-2">
                        <Clock className="mt-0.5 size-4 shrink-0 text-[#FF5A1F]" aria-hidden />
                        Free cancellation up to 48 hours before your session.
                    </p>
                    <p className="flex items-start gap-2">
                        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#FF5A1F]" aria-hidden />
                        Protected payments. Verified spaces. Support from real people, whenever
                        you need it.
                    </p>
                </div>
            </div>

            {/* Booking modal */}
            <Dialog.Root open={open} onOpenChange={closeAndReset}>
                <Dialog.Portal>
                    <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
                    <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 max-h-[88vh] w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl outline-none">
                        {confirmed ? (
                            <div className="py-6 text-center">
                                <CheckCircle2
                                    className="mx-auto size-12 text-[#FF5A1F]"
                                    aria-hidden
                                />
                                <Dialog.Title className="mt-4 text-xl font-semibold tracking-tight text-[#1b1b1a]">
                                    Request sent to the host
                                </Dialog.Title>
                                <Dialog.Description className="mt-2 text-sm leading-relaxed text-[#7a776f]">
                                    We&apos;ve emailed your booking request for {studio.title}. The
                                    host usually replies quickly — you&apos;ll hear back with a
                                    confirmation shortly.
                                </Dialog.Description>
                                <button
                                    type="button"
                                    onClick={() => closeAndReset(false)}
                                    className="mt-6 w-full rounded-xl border border-[#e7e3db] bg-white py-3 text-sm font-medium transition-colors hover:bg-[#f3f0ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/40"
                                >
                                    Back to studio
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <Dialog.Title className="text-xl font-semibold tracking-tight text-[#1b1b1a]">
                                            Confirm your booking
                                        </Dialog.Title>
                                        <Dialog.Description className="mt-1 text-sm text-[#7a776f]">
                                            Review the details below. Nothing is charged until the
                                            host accepts your request.
                                        </Dialog.Description>
                                    </div>
                                    <Dialog.Close
                                        aria-label="Close"
                                        className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#7a776f] transition hover:bg-[#f3f0ea] hover:text-[#1b1b1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/40"
                                    >
                                        ✕
                                    </Dialog.Close>
                                </div>

                                <div className="mt-5 rounded-xl border border-[#e7e3db] bg-[#f7f5f1] p-4">
                                    <p className="text-sm font-semibold text-[#1b1b1a]">
                                        {studio.title}
                                    </p>
                                    <p className="mt-0.5 text-[13px] text-[#7a776f]">
                                        {studio.address}
                                    </p>
                                    <dl className="mt-3 space-y-1.5 text-[13px]">
                                        <div className="flex justify-between">
                                            <dt className="text-[#7a776f]">Date</dt>
                                            <dd className="font-medium text-[#1b1b1a]">{date}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-[#7a776f]">Time</dt>
                                            <dd className="font-medium text-[#1b1b1a]">
                                                {start} – {end} ({hours} hours)
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-[#7a776f]">Crew size</dt>
                                            <dd className="font-medium text-[#1b1b1a]">
                                                {crew} {crew === 1 ? "person" : "people"}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between border-t border-[#e7e3db] pt-2">
                                            <dt className="font-semibold text-[#1b1b1a]">Total</dt>
                                            <dd className="font-semibold text-[#1b1b1a]">
                                                {formatMoney(total)}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                <form
                                    className="mt-5 space-y-4"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (!canBook) return;
                                        setConfirmed(true);
                                    }}
                                >
                                    <label className={fieldBox}>
                                        <span className={fieldLabel}>Your name</span>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Alex Rivera"
                                            className={fieldInput}
                                        />
                                    </label>
                                    <label className={fieldBox}>
                                        <span className={fieldLabel}>Email</span>
                                        <input
                                            type="email"
                                            required
                                            placeholder="alex@example.com"
                                            className={fieldInput}
                                        />
                                    </label>
                                    <label className={fieldBox}>
                                        <span className={fieldLabel}>Note for the host (optional)</span>
                                        <textarea
                                            rows={3}
                                            placeholder="Tell the host about your project…"
                                            className={cn(fieldInput, "resize-y")}
                                        />
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={!canBook}
                                        className="w-full rounded-xl bg-[#FF5A1F] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#e84e15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/40 focus-visible:ring-offset-2 disabled:opacity-50"
                                    >
                                        Send booking request
                                    </button>
                                    <p className="text-center text-[12px] text-[#8f8c85]">
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
