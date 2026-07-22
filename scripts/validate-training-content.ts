/**
 * Statyczny audyt bazy ćwiczeń i presetów — bez połączenia z Supabase.
 * Uruchom: npm run validate:training
 */
import rawExercises from "./data/exercises.json";
import { PLANNED_PROGRAM_ALTERNATIVES } from "./data/program-slot-alternatives";
import {
  PROGRAMS,
  POLISH_INSTRUCTION_OVERRIDES,
  deriveExerciseType,
  deriveMovementPattern,
  deriveHidden,
  toSeedExercise,
  type RawExercise,
} from "./seed";

const exercises = rawExercises as RawExercise[];
const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));
const errors: string[] = [];
const warnings: string[] = [];
const placeholderExerciseIds = new Set<string>();

const fail = (message: string) => errors.push(message);
const warn = (message: string) => warnings.push(message);
const normalizedName = (name: string) => name.toLocaleLowerCase("en").replace(/[^a-z0-9]+/g, "");

function findDuplicates(values: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

for (const id of findDuplicates(exercises.map((exercise) => exercise.id))) {
  fail(`Duplikat exercise id: ${id}`);
}
for (const name of findDuplicates(exercises.map((exercise) => normalizedName(exercise.name)))) {
  fail(`Duplikat nazwy ćwiczenia po normalizacji: ${name}`);
}
for (const name of findDuplicates(PROGRAMS.map((program) => program.name))) {
  fail(`Duplikat nazwy programu: ${name}`);
}
for (const slug of findDuplicates(PROGRAMS.map((program) => program.slug))) {
  fail(`Duplikat sluga programu: ${slug}`);
}

const machineBench = byId.get("Machine_Bench_Press");
if (!machineBench || deriveMovementPattern(machineBench) !== "push") {
  fail("Regresja taksonomii: Machine Bench Press musi mieć movement_pattern=push.");
}
const singleLegBridge = byId.get("Single_Leg_Glute_Bridge");
if (!singleLegBridge || deriveExerciseType(singleLegBridge) !== "bodyweight") {
  fail("Regresja typu: Single Leg Glute Bridge musi być bodyweight, nie timed.");
}
for (const exercise of exercises.filter(
  (item) => /bridge/i.test(item.name) && item.primaryMuscles.includes("glutes"),
)) {
  if (deriveExerciseType(exercise) === "timed") {
    fail(`Regresja typu: ${exercise.name} jest ruchem pośladkowym na powtórzenia, nie timed.`);
  }
}
const obviouslyNotPull = new Set([
  "chest",
  "triceps",
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "abdominals",
  "adductors",
  "abductors",
]);
for (const exercise of exercises.filter((item) => /machine/i.test(item.name))) {
  if (
    deriveMovementPattern(exercise) === "pull" &&
    exercise.primaryMuscles.some((muscle) => obviouslyNotPull.has(muscle))
  ) {
    fail(`Regresja machine/chin: ${exercise.name} nie może być automatycznie sklasyfikowane jako pull.`);
  }
}

const HOME_ALLOWED = new Set([null, "dumbbell", "kettlebells", "bands", "body only", "other"]);
const BODYWEIGHT_ALLOWED = new Set([null, "body only"]);
const usedExerciseIds = new Set<string>();
let slotCount = 0;

if (Object.keys(POLISH_INSTRUCTION_OVERRIDES).length < 20) {
  fail("Warstwa polskich instrukcji musi obejmować co najmniej 20 priorytetowych ćwiczeń.");
}
for (const [exerciseId, instructions] of Object.entries(POLISH_INSTRUCTION_OVERRIDES)) {
  if (!byId.has(exerciseId)) fail(`Polskie instrukcje wskazują nieistniejące ćwiczenie: ${exerciseId}.`);
  if (instructions.length < 2 || instructions.some((instruction) => instruction.trim().length < 12)) {
    fail(`${exerciseId}: polskie instrukcje są niepełne.`);
  }
}

for (const program of PROGRAMS) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(program.slug)) {
    fail(`${program.name}: nieprawidłowy stabilny slug „${program.slug}”.`);
  }
  if (program.level_min > program.level_max || program.level_min < 1 || program.level_max > 3) {
    fail(`${program.name}: nieprawidłowy zakres poziomu ${program.level_min}–${program.level_max}.`);
  }
  if (
    program.frequency_min > program.frequency_max ||
    program.frequency_min < 1 ||
    program.frequency_max > 7
  ) {
    fail(`${program.name}: nieprawidłowa częstotliwość ${program.frequency_min}–${program.frequency_max}.`);
  }
  if (program.estimated_minutes_min > program.estimated_minutes_max) {
    fail(`${program.name}: minimalny czas treningu przekracza maksymalny.`);
  }
  if (program.days.length !== program.days_per_week) {
    fail(`${program.name}: days_per_week=${program.days_per_week}, ale cykl ma ${program.days.length} dni.`);
  }

  const environment = program.environment;

  for (const day of program.days) {
    const daySets = day.slots.reduce((sum, slot) => sum + slot.sets, 0);
    if (daySets > 28) fail(`${program.name} / ${day.label}: ${daySets} serii przekracza limit audytowy 28.`);
    if (day.slots.length === 0) fail(`${program.name} / ${day.label}: dzień bez ćwiczeń.`);

    for (const slot of day.slots) {
      slotCount += 1;
      usedExerciseIds.add(slot.exercise_id);
      const exercise = byId.get(slot.exercise_id);
      const context = `${program.name} / ${day.label} / ${slot.exercise_id}`;
      if (!exercise) {
        fail(`${context}: ćwiczenie nie istnieje w datasetcie.`);
        continue;
      }

      const seeded = toSeedExercise(exercise);
      if (deriveHidden(exercise)) fail(`${context}: ćwiczenie jest ukryte/deprecated.`);
      if (!deriveMovementPattern(exercise)) fail(`${context}: brak movement_pattern.`);
      if (seeded.instructions.length === 0) fail(`${context}: brak instrukcji.`);
      if (seeded.images.length === 0) fail(`${context}: brak obrazu.`);

      if (environment === "home" && !HOME_ALLOWED.has(exercise.equipment)) {
        fail(`${context}: sprzęt „${exercise.equipment}” nie pasuje do programu domowego.`);
      }
      if (environment === "bodyweight" && !BODYWEIGHT_ALLOWED.has(exercise.equipment)) {
        fail(`${context}: sprzęt „${exercise.equipment}” nie pasuje do programu bodyweight.`);
      }

      if (!Number.isInteger(slot.sets) || slot.sets < 1 || slot.sets > 10) {
        fail(`${context}: nieprawidłowa liczba serii ${slot.sets}.`);
      }
      if (!Number.isInteger(slot.rest) || slot.rest < 0 || slot.rest > 600) {
        fail(`${context}: nieprawidłowa przerwa ${slot.rest}s.`);
      }
      if (slot.repsMin != null && slot.repsMax != null && slot.repsMin > slot.repsMax) {
        fail(`${context}: repsMin > repsMax.`);
      }
      if (slot.repsMin != null && slot.repsMax != null && slot.repsMin === slot.repsMax) {
        fail(`${context}: stałe ${slot.repsMin} powt. blokuje double progression — podaj zakres.`);
      }

      const type = deriveExerciseType(exercise);
      const hasReps = slot.repsMin != null || slot.repsMax != null;
      if (type === "timed" && hasReps) {
        fail(`${context}: ćwiczenie timed ma zadany zakres powtórzeń.`);
      }
      if (type !== "timed" && !hasReps && !/amrap|max|maksymal/i.test(slot.notes ?? "")) {
        fail(`${context}: ćwiczenie ${type} bez celu powtórzeń ani informacji o serii prawie maksymalnej.`);
      }

      if (seeded.images.includes("/exercise-placeholder.svg")) {
        placeholderExerciseIds.add(slot.exercise_id);
        warn(`${context}: używa placeholdera zdjęcia.`);
      }
    }
  }
}

