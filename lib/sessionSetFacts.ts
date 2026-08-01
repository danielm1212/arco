import type { SessionSet } from "@/lib/types";

type SetFact = Pick<SessionSet, "completed" | "set_type">;

export function isCompletedWorkingSet(set: SetFact) {
  return set.completed && set.set_type === "working";
}

export function isIncompleteWorkingSet(set: SetFact) {
  return !set.completed && set.set_type === "working";
}

/** Minimum potrzebne do policzenia objętości — celowo węższe niż `SessionSet`,
 *  żeby dało się to wołać na wąskich selectach z `/postępy` i Home. */
type VolumeFact = Pick<SessionSet, "weight" | "reps" | "added_weight">;

/**
 * AUDIT-A3 (audyt 2026-07-31): jedyne miejsce, w którym liczymy objętość serii.
 *
 * Było sześć kopii wzoru `weight * reps` (`progress/stats.ts`, `homePeriods.ts`,
 * `Logger.tsx`, `history/[id]`, `done`, `exercise/[id]`) i **żadna nie znała
 * `added_weight`**. Kolumna istnieje od `init_schema.sql:120`, logger ma dla niej
 * pole („Dodatkowy ciężar"), a mimo to podciąganie z +20 kg wnosiło ZERO do tonażu
 * na Home, `/postępy`, ekranie Done i w Historii.
 *
 * `weight` i `added_weight` wykluczają się w UI (`SetRow` pokazuje albo ciężar,
 * albo dociążenie — zależnie od typu ćwiczenia), ale sumujemy oba zamiast wybierać,
 * żeby wynik nie zależał od tego, która gałąź formularza akurat zapisała wartość.
 *
 * **Czego świadomie NIE liczymy:** masy ciała. Ćwiczenie z masą własną bez
 * dociążenia dalej daje 0 — nie znamy wagi użytkownika w momencie serii, a
 * doszacowanie z ostatniego pomiaru z `/ciało` zmieniałoby historyczny tonaż przy
 * każdym ważeniu. To jest decyzja, nie przeoczenie.
 */
export function setVolumeKg(set: VolumeFact): number {
  if (set.reps == null || set.reps <= 0) return 0;
  const load = (set.weight ?? 0) + (set.added_weight ?? 0);
  return load > 0 ? load * set.reps : 0;
}

/** Suma objętości (kg) po seriach. Wywołujący filtruje, co się liczy
 *  (`isCompletedWorkingSet` albo własny warunek okna czasowego). */
export function sumVolumeKg(sets: VolumeFact[]): number {
  return sets.reduce((total, set) => total + setVolumeKg(set), 0);
}
