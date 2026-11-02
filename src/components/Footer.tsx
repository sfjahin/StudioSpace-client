import { ArrowUpRight } from "lucide-react";

const columns = [
  {
    heading: "Discover",
    links: [
      { label: "Photography studios", href: "/studios/photography" },
      { label: "Film & video spaces", href: "/studios/film-video" },
      { label: "Podcast studios", href: "/studios/podcast" },
      { label: "Music studios", href: "/studios/music" },
      { label: "Art & making", href: "/studios/art-making" },
    ],
  },
  {
    heading: "StudioSpace",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Become a host", href: "/become-a-host" },
      { label: "Our story", href: "/about" },
      { label: "Journal", href: "/journal" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    heading: "Here to help",
    links: [
      { label: "Help center", href: "/help" },
      { label: "Trust & safety", href: "/trust-safety" },
      { label: "Cancellation policy", href: "/cancellation-policy" },
      { label: "Contact us", href: "/contact" },
      { label: "hello@studiospace.co", href: "mailto:hello@studiospace.co" },
    ],
  },
];

const socials = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Vimeo", href: "https://vimeo.com" },
  { label: "Pinterest", href: "https://pinterest.com" },
];

export default function Footer() {
  return (
    <footer className="bg-[#1c1c1c]">
      <div className="mx-auto w-full max-w-7xl px-6 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <p className="text-xl font-bold tracking-tight text-white">
              StudioSpace<span className="text-brand">.</span>
            </p>
            <p className="mt-4 max-w-[240px] text-sm leading-relaxed text-zinc-400">
              Space for your next big idea. Book remarkable creative spaces, by
              the hour.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-zinc-300 transition-colors hover:text-white"
                >
                  {social.label}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.heading}>
              <h3 className="text-sm font-bold text-white">{column.heading}</h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-zinc-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 StudioSpace. Made for the makers.</p>
          <div className="flex flex-wrap gap-5">
            <a href="/privacy" className="transition-colors hover:text-white">
              Privacy policy
            </a>
            <a href="/terms" className="transition-colors hover:text-white">
              Terms of service
            </a>
            <span>USD $</span>
            <span>English</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
