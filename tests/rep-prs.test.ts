import assert from "node:assert/strict";
import { test } from "node:test";
import { repPRRows } from "../lib/repPRs";

test("repPRRows zwraca pustą listę dla braku rekordów", () => {
  assert.deepEqual(repPRRows({}), []);
});

test("repPRRows sortuje po powtórzeniach i zachowuje ściśle malejące ciężary", () => {
  // Klucze celowo nie po kolei — wejście z mapy reps → ciężar.
  const rows = repPRRows({ 8: 80, 1: 120, 5: 100 });
  assert.deepEqual(rows, [
    { reps: 1, weight: 120 },
    { reps: 5, weight: 100 },
    { reps: 8, weight: 80 },
  ]);
});

test("repPRRows odfiltrowuje wpisy zdominowane (Pareto)", () => {
  // 3×100 jest szumem, skoro przy 5 powt. też jest 100 (więcej powt., nie mniej ciężaru).
  assert.deepEqual(repPRRows({ 3: 100, 5: 100 }), [{ reps: 5, weight: 100 }]);

  // 6×90 dominuje i 2×85, i 4×90 — zostaje sam.
  assert.deepEqual(repPRRows({ 2: 85, 4: 90, 6: 90 }), [{ reps: 6, weight: 90 }]);

  // Mieszany przypadek: dominacja nie jest przechodnia przez dziury.
  assert.deepEqual(repPRRows({ 1: 140, 3: 120, 5: 125, 10: 60 }), [
    { reps: 1, weight: 140 },
    { reps: 5, weight: 125 },
    { reps: 10, weight: 60 },
  ]);
});

test("repPRRows zachowuje pojedynczy rekord", () => {
  assert.deepEqual(repPRRows({ 5: 100 }), [{ reps: 5, weight: 100 }]);
});
