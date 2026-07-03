import type { ExerciseType, UnitSystem } from "@/lib/types";

/**
 * Guidance rule-based (rdzeń wyróżnika „anti-Hevy") — jawne, nadpisywalne reguły.
 * NIE „AI auto-programming". Każda flaga to podpowiedź (nie blokada), do zignorowania.
 * Wszystkie progi tutaj jako nazwane stałe (zero magic numbers) — profil „standardowy".
 * Per-user kalibracja progów = późniejsza warstwa. Deload = osobna faza (patrz roadmap S5).
 */

export type GuidanceKind = "progression" | "balance" | "staleness" | "deload";

export interface GuidanceItem {
  id: string;
  kind: GuidanceKind;
  severity: "info" | "warn";
  message: string;
}

/** Progi profilu „standardowego" (decyzja właściciela 2026-06). */
export const GUIDANCE = {
  /** Flaga balansu, gdy słabsza grupa ma < tego ułamka serii silniejszej. */
  balanceRatio: 0.6,
  /** Balans liczymy dopiero, gdy silniejsza grupa ma ≥ tyle serii (anti-noise na starcie tygodnia). */
  balanceMinSets: 4,
  /** Partia „zwietrzała", gdy nietrenowana ≥ tylu dni (a była trenowana wcześniej). */
  stalenessDays: 8,
  /** Deload: stagnacja, gdy metryka nie wzrosła przez tyle kolejnych sesji ćwiczenia. */
  deloadSessions: 3,
  /** Ile flag max na home (reszta zostaje na /progress). */
  maxHomeFlags: 2,
} as const;

export type MuscleCategory = "push" | "pull" | "legs" | "core";

/** Mięsień `primary_muscles` (free-exercise-db) → kategoria ruchu. Edytowalne (jak `muscleMap`). */
export const MUSCLE_CATEGORY: Record<string, MuscleCategory> = {
  chest: "push",
  shoulders: "push",
  triceps: "push",
  lats: "pull",
  "middle back": "pull",
  traps: "pull",
  biceps: "pull",
  forearms: "pull",
  quadriceps: "legs",
  hamstrings: "legs",
  glutes: "legs",
  calves: "legs",
  adductors: "legs",
  abductors: "legs",
  abdominals: "core",
  "lower back": "core",
  // neck — celowo bez kategorii
};

const CATEGORY_LABEL: Record<MuscleCategory, string> = {
  push: "push",
  pull: "pull",
  legs: "nogi",
  core: "core",
};

/**
 * Korekty kategorii per ćwiczenie — gdy `primary_muscles` daje złą kategorię balansu.
 * (Patrz `docs/audyt-fbw.md` §4.) Override ZASTĘPUJE kategorię z mięśni.
 * Dwie rodziny błędów w free-exercise-db:
 *  - rear delt / face pull: `primary = shoulders` (→push), a to realnie PULL,
 *  - deadlift / good morning / rack pull: `primary = "lower back"` (→core), a to LEGS/hinge.
 */
export const EXERCISE_CATEGORY_OVERRIDE: Record<string, MuscleCategory> = {
  // rear delt / face pull → pull
  Barbell_Rear_Delt_Row: "pull",
  Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench: "pull",
  Cable_Rear_Delt_Fly: "pull",
  "Cable_Rope_Rear-Delt_Rows": "pull",
  "Dumbbell_Lying_One-Arm_Rear_Lateral_Raise": "pull",
  Dumbbell_Lying_Rear_Lateral_Raise: "pull",
  Face_Pull: "pull",
  Lying_Rear_Delt_Raise: "pull",
  Reverse_Flyes: "pull",
  Reverse_Flyes_With_External_Rotation: "pull",
  Reverse_Machine_Flyes: "pull",
  "Seated_Bent-Over_Rear_Delt_Raise": "pull",
  Sled_Reverse_Flye: "pull",
  // deadlift / good morning / rack pull → legs (posterior chain / hinge)
  Axle_Deadlift: "legs",
  Barbell_Deadlift: "legs",
  Deadlift_with_Bands: "legs",
  Deadlift_with_Chains: "legs",
  Deficit_Deadlift: "legs",
  Reverse_Band_Deadlift: "legs",
  Rack_Pulls: "legs",
  Rack_Pull_with_Bands: "legs",
  Seated_Good_Mornings: "legs",
  Stiff_Leg_Barbell_Good_Morning: "legs",
};

/** Kategorie z listy mięśni (dedup). */
export function categoriesForMuscles(muscles: string[]): MuscleCategory[] {
  const out = new Set<MuscleCategory>();
  for (const m of muscles) {
    const c = MUSCLE_CATEGORY[m];
    if (c) out.add(c);
  }
  return [...out];
}

/** Kategorie ćwiczenia — korekta per ID (zastępuje), w przeciwnym razie z mięśni. */
export function categoriesForExercise(exerciseId: string, muscles: string[]): MuscleCategory[] {
  const o = EXERCISE_CATEGORY_OVERRIDE[exerciseId];
  return o ? [o] : categoriesForMuscles(muscles);
}

