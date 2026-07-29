import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { PLANNED_PROGRAM_ALTERNATIVES } from "../scripts/data/program-slot-alternatives";
import { deterministicSeedUuid, PROGRAMS } from "../scripts/seed";

const pointSyncPath = fileURLToPath(
  new URL(
    "../supabase/migrations/20260727134500_train02a4_missing_programs.sql",
    import.meta.url,
  ),
);
const alternativesContractPath = fileURLToPath(
  new URL(
    "../supabase/migrations/20260727133000_train03_05_minimum_alternatives.sql",
    import.meta.url,
  ),
);
const requiredExercisesPath = fileURLToPath(
  new URL(
    "../supabase/migrations/20260727134000_train02a4_required_exercises.sql",
    import.meta.url,
  ),
);
const pointSyncSql = readFileSync(pointSyncPath, "utf8");
const alternativesContractSql = readFileSync(alternativesContractPath, "utf8");
const requiredExercisesSql = readFileSync(requiredExercisesPath, "utf8");

const targetSlugs = new Set([
  "beginner-gym-fbw2",
  "beginner-home-fbw2",
  "intermediate-bodyweight-fbw3",
  "advanced-home-upper-lower4",
  "advanced-bodyweight-upper-lower4",
]);

function embeddedJson(marker: string) {
  const pattern = new RegExp(
    `${marker}_payload constant jsonb := \\$${marker}\\$([\\s\\S]*?)\\$${marker}\\$::jsonb;`,
  );
  const match = pointSyncSql.match(pattern);
  assert.ok(match, `Brak payloadu $${marker}$ w migracji TRAIN-02A4.`);
  return JSON.parse(match[1]);
}

test("TRAIN-02A4 SQL zawiera dokładną kopię pięciu zatwierdzonych recept", () => {
  // Payload jest MIGAWKĄ HISTORYCZNĄ z 2026-07-27 i celowo nie śledzi bieżącego seeda —
  // kolejne paczki treści (PLAN-C1B, PLAN-C2) zmieniają recepty, a wdrożonej migracji
  // nie wolno przepisywać. Pilnujemy więc kształtu i zakresu, nie zamrożonej treści.
  const embeddedPrograms = embeddedJson("programs");

  assert.deepEqual(
    embeddedPrograms.map((program: { slug: string }) => program.slug).sort(),
    [...targetSlugs].sort(),
  );
  assert.ok(
    PROGRAMS.filter((program) => targetSlugs.has(program.slug)).length === 5,
    "pięć planów TRAIN-02A4 musi nadal istnieć w seedzie",
  );
  assert.equal(embeddedPrograms.length, 5);
  assert.equal(
    embeddedPrograms.reduce(
      (total: number, program: { days: unknown[] }) => total + program.days.length,
      0,
    ),
    15,
  );
  assert.equal(
    embeddedPrograms.reduce(
      (programTotal: number, program: { days: { slots: unknown[] }[] }) =>
        programTotal +
        program.days.reduce((dayTotal, day) => dayTotal + day.slots.length, 0),
      0,
    ),
    99,
  );
});

test("TRAIN-02A4 SQL zawiera dokładnie 29 zatwierdzonych alternatyw", () => {
  // Porównujemy wyłącznie zakres TRAIN-02A4. Kolejne paczki treści (PLAN-C1 i dalsze)
  // dopisują alternatywy dla innych programów i nie mogą przepisywać tej migracji.
  const shipped = PLANNED_PROGRAM_ALTERNATIVES.filter((item) =>
    targetSlugs.has(item.programSlug),
  );

  assert.deepEqual(embeddedJson("alternatives"), shipped);
  assert.equal(shipped.length, 29);
});

test("point sync nie usuwa danych i używa deterministycznych identyfikatorów", () => {
  assert.doesNotMatch(pointSyncSql, /\bdelete\s+from\b/i);
  assert.match(pointSyncSql, /md5\('arco:system-program:'/);
  assert.match(pointSyncSql, /md5\(\s*'arco:system-program-day:'/);
  assert.match(pointSyncSql, /md5\(\s*'arco:system-program-slot:'/);
  assert.equal(
    deterministicSeedUuid("arco:system-program:beginner-gym-fbw2"),
    "642c3e48-64d8-4b4e-f652-47dba4722ee2",
  );
});

test("minimalny kontrakt alternatyw ma FK, RLS i write policy tylko dla właściciela", () => {
  assert.match(
    alternativesContractSql,
    /references public\.program_day_slots \(id\) on delete cascade/,
  );
  assert.match(
    alternativesContractSql,
    /references public\.exercises \(id\)/,
  );
  assert.match(
    alternativesContractSql,
    /alter table public\.program_slot_alternatives enable row level security/,
  );
  assert.match(
    alternativesContractSql,
    /program\.user_id = \(select auth\.uid\(\)\)/,
  );
  assert.match(
    alternativesContractSql,
    /grant all\s+on public\.program_slot_alternatives\s+to service_role/,
  );
});

test("SQL prerequisite uzupełnia punktowo dwa brakujące ćwiczenia bez service_role", () => {
  assert.match(requiredExercisesSql, /'Band_Lat_Pulldown'/);
  assert.match(requiredExercisesSql, /'Single_Leg_Calf_Raise'/);
  assert.match(requiredExercisesSql, /on conflict \(id\)/);
  assert.match(requiredExercisesSql, /where public\.exercises\.user_id is null/);
  assert.match(requiredExercisesSql, /if not exists \(select 1 from public\.exercises\)/);
  assert.doesNotMatch(requiredExercisesSql, /SUPABASE_SERVICE_ROLE_KEY/);
});
