import type { ExerciseType } from "@/lib/types";

/**
 * Szacunkowy 1RM wg Epleya: weight × (1 + reps/30), zaokrąglony do 0,1.
 * Jedno źródło wzoru dla postępów, guidance, strony ćwiczenia i (docelowo)
 * prognozy Coach — rozjazd kopii oznaczałby rozjazd rekordów między widokami.
 */
export function estimate1RM(weight: number, reps: number): number {
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

/**
 * Najlepsza metryka serii wg typu ćwiczenia:
 * e1RM (weighted) / powtórzenia (bodyweight) / czas (timed).
 */
export function setMetric(
  type: ExerciseType,
  s: { weight: number | null; reps: number | null; duration_seconds: number | null },
): number | null {
  if (type === "weighted" && s.weight != null && s.reps != null) {
    return estimate1RM(s.weight, s.reps);
  }
  if (type === "bodyweight" && s.reps != null) return s.reps;
  if (type === "timed" && s.duration_seconds != null) return s.duration_seconds;
  return null;
}
