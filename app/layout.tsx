import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { AppChrome } from "@/components/AppChrome";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

// DM Sans (decyzja 2026-07-05, spójny z „Arco Warm"). next/font self-hostuje
// pliki przy buildzie — zero runtime'owych zapytań do Google. latin-ext = PL znaki.
const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

// Gambarino (decyzja 2026-07-11, roadmap.md) — WYŁĄCZNIE momenty (celebracja/PR/
// recap/trial/hero/landing), nigdy UI narzędzia. Self-host z vendor/ (licencja ITF
// FFL przez Fontshare, zweryfikowana — bez zależności od Adobe CC). Jeden statyczny
// plik (nie next/font/google) bo to font spoza Google Fonts — next/font/local i tak
// go subsetuje/self-hostuje przy buildzie tak samo jak DM Sans.
const gambarino = localFont({
  src: "../vendor/gambarino/Gambarino-Regular.woff2",
  variable: "--font-display",
  weight: "400",
  style: "normal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arco",
  description: "Osobista aplikacja do treningu siłowego, planów i śledzenia postępów.",
  applicationName: "Arco",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Arco" },
  other: { "apple-mobile-web-app-capable": "yes" },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F2ED" },
    { media: "(prefers-color-scheme: dark)", color: "#1E1C1A" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      {/* statusBarStyle="black-translucent" + viewportFit="cover" (wyżej) każą treści
          wchodzić pod notch/status bar w PWA standalone na iOS — pt-safe to koryguje,
          inaczej nagłówek nachodzi na zegar/ikony systemowe (zgłoszone 2026-07-07). */}
      <body
        className={cn(
          dmSans.variable,
          gambarino.variable,
          "min-h-dvh pt-[env(safe-area-inset-top)] font-sans antialiased",
        )}
      >
        <ThemeProvider>
          <AppChrome>{children}</AppChrome>
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
