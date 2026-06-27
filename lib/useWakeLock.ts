import { useEffect } from "react";

/** Blokada wygaszania ekranu na czas treningu (Screen Wake Lock API).
 *  Re-akwizycja po powrocie do karty (lock pada przy ukryciu). No-op gdy brak API. */
export function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wl = (navigator as any).wakeLock;
    let sentinel: { release: () => Promise<void> } | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        sentinel = await wl.request("screen");
      } catch {
        /* odmowa / niewspierane — ignorujemy */
      }
    };
    acquire();

    const onVis = () => {
      if (document.visibilityState === "visible" && !cancelled) acquire();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
      sentinel?.release().catch(() => {});
    };
  }, [enabled]);
}
