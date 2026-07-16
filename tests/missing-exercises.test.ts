import assert from "node:assert/strict";
import test from "node:test";
import rawExercises from "../scripts/data/exercises.json";
import {
  REQUIRED_EXERCISE_IDS,
  missingExerciseRows,
} from "../scripts/sync-missing-exercises";
import type { RawExercise } from "../scripts/seed";

test("punktowy sync zawiera dokładnie dwa brakujące, kompletne ćwiczenia", () => {
  const rows = missingExerciseRows(rawExercises as RawExercise[]);
  assert.deepEqual(
    rows.map((row) => row.id),
    [...REQUIRED_EXERCISE_IDS],
  );
  assert.equal(rows[0].movement_pattern, "pull");
  assert.equal(rows[0].exercise_type, "weighted");
  assert.equal(rows[1].movement_pattern, "squat");
  assert.equal(rows[1].exercise_type, "bodyweight");
  assert.ok(rows.every((row) => row.instructions.length > 0));
});
