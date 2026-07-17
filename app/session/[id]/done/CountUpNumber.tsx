"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Liczba-bohater celebracji nabija się od 0 do wartości (feedback [Ty],
 * 2026-07-17 — w miejsce zdjętej ikony 3D). Przy prefers-reduced-motion
 * wartość pojawia się od razu, bez animacji.
 */
export function CountUpNumber({ value, durationMs = 900 }: { value: number; durationMs?: number }) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const instant =
      value <= 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = instant ? 1 : Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return <>{display.toLocaleString("pl-PL")}</>;
}
