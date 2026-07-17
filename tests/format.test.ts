import assert from "node:assert/strict";
import { test } from "node:test";
import { clampNum, formatSet, LIMITS } from "../lib/format";

test("clampNum: null i NaN dają null", () => {
  assert.equal(clampNum(null, { max: 100 }), null);
  assert.equal(clampNum(NaN, { max: 100 }), null);
});

test("clampNum: zaciska do zakresu min/max", () => {
  assert.equal(clampNum(150, { max: 100 }), 100);
  assert.equal(clampNum(-5, { max: 100 }), 0);
  assert.equal(clampNum(-5, { min: -10, max: 100 }), -5);
  assert.equal(clampNum(50, { max: 100 }), 50);
});

test("clampNum: domyślny min to 0", () => {
  assert.equal(clampNum(-1, { max: LIMITS.weight }), 0);
});

test("formatSet: timed", () => {
  const base = { weight: null, reps: null, duration_seconds: null, added_weight: null };
  assert.equal(formatSet("timed", { ...base, duration_seconds: 45 }, "kg"), "45s");
  assert.equal(formatSet("timed", base, "kg"), "Brak wyniku");
});

test("formatSet: bodyweight z dociążeniem i bez", () => {
  const base = { weight: null, reps: null, duration_seconds: null, added_weight: null };
  assert.equal(formatSet("bodyweight", { ...base, reps: 12 }, "kg"), "12 powt.");
  assert.equal(
    formatSet("bodyweight", { ...base, reps: 12, added_weight: 5 }, "kg"),
    "12 powt. +5kg",
  );
  assert.equal(formatSet("bodyweight", base, "kg"), "Brak wyniku");
  // added_weight: 0 jest falsy — świadomie pomijane (brak "+0kg" w UI)
  assert.equal(formatSet("bodyweight", { ...base, reps: 12, added_weight: 0 }, "kg"), "12 powt.");
});

test("formatSet: weighted", () => {
  const base = { weight: null, reps: null, duration_seconds: null, added_weight: null };
  assert.equal(formatSet("weighted", { ...base, weight: 60, reps: 8 }, "kg"), "60kg × 8");
  assert.equal(formatSet("weighted", { ...base, weight: 60, reps: 8 }, "lbs"), "60lbs × 8");
  assert.equal(formatSet("weighted", { ...base, weight: 60 }, "kg"), "Brak wyniku");
  assert.equal(formatSet("weighted", { ...base, reps: 8 }, "kg"), "Brak wyniku");
});
