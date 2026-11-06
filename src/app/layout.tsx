import type { Metadata } from "next";
import { Suspense } from "react";
import { Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import NavbarFallback from "@/components/NavbarFallback";
import Footer from "@/components/Footer";
import ToastProvider from "@/components/ToastProvider";
import ThemeProvider, { themeInitScript } from "@/components/ThemeProvider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "StudioSpace — Book creative studios by the hour",
    template: "%s | StudioSpace",
  },
  description:
    "StudioSpace is a peer-to-peer marketplace for photo studios, film stages, podcast lounges and music suites. Discover, compare and book creative spaces by the hour.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-ss-bg text-ss-ink">
        <ThemeProvider>
          <Suspense fallback={<NavbarFallback />}>
            <Navbar />
          </Suspense>
          {children}
          <Footer />
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
