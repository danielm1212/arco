"use client";

import { useRef, useState, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import { toast } from "sonner";
import {
  deleteSessionExercise,
  setSessionExerciseSkipped,
  setSupersetGroups,
  updateSessionExerciseNotes,
} from "@/app/actions/sets";
import type { SessionSet, SetType } from "@/lib/types";
import { getAutoRest } from "@/lib/prefs";
import { vibrate } from "@/lib/feedback";
import { uuid } from "@/lib/uuid";
import type { LoggerExercise } from "./Logger";

const SAVE_ERR = "Nie zapisano — sprawdź połączenie i spróbuj ponownie.";

/**
 * Handlery mutacji sesji (serie / notatki / pomiń / superset) — S9-cz.2 paczka 3:
 * przeniesione 1:1 z Logger.tsx.
 *
 * ⚠️ INWARIANT (memo w ExerciseCard/SetRow pomija funkcje w komparatorze):
 * handler NIE czyta stanu ze swojego domknięcia — wyłącznie funkcyjne setState,
 * `exercisesRef.current` albo argumenty (ex/set/id).
 */
export function useSessionMutations({
  sessionId,
  setExercises,
  exercisesRef,
  saveSet,
  removeSet,
  startRest,
}: {
  sessionId: string;
  setExercises: Dispatch<SetStateAction<LoggerExercise[]>>;
  exercisesRef: MutableRefObject<LoggerExercise[]>;
  saveSet: (s: SessionSet, patch?: Partial<SessionSet>) => void;
  removeSet: (setId: string) => void;
  startRest: (ex: LoggerExercise) => void;
}) {
  // S12: serie, które pobiły rep-PR w tej sesji (badge „PR" na wierszu)
  const [prSets, setPrSets] = useState<Record<string, boolean>>({});
  // Lokalna kopia rekordów — po pobiciu podbijamy, żeby 2. taka sama seria nie świeciła znowu
  const repPRLocal = useRef<Record<string, Record<number, number>>>({});

  function patchSetLocal(seId: string, setId: string, patch: Partial<SessionSet>) {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.sessionExerciseId !== seId
          ? ex
          : { ...ex, sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) },
      ),
    );
  }

  function persistNotes(seId: string, notes: string) {
    setExercises((prev) =>
      prev.map((ex) => (ex.sessionExerciseId === seId ? { ...ex, notes } : ex)),
    );
    updateSessionExerciseNotes(sessionId, seId, notes).catch(() => toast.error(SAVE_ERR));
  }

  async function handleAddSet(ex: LoggerExercise) {
    const last = ex.sets[ex.sets.length - 1];
    const seed = last
      ? {
          weight: last.weight,
          reps: last.reps,
          duration_seconds: last.duration_seconds,
          added_weight: last.added_weight,
          set_type: last.set_type,
        }
      : {
          weight: ex.previous?.weight ?? null,
          reps: ex.previous?.reps ?? null,
          duration_seconds: ex.previous?.duration_seconds ?? null,
          added_weight: ex.previous?.added_weight ?? null,
        };
    // UUID po stronie klienta → operacja odtwarzalna offline (idempotentny upsert)
    const newSet: SessionSet = {
      id: uuid(),
      session_exercise_id: ex.sessionExerciseId,
      set_index: ex.sets.reduce((m, s) => Math.max(m, s.set_index), -1) + 1,
      set_type: (seed.set_type as SetType) ?? "working",
      weight: seed.weight ?? null,
      reps: seed.reps ?? null,
      duration_seconds: seed.duration_seconds ?? null,
      added_weight: seed.added_weight ?? null,
      rpe: null,
      completed: false,
    };
    setExercises((prev) =>
      prev.map((e) =>
        e.sessionExerciseId === ex.sessionExerciseId ? { ...e, sets: [...e.sets, newSet] } : e,
      ),
    );
    saveSet(newSet);
  }

  function handleToggle(ex: LoggerExercise, set: SessionSet) {
    const next = !set.completed;
    patchSetLocal(ex.sessionExerciseId, set.id, { completed: next });
    if (next && getAutoRest()) startRest(ex);
    // S12: mikro-celebracja rep-PR — w momencie zaliczenia, nie na ekranie końcowym
    if (
      next &&
      ex.type === "weighted" &&
      set.set_type === "working" &&
      set.weight != null &&
      set.reps != null
    ) {
      const local = (repPRLocal.current[ex.exerciseId] ??= { ...ex.repPRs });
      const best = local[set.reps] ?? 0;
      if (best > 0 && set.weight > best) {
        local[set.reps] = set.weight;
        setPrSets((p) => ({ ...p, [set.id]: true }));
        vibrate([80, 40, 80]); // krótszy niż koniec przerwy; no-op bez HTTPS
      }
    }
    saveSet(set, { completed: next });
  }

  // Stoper `timed`: atomowy zapis czasu + zaliczenie (jeden upsert, bez wyścigu patch/toggle).
  function handleTimedComplete(ex: LoggerExercise, set: SessionSet, seconds: number) {
    patchSetLocal(ex.sessionExerciseId, set.id, { duration_seconds: seconds, completed: true });
    if (!set.completed && getAutoRest()) startRest(ex);
    saveSet(set, { duration_seconds: seconds, completed: true });
  }

  function persistSet(setId: string, patch: Partial<SessionSet>) {
    for (const ex of exercisesRef.current) {
      const s = ex.sets.find((x) => x.id === setId);
      if (s) {
        saveSet(s, patch);
        return;
      }
    }
  }

  function handleDeleteSet(seId: string, setId: string) {
    const ex = exercisesRef.current.find((e) => e.sessionExerciseId === seId);
    const idx = ex ? ex.sets.findIndex((s) => s.id === setId) : -1;
    const removed = idx >= 0 ? ex!.sets[idx] : null;
    setExercises((prev) =>
      prev.map((e) =>
        e.sessionExerciseId !== seId
          ? e
          : { ...e, sets: e.sets.filter((s) => s.id !== setId) },
      ),
    );
    removeSet(setId);
    if (removed) {
      toast("Seria usunięta", {
        action: {
          label: "Cofnij",
          onClick: () => {
            setExercises((prev) =>
              prev.map((e) => {
                if (e.sessionExerciseId !== seId) return e;
                const sets = [...e.sets];
                sets.splice(Math.min(idx, sets.length), 0, removed);
                return { ...e, sets };
              }),
            );
            saveSet(removed);
          },
        },
      });
    }
  }

  async function handleDeleteExercise(seId: string) {
    const snapshot = exercisesRef.current;
    setExercises((prev) => prev.filter((ex) => ex.sessionExerciseId !== seId));
    try {
      await deleteSessionExercise(sessionId, seId);
    } catch {
      setExercises(snapshot); // revert
      toast.error(SAVE_ERR);
    }
  }

  // „Pomiń"/„Przywróć" ćwiczenie z programu — zostaje slot, nie usuwamy wiersza
  async function handleSkip(seId: string, skipped: boolean) {
    const snapshot = exercisesRef.current;
    setExercises((prev) =>
      prev.map((ex) => (ex.sessionExerciseId === seId ? { ...ex, skipped } : ex)),
    );
    try {
      await setSessionExerciseSkipped(sessionId, seId, skipped);
    } catch {
      setExercises(snapshot);
      toast.error(SAVE_ERR);
    }
  }

  async function setGroups(updates: { id: string; group: number | null }[]) {
    const snapshot = exercisesRef.current;
    setExercises((prev) =>
      prev.map((ex) => {
        const u = updates.find((x) => x.id === ex.sessionExerciseId);
        return u ? { ...ex, supersetGroup: u.group } : ex;
      }),
    );
    try {
      await setSupersetGroups(sessionId, updates);
    } catch {
      setExercises(snapshot);
      toast.error(SAVE_ERR);
    }
  }

  function linkWithPrevious(i: number) {
    if (i <= 0) return;
    const list = exercisesRef.current;
    const prev = list[i - 1];
    const cur = list[i];
    if (prev.supersetGroup != null) {
      setGroups([{ id: cur.sessionExerciseId, group: prev.supersetGroup }]);
    } else {
      const g = Math.max(0, ...list.map((e) => e.supersetGroup ?? 0)) + 1;
      setGroups([
        { id: prev.sessionExerciseId, group: g },
        { id: cur.sessionExerciseId, group: g },
      ]);
    }
  }

  function unlink(i: number) {
    const list = exercisesRef.current;
    const cur = list[i];
    const g = cur.supersetGroup;
    const updates: { id: string; group: number | null }[] = [
      { id: cur.sessionExerciseId, group: null },
    ];
    if (g != null) {
      const others = list.filter(
        (e) => e.supersetGroup === g && e.sessionExerciseId !== cur.sessionExerciseId,
      );
      if (others.length === 1) updates.push({ id: others[0].sessionExerciseId, group: null });
    }
    setGroups(updates);
  }

  return {
    prSets,
    patchSetLocal,
    persistNotes,
    handleAddSet,
    handleToggle,
    handleTimedComplete,
    persistSet,
    handleDeleteSet,
    handleDeleteExercise,
    handleSkip,
    linkWithPrevious,
    unlink,
  };
}
