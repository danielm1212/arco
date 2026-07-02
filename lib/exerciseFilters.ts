import type { MovementPattern } from "@/lib/types";

/**
 * Jedno źródło prawdy dla filtrów pickera (partia / sprzęt / wzorzec).
 * Sprzężone z nazwami z `free-exercise-db` (jak `lib/muscleMap.ts`) — edytowalne przez właściciela.
 */

/** Partia → mięśnie `primary_muscles` (DB). Biceps/triceps świadomie osobno (decyzja właściciela).
 *  Przedramiona i traps wrzucone do „Plecy" (dzień pull) — zmień tu, jeśli wolisz inaczej.
 *  `neck` (8 szt.) celowo bez chipa — dostępne przez wyszukiwarkę. */
export const BODY_PART_GROUPS: { id: string; label: string; muscles: string[] }[] = [
  { id: "chest", label: "Klatka", muscles: ["chest"] },
  { id: "back", label: "Plecy", muscles: ["lats", "middle back", "lower back", "traps", "forearms"] },
  { id: "shoulders", label: "Barki", muscles: ["shoulders"] },
  { id: "biceps", label: "Biceps", muscles: ["biceps"] },
  { id: "triceps", label: "Triceps", muscles: ["triceps"] },
  { id: "legs", label: "Nogi", muscles: ["quadriceps", "hamstrings", "glutes", "calves", "adductors", "abductors"] },
  { id: "core", label: "Brzuch", muscles: ["abdominals"] },
];

/** Sprzęt → wartości `equipment` (DB). Dumbbell-first (CLAUDE.md): główne na wierzchu, drobne pod „więcej". */
export const EQUIPMENT_GROUPS: { id: string; label: string; values: string[]; primary: boolean }[] = [
  { id: "dumbbell", label: "Hantle", values: ["dumbbell"], primary: true },
  { id: "barbell", label: "Sztanga", values: ["barbell", "e-z curl bar"], primary: true },
  { id: "cable", label: "Wyciąg", values: ["cable"], primary: true },
  { id: "machine", label: "Maszyna", values: ["machine"], primary: true },
  { id: "kettlebell", label: "Kettlebell", values: ["kettlebells"], primary: true },
  { id: "bands", label: "Gumy", values: ["bands"], primary: true },
  { id: "bodyweight", label: "Masa ciała", values: ["body only"], primary: true },
  { id: "ball", label: "Piłka", values: ["exercise ball", "medicine ball"], primary: false },
  { id: "other", label: "Inne", values: ["other", "foam roll"], primary: false },
];

/** Wzorzec ruchu → etykieta PL. `carry`/`lunge` rzadkie, ale tanie do pokazania. */
export const MOVEMENT_PATTERNS: { id: MovementPattern; label: string }[] = [
  { id: "push", label: "Pchanie" },
  { id: "pull", label: "Ciągnięcie" },
  { id: "squat", label: "Przysiad" },
  { id: "hinge", label: "Zawias" },
  { id: "lunge", label: "Wykrok" },
  { id: "core", label: "Core" },
  { id: "carry", label: "Przenoszenie" },
];

/** Pojedyncze mięśnie DB → etykieta PL (formularz własnego ćwiczenia). */
export const MUSCLE_OPTIONS: { id: string; label: string }[] = [
  { id: "chest", label: "Klatka" },
  { id: "shoulders", label: "Barki" },
  { id: "biceps", label: "Biceps" },
  { id: "triceps", label: "Triceps" },
  { id: "forearms", label: "Przedramiona" },
  { id: "lats", label: "Najszersze (lats)" },
  { id: "middle back", label: "Środek pleców" },
  { id: "lower back", label: "Dolny odcinek pleców" },
  { id: "traps", label: "Kaptury" },
  { id: "abdominals", label: "Brzuch" },
  { id: "quadriceps", label: "Czworogłowe" },
  { id: "hamstrings", label: "Dwugłowe uda" },
  { id: "glutes", label: "Pośladki" },
  { id: "calves", label: "Łydki" },
  { id: "adductors", label: "Przywodziciele" },
  { id: "abductors", label: "Odwodziciele" },
  { id: "neck", label: "Kark" },
];

/** Pojedyncze wartości `equipment` DB → etykieta PL (formularz własnego ćwiczenia). */
export const EQUIPMENT_DB_OPTIONS: { id: string; label: string }[] = [
  { id: "dumbbell", label: "Hantle" },
  { id: "barbell", label: "Sztanga" },
  { id: "cable", label: "Wyciąg" },
  { id: "machine", label: "Maszyna" },
  { id: "kettlebells", label: "Kettlebell" },
  { id: "bands", label: "Gumy" },
  { id: "body only", label: "Masa ciała" },
  { id: "other", label: "Inne" },
];

/** Suma `primary_muscles` z wybranych partii (union → semantyka OR w `.overlaps`). */
export function musclesForBodyParts(ids: string[]): string[] {
  const out = new Set<string>();
  for (const g of BODY_PART_GROUPS) if (ids.includes(g.id)) g.muscles.forEach((m) => out.add(m));
  return [...out];
}

/** Suma wartości `equipment` z wybranych grup sprzętu (union → `.in`). */
export function equipmentForGroups(ids: string[]): string[] {
  const out = new Set<string>();
  for (const g of EQUIPMENT_GROUPS) if (ids.includes(g.id)) g.values.forEach((v) => out.add(v));
  return [...out];
}
