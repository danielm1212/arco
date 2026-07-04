"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";

/** Motyw apki: klasa `.dark` na <html>, 3-stan (light/dark/system).
 *  „Arco Warm" (2026-07-04): default JASNY; forced-dark loggera zawieszony. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}
