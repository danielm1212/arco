"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { buildConfettiParticles, CONFETTI_LIFETIME_MS } from "@/lib/confetti";

/**
 * „Czy jesteśmy już po hydracji" — oficjalne API Reacta zamiast `setState`
 * w efekcie. Serwer dostaje `false`, klient po hydracji `true`, więc losowanie
 * cząstek nigdy nie trafia do renderu serwerowego i nie rozjeżdża hydracji.
 */
const subscribeNever = () => () => {};
function useHydrated() {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

/**
 * MOMENT-01 — wystrzał konfetti na done-screenie, gdy sesja przyniosła rekord.
 * Renderowany wyłącznie przy `hasPR`, więc bez rekordu kosztuje dokładnie zero.
 *
 * Dwie rzeczy, które muszą tu zostać:
 * 1. losowanie WYŁĄCZNIE w efekcie — komponent kliencki i tak jest SSR-owany,
 *    więc `Math.random()` w renderze rozjechałby hydrację;
 * 2. `prefers-reduced-motion` nie wycisza animacji, tylko w ogóle nie tworzy
 *    cząstek — nagłówek „Nowy rekord" niesie tę informację tekstowo, a warstwa
 *    jest `aria-hidden`, więc czytnik ekranu nic nie traci.
 */
export function PrConfetti() {
  const hydrated = useHydrated();
  const [expired, setExpired] = useState(false);

  const particles = useMemo(() => {
    if (!hydrated) return null;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
    return buildConfettiParticles();
  }, [hydrated]);

  useEffect(() => {
    if (!particles || expired) return;
    // Moment ma jawny koniec — po locie warstwa znika z DOM.
    const timeout = window.setTimeout(() => setExpired(true), CONFETTI_LIFETIME_MS);
    return () => window.clearTimeout(timeout);
  }, [particles, expired]);

  if (!particles || expired) return null;

  return (
    <div className="confetti-layer" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="confetti-x"
          style={
            {
              "--confetti-dx": `${p.dx}px`,
              "--confetti-dur": `${p.durationSeconds}s`,
              "--confetti-delay": `${p.delaySeconds}s`,
            } as React.CSSProperties
          }
        >
          <span
            className="confetti-y"
            style={
              {
                "--confetti-peak": `${p.peak}vh`,
                "--confetti-floor": `${p.floor}vh`,
                "--confetti-dur": `${p.durationSeconds}s`,
                "--confetti-delay": `${p.delaySeconds}s`,
              } as React.CSSProperties
            }
          >
            <i
              className="confetti-paper"
              style={
                {
                  "--confetti-color": `var(--confetti-${p.color})`,
                  "--confetti-w": `${p.widthPx}px`,
                  "--confetti-h": `${p.heightPx}px`,
                  "--confetti-spin": `${p.spinSeconds}s`,
                  "--confetti-iterations": `${p.spinIterations}`,
                  "--confetti-delay": `${p.delaySeconds}s`,
                  opacity: p.opacity,
                } as React.CSSProperties
              }
            />
          </span>
        </span>
      ))}
    </div>
  );
}
