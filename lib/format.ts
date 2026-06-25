import type { ExerciseType, UnitSystem } from "@/lib/types";

/** Zacisk liczby do sensownego zakresu (walidacja inputów). Puste/NaN → null. */
export function clampNum(
  value: number | null,
  { min = 0, max }: { min?: number; max: number },
): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  return Math.min(max, Math.max(min, value));
}

/** Górne limity pól liczbowych — żeby fat-finger (np. 2222 kg) nie wchodził. */
export const LIMITS = {
  weight: 2000,
  reps: 999,
  duration: 86_400,
  rpe: 10,
  bodyWeight: 1000,
  bodyFat: 100,
  rest: 3600,
} as const;

interface SetLike {
  weight: number | null;
  reps: number | null;
  duration_seconds: number | null;
  added_weight: number | null;
}

/** Sformatuj serię do odczytu wg typu ćwiczenia (np. "60kg × 8", "12 powt. +5kg", "45s"). */
export function formatSet(type: ExerciseType, s: SetLike, unit: UnitSystem): string {
  if (type === "timed") return s.duration_seconds != null ? `${s.duration_seconds}s` : "—";
  if (type === "bodyweight")
    return (
      [
        s.reps != null ? `${s.reps} powt.` : null,
        s.added_weight ? `+${s.added_weight}${unit}` : null,
      ]
        .filter(Boolean)
        .join(" ") || "—"
    );
  return s.weight != null && s.reps != null ? `${s.weight}${unit} × ${s.reps}` : "—";
}