/**
 * Hint progresji w loggerze (per ćwiczenie). Rozszerzony:
 * - pełny zakres → dołóż obciążenie (z uzasadnieniem),
 * - poniżej dolnego zakresu → utrzymaj ciężar, dobij powtórzeń,
 * - timed → spróbuj pobić poprzedni czas.
 */
export function progressionHint(input: {
  type: ExerciseType;
  unit: UnitSystem;
  prev: { weight: number | null; reps: number | null; duration_seconds: number | null } | null;
  targetRepsMin?: number | null;
  targetRepsMax?: number | null;
  /** S12: rekord przy docelowej liczbie powtórzeń (rep-PR) — wzbogaca hint. */
  repPR?: { reps: number; weight: number } | null;
}): string | null {
  const { type, unit, prev, targetRepsMin, targetRepsMax, repPR } = input;
  const prBit =
    type === "weighted" && repPR ? ` · rekord przy ${repPR.reps} powt.: ${repPR.weight}${unit}` : "";

  if (!prev) {
    // Bez „poprzednio" (np. dawno nietrenowane) rep-PR sam w sobie daje cel
    return type === "weighted" && repPR
      ? `Rekord przy ${repPR.reps} powt.: ${repPR.weight}${unit} — spróbuj pobić`
      : null;
  }

  if (type === "timed") {
    return prev.duration_seconds != null
      ? `Ostatnio ${prev.duration_seconds}s → spróbuj pobić`
      : null;
  }

  const inc = unit === "kg" ? 2.5 : 5;

  if (type === "weighted" && prev.weight != null && prev.reps != null) {
    if (targetRepsMax && prev.reps >= targetRepsMax)
      return `Ostatnio pełny zakres (${prev.reps}) → spróbuj ${prev.weight + inc}${unit}${prBit}`;
    if (targetRepsMin && prev.reps < targetRepsMin)
      return `Ostatnio ${prev.reps} (poniżej zakresu) → utrzymaj ${prev.weight}${unit}, dobij powtórzeń`;
    return null;
  }

  if (type === "bodyweight" && prev.reps != null && targetRepsMax && prev.reps >= targetRepsMax)
    return `Ostatnio ${prev.reps} powt. → dołóż powtórzeń lub obciążenie`;

  return null;
}

/** Flaga balansu push vs pull w bieżącym tygodniu (serie robocze per kategoria). */
export function balanceFlags(setsByCategory: Partial<Record<MuscleCategory, number>>): GuidanceItem[] {
  const push = setsByCategory.push ?? 0;
  const pull = setsByCategory.pull ?? 0;
  const strong = Math.max(push, pull);
  if (strong < GUIDANCE.balanceMinSets) return [];
  const weak = Math.min(push, pull);
  if (weak >= strong * GUIDANCE.balanceRatio) return [];
  const lacking = push < pull ? "push" : "pull";
  return [
    {
      id: `balance-${lacking}`,
      kind: "balance",
      severity: "warn",
      message: `Mało ${CATEGORY_LABEL[lacking as MuscleCategory]} w tym tygodniu (push ${push} / pull ${pull} serii)`,
    },
  ];
}

/** Flagi „zwietrzałych" partii — dni od ostatniego treningu kategorii (tylko trenowane wcześniej). */
export function stalenessFlags(
  daysSinceByCategory: Partial<Record<MuscleCategory, number | null>>,
): GuidanceItem[] {
  return (Object.entries(daysSinceByCategory) as [MuscleCategory, number | null][])
    .filter(([, days]) => days != null && days >= GUIDANCE.stalenessDays)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .map(([cat, days]) => ({
      id: `stale-${cat}`,
      kind: "staleness" as const,
      severity: "info" as const,
      message: `${cap(CATEGORY_LABEL[cat])}: ${days} dni temu — czas na trening`,
    }));
}

/**
 * Flaga deloadu — ćwiczenie ze stagnacją metryki (e1RM/powt./czas) przez ≥ deloadSessions.
 * `series` = najlepsza metryka per sesja, chronologicznie (rosnąco wg daty). Zwraca max 1
 * (najmocniejsza stagnacja) — anti-noise; deload to sygnał, nie nakaz.
 */
export function deloadFlags(items: { name: string; series: number[] }[]): GuidanceItem[] {
  const n = GUIDANCE.deloadSessions;
  const flagged = items
    .filter((e) => e.series.length >= n)
    .map((e) => {
      const recent = e.series[e.series.length - 1];
      const past = e.series[e.series.length - n];
      return { name: e.name, drop: past - recent, stalled: recent <= past };
    })
    .filter((e) => e.stalled)
    .sort((a, b) => b.drop - a.drop);
  if (flagged.length === 0) return [];
  const w = flagged[0];
  return [
    {
      id: `deload-${w.name}`,
      kind: "deload",
      severity: "warn",
      message: `${w.name}: ${n} sesje bez postępu → rozważ lżejszy tydzień`,
    },
  ];
}

/** Łączy flagi na home: staleness/deload (konkretne sygnały) przed balansem; cap maxHomeFlags. */
export function homeGuidance(items: GuidanceItem[]): GuidanceItem[] {
  const order: GuidanceKind[] = ["staleness", "deload", "balance", "progression"];
  return [...items]
    .sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind))
    .slice(0, GUIDANCE.maxHomeFlags);
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
