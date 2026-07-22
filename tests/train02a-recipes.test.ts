import assert from "node:assert/strict";
import test from "node:test";
import { PLANNED_PROGRAM_ALTERNATIVES } from "../scripts/data/program-slot-alternatives";
import { PROGRAMS, type Day, type Program } from "../scripts/seed";

function program(slug: string): Program {
  const result = PROGRAMS.find((item) => item.slug === slug);
  assert.ok(result, `Brak programu ${slug}.`);
  return result;
}

function day(programValue: Program, label: string): Day {
  const result = programValue.days.find((item) => item.label === label);
  assert.ok(result, `Brak dnia ${programValue.slug} / ${label}.`);
  return result;
}

function estimatedMinutes(dayValue: Day) {
  return Math.round(
    dayValue.slots.reduce((seconds, slot) => seconds + slot.sets * (40 + slot.rest), 0) / 60,
  );
}

test("P01 Trening B ma domkniętą tylną taśmę i pozostaje w zakresie czasu", () => {
  const p01 = program("beginner-gym-fbw2");
  const trainingB = day(p01, "Trening B");

  assert.equal(p01.content_version, 2);
  assert.deepEqual(
    trainingB.slots.map((slot) => [slot.exercise_id, slot.sets]),
    [
      ["Leg_Press", 3],
      ["Incline_Dumbbell_Press", 3],
      ["Seated_Cable_Rows", 3],
      ["Dumbbell_Rear_Lunge", 2],
      ["Lying_Leg_Curls", 2],
      ["Pullups", 2],
      ["Standing_Calf_Raises", 2],
      ["Dead_Bug", 2],
    ],
  );
  assert.equal(trainingB.slots.reduce((sum, slot) => sum + slot.sets, 0), 19);
  assert.ok(estimatedMinutes(trainingB) >= 45 && estimatedMinutes(trainingB) <= 55);
});

test("P08 Trening C ma zatwierdzone 18 serii i estymację 40–50 minut", () => {
  const p08 = program("intermediate-bodyweight-fbw3");
  const trainingC = day(p08, "Trening C · objętość");

  assert.equal(p08.content_version, 2);
  assert.deepEqual(
    trainingC.slots.map((slot) => [slot.exercise_id, slot.sets]),
    [
      ["Bodyweight_Walking_Lunge", 3],
      ["Chin-Up", 3],
      ["Push-Ups_With_Feet_Elevated", 3],
      ["Single_Leg_Glute_Bridge", 3],
      ["Pike_Push-Up", 2],
      ["Scapular_Pull-Up", 2],
      ["Copenhagen_Plank", 2],
    ],
  );
  assert.equal(trainingC.slots.reduce((sum, slot) => sum + slot.sets, 0), 18);
  assert.ok(estimatedMinutes(trainingC) >= 40 && estimatedMinutes(trainingC) <= 50);
});

test("P03 ma jawne mapowanie alternatyw i zachowuje fallback do czasu kontraktu TRAIN-03/05", () => {
  const p03 = program("beginner-home-fbw2");
  const p03Alternatives = PLANNED_PROGRAM_ALTERNATIVES.filter(
    (item) => item.programSlug === p03.slug,
  );

  assert.deepEqual(
    p03Alternatives.map((item) => [
      item.dayLabel,
      item.defaultExerciseId,
      item.alternativeExerciseId,
      item.patternCoverage,
    ]),
    [
      ["Trening A", "Dumbbell_Bench_Press", "Dumbbell_Floor_Press", "same_pattern"],
      ["Trening B", "Incline_Dumbbell_Press", "Dumbbell_Floor_Press", "same_pattern"],
      [
        "Trening B",
        "Band_Lat_Pulldown",
        "Straight-Arm_Dumbbell_Pullover",
        "partial_pattern",
      ],
    ],
  );

  for (const alternative of p03Alternatives) {
    const sourceDay = day(p03, alternative.dayLabel);
    const sourceSlot = sourceDay.slots.find(
      (slot) => slot.exercise_id === alternative.defaultExerciseId,
    );
    assert.ok(sourceSlot, `Brak źródłowego slotu ${alternative.defaultExerciseId}.`);
    assert.match(sourceSlot.notes ?? "", /bez ławki|bez gumy/i);
  }
});
