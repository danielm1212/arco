import { LIMITS } from "@/lib/format";
import type { ExerciseType, SetType } from "@/lib/types";

export const WEIGHT_REVIEW_KG = 300;
export const VERY_HIGH_WEIGHT_REVIEW_KG = 500;
export const PREVIOUS_WEIGHT_MULTIPLIER = 1.5;

type SetNumbers = {
  weight?: number | null;
  added_weight?: number | null;
  reps?: number | null;
  duration_seconds?: number | null;
  rpe?: number | null;
};

/**
 * Wspólny kontrakt dla klienta, server actions i synchronizacji offline.
 * Pola mogą być puste podczas wpisywania serii; gdy mają wartość, muszą być
 * skończone i mieścić się w granicach modelu danych.
 */
export function validateSetNumbers(values: SetNumbers): string | null {
  for (const [label, value] of [
    ["Ciężar", values.weight],
    ["Dodatkowy ciężar", values.added_weight],
  ] as const) {
    if (value != null && (!Number.isFinite(value) || value < 0 || value > LIMITS.weight)) {
      return `${label} musi mieścić się w zakresie 0–${LIMITS.weight} kg.`;
    }
  }

  if (
    values.reps != null &&
    (!Number.isInteger(values.reps) || values.reps < 1 || values.reps > LIMITS.reps)
  ) {
    return `Liczba powtórzeń musi być liczbą całkowitą od 1 do ${LIMITS.reps}.`;
  }
  if (
    values.duration_seconds != null &&
    (!Number.isInteger(values.duration_seconds) ||
      values.duration_seconds < 0 ||
      values.duration_seconds > LIMITS.duration)
  ) {
    return "Czas serii jest poza dopuszczalnym zakresem.";
  }
  if (values.rpe != null && (!Number.isFinite(values.rpe) || values.rpe < 0 || values.rpe > LIMITS.rpe)) {
    return "RPE musi mieścić się w zakresie 0–10.";
  }
  return null;
}

export function assertValidSetNumbers(values: SetNumbers) {
  const error = validateSetNumbers(values);
  if (error) throw new Error(error);
}

export interface SetWeightReview {
  reasons: ("high_weight" | "very_high_weight" | "large_jump")[];
  previousWeight: number | null;
}

/**
 * Nietypowy ciężar nie jest błędem: użytkownik może go zapisać po jednym,
 * świadomym potwierdzeniu. Dotyczy tylko zaliczonej serii roboczej z ciężarem,
 * bo tylko ona może utworzyć rekord.
 */
export function reviewWorkingSetWeight({
  type,
  setType,
  weight,
  previousWeight,
}: {
  type: ExerciseType;
  setType: SetType;
  weight: number | null;
  previousWeight: number | null;
}): SetWeightReview | null {
  if (type !== "weighted" || setType !== "working" || weight == null) return null;

  const reasons: SetWeightReview["reasons"] = [];
  if (weight > WEIGHT_REVIEW_KG) reasons.push("high_weight");
  if (weight > VERY_HIGH_WEIGHT_REVIEW_KG) reasons.push("very_high_weight");
  if (
    previousWeight != null &&
    previousWeight > 0 &&
    weight > previousWeight * PREVIOUS_WEIGHT_MULTIPLIER
  ) {
    reasons.push("large_jump");
  }

  return reasons.length ? { reasons, previousWeight } : null;
}
