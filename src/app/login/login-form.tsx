"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AuthShell from "@/components/AuthShell";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { authClient, syncAuthJwt } from "@/lib/auth-client";
import { safeNext } from "@/lib/redirect";

const fieldBox =
  "block rounded-xl border border-ss-line bg-ss-surface px-4 pb-3 pt-3 transition-colors focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20";
const fieldLabel = "block text-[11px] font-medium text-ss-muted";
const fieldInput =
  "mt-1 w-full bg-transparent text-[15px] text-ss-ink outline-none placeholder:text-ss-faint";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"), "/");

  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const { error: authError } = await authClient.signIn.email({
        email: email.trim(),
        password,
        rememberMe,
      });

      if (authError) {
        const message = authError.message ?? "That email and password don't match.";
        setError(message);
        toast.error(message);
        return;
      }

      // Exchange the Better Auth session for the HTTPOnly JWT used by
      // protected mutations (create studio, delete studio, create booking).
      if (!(await syncAuthJwt(true))) {
        const message = "We couldn't finish signing you in. Please try again.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Logged in successfully.");
      router.replace(next);
      router.refresh();
    } catch {
      const message = "We couldn't reach the server. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleForgotPassword() {
    toast.info("Password reset isn't available in this demo. Please register a new account or contact support.");
  }

  return (
    <AuthShell
      title="Login to StudioSpace"
      subtitle="Log in to book a studio, track your bookings, and manage your listings."
      image="/images/slide-1.jpg"
      quote="The right room changes everything. Find yours on StudioSpace."
      footer={
        <>
          New to StudioSpace?{" "}
          <Link
            href={`/register?next=${encodeURIComponent(next)}`}
            className="font-semibold text-brand hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <GoogleSignInButton next={next} />

        <div className="flex items-center gap-3 text-xs text-ss-muted">
          <span className="h-px flex-1 bg-ss-line" />
          or log in with email
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

          <div className={fieldBox}>
            <div className="flex items-center justify-between gap-3">
              <span className={fieldLabel}>Password</span>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] font-semibold text-brand hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <span className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
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
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ss-soft">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-4 accent-brand"
            />
            Keep me signed in
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting ? "Logging in…" : "Login"}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
