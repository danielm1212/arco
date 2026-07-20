import assert from "node:assert/strict";
import { test } from "node:test";
import { estimate1RM, isE1rmRepRange, setMetric } from "../lib/exerciseMetrics";

test("estimate1RM liczy wzór Epleya z zaokrągleniem do 0,1", () => {
  assert.equal(estimate1RM(100, 1), 103.3);
  assert.equal(estimate1RM(100, 5), 116.7);
  assert.equal(estimate1RM(60, 10), 80);
  assert.equal(estimate1RM(82.5, 8), 104.5);
});

test("setMetric wybiera metrykę wg typu ćwiczenia", () => {
  const s = { weight: 100, reps: 5, duration_seconds: 45 };
  assert.equal(setMetric("weighted", s), 116.7);
  assert.equal(setMetric("bodyweight", s), 5);
  assert.equal(setMetric("timed", s), 45);
});

test("setMetric zwraca null przy brakach danych dla danego typu", () => {
  assert.equal(setMetric("weighted", { weight: 100, reps: null, duration_seconds: null }), null);
  assert.equal(setMetric("weighted", { weight: null, reps: 5, duration_seconds: null }), null);
  assert.equal(setMetric("bodyweight", { weight: 100, reps: null, duration_seconds: 45 }), null);
  assert.equal(setMetric("timed", { weight: 100, reps: 5, duration_seconds: null }), null);
});

test("e1RM nie interpretuje serii poza zakresem 1–10 powtórzeń", () => {
  assert.equal(isE1rmRepRange(1), true);
  assert.equal(isE1rmRepRange(10), true);
  assert.equal(isE1rmRepRange(0), false);
  assert.equal(isE1rmRepRange(11), false);
  assert.equal(isE1rmRepRange(8.5), false);
  assert.equal(setMetric("weighted", { weight: 100, reps: 11, duration_seconds: null }), null);
});
