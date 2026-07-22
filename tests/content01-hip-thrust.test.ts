import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import rawExercises from "@/scripts/data/exercises.json";
import {
  CONTENT_REVIEWS,
  POLISH_INSTRUCTION_OVERRIDES,
  PROGRAMS,
  toSeedExercise,
  type RawExercise,
} from "@/scripts/seed";

function exercise(id: string) {
  const result = (rawExercises as RawExercise[]).find((item) => item.id === id);
  assert.ok(result, `Brak ćwiczenia ${id}`);
  return toSeedExercise(result);
}

test("CONTENT-01A: ryzykowny Barbell Hip Thrust jest zablokowany i nie publikuje starych zdjęć", () => {
  const barbellHipThrust = exercise("Barbell_Hip_Thrust");

  assert.equal(CONTENT_REVIEWS.Barbell_Hip_Thrust?.decision, "blocked");
  assert.equal(
    CONTENT_REVIEWS.Barbell_Hip_Thrust?.replacement_exercise_id,
    "Barbell_Glute_Bridge",
  );
  assert.equal(barbellHipThrust.hidden, true);
  assert.equal(barbellHipThrust.content_blocked, true);
  assert.deepEqual(barbellHipThrust.images, ["/exercise-placeholder.svg"]);
  assert.equal(barbellHipThrust.instructions.length, 4);
});

test("CONTENT-01A: mostek ze sztangą ma zatwierdzony dwukadrowy fallback", () => {
  const replacement = exercise("Barbell_Glute_Bridge");

  assert.equal(CONTENT_REVIEWS.Barbell_Glute_Bridge?.decision, "approved_replacement");
  assert.equal(replacement.hidden, false);
  assert.equal(replacement.content_blocked, false);
  assert.equal(replacement.movement_pattern, "hinge");
  assert.equal(replacement.images.length, 2);
  assert.ok(replacement.images.every((image) => image.includes("Barbell_Glute_Bridge/")));
  assert.equal(replacement.instructions.length, 4);
});

test("CONTENT-01A: wszystkie trzy warianty Hip Thrust mają sprawdzoną instrukcję PL", () => {
  for (const id of [
    "Barbell_Hip_Thrust",
    "Dumbbell_Hip_Thrust",
    "Single-Leg_Hip_Thrust",
  ]) {
    const instructions = POLISH_INSTRUCTION_OVERRIDES[id];
    assert.equal(instructions?.length, 4, `${id} powinien mieć cztery kroki`);
    assert.match(instructions?.join(" ") ?? "", /biodr|miednic/i);
  }
});

test("CONTENT-01A: żaden program systemowy nie publikuje zablokowanego wariantu", () => {
  const slots = PROGRAMS.flatMap((program) =>
    program.days.flatMap((day) => day.slots.map((slot) => ({ program, day, slot }))),
  );

  assert.equal(
    slots.filter(({ slot }) => slot.exercise_id === "Barbell_Hip_Thrust").length,
    0,
  );
  assert.equal(
    slots.filter(({ slot }) => slot.exercise_id === "Barbell_Glute_Bridge").length,
    3,
  );
  assert.equal(PROGRAMS.find((item) => item.slug === "lower-body-gym3")?.content_version, 2);
  assert.equal(PROGRAMS.find((item) => item.slug === "advanced-gym-ppl6")?.content_version, 4);
});

test("CONTENT-01A: browse, jawne wyszukiwanie i swap respektują twardą blokadę", () => {
  for (const file of [
    "app/session/[id]/ExerciseBrowser.tsx",
    "app/actions/substitute.ts",
  ]) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /\.eq\("content_blocked", false\)/, `${file} pomija content_blocked`);
  }
});
