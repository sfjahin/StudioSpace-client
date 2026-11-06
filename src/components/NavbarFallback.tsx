import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Explore Studios", href: "/studios" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About Us", href: "/about" },
];

/**
 * Static stand-in for <Navbar />. The real navbar reads `usePathname()` (URL
 * data), which suspends during prerendering, so this keeps the header shell in
 * the initial HTML without a layout shift.
 */
export default function NavbarFallback() {
  return (
    <header className="sticky top-0 z-50 border-b border-ss-line bg-ss-bg/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/images/Brand mark.png"
            alt="StudioSpace logo"
            width={30}
            height={30}
            className="rounded-[8px]"
          />
          <span className="text-lg font-bold tracking-tight text-ss-ink">
            StudioSpace<span className="text-brand">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-1 text-sm text-ss-muted transition-colors hover:text-ss-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <span className="size-9" aria-hidden />
          <div className="hidden items-center gap-4 sm:flex">
            <Link href="/login" className="text-sm font-medium text-ss-soft hover:text-ss-ink">
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
