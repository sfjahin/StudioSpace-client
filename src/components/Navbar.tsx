"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, LayoutDashboard, LogOut, Menu, Moon, PlusCircle, Sun, X, CalendarCheck, Building2 } from "lucide-react";
import { useAuth, authClient } from "@/lib/auth-client";
import { useTheme } from "@/components/ThemeProvider";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Explore Studios", href: "/studios" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About Us", href: "/about" },
];

const menuLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Add New Studio", href: "/add-studio", icon: PlusCircle },
  { label: "My Studio Listings", href: "/my-listings", icon: Building2 },
  { label: "My Bookings", href: "/my-bookings", icon: CalendarCheck },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  // Store the path each menu was opened on, so navigating closes them without an effect.
  const [menuAt, setMenuAt] = useState<string | null>(null);
  const [mobileAt, setMobileAt] = useState<string | null>(null);
  const menuOpen = menuAt === pathname;
  const mobileOpen = mobileAt === pathname;
  const setMenuOpen = (v: boolean | ((o: boolean) => boolean)) =>
    setMenuAt((cur) => ((typeof v === "function" ? v(cur === pathname) : v) ? pathname : null));
  const setMobileOpen = (v: boolean | ((o: boolean) => boolean)) =>
    setMobileAt((cur) => ((typeof v === "function" ? v(cur === pathname) : v) ? pathname : null));
  const menuRef = useRef<HTMLDivElement>(null);

  async function handleLogout() {
    setMenuOpen(false);
    try {
      const { error } = await authClient.signOut();
      if (error) {
        toast.error(error.message ?? "We couldn't log you out. Please try again.");
        return;
      }
      toast.success("You've been logged out.");
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("We couldn't log you out. Please try again.");
    }
  }

  // Close the profile menu on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuAt(null);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

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
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`relative py-1 text-sm transition-colors ${
                isActive(link.href)
                  ? "font-bold text-brand after:absolute after:inset-x-0 after:-bottom-[23px] after:h-0.5 after:bg-brand"
                  : "text-ss-muted hover:text-ss-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="rounded-full p-2 text-ss-muted transition-colors hover:bg-ss-hover hover:text-ss-ink"
          >
            {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>

          {user ? (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded-full border border-ss-line bg-ss-surface py-1 pl-1 pr-2.5 transition-colors hover:bg-ss-hover"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                  {initials(user.name)}
                </span>
                <ChevronDown className="size-4 text-ss-muted" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-ss-line bg-ss-surface shadow-xl"
                >
                  <div className="border-b border-ss-line px-4 py-3">
                    <p className="text-sm font-semibold text-ss-ink">{user.name}</p>
                    <p className="truncate text-xs text-ss-muted">{user.email}</p>
                  </div>
                  {menuLinks.map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      role="menuitem"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-ss-ink transition-colors hover:bg-ss-hover"
                    >
                      <Icon className="size-4 text-ss-muted" />
                      {label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 border-t border-ss-line px-4 py-2.5 text-left text-sm text-ss-ink transition-colors hover:bg-ss-hover"
                  >
                    <LogOut className="size-4 text-ss-muted" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
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
          )}

          <button
            type="button"
            className="rounded-md p-2 text-ss-ink md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-ss-line bg-ss-bg px-6 py-3 md:hidden" aria-label="Mobile">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-3 py-3 text-sm ${
                isActive(link.href) ? "bg-ss-hover font-bold text-brand" : "text-ss-soft"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <div className="mt-2 grid grid-cols-2 gap-3 border-t border-ss-line pt-3">
              <Link
                href="/login"
                className="rounded-lg border border-ss-line px-4 py-3 text-center text-sm font-medium text-ss-ink"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand px-4 py-3 text-center text-sm font-medium text-white"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
