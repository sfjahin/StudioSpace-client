import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  image: string;
  quote: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

/** Split-screen shell shared by the login and sign-up pages. */
export default function AuthShell({ title, subtitle, image, quote, children, footer }: Props) {
  return (
    <main className="flex-1 bg-ss-bg">
      <div className="mx-auto grid w-full max-w-7xl lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:min-h-[calc(100vh-72px)] lg:px-16">
          <div className="mx-auto w-full max-w-md">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-ss-muted transition-colors hover:text-ss-ink"
            >
              <ArrowLeft className="size-4" />
              Back to studios
            </Link>

            <h1 className="mt-8 text-4xl font-bold tracking-tight text-ss-ink">{title}</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-ss-muted">{subtitle}</p>

            <div className="mt-8">{children}</div>

            <p className="mt-8 text-sm text-ss-muted">{footer}</p>
          </div>
        </div>

        <div className="relative hidden p-5 lg:block">
          <div className="relative h-full min-h-[560px] overflow-hidden rounded-3xl">
            <Image
              src={image}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 0px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                StudioSpace
              </p>
              <p className="mt-3 max-w-sm text-xl font-semibold leading-snug tracking-tight">
                {quote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
