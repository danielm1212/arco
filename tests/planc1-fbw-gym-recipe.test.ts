import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { PROGRAMS } from "@/scripts/seed";
import { PLANNED_PROGRAM_ALTERNATIVES } from "@/scripts/data/program-slot-alternatives";
import rawExercises from "@/scripts/data/exercises.json";

const SLUG = "intermediate-gym-fbw2";

const migrationSql = readFileSync(
  fileURLToPath(
    new URL(
      "../supabase/migrations/20260728213337_planc1_intermediate_gym_fbw2_v21.sql",
      import.meta.url,
    ),
  ),
  "utf8",
);

function program() {
  const result = PROGRAMS.find((item) => item.slug === SLUG);
  assert.ok(result, `Brak programu ${SLUG}`);
  return result;
}

function day(label: string) {
  const result = program().days.find((item) => item.label === label);
  assert.ok(result, `Brak dnia ${label}`);
  return result;
}

function sets(label: string) {
  return day(label).slots.reduce((sum, slot) => sum + slot.sets, 0);
}

test("PLAN-C1: recepta v2.1 ma dwa dni po 7 pozycjach i 21 seriach", () => {
  assert.equal(program().content_version, 4);
  assert.equal(day("Trening A").slots.length, 7);
  assert.equal(day("Trening B").slots.length, 7);
  assert.equal(sets("Trening A"), 21);
  assert.equal(sets("Trening B"), 21);
});

test("PLAN-C1: Trening A rozwija przysiad, Trening B zawias biodrowy", () => {
  assert.deepEqual(
    day("Trening A").slots.map((slot) => slot.exercise_id),
    [
      "Barbell_Squat",
      "Barbell_Incline_Bench_Press_-_Medium_Grip",
      "Wide-Grip_Lat_Pulldown",
      "Side_Lateral_Raise",
      "Incline_Dumbbell_Curl",
      "Reverse_Crunch",
      "Cable_Rope_Overhead_Triceps_Extension",
    ],
  );
  assert.deepEqual(
    day("Trening B").slots.map((slot) => slot.exercise_id),
    [
      "Romanian_Deadlift",
      "Barbell_Bench_Press_-_Medium_Grip",
      "Chest-Supported_Dumbbell_Row",
      "Arnold_Dumbbell_Press",
      "Triceps_Pushdown",
      "Hanging_Knee_Raise",
      "Hammer_Curls",
    ],
  );
});

test("PLAN-C1: każda sesja ma dokładnie jedno duże ćwiczenie na dół ciała", () => {
  const lowerBody = new Set([
    "Barbell_Squat",
    "Romanian_Deadlift",
    "Barbell_Walking_Lunge",
    "Leg_Press",
    "Lying_Leg_Curls",
    "Seated_Leg_Curl",
  ]);
  for (const label of ["Trening A", "Trening B"]) {
    const found = day(label).slots.filter((slot) => lowerBody.has(slot.exercise_id));
    assert.equal(found.length, 1, `${label}: oczekiwano jednego ruchu na dół ciała`);
  }
});

test("PLAN-C1: każda sesja ma bezpośredni biceps I triceps", () => {
  const biceps = new Set(["Incline_Dumbbell_Curl", "Hammer_Curls"]);
  const triceps = new Set(["Triceps_Pushdown", "Cable_Rope_Overhead_Triceps_Extension"]);
  for (const label of ["Trening A", "Trening B"]) {
    const ids = day(label).slots.map((slot) => slot.exercise_id);
    assert.ok(ids.some((id) => biceps.has(id)), `${label}: brak bezpośredniego bicepsa`);
    assert.ok(ids.some((id) => triceps.has(id)), `${label}: brak bezpośredniego tricepsa`);
  }
});

test("PLAN-C1: zachowana intencja TRAIN-01 — hinge i bezpośrednia praca ramion", () => {
  const all = program().days.flatMap((item) => item.slots.map((slot) => slot.exercise_id));
  assert.ok(all.includes("Romanian_Deadlift"), "brak wzorca hinge w pełnym cyklu");
  assert.ok(all.includes("Incline_Dumbbell_Curl"), "brak bezpośredniej pracy bicepsa");
  assert.ok(all.includes("Triceps_Pushdown"), "brak bezpośredniej pracy tricepsa");
});

