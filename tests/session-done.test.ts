import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("app/session/[id]/done/page.tsx", "utf8");

test("Done: zapytanie pobiera czas serii potrzebny treningom timed", () => {
  assert.match(
    source,
    /session_sets\(id, weight, reps, duration_seconds, set_type, completed\)/,
  );
});

test("Done: podsumowanie nie celebruje pominiętych ćwiczeń", () => {
  assert.match(source, /\.filter\(\(exercise\) => !exercise\.skipped\)/);
});

test("SESSION-01A: Done celebruje wyłącznie zaliczone serie robocze", () => {
  assert.match(source, /const completed = allSets\.filter\(isCompletedWorkingSet\)/);
  assert.match(source, /e\.session_sets\.some\(isCompletedWorkingSet\)/);
});

test("SESSION-01A: zakończenie jest opcjonalne i bez obietnic regeneracji", () => {
  assert.match(source, /Spokojne zakończenie · opcjonalnie/);
  assert.match(source, /nie wpływa na zaliczenie treningu/);
  assert.doesNotMatch(source, /przyspiesza regenerację|zapobiega urazom/i);
});
