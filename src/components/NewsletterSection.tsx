"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // No backend yet — just acknowledge the signup.
    setSubscribed(true);
    setEmail("");
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-16">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-950">
            A little space for inspiration.
          </h2>
          <p className="mt-3 text-sm text-zinc-500 sm:text-base">
            Fresh spaces, creative stories, and a few good ideas. In your inbox,
            monthly.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate={false}>
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
              <label
                htmlFor="newsletter-email"
                className="block text-xs text-zinc-500"
              >
                Your email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourstudio.com"
                className="mt-0.5 w-full border-0 bg-transparent p-0 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
              />
            </div>
            <button
              type="submit"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#e64d25]"
            >
              Count me in
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <p
            className={`mt-2 text-xs ${
              subscribed ? "text-brand" : "text-zinc-400"
            }`}
          >
            {subscribed
              ? "You're on the list — see you in your inbox."
              : "By subscribing, you agree to our Privacy Policy. Unsubscribe anytime."}
          </p>
        </form>
      </div>
    </section>
  );
}