const alternativeKeys = new Set<string>();
for (const alternative of PLANNED_PROGRAM_ALTERNATIVES) {
  const key = [
    alternative.programSlug,
    alternative.dayLabel,
    alternative.defaultExerciseId,
    alternative.alternativeExerciseId,
  ].join("::");
  if (alternativeKeys.has(key)) fail(`Duplikat planowanej alternatywy: ${key}.`);
  alternativeKeys.add(key);

  const program = PROGRAMS.find((item) => item.slug === alternative.programSlug);
  const day = program?.days.find((item) => item.label === alternative.dayLabel);
  const sourceSlot = day?.slots.find(
    (item) => item.exercise_id === alternative.defaultExerciseId,
  );
  const alternativeExercise = byId.get(alternative.alternativeExerciseId);
  const context = `${alternative.programSlug} / ${alternative.dayLabel}`;

  if (!program) fail(`${context}: planowana alternatywa wskazuje nieistniejący program.`);
  if (!day) fail(`${context}: planowana alternatywa wskazuje nieistniejący dzień.`);
  if (!sourceSlot) {
    fail(`${context}: brak źródłowego slotu ${alternative.defaultExerciseId}.`);
  }
  if (!alternativeExercise) {
    fail(`${context}: alternatywa ${alternative.alternativeExerciseId} nie istnieje.`);
  } else {
    if (deriveHidden(alternativeExercise)) {
      fail(`${context}: alternatywa ${alternative.alternativeExerciseId} jest ukryta.`);
    }
    if (program?.environment === "home" && !HOME_ALLOWED.has(alternativeExercise.equipment)) {
      fail(
        `${context}: sprzęt alternatywy „${alternativeExercise.equipment}” nie pasuje do programu domowego.`,
      );
    }
  }
  if (alternative.missingEquipment.length === 0) {
    fail(`${context}: alternatywa nie ma jawnego triggera brakującego sprzętu.`);
  }
  if (alternative.notePl.trim().length < 24) {
    fail(`${context}: alternatywa nie opisuje użytkownikowi kompromisu.`);
  }
}

const visible = exercises.filter((exercise) => !deriveHidden(exercise));
const missingPatternVisible = visible.filter((exercise) => !deriveMovementPattern(exercise));
if (missingPatternVisible.length > 0) {
  fail(
    `${missingPatternVisible.length} widocznych ćwiczeń nadal nie ma movement_pattern: ${missingPatternVisible
      .map((exercise) => exercise.id)
      .join(", ")}`,
  );
}

console.log(
  `Audyt: ${exercises.length} ćwiczeń · ${visible.length} widocznych · ${PROGRAMS.length} programów · ${slotCount} slotów · ${usedExerciseIds.size} ćwiczeń w presetach`,
);
if (warnings.length > 0) {
  console.log(`\nOstrzeżenia (${warnings.length}):`);
  for (const message of warnings) console.log(`- ${message}`);
  console.log(
    `Podsumowanie placeholderów: ${placeholderExerciseIds.size} unikalnych ćwiczeń w ${warnings.length} slotach.`,
  );
}
if (errors.length > 0) {
  console.error(`\nBłędy (${errors.length}):`);
  for (const message of errors) console.error(`- ${message}`);
  process.exitCode = 1;
} else {
  console.log("\nOK — brak błędów integralności treści treningowej.");
}
