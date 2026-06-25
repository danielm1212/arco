"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";

/** Motyw apki: klasa `.dark` na <html>, 3-stan (light/dark/system), default ciemny.
 *  Logger ma własny wymuszony `.dark` (focus mode) niezależnie od tego wyboru. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}
