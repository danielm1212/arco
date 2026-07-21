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

  assert.equal(p11.content_version, 2);
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

  assert.equal(p12.content_version, 2);
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

test("TRAIN-01 / P14: oba dni mają pracę tylnej taśmy zamiast drugiego curl", () => {
  const p14 = program("intermediate-gym-fbw2");
  const trainingA = day(p14.slug, "Trening A");
  const trainingB = day(p14.slug, "Trening B");

  assert.equal(p14.content_version, 3);
  assert.deepEqual(
    trainingA.slots.map((slot) => slot.exercise_id),
    [
      "Barbell_Squat",
      "Barbell_Bench_Press_-_Medium_Grip",
      "Romanian_Deadlift",
      "Bent_Over_Barbell_Row",
      "Standing_Military_Press",
      "EZ-Bar_Skullcrusher",
      "Plank",
    ],
  );
  assert.equal(trainingB.slots[4]?.exercise_id, "Lying_Leg_Curls");
  assert.deepEqual(
    {
      repsMin: trainingB.slots[1]?.repsMin,
      repsMax: trainingB.slots[1]?.repsMax,
    },
    { repsMin: 5, repsMax: 10 },
  );
});
