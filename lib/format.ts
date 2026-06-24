import type { ExerciseType, UnitSystem } from "@/lib/types";

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
