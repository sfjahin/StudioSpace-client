"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AuthShell from "@/components/AuthShell";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { authClient } from "@/lib/auth-client";
import { safeNext } from "@/lib/redirect";

const fieldBox =
  "block rounded-xl border border-ss-line bg-ss-surface px-4 pb-3 pt-3 transition-colors focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20";
const fieldLabel = "block text-[11px] font-medium text-ss-muted";
const fieldInput =
  "mt-1 w-full bg-transparent text-[15px] text-ss-ink outline-none placeholder:text-ss-faint";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/i;
const MIN_PASSWORD_LENGTH = 6;

const passwordRules = [
  {
    id: "uppercase",
    label: "At least one uppercase letter",
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: "lowercase",
    label: "At least one lowercase letter",
    test: (password: string) => /[a-z]/.test(password),
  },
  {
    id: "length",
    label: `At least ${MIN_PASSWORD_LENGTH} characters`,
    test: (password: string) => password.length >= MIN_PASSWORD_LENGTH,
  },
] as const;

export default function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"), "/");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const failedRule = passwordRules.find((rule) => !rule.test(password));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Enter your full name.");
      toast.error("Enter your full name.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address.");
      toast.error("Enter a valid email address.");
      return;
    }
    if (photoUrl.trim() && !URL_RE.test(photoUrl.trim())) {
      setError("Photo URL must start with http:// or https://.");
      toast.error("Photo URL must start with http:// or https://.");
      return;
    }
    if (failedRule) {
      const message = `Password must contain ${failedRule.label.toLowerCase()}.`;
      setError(message);
      toast.error(message);
      return;
    }

    setSubmitting(true);
    try {
      const { error: authError } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        image: photoUrl.trim() || undefined,
      });

      if (authError) {
        const message = authError.message ?? "We couldn't create your account. Please try again.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Registration successful. Please log in.");
      // better-auth signs new users in; end that session so registration lands on the login page.
      await authClient.signOut();
      const query = new URLSearchParams({ email: email.trim() });
      if (next !== "/") query.set("next", next);
      router.push(`/login?${query}`);
    } catch {
      const message = "We couldn't reach the server. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Registration"
      subtitle="Create an account to book inspiring spaces by the hour or list your own studio."
      image="/images/slide-2.jpg"
      quote="From first shoot to sold-out workshop — it starts with the right space."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="font-semibold text-brand hover:underline"
          >
            Login
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <GoogleSignInButton next="/" />

        <div className="flex items-center gap-3 text-xs text-ss-muted">
          <span className="h-px flex-1 bg-ss-line" />
          or register with email
          <span className="h-px flex-1 bg-ss-line" />
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <label className={fieldBox}>
            <span className={fieldLabel}>Name</span>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Maya Chen"
              className={fieldInput}
            />
          </label>

          <label className={fieldBox}>
            <span className={fieldLabel}>Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={fieldInput}
            />
          </label>

          <label className={fieldBox}>
            <span className={fieldLabel}>Photo URL</span>
            <input
              type="url"
              autoComplete="photo"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/your-photo.jpg"
              className={fieldInput}
            />
            <span className="mt-1 block text-[11px] text-ss-muted">
              Optional. Paste a direct link to your profile photo.
            </span>
          </label>

          <div className={fieldBox}>
            <span className={fieldLabel}>Password</span>
            <span className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className={`${fieldInput} pr-9`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-0 text-ss-muted transition-colors hover:text-ss-ink"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </span>

            <ul className="mt-2 space-y-1">
              {passwordRules.map((rule) => {
                const passed = rule.test(password);
                return (
                  <li
                    key={rule.id}
                    className={`flex items-center gap-1.5 text-[11px] ${
                      passed ? "text-green-600" : "text-ss-muted"
                    }`}
                  >
                    <Check
                      className={`size-3 ${passed ? "opacity-100" : "opacity-40"}`}
                      aria-hidden
                    />
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting ? "Registering…" : "Register"}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
