"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";

/** Pokazuje bottom-nav na ekranach-hubach; chowa w loggerze, loginie i spike'u (tryb skupienia). */
export function AppChrome({ children }: { children: React.ReactNode }) {
  const p = usePathname();
  const hide = p === "/login" || p.startsWith("/session") || p.startsWith("/spike");
  return (
    <>
      <div className={hide ? "" : "pb-16"}>{children}</div>
      {!hide && <BottomNav />}
    </>
  );
}
