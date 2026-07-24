import assert from "node:assert/strict";
import { test } from "node:test";
import { clampNum, formatSet, LIMITS, weightToDisplay, weightToCanonicalKg } from "../lib/format";

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
  // DATA-02: weight jest kanonicznym kg — w trybie lbs formatSet konwertuje do wyświetlenia,
  // NIE etykietuje surowej liczby (60kg to 132.3lbs, nie "60lbs").
  assert.equal(formatSet("weighted", { ...base, weight: 60, reps: 8 }, "lbs"), "132.3lbs × 8");
  assert.equal(formatSet("weighted", { ...base, weight: 60 }, "kg"), "Brak wyniku");
  assert.equal(formatSet("weighted", { ...base, reps: 8 }, "kg"), "Brak wyniku");
});

test("DATA-02: weightToDisplay/weightToCanonicalKg — kg jest kanoniczne, lbs tylko prezentacja", () => {
  // kg -> kg jest tożsamością (zaokrągloną do 0,1)
  assert.equal(weightToDisplay(100, "kg"), 100);
  assert.equal(weightToDisplay(100.05, "kg"), 100.1);
  // kg -> lbs: 100kg ≈ 220.5lbs
  assert.equal(weightToDisplay(100, "lbs"), 220.5);
  // lbs -> kg (input użytkownika w trybie lbs -> zapis)
  assert.equal(weightToCanonicalKg(100, "kg"), 100);
  assert.equal(weightToCanonicalKg(220.5, "lbs"), 100.02);
  // round-trip kg -> lbs -> kg nie ucieka poza rozsądną tolerancję zaokrąglenia
  const original = 137.5;
  const roundTripped = weightToCanonicalKg(weightToDisplay(original, "lbs"), "lbs");
  assert.ok(Math.abs(roundTripped - original) < 0.1);
});
