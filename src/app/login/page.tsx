import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your StudioSpace account to book studios or manage your listings.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-[60vh] place-items-center bg-ss-bg text-sm text-ss-muted">
          Loading…
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
