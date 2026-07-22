import test from "node:test";
import assert from "node:assert/strict";
import rawExercises from "@/scripts/data/exercises.json";
import {
  CONTENT_REVIEWS,
  POLISH_INSTRUCTION_OVERRIDES,
  PROGRAMS,
  toSeedExercise,
  type RawExercise,
} from "@/scripts/seed";

function chinUp() {
  const raw = (rawExercises as RawExercise[]).find((item) => item.id === "Chin-Up");
  assert.ok(raw, "Brak ćwiczenia Chin-Up");
  return toSeedExercise(raw);
}

test("CONTENT-02: Chin-Up publikuje zatwierdzony tekst bez niejednoznacznych zdjęć", () => {
  const exercise = chinUp();
  const review = CONTENT_REVIEWS["Chin-Up"];

  assert.equal(review?.review_version, "CONTENT-02-v1");
  assert.equal(review?.decision, "text_approved_media_pending");
  assert.deepEqual(exercise.images, ["/exercise-placeholder.svg"]);
  assert.equal(exercise.hidden, false);
  assert.equal(exercise.content_blocked, false);
});

test("CONTENT-02: instrukcja jednoznacznie opisuje podchwyt, stabilny tułów i pełne powtórzenie", () => {
  const instructions = POLISH_INSTRUCTION_OVERRIDES["Chin-Up"];
  const copy = instructions?.join(" ") ?? "";

  assert.equal(instructions?.length, 4);
  assert.match(copy, /podchwytem/i);
  assert.match(copy, /dłonie skieruj do twarzy/i);
  assert.match(copy, /nie wyginaj dolnych pleców/i);
  assert.match(copy, /brodę wyraźnie ponad drążek/i);
  assert.match(copy, /bez gwałtownego opadania/i);
});

test("CONTENT-02: pięć istniejących slotów zachowuje Chin-Up", () => {
  const slots = PROGRAMS.flatMap((program) =>
    program.days.flatMap((day) => day.slots.map((slot) => slot.exercise_id)),
  );

  assert.equal(slots.filter((exerciseId) => exerciseId === "Chin-Up").length, 5);
});
