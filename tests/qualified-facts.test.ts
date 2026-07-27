import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

test("DATA-03: funkcje DB wykluczają pominięte ćwiczenia z rekordów i poprzednich wyników", () => {
  const migration = read(
    "supabase/migrations/20260727110435_data03_exclude_skipped_exercises.sql",
  );

  assert.match(migration, /create or replace function recompute_personal_records\(\)/);
  assert.match(migration, /create or replace function public\.previous_working_set/);
  assert.match(migration, /create or replace function public\.previous_session_sets/);
  assert.ok(
    (migration.match(/not se\.skipped/g) ?? []).length >= 4,
    "każda ścieżka faktu DB musi odrzucać skipped=true",
  );
});

test("DATA-03: pochodne aplikacji filtrują skipped=false", () => {
  const files = [
    "lib/getHomeGuidance.ts",
    "lib/repPRs.ts",
    "app/exercise/[id]/page.tsx",
    "app/progress/stats.ts",
    "app/actions/session.ts",
  ];

  for (const file of files) {
    assert.match(
      read(file),
      /\.eq\("(?:session_exercises\.)?skipped", false\)/,
      `${file} nie filtruje pominiętych ćwiczeń`,
    );
  }
});

test("DATA-03: zmiana skipped w zakończonej sesji przelicza pochodne", () => {
  const actions = read("app/actions/sets.ts");
  const functionSource = actions.match(
    /export async function setSessionExerciseSkipped[\s\S]*?\n}\n/,
  )?.[0];

  assert.ok(functionSource, "brak setSessionExerciseSkipped");
  assert.match(functionSource, /refreshFinishedSessionDerivedData\(supabase, sessionId\)/);
});
