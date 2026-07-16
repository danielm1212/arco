"use client";

import { createContext, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import type { AppChromeConfig } from "@/lib/appChrome";

export interface ChromeOverrideRegistration {
  pathname: string;
  config: AppChromeConfig;
}

export const ScreenChromeContext = createContext<
  (registration: ChromeOverrideRegistration | null) => void
>(() => undefined);

/** Deklaracja dla ekranów, których trybu nie da się rozpoznać wyłącznie po URL. */
export function ScreenChrome({
  screenType,
  showBottomNav,
  activeTab,
  showSessionMiniBar,
  miniBarPosition,
}: AppChromeConfig) {
  const pathname = usePathname();
  const register = useContext(ScreenChromeContext);

  useEffect(() => {
    register({
      pathname,
      config: {
        screenType,
        showBottomNav,
        activeTab,
        showSessionMiniBar,
        miniBarPosition,
      },
    });
    return () => register(null);
  }, [activeTab, miniBarPosition, pathname, register, screenType, showBottomNav, showSessionMiniBar]);

  return null;
}
