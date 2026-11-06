"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    ApiError,
    CATEGORIES,
    formatMoney,
    priceBreakdown,
    updateStudio,
    type FieldErrors,
    type Studio,
} from "@/lib/api";
<<<<<<< HEAD
import { useAuth } from "@/lib/auth-client";
=======
import { useAuth } from "@/lib/auth";
>>>>>>> 6a0b7a52d7fcf34f22d7a10e3b9bfa737da6529f
import ImageUploadField from "./ImageUploadField";

/* --------------------------------- Data ---------------------------------- */

const AMENITIES = [
    "Fast Wi-Fi",
    "Air conditioning",
    "Natural light",
    "Lighting equipment",
    "Kitchenette",
    "Restroom",
    "Props & furniture",
    "Freight elevator",
    "Bluetooth speaker",
    "Soundproofing",
    "Parking",
    "Step-free access",
];

const TITLE_MAX = 60;

type FormState = {
    title: string;
    category: string;
    hourlyRate: string;
    securityDeposit: string;
    maxCapacity: string;
    address: string;
    imageUrl: string;
    amenities: string[];
    overview: string;
};

/** Pre-fill the form from an existing listing. */
function toFormState(studio: Studio): FormState {
    return {
        title: studio.title ?? "",
        category: studio.category ?? "",
        hourlyRate: studio.hourlyRate != null ? String(studio.hourlyRate) : "",
        securityDeposit: studio.securityDeposit != null ? String(studio.securityDeposit) : "",
        maxCapacity: studio.maxCapacity != null ? String(studio.maxCapacity) : "",
        address: studio.address ?? "",
        imageUrl: studio.imageUrl ?? "",
        amenities: Array.isArray(studio.amenities) ? [...studio.amenities] : [],
        overview: studio.overview ?? "",
    };
}

/* ------------------------------ UI primitives ----------------------------- */

const fieldBox =
    "rounded-xl border bg-ss-surface px-4 pb-3 pt-3 transition-colors focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20";
const inputCls =
    "mt-1 w-full bg-transparent text-[15px] text-ss-ink outline-none placeholder:text-ss-faint";

function Field({
    label,
    required,
    hint,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    hint?: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <label
            className={`${fieldBox} block ${error ? "border-red-400" : "border-ss-line"}`}
        >
            <span className="block text-[11px] font-medium text-ss-muted">
                {label}
                {required && <span className="text-brand"> *</span>}
            </span>
            {children}
            {error ? (
                <span className="mt-1 block text-[11px] text-red-600" role="alert">
                    {error}
                </span>
            ) : hint ? (
                <span className="mt-1 block text-[11px] text-ss-muted">{hint}</span>
            ) : null}
        </label>
    );
}

function Section({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-ss-line bg-ss-surface p-5 sm:p-6">
            <h2 className="text-lg font-semibold tracking-tight text-ss-ink">{title}</h2>
            <p className="mt-1.5 text-sm text-ss-muted">{description}</p>
            <div className="mt-4 space-y-4">{children}</div>
        </section>
    );
}

/* --------------------------------- Form ---------------------------------- */

type Props = {
    studio: Studio;
    /** "page" = full page (/studios/edit/[id]), "dialog" = popup on the detail page. */
    variant?: "page" | "dialog";
    onCancel: () => void;
};

