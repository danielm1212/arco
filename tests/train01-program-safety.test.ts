import test from "node:test";
import assert from "node:assert/strict";
import { PROGRAMS } from "@/scripts/seed";

function program(slug: string) {
  const result = PROGRAMS.find((item) => item.slug === slug);
  assert.ok(result, `Brak programu ${slug}`);
  return result;
}

function day(slug: string, label: string) {
  const result = program(slug).days.find((item) => item.label === label);
  assert.ok(result, `Brak dnia ${slug} / ${label}`);
  return result;
}

test("TRAIN-01 / P11: HSPU jest pierwsze, a Upper B ma dokładnie 18 serii", () => {
  const p11 = program("advanced-home-upper-lower4");
  const upperB = day(p11.slug, "Upper B · objętość");

  assert.equal(p11.content_version, 3);
  assert.deepEqual(
    upperB.slots.map((slot) => slot.exercise_id),
    [
      "Handstand_Push-Ups",
      "Incline_Dumbbell_Press",
      "Chest-Supported_Dumbbell_Row",
      "Chin-Up",
      "Reverse_Flyes",
      "Lying_Dumbbell_Tricep_Extension",
      "Incline_Dumbbell_Curl",
    ],
  );
  assert.equal(upperB.slots.reduce((sum, slot) => sum + slot.sets, 0), 18);
});

test("TRAIN-01 / P12: ruchy techniczne i mocy poprzedzają zmęczenie", () => {
  const p12 = program("advanced-bodyweight-upper-lower4");
  const upperA = day(p12.slug, "Upper A · siła");
  const lowerA = day(p12.slug, "Lower A · siła");

  assert.equal(p12.content_version, 3);
  assert.equal(upperA.slots[0]?.exercise_id, "Handstand_Push-Ups");
  assert.deepEqual(
    lowerA.slots.slice(0, 2).map((slot) => slot.exercise_id),
    ["Freehand_Jump_Squat", "Split_Squats"],
  );
  assert.deepEqual(
    {
      sets: lowerA.slots[0]?.sets,
      repsMin: lowerA.slots[0]?.repsMin,
      repsMax: lowerA.slots[0]?.repsMax,
    },
    { sets: 3, repsMin: 3, repsMax: 5 },
  );
});

// P14 (`intermediate-gym-fbw2`) miało tu własny test TRAIN-01. Recepta została zastąpiona
// przez bibliotekę v2.1; aktualne asercje żyją w `planc1-fbw-gym-recipe.test.ts`.
// Intencja TRAIN-01 — oba dni mają bezpośrednią pracę tylnej taśmy — jest tam utrzymana.
