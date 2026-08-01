import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("app/session/[id]/done/page.tsx", "utf8");

test("Done: zapytanie pobiera wszystkie kolumny serii, od których zależy podsumowanie", () => {
  // AUDIT-A3: asercja była przyklejona do DOKŁADNEGO ciągu selecta, więc pękała
  // przy dołożeniu kolumny (`added_weight`) i niczego nie chroniła poza kolejnością
  // słów. Sprawdzamy teraz obecność każdej potrzebnej kolumny osobno — czyli
  // warunek, który realnie musi być spełniony, żeby ekran Done liczył poprawnie.
  const select = source.match(/session_sets\(([^)]*)\)/)?.[1] ?? "";
  for (const column of [
    "weight",
    "reps",
    "duration_seconds",
    "added_weight", // objętość dla ćwiczeń z masą własną (lib/sessionSetFacts)
    "set_type",
    "completed",
  ]) {
    assert.ok(
      select.split(/\s*,\s*/).includes(column),
      `select serii na ekranie Done nie pobiera kolumny "${column}"`,
    );
  }
});

test("Done: podsumowanie nie celebruje pominiętych ćwiczeń", () => {
  assert.match(source, /\.filter\(\(exercise\) => !exercise\.skipped\)/);
});

test("SESSION-01A: Done celebruje wyłącznie zaliczone serie robocze", () => {
  assert.match(source, /const completed = allSets\.filter\(isCompletedWorkingSet\)/);
  assert.match(source, /e\.session_sets\.some\(isCompletedWorkingSet\)/);
});

test("SESSION-01A4: rozciąganie zeszło z Done do treningu", () => {
  // Feedback 2026-07-27: na ekranie podsumowania rozciąganie było już po
  // wszystkim, a wtedy nikt do niego nie wraca. Jest ostatnią pozycją treningu.
  assert.doesNotMatch(source, /kind="stretching"/);
  assert.doesNotMatch(source, /Rozciąganie/);

  const logger = readFileSync("app/session/[id]/Logger.tsx", "utf8");
  assert.match(logger, /kind="stretching"/);
  assert.match(logger, /title="Rozciąganie"/);
  // Musi stać ZA listą ćwiczeń, inaczej przestaje być „ostatnią pozycją".
  assert.ok(
    logger.indexOf('kind="stretching"') > logger.indexOf("exercises.map("),
    "rozciąganie nie jest ostatnią pozycją treningu",
  );
  assert.doesNotMatch(logger, /przyspiesza regenerację|zapobiega urazom/i);
});
