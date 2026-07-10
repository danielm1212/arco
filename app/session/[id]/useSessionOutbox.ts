"use client";

import { useSync } from "@/lib/useSync";
import type { SessionSet } from "@/lib/types";
import type { OutboxSetRow } from "@/lib/outbox";

/**
 * Integracja loggera z outboxem: serializacja wiersza serii + kolejkowanie
 * upsert/delete dla bieżącej sesji. S9-cz.2 paczka 3 — wydzielone z Logger.tsx
 * (grunt pod S10: offline correctness będzie dotykać tylko tego pliku i lib/outbox).
 * Callbacki z useSync są stabilne (useCallback) — bezpieczne dla memo niżej.
 */
export function useSessionOutbox(sessionId: string) {
  const { online, pending, syncing, queueUpsert, queueDelete, flush } = useSync();

  function toRow(s: SessionSet): OutboxSetRow {
    return {
      id: s.id,
      session_exercise_id: s.session_exercise_id,
      set_index: s.set_index,
      set_type: s.set_type,
      weight: s.weight,
      reps: s.reps,
      duration_seconds: s.duration_seconds,
      added_weight: s.added_weight,
      rpe: s.rpe,
      completed: s.completed,
    };
  }

  /** Zakolejkuj zapis serii (opcjonalnie z nakładką zmian — jeden pełny wiersz). */
  const saveSet = (s: SessionSet, patch: Partial<SessionSet> = {}) =>
    queueUpsert(sessionId, toRow({ ...s, ...patch }));

  const removeSet = (setId: string) => queueDelete(sessionId, setId);

  return { online, pending, syncing, flush, saveSet, removeSet };
}
