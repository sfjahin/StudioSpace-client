"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ApiError,
    CATEGORIES,
    createStudio,
    type FieldErrors,
    formatMoney,
    priceBreakdown,
} from "@/lib/api";

/* ----------------------------- Auth (replace) ----------------------------- */

type AuthUser = { name: string; email: string };

function useAuth(): { user: AuthUser | null; loading: boolean } {
    // TODO: swap for your auth provider, e.g. `const { data, status } = useSession()`
    return { user: { name: "Maya Chen", email: "maya@example.com" }, loading: false };
}

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
const DRAFT_KEY = "studiospace:add-studio:draft";

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

const INITIAL: FormState = {
    title: "",
    category: "",
    hourlyRate: "",
    securityDeposit: "",
    maxCapacity: "",
    address: "",
    imageUrl: "",
    amenities: [],
    overview: "",
};

/* ------------------------------ UI primitives ----------------------------- */

const fieldBox =
    "rounded-xl border bg-white px-4 pb-3 pt-3 transition-colors focus-within:border-[#FF5A1F] focus-within:ring-2 focus-within:ring-[#FF5A1F]/20";
const inputCls =
    "mt-1 w-full bg-transparent text-[15px] text-[#1b1b1a] outline-none placeholder:text-[#a8a59e]";

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
            className={`${fieldBox} block ${error ? "border-red-400" : "border-[#e7e3db]"}`}
        >
            <span className="block text-[11px] font-medium text-[#6f6c66]">
                {label}
                {required && <span className="text-[#FF5A1F]"> *</span>}
            </span>
            {children}
            {error ? (
                <span className="mt-1 block text-[11px] text-red-600" role="alert">
                    {error}
                </span>
            ) : hint ? (
                <span className="mt-1 block text-[11px] text-[#8f8c85]">{hint}</span>
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
        <section className="rounded-2xl border border-[#e7e3db] bg-white p-6 sm:p-7">
            <h2 className="text-xl font-semibold tracking-tight text-[#1b1b1a]">{title}</h2>
            <p className="mt-2 text-sm text-[#7a776f]">{description}</p>
            <div className="mt-5 space-y-4">{children}</div>
        </section>
    );
}

/* --------------------------------- Page ---------------------------------- */

export default function AddStudioPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    const [form, setForm] = useState<FormState>(INITIAL);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
    const [imageFailed, setImageFailed] = useState(false);


    

    // Private route guard
    useEffect(() => {
        if (!loading && !user) router.replace("/login?next=/add-studio");
    }, [loading, user, router]);

    // Restore a draft saved on this device, if there is one.
    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(DRAFT_KEY);
            if (!raw) return;
            const saved = JSON.parse(raw) as Partial<FormState>;
            // One-time read from localStorage on mount; the draft lives outside React.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setForm((f) => ({ ...f, ...saved }));
        } catch {
            // Ignore unreadable drafts.
        }
    }, []);

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

    // Live pricing example
    const rate = parseFloat(form.hourlyRate);
    const example = rate > 0 ? priceBreakdown(rate) : null;

    const saveDraft = () => {
        try {
            window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
            setStatus({ kind: "ok", msg: "Draft saved in this browser." });
        } catch {
            setStatus({ kind: "err", msg: "Your browser wouldn't let us save the draft." });
        }
    };

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
            setStatus({ kind: "err", msg: "Fix the highlighted fields, then publish again." });
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        setSubmitting(true);
        try {
            const studio = await createStudio({
                title: form.title.trim(),
                category: form.category,
                hourlyRate: parseFloat(form.hourlyRate),
                securityDeposit: parseFloat(form.securityDeposit),
                maxCapacity: Number(form.maxCapacity),
                address: form.address.trim(),
                imageUrl: form.imageUrl.trim(),
                amenities: form.amenities,
                overview: form.overview.trim(),
                hostName: user?.name,
                hostEmail: user?.email,
            });
            setStatus({ kind: "ok", msg: "Studio published." });
            setForm(INITIAL);
            setImageFailed(false);
            window.localStorage.removeItem(DRAFT_KEY);
            router.push(`/studios/${studio.id}`);
        } catch (err) {
            if (err instanceof ApiError) {
                if (Object.keys(err.fields).length > 0) setErrors(err.fields);
                setStatus({ kind: "err", msg: err.message });
            } else {
                setStatus({ kind: "err", msg: "We couldn't publish your studio. Please try again." });
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="grid min-h-screen place-items-center bg-[#f7f5f1] text-sm text-[#7a776f]">
                Checking your account…
            </div>
        );
    }

    const money = formatMoney;


    


