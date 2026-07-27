import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("SYNC-01: finish rozlicza i ocenia wyłącznie kolejkę bieżącej sesji", () => {
  const source = readFileSync("app/session/[id]/finish.ts", "utf8");

  assert.match(source, /flush\(sessionId\)/);
  assert.match(source, /pendingCount\(sessionId\)/);
  assert.match(source, /quarantineCount\(sessionId\)/);
  assert.doesNotMatch(source, /pendingCount\(\)\s*>\s*0/);
});

test("DATA-03: podsumowanie loggera ignoruje pominięte ćwiczenia", () => {
  const source = readFileSync("app/session/[id]/Logger.tsx", "utf8");

  assert.match(
    source,
    /const factExercises = exercises\.filter\(\(exercise\) => !exercise\.skipped\)/,
  );
  assert.match(source, /const doneSets = factExercises\.reduce/);
  assert.match(source, /const incompleteSets = factExercises\.reduce/);
  assert.match(source, /const volume = factExercises\.reduce/);
});
