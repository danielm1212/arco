"use client";

import { useState } from "react";
import type { LoggerExercise } from "./Logger";

/**
 * Stan przerwy między seriami + override długości per ćwiczenie (na czas sesji).
 * S9-cz.2 paczka 3: przeniesione 1:1 z Logger.tsx (bez zmiany zachowania).
 */
export function useRestTimer(defaultRest: number) {
  const [rest, setRest] = useState<{ endAt: number; label: string | null } | null>(null);
  // Override restu per ćwiczenie (na czas sesji)
  const [restOverride, setRestOverride] = useState<Record<string, number>>({});

  const restFor = (ex: LoggerExercise) =>
    restOverride[ex.sessionExerciseId] ?? ex.slot?.rest_seconds ?? defaultRest;

  // R6a (audyt-loggera.md §5): label opcjonalny — grupa supersetu podmienia go
  // na "Przerwa po supersecie" (patrz maybeStartRest w useSessionMutations).
  function startRest(ex: LoggerExercise, label?: string) {
    setRest({ endAt: Date.now() + restFor(ex) * 1000, label: label ?? ex.name });
  }

  const adjustRest = (ex: LoggerExercise, delta: number) =>
    setRestOverride((o) => ({
      ...o,
      [ex.sessionExerciseId]: Math.max(0, restFor(ex) + delta),
    }));

  const dismissRest = () => setRest(null);
  const extendRest = (s: number) =>
    setRest((r) => (r ? { ...r, endAt: r.endAt + s * 1000 } : r));

  return { rest, restFor, startRest, adjustRest, dismissRest, extendRest };
}