return (
    <main className="min-h-screen bg-[#f7f5f1] text-[#1b1b1a]">
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8">
            {/* Header */}
            <header className="mb-8">
                <p className="text-xs font-medium tracking-wide text-[#FF5A1F]">
                    Host workspace / New listing
                </p>
                <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                    Make room for possibility.
                </h1>
                <p className="mt-2 max-w-xl text-[15px] text-[#7a776f]">
                    Introduce your creative space to a world of people ready to make something great.
                </p>
            </header>

            {/* Status bar */}
            <div
                className={`mb-8 flex items-center gap-3 rounded-xl border px-4 py-3 text-xs ${status?.kind === "ok"
                        ? "border-green-300 bg-green-50 text-green-800"
                        : status?.kind === "err"
                            ? "border-red-300 bg-red-50 text-red-700"
                            : "border-[#e7e3db] bg-white text-[#7a776f]"
                    }`}
                role="status"
            >
                {status ? (
                    status.msg
                ) : (
                    <>
                        <span className="rounded-md bg-[#ffe9df] px-2 py-1 text-[10px] font-semibold text-[#FF5A1F]">
                            Draft
                        </span>
                        Fields marked * are required before publishing.
                    </>
                )}
            </div>

            <form onSubmit={handleSubmit} noValidate className="grid gap-8 lg:grid-cols-[1fr_300px]">
                <div className="space-y-6">
                    {/* 01 Essentials */}
                    <Section title="01 / The essentials" description="Give your space a name and tell creatives what it does best.">
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
                    <Section title="02 / Pricing, without surprises" description="You set the hourly rate. Guests see every cost before they book.">
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
                                ? `Example: ${example.hours} hours × ${money(parseFloat(form.hourlyRate))} = ${money(
                                    example.subtotal
                                )}. Guest service fee: ${money(example.fee)}. Guest total: ${money(example.total)}.`
                                : "Enter an hourly rate to preview what a 4-hour booking costs your guests."}
                        </div>
                    </Section>

                    {/* 03 Location */}
                    <Section title="03 / Put your space on the map" description="Your exact address is only shared with confirmed guests.">
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
                    <Section title="04 / Let your space speak" description="Lead with a wide, naturally lit view of your space.">
                        <Field label="Image URL" required error={errors.imageUrl}>
                            <input
                                type="url"
                                className={inputCls}
                                value={form.imageUrl}
                                onChange={(e) => {
                                    set("imageUrl", e.target.value);
                                    setImageFailed(false);
                                }}
                                placeholder="https://your-site.com/studio-photo.jpg"
                            />
                        </Field>
                        {form.imageUrl.trim() && (
                            <div className="overflow-hidden rounded-xl border border-[#e7e3db] bg-[#f0ece4]">
                                {imageFailed ? (
                                    <p className="px-4 py-10 text-center text-xs text-[#7a776f]">
                                        We couldn&apos;t load that image. Check the link and try again.
                                    </p>
                                ) : (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={form.imageUrl}
                                        alt="Studio cover preview"
                                        className="h-56 w-full object-cover"
                                        onError={() => setImageFailed(true)}
                                    />
                                )}
                                <p className="border-t border-[#e7e3db] bg-white px-3 py-2 text-[11px] text-[#7a776f]">
                                    Cover photo preview
                                </p>
                            </div>
                        )}
                    </Section>

                    {/* 05 Amenities */}
                    <Section title="05 / The little things that make a difference" description="Choose every amenity your guests can use, at no extra cost.">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                            {AMENITIES.map((a) => {
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
                                            className={`grid h-4 w-4 place-items-center rounded border text-[10px] leading-none text-white transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#FF5A1F]/40 ${on ? "border-[#FF5A1F] bg-[#FF5A1F]" : "border-[#cfcac0] bg-white"
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

                    {/* 06 Overview + host */}
                    <Section title="06 / Tell the story of your space" description="Be specific about the light, layout, equipment, and what makes your space special.">
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

                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block rounded-xl border border-[#e7e3db] bg-[#f3f0ea] px-4 pb-3 pt-3">
                                <span className="block text-[11px] font-medium text-[#6f6c66]">Host name</span>
                                <input readOnly value={user.name} className={`${inputCls} cursor-not-allowed text-[#6f6c66]`} />
                            </label>
                            <label className="block rounded-xl border border-[#e7e3db] bg-[#f3f0ea] px-4 pb-3 pt-3">
                                <span className="block text-[11px] font-medium text-[#6f6c66]">Host email</span>
                                <input readOnly value={user.email} className={`${inputCls} cursor-not-allowed text-[#6f6c66]`} />
                            </label>
                        </div>
                    </Section>

                    {/* Actions */}
                    <div className="grid gap-3 sm:grid-cols-[1fr_1.4fr]">
                        <button
                            type="button"
                            onClick={saveDraft}
                            className="rounded-xl border border-[#e7e3db] bg-white py-3.5 text-sm font-medium transition-colors hover:bg-[#f3f0ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/40"
                        >
                            Save draft
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-xl bg-[#FF5A1F] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#e84e15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/40 focus-visible:ring-offset-2 disabled:opacity-60"
                        >
                            {submitting ? "Publishing…" : "Publish studio"}
                        </button>
                    </div>
                    <p className="text-xs text-[#8f8c85]">
                        By publishing, you confirm you have permission to host at this address and agree to the
                        StudioSpace Host Terms.
                    </p>
                </div>

                {/* Sidebar */}
                <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
                    <div className="rounded-2xl bg-[#1c1b1a] p-6 text-white">
                        <h3 className="text-xl font-semibold leading-snug tracking-tight">
                            Your next chapter starts here.
                        </h3>
                        <p className="mt-3 text-[13px] leading-relaxed text-[#b9b5ad]">
                            Beautiful photos and honest details help the right creatives find you. Take a little
                            time now. Make a great first impression.
                        </p>
                        <ul className="mt-5 space-y-2.5 text-[13px] text-[#e8e5de]">
                            {[
                                ["Clear, memorable name", !!form.title.trim()],
                                ["Transparent hourly pricing", parseFloat(form.hourlyRate) > 0],
                                ["Accurate address", !!form.address.trim()],
                                ["A quality cover photo", !!form.imageUrl.trim() && !imageFailed],
                                ["Amenities & overview", form.amenities.length > 0 && form.overview.length >= 40],
                            ].map(([label, done]) => (
                                <li key={label as string} className="flex items-center gap-2">
                                    <span className={done ? "text-[#FF7A45]" : "text-[#6a665f]"}>✓</span>
                                    <span className={done ? "" : "text-[#b9b5ad]"}>{label as string}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-2xl border border-[#e7e3db] bg-white p-6">
                        <h3 className="text-lg font-semibold tracking-tight">A host, not alone.</h3>
                        <p className="mt-2 text-[13px] text-[#7a776f]">
                            Our team can help with your listing, pricing, or first booking.
                        </p>
                        <a
                            href="/support/hosts"
                            className="mt-4 inline-block text-[13px] font-medium text-[#FF5A1F] hover:underline"
                        >
                            Talk to host support ↗
                        </a>
                    </div>
                </aside>
            </form>
        </div>
    </main>
);
}
