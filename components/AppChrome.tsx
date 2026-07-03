"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";
import { SessionMiniBar } from "./SessionMiniBar";

/** Pokazuje bottom-nav na ekranach-hubach; chowa w loggerze, loginie i spike'u (tryb skupienia).
 *  S12: nad nawigacją mini-bar „Trening w toku", gdy jest otwarta sesja. */
export function AppChrome({ children }: { children: React.ReactNode }) {
  const p = usePathname();
  const hide = p === "/login" || p.startsWith("/session") || p.startsWith("/spike");
  return (
    <>
      <div className={hide ? "" : "pb-28"}>{children}</div>
      {!hide && <SessionMiniBar />}
      {!hide && <BottomNav />}
    </>
  );
}