export default function StudioEditForm({ studio, variant = "page", onCancel }: Props) {
    const router = useRouter();
    const { user } = useAuth();
    const inDialog = variant === "dialog";

    const [form, setForm] = useState<FormState>(() => toFormState(studio));
    const [errors, setErrors] = useState<FieldErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((f) => ({ ...f, [key]: value }));
        setErrors((e) => ({ ...e, [key]: undefined }));
    };

    const toggleAmenity = (a: string) =>
        set(
            "amenities",
            form.amenities.includes(a)
                ? form.amenities.filter((x) => x !== a)
                : [...form.amenities, a]
        );

    // Amenities stored on the listing that aren't in the preset list.
    const extraAmenities = form.amenities.filter((a) => !AMENITIES.includes(a));

    const rate = parseFloat(form.hourlyRate);
    const example = rate > 0 ? priceBreakdown(rate) : null;

    // Host info is read-only: prefer what's on the listing, fall back to the account.
    const ownerName = studio.ownerName || user?.name || "";
    const ownerEmail = studio.ownerEmail || user?.email || "";

    const validate = () => {
        const e: FieldErrors = {};
        if (!form.title.trim()) e.title = "Give your studio a name.";
        if (!form.category) e.category = "Choose a category.";
        if (!(parseFloat(form.hourlyRate) > 0)) e.hourlyRate = "Enter an hourly rate above $0.";
        if (form.securityDeposit === "" || parseFloat(form.securityDeposit) < 0)
            e.securityDeposit = "Enter a deposit (use 0 for none).";
        if (!Number.isInteger(Number(form.maxCapacity)) || Number(form.maxCapacity) <= 0)
            e.maxCapacity = "Enter how many people fit.";
        if (!form.address.trim()) e.address = "Add the studio's address.";
        if (!/^https?:\/\/.+/i.test(form.imageUrl.trim()))
            e.imageUrl = "Paste a full image link starting with http:// or https://.";
        if (form.overview.trim().length < 40)
            e.overview = "Write at least 40 characters about the light, layout and equipment.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        setStatus(null);
        if (!validate()) {
            setStatus({ kind: "err", msg: "Fix the highlighted fields, then save again." });
            if (!inDialog) window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        setSubmitting(true);
        try {
            await updateStudio(studio.id, {
                title: form.title.trim(),
                category: form.category,
                hourlyRate: parseFloat(form.hourlyRate),
                securityDeposit: parseFloat(form.securityDeposit),
                maxCapacity: Number(form.maxCapacity),
                address: form.address.trim(),
                imageUrl: form.imageUrl.trim(),
                amenities: form.amenities,
                overview: form.overview.trim(),
            });
            toast.success("Studio updated. Redirecting to your listings…");
            router.push("/my-listings");
        } catch (err) {
            if (err instanceof ApiError) {
                if (Object.keys(err.fields).length > 0) setErrors(err.fields);
                setStatus({ kind: "err", msg: err.message });
            } else {
                setStatus({ kind: "err", msg: "We couldn't save your changes. Please try again." });
            }
            if (!inDialog) window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Status bar — errors stay inline; success is a toast */}
            {status && (
                <div
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-xs ${status.kind === "ok"
                            ? "border-green-300 bg-green-50 text-green-800"
                            : "border-red-300 bg-red-50 text-red-700"
                        }`}
                    role="status"
                >
                    {status.msg}
                </div>
            )}

            {/* 01 Essentials */}
            <Section
                title="01 / The essentials"
                description="Give your space a name and tell creatives what it does best."
            >
                <Field
                    label="Studio name"
                    required
                    error={errors.title}
                    hint={`Keep it memorable. ${form.title.length}/${TITLE_MAX} characters.`}
                >
                    <input
                        className={inputCls}
                        value={form.title}
                        maxLength={TITLE_MAX}
                        onChange={(e) => set("title", e.target.value)}
                        placeholder="Still Life Atelier — Workshop Room"
                    />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Category" required error={errors.category}>
                        <select
                            className={inputCls}
                            value={form.category}
                            onChange={(e) => set("category", e.target.value)}
                        >
                            <option value="">Select a category</option>
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Max capacity" required error={errors.maxCapacity}>
                        <input
                            type="number"
                            min={1}
                            className={inputCls}
                            value={form.maxCapacity}
                            onChange={(e) => set("maxCapacity", e.target.value)}
                            placeholder="8"
                        />
                    </Field>
                </div>
            </Section>

            {/* 02 Pricing */}
            <Section
                title="02 / Pricing, without surprises"
                description="You set the hourly rate. Guests see every cost before they book."
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Hourly rate (USD)" required error={errors.hourlyRate}>
                        <input
                            type="number"
                            min={0}
                            step="0.01"
                            className={inputCls}
                            value={form.hourlyRate}
                            onChange={(e) => set("hourlyRate", e.target.value)}
                            placeholder="45"
                        />
                    </Field>
                    <Field
                        label="Refundable security deposit (USD)"
                        required
                        error={errors.securityDeposit}
                        hint="Authorized separately before check-in."
                    >
                        <input
                            type="number"
                            min={0}
                            step="0.01"
                            className={inputCls}
                            value={form.securityDeposit}
                            onChange={(e) => set("securityDeposit", e.target.value)}
                            placeholder="75"
                        />
                    </Field>
                </div>
                <div className="rounded-xl bg-[#fff0e8] px-4 py-3 text-xs text-[#6b3a22]">
                    {example
                        ? `Example: ${example.hours} hours × ${formatMoney(parseFloat(form.hourlyRate))} = ${formatMoney(
                            example.subtotal
                        )}. Guest service fee: ${formatMoney(example.fee)}. Guest total: ${formatMoney(example.total)}.`
                        : "Enter an hourly rate to preview what a 4-hour booking costs your guests."}
                </div>
            </Section>

            {/* 03 Location */}
            <Section
                title="03 / Put your space on the map"
                description="Your exact address is only shared with confirmed guests."
            >
                <Field label="Location / address" required error={errors.address}>
                    <input
                        className={inputCls}
                        value={form.address}
                        onChange={(e) => set("address", e.target.value)}
                        placeholder="3120 Sunset Boulevard, Los Angeles, CA 90026"
                        autoComplete="street-address"
                    />
                </Field>
            </Section>

            {/* 04 Photo */}
            <Section
                title="04 / Let your space speak"
                description="Lead with a wide, naturally lit view of your space."
            >
                <ImageUploadField
                    value={form.imageUrl}
                    onChange={(url) => set("imageUrl", url)}
                    error={errors.imageUrl}
                    previewClassName="h-48"
                />
            </Section>

            {/* 05 Amenities */}
            <Section
                title="05 / The little things that make a difference"
                description="Choose every amenity your guests can use, at no extra cost."
            >
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                    {[...AMENITIES, ...extraAmenities].map((a) => {
                        const on = form.amenities.includes(a);
                        return (
                            <label key={a} className="flex cursor-pointer items-center gap-2.5 text-sm">
                                <input
                                    type="checkbox"
                                    checked={on}
                                    onChange={() => toggleAmenity(a)}
                                    className="peer sr-only"
                                />
                                <span
                                    className={`grid h-4 w-4 place-items-center rounded border text-[10px] leading-none text-white transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 ${on ? "border-brand bg-brand" : "border-[#cfcac0] bg-ss-surface"
                                        }`}
                                    aria-hidden
                                >
                                    {on && "✓"}
                                </span>
                                {a}
                            </label>
                        );
                    })}
                </div>
            </Section>

            {/* 06 Overview */}
            <Section
                title="06 / Tell the story of your space"
                description="Be specific about the light, layout, equipment, and what makes your space special."
            >
                <Field
                    label="Detailed overview"
                    required
                    error={errors.overview}
                    hint={`${form.overview.length} characters`}
                >
                    <textarea
                        rows={6}
                        className={`${inputCls} resize-y`}
                        value={form.overview}
                        onChange={(e) => set("overview", e.target.value)}
                        placeholder="A sun-filled workshop room designed for small-group art classes, still-life photography and pottery…"
                    />
                </Field>
            </Section>

            {/* 07 Host (read-only) */}
            <Section
                title="07 / Host details"
                description="Host information is managed by StudioSpace and can't be edited here."
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block rounded-xl border border-ss-line bg-ss-hover px-4 pb-3 pt-3">
                        <span className="block text-[11px] font-medium text-ss-muted">Host name</span>
                        <input
                            readOnly
                            value={ownerName}
<<<<<<< HEAD
                            className={`${inputCls} cursor-not-allowed text-ss-muted`}
=======
                            className={`${inputCls} cursor-not-allowed text-[#6f6c66]`}
>>>>>>> 6a0b7a52d7fcf34f22d7a10e3b9bfa737da6529f
                        />
                    </label>
                    <label className="block rounded-xl border border-ss-line bg-ss-hover px-4 pb-3 pt-3">
                        <span className="block text-[11px] font-medium text-ss-muted">Host email</span>
                        <input
                            readOnly
                            value={ownerEmail}
<<<<<<< HEAD
                            className={`${inputCls} cursor-not-allowed text-ss-muted`}
=======
                            className={`${inputCls} cursor-not-allowed text-[#6f6c66]`}
>>>>>>> 6a0b7a52d7fcf34f22d7a10e3b9bfa737da6529f
                        />
                    </label>
                </div>
            </Section>

            {/* Actions */}
            <div className="grid gap-3 sm:grid-cols-[1fr_1.4fr]">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                    className="rounded-xl border border-ss-line bg-ss-surface py-3.5 text-sm font-medium transition-colors hover:bg-ss-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-60"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-brand py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 disabled:opacity-60"
                >
                    {submitting ? "Saving…" : "Save changes"}
                </button>
            </div>
        </form>
    );
}
