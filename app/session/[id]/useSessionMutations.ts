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
import { ensureOnline } from "@/lib/offlineGuard";
import { vibrate } from "@/lib/feedback";
import { uuid } from "@/lib/uuid";
import type { LoggerExercise } from "./Logger";

const SAVE_ERR = "Nie udało się zapisać. Sprawdź internet i spróbuj ponownie.";

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
  allowRest,
}: {
  sessionId: string;
  setExercises: Dispatch<SetStateAction<LoggerExercise[]>>;
  exercisesRef: MutableRefObject<LoggerExercise[]>;
  saveSet: (s: SessionSet, patch?: Partial<SessionSet>) => void;
  removeSet: (setId: string) => void;
  startRest: (ex: LoggerExercise, label?: string) => void;
  /** W trybie edycji historii nie uruchamiamy timera przerw. */
  allowRest: boolean;
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

  // R6a (audyt-loggera.md §5): superset ma świadomą przerwę — jeśli partner w
  // grupie ma jeszcze niezaliczoną serię TEJ rundy, przerwa NIE startuje (sedno
  // metody: A→od razu B), zamiast tego mikro-hint kto teraz. Przerwa odpala się
  // dopiero po ostatnim ogniwie rundy, z labelem "Przerwa po supersecie".
  function maybeStartRest(ex: LoggerExercise) {
    if (!allowRest) return;
    if (!getAutoRest()) return;
    if (ex.supersetGroup == null) {
      startRest(ex);
      return;
    }
    const partners = exercisesRef.current.filter(
      (e) => e.supersetGroup === ex.supersetGroup && e.sessionExerciseId !== ex.sessionExerciseId,
    );
    const curDone = ex.sets.filter((s) => s.completed).length + 1;
    const behind = partners.find(
      (p) =>
        p.sets.some((s) => !s.completed) &&
        p.sets.filter((s) => s.completed).length < curDone,
    );
    if (behind) {
      toast(`→ teraz: ${behind.name}`);
      return;
    }
    startRest(ex, "Przerwa po supersecie");
  }

  function handleToggle(ex: LoggerExercise, set: SessionSet) {
    const next = !set.completed;
    patchSetLocal(ex.sessionExerciseId, set.id, { completed: next });
    if (next) maybeStartRest(ex);
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
    if (!set.completed) maybeStartRest(ex);
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
    if (!ensureOnline(skipped ? "pominięcie ćwiczenia" : "przywrócenie ćwiczenia")) return; // S10
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

  // R6b (audyt-loggera.md §5): łączenie kierunko-agnostyczne — "Połącz w superset"
  // działa z DOWOLNYM partnerem (nie tylko poprzednim), ta sama ścieżka dołącza
  // do już istniejącej grupy z dowolnej strony (giant sety 3+ zostają możliwe).
  function linkWithPartner(i: number, partnerIndex: number) {
    const list = exercisesRef.current;
    const cur = list[i];
    const partner = list[partnerIndex];
    if (!cur || !partner) return;
    if (partner.supersetGroup != null) {
      setGroups([{ id: cur.sessionExerciseId, group: partner.supersetGroup }]);
    } else if (cur.supersetGroup != null) {
      setGroups([{ id: partner.sessionExerciseId, group: cur.supersetGroup }]);
    } else {
      const g = Math.max(0, ...list.map((e) => e.supersetGroup ?? 0)) + 1;
      setGroups([
        { id: cur.sessionExerciseId, group: g },
        { id: partner.sessionExerciseId, group: g },
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
    linkWithPartner,
    unlink,
  };
}