test("PLAN-C1: ciężkie compoundy dostają realną przerwę, izolacje krótką", () => {
  const a = day("Trening A").slots;
  const b = day("Trening B").slots;
  assert.ok(a[0]!.rest >= 180, "przysiad potrzebuje pełnej przerwy");
  assert.ok(b[0]!.rest >= 180, "martwy ciąg rumuński potrzebuje pełnej przerwy");
  for (const slot of [...a.slice(3), ...b.slice(4)]) {
    assert.ok(slot.rest <= 90, `${slot.exercise_id}: izolacja nie potrzebuje długiej przerwy`);
  }
});

test("PLAN-C1: maszyny nie są wymaganiem wejścia, tylko alternatywą", () => {
  assert.deepEqual(program().required_equipment, ["barbell", "dumbbell", "cable"]);
  assert.ok(program().optional_equipment.includes("machine"));
});

test("D-45: świadomy profil planu — nacisk na górę, umiarkowane nogi, zero łydek", () => {
  // Ten test NIE pilnuje „poprawnej" objętości. Pilnuje, że kompromis z D-45 pozostaje
  // świadomy: gdy ktoś zmieni receptę, ma zmienić też decyzję, a nie odkryć zmianę po fakcie.
  const direct = new Map<string, number>();
  for (const day of program().days) {
    for (const slot of day.slots) {
      const exercise = (rawExercises as { id: string; primaryMuscles?: string[] }[]).find(
        (item) => item.id === slot.exercise_id,
      );
      assert.ok(exercise, `brak ${slot.exercise_id} w katalogu`);
      for (const muscle of exercise.primaryMuscles ?? []) {
        direct.set(muscle, (direct.get(muscle) ?? 0) + slot.sets);
      }
    }
  }

  assert.deepEqual(
    {
      quadriceps: direct.get("quadriceps") ?? 0,
      hamstrings: direct.get("hamstrings") ?? 0,
      chest: direct.get("chest") ?? 0,
      biceps: direct.get("biceps") ?? 0,
      triceps: direct.get("triceps") ?? 0,
      calves: direct.get("calves") ?? 0,
    },
    { quadriceps: 4, hamstrings: 4, chest: 8, biceps: 5, triceps: 5, calves: 0 },
    "Zmiana profilu objętości wymaga aktualizacji D-45 i karty planu.",
  );
});

test("PLAN-C1: opis programu w migracji jest identyczny jak w seedzie", () => {
  // Reguła arco-migration §2: seed i migracja to dwie drogi do tego samego stanu.
  assert.ok(
    migrationSql.includes(program().description),
    "Opis w migracji rozjechał się z seedem.",
  );
});

test("PLAN-C1: migracja niesie te same alternatywy co repo (produkcji nie seedujemy)", () => {
  const match = migrationSql.match(
    /alternatives_payload constant jsonb := \$alternatives\$([\s\S]*?)\$alternatives\$::jsonb;/,
  );
  assert.ok(match, "Brak payloadu $alternatives$ w migracji PLAN-C1.");

  const embedded = JSON.parse(match[1]);
  const expected = PLANNED_PROGRAM_ALTERNATIVES.filter((item) => item.programSlug === SLUG);

  assert.deepEqual(embedded, expected);
  assert.equal(embedded.length, 14);
});

test("PLAN-C1: migracja nic nie usuwa i broni się przed otwartą sesją", () => {
  // Dzień zostaje przy 7 pozycjach, więc żaden wiersz historii nie traci powiązania ze slotem.
  assert.equal(migrationSql.match(/delete\s+from\s+public\.\w+/gi), null);
  assert.match(migrationSql, /PLAN-C1 wymaga zakończenia lub usunięcia otwartych sesji P14/);
});

test("PLAN-C1: każdy slot poza ćwiczeniem bez sprzętu ma alternatywę sprzętową", () => {
  const planned = PLANNED_PROGRAM_ALTERNATIVES.filter((item) => item.programSlug === SLUG);
  // Reverse_Crunch nie wymaga sprzętu, więc nie potrzebuje ścieżki zastępczej.
  const needsAlternative = program()
    .days.flatMap((item) => item.slots.map((slot) => slot.exercise_id))
    .filter((id) => id !== "Reverse_Crunch");

  for (const exerciseId of needsAlternative) {
    assert.ok(
      planned.some((item) => item.defaultExerciseId === exerciseId),
      `brak alternatywy dla ${exerciseId}`,
    );
  }
  for (const item of planned) {
    assert.ok(item.missingEquipment.length > 0, `${item.alternativeExerciseId}: brak triggera`);
  }
});
