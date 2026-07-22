import assert from "node:assert/strict";
import test from "node:test";
import rawExercises from "../scripts/data/exercises.json";
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

function totalSets(dayValue: Day) {
  return dayValue.slots.reduce((sum, slot) => sum + slot.sets, 0);
}

function assertApproximateRange(dayValue: Day, min: number, max: number) {
  const estimate = estimatedMinutes(dayValue);
  assert.ok(
    estimate >= min - 2 && estimate <= max + 2,
    `${dayValue.label}: estymacja ${estimate} min poza zakresem ${min}–${max} min z tolerancją 2 min.`,
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

test("P11 ma zatwierdzoną objętość i czasy wszystkich czterech dni", () => {
  const p11 = program("advanced-home-upper-lower4");
  const upperA = day(p11, "Upper A · siła");
  const lowerA = day(p11, "Lower A · siła");
  const upperB = day(p11, "Upper B · objętość");
  const lowerB = day(p11, "Lower B · objętość");

  assert.equal(p11.content_version, 3);
  assert.deepEqual(
    [upperA, lowerA, upperB, lowerB].map(totalSets),
    [21, 21, 18, 18],
  );
  assert.deepEqual(
    upperA.slots.slice(-3).map((slot) => [slot.exercise_id, slot.sets]),
    [
      ["Side_Lateral_Raise", 2],
      ["Standing_Dumbbell_Triceps_Extension", 2],
      ["Dumbbell_Bicep_Curl", 2],
    ],
  );
  assert.deepEqual(
    lowerB.slots.map((slot) => [slot.exercise_id, slot.sets]),
    [
      ["Dumbbell_Step_Ups", 3],
      ["Stiff-Legged_Dumbbell_Deadlift", 3],
      ["Single-Leg_Hip_Thrust", 3],
      ["Reverse_Nordic_Curl", 2],
      ["Natural_Glute_Ham_Raise", 2],
      ["Dumbbell_Seated_One-Leg_Calf_Raise", 3],
      ["Copenhagen_Plank", 2],
    ],
  );
  assertApproximateRange(upperA, 55, 65);
  assertApproximateRange(lowerA, 50, 60);
  assertApproximateRange(upperB, 45, 55);
  assertApproximateRange(lowerB, 45, 55);
});

test("P12 ma zatwierdzoną objętość i czasy wszystkich czterech dni", () => {
  const p12 = program("advanced-bodyweight-upper-lower4");
  const upperA = day(p12, "Upper A · siła");
  const lowerA = day(p12, "Lower A · siła");
  const upperB = day(p12, "Upper B · objętość");
  const lowerB = day(p12, "Lower B · objętość");

  assert.equal(p12.content_version, 3);
  assert.deepEqual(
    [upperA, lowerA, upperB, lowerB].map(totalSets),
    [22, 22, 21, 19],
  );
  assert.deepEqual(
    upperB.slots.slice(-3).map((slot) => [slot.exercise_id, slot.sets]),
    [
      ["Scapular_Pull-Up", 2],
      ["Body_Tricep_Press", 2],
      ["Hanging_Leg_Raise", 2],
    ],
  );
  assert.deepEqual(
    lowerB.slots.map((slot) => [slot.exercise_id, slot.sets]),
    [
      ["Bodyweight_Walking_Lunge", 3],
      ["Step-up_with_Knee_Raise", 3],
      ["Reverse_Nordic_Curl", 3],
      ["Natural_Glute_Ham_Raise", 3],
      ["Single_Leg_Glute_Bridge", 3],
      ["Tibialis_Raise", 2],
      ["Hollow_Body_Hold", 2],
    ],
  );
  assertApproximateRange(upperA, 55, 65);
  assertApproximateRange(lowerA, 45, 55);
  assertApproximateRange(upperB, 45, 55);
  assertApproximateRange(lowerB, 45, 55);
});

test("P11/P12 mają kompletne i istniejące ścieżki sprzętowe do kontraktu TRAIN-03/05", () => {
  const exerciseIds = new Set(rawExercises.map((exercise) => exercise.id));
  const expectedCounts = new Map([
    ["advanced-home-upper-lower4", 14],
    ["advanced-bodyweight-upper-lower4", 12],
  ]);

  for (const [programSlug, expectedCount] of expectedCounts) {
    const sourceProgram = program(programSlug);
    const alternatives = PLANNED_PROGRAM_ALTERNATIVES.filter(
      (item) => item.programSlug === programSlug,
    );
    assert.equal(alternatives.length, expectedCount);

    for (const alternative of alternatives) {
      const sourceDay = day(sourceProgram, alternative.dayLabel);
      assert.ok(
        sourceDay.slots.some((slot) => slot.exercise_id === alternative.defaultExerciseId),
        `Brak źródłowego slotu ${programSlug} / ${alternative.dayLabel} / ${alternative.defaultExerciseId}.`,
      );
      assert.notEqual(alternative.defaultExerciseId, alternative.alternativeExerciseId);
      assert.ok(exerciseIds.has(alternative.alternativeExerciseId));
      assert.ok(alternative.missingEquipment.length > 0);
      assert.ok(alternative.alternativeEquipment.length > 0);
      assert.ok(alternative.notePl.length >= 20);
    }
  }
});
