import type { ExerciseType, MovementPattern } from "@/lib/types";

export interface PreparationExercise {
  sessionExerciseId: string;
  exerciseId: string;
  type: ExerciseType;
  category: string | null;
  mechanic: "compound" | "isolation" | null;
  movementPattern: MovementPattern | null;
  skipped: boolean;
}

export interface WarmupRecommendation {
  sessionExerciseId: string;
  series: 1 | 2;
  kind: "first_pattern" | "new_pattern";
}

const POWER_OR_SKILL_CATEGORIES = new Set([
  "olympic weightlifting",
  "plyometrics",
  "powerlifting",
  "strongman",
]);

function isWarmupCandidate(exercise: PreparationExercise) {
  if (exercise.skipped || exercise.type === "timed") return false;
  if (POWER_OR_SKILL_CATEGORIES.has(exercise.category ?? "")) return true;
  if (exercise.mechanic === "compound") return true;

  // Ćwiczenie własne nie ma pełnych metadanych katalogu. Dla ciężaru bez
  // jawnego oznaczenia izolacji bezpieczniej pokazać opcjonalną sugestię.
  return (
    exercise.type === "weighted" &&
    exercise.category == null &&
    exercise.mechanic == null
  );
}

function patternKey(exercise: PreparationExercise) {
  return exercise.movementPattern ?? `exercise:${exercise.exerciseId}`;
}

/**
 * SESSION-01A: dolna granica zatwierdzonej rekomendacji.
 * Pierwszy ciężki/power/skill wzorzec dostaje 2 serie, a każdy kolejny nowy
 * wzorzec 1 serię wprowadzającą. Powtórzenie tego samego wzorca nie dokłada
 * kolejnego bloku.
 */
export function buildWarmupRecommendations(
  exercises: PreparationExercise[],
): WarmupRecommendation[] {
  const seenPatterns = new Set<string>();
  const result: WarmupRecommendation[] = [];

  for (const exercise of exercises) {
    if (!isWarmupCandidate(exercise)) continue;
    const key = patternKey(exercise);
    if (seenPatterns.has(key)) continue;
    seenPatterns.add(key);
    result.push({
      sessionExerciseId: exercise.sessionExerciseId,
      series: result.length === 0 ? 2 : 1,
      kind: result.length === 0 ? "first_pattern" : "new_pattern",
    });
  }

  return result;
}

export function warmupRecommendationText(recommendation: WarmupRecommendation) {
  return recommendation.kind === "first_pattern"
    ? "Zacznij od 2 lekkich, narastających serii. Jeśli potrzebujesz, dodaj kolejną ręcznie."
    : "To nowy wzorzec ruchu w tym treningu. Zrób 1 krótszą serię wprowadzającą.";
}
