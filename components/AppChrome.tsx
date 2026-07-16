"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { resolveAppChrome, type AppChromeConfig } from "@/lib/appChrome";
import { BottomNav } from "./BottomNav";
import { SessionMiniBar } from "./SessionMiniBar";
import { OfflineBanner } from "./OfflineBanner";
import {
  ScreenChromeContext,
  type ChromeOverrideRegistration,
} from "./navigation/ScreenChrome";
import { NavigationHistoryProvider } from "./navigation/NavigationHistory";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [override, setOverride] = useState<ChromeOverrideRegistration | null>(null);
  const [sessionMiniVisible, setSessionMiniVisible] = useState(false);

  const config: AppChromeConfig = useMemo(() => {
    if (override?.pathname === pathname) return override.config;
    return resolveAppChrome(pathname);
  }, [override, pathname]);

  const hasBottomNav = config.showBottomNav && config.activeTab !== null;
  const hasSessionMini = config.showSessionMiniBar && sessionMiniVisible;
  const paddingBottom = hasBottomNav
    ? hasSessionMini
      ? "calc(var(--floating-nav-height) + var(--session-mini-height) + var(--floating-nav-gap) + var(--floating-nav-gap) + var(--floating-nav-gap))"
      : "calc(var(--floating-nav-height) + var(--floating-nav-gap) + var(--floating-nav-gap))"
    : hasSessionMini
      ? "calc(var(--session-mini-height) + var(--floating-nav-gap) + var(--floating-nav-gap))"
      : undefined;

  return (
    <NavigationHistoryProvider>
      <ScreenChromeContext.Provider value={setOverride}>
        <OfflineBanner />
        <div style={{ paddingBottom }} data-screen-type={config.screenType}>
          {children}
        </div>
        {config.showSessionMiniBar ? (
          <SessionMiniBar
            position={config.miniBarPosition}
            onVisibilityChange={setSessionMiniVisible}
          />
        ) : null}
        {hasBottomNav ? <BottomNav activeTab={config.activeTab!} /> : null}
      </ScreenChromeContext.Provider>
    </NavigationHistoryProvider>
  );
}
