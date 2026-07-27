import assert from "node:assert/strict";
import test from "node:test";
import {
  buildWarmupRecommendations,
  warmupRecommendationText,
  type PreparationExercise,
} from "../lib/sessionPreparation";

function exercise(
  patch: Partial<PreparationExercise> & Pick<PreparationExercise, "sessionExerciseId">,
): PreparationExercise {
  const { sessionExerciseId, ...rest } = patch;
  return {
    sessionExerciseId,
    exerciseId: sessionExerciseId,
    type: "weighted",
    category: "strength",
    mechanic: "compound",
    movementPattern: "push",
    skipped: false,
    ...rest,
  };
}

test("SESSION-01A: pierwszy ciężki wzorzec dostaje 2 serie, kolejny nowy wzorzec 1", () => {
  assert.deepEqual(
    buildWarmupRecommendations([
      exercise({ sessionExerciseId: "bench", movementPattern: "push" }),
      exercise({ sessionExerciseId: "row", movementPattern: "pull" }),
    ]),
    [
      { sessionExerciseId: "bench", series: 2, kind: "first_pattern" },
      { sessionExerciseId: "row", series: 1, kind: "new_pattern" },
    ],
  );
});

test("SESSION-01A: ten sam wzorzec nie powiela rekomendacji", () => {
  assert.deepEqual(
    buildWarmupRecommendations([
      exercise({ sessionExerciseId: "bench", movementPattern: "push" }),
      exercise({ sessionExerciseId: "press", movementPattern: "push" }),
    ]),
    [{ sessionExerciseId: "bench", series: 2, kind: "first_pattern" }],
  );
});

test("SESSION-01A: izolacje, czas i pominięte ćwiczenia nie dostają sugestii", () => {
  assert.deepEqual(
    buildWarmupRecommendations([
      exercise({ sessionExerciseId: "curl", mechanic: "isolation" }),
      exercise({ sessionExerciseId: "plank", type: "timed", mechanic: "compound" }),
      exercise({ sessionExerciseId: "skip", skipped: true }),
    ]),
    [],
  );
});

test("SESSION-01A: power/skill oraz własne ćwiczenie ciężarowe mają bezpieczny fallback", () => {
  assert.deepEqual(
    buildWarmupRecommendations([
      exercise({
        sessionExerciseId: "jump",
        type: "bodyweight",
        category: "plyometrics",
        mechanic: null,
        movementPattern: null,
      }),
      exercise({
        sessionExerciseId: "custom",
        category: null,
        mechanic: null,
        movementPattern: null,
      }),
    ]).map(({ sessionExerciseId, series }) => ({ sessionExerciseId, series })),
    [
      { sessionExerciseId: "jump", series: 2 },
      { sessionExerciseId: "custom", series: 1 },
    ],
  );
});

test("SESSION-01A: copy jest opcjonalne i nie obiecuje regeneracji", () => {
  const text = [
    warmupRecommendationText({
      sessionExerciseId: "a",
      series: 2,
      kind: "first_pattern",
    }),
    warmupRecommendationText({
      sessionExerciseId: "b",
      series: 1,
      kind: "new_pattern",
    }),
  ].join(" ");
  assert.match(text, /lekkich, narastających/);
  assert.doesNotMatch(text, /regener|uraz/i);
});
