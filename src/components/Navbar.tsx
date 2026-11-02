import Image from "next/image";
import Link from "next/link";
import { Moon } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/", active: true },
  { label: "Explore studios", href: "/studios" },
  { label: "How it works", href: "/how-it-works" },
  { label: "About us", href: "/about" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-100 bg-[#fbfbfa]">
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/images/Brand mark.png"
            alt="StudioSpace logo"
            width={30}
            height={30}
            className="rounded-[8px]"
          />
          <span className="text-lg font-bold tracking-tight text-zinc-900">
            StudioSpace<span className="text-brand">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-sm transition-colors ${
                link.active
                  ? "text-brand font-bold"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <button
            type="button"
            aria-label="Toggle dark mode"
            className="text-zinc-500 transition-colors hover:text-zinc-900"
          >
            <Moon className="h-[18px] w-[18px]" />
          </button>
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-900"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#e64d25]"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}
