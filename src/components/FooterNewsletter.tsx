"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";

export default function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // No backend yet — just acknowledge the signup.
    setSubscribed(true);
    setEmail("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 transition-colors focus-within:border-white/40">
        <label htmlFor="footer-newsletter-email" className="sr-only">
          Your email address
        </label>
        <input
          id="footer-newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourstudio.com"
          className="w-full min-w-0 border-0 bg-transparent p-0 text-sm text-white outline-none placeholder:text-zinc-500"
        />
        <button
          type="submit"
          aria-label="Subscribe to the newsletter"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand text-white transition-colors hover:bg-brand-dark"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <p
        className={`mt-3 text-xs leading-relaxed ${
          subscribed ? "text-brand" : "text-zinc-500"
        }`}
      >
        {subscribed
          ? "You're on the list — see you in your inbox."
          : "Monthly inspiration, new spaces, and no spam. Unsubscribe anytime."}
      </p>
    </form>
  );
}
