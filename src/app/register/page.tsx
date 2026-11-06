import { Suspense } from "react";
import type { Metadata } from "next";
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a StudioSpace account to book creative studios or list your own space.",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-[60vh] place-items-center bg-ss-bg text-sm text-ss-muted">
          Loading…
        </main>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
