import assert from "node:assert/strict";
import { test } from "node:test";
import { buildLevelMeter, LEVEL_METER_TOTAL } from "../lib/levelMeter";

/** PLAN-05C: wybór segmentów/copy paska poziomu dla granicznych wartości
 * (spec-plan-detail-card.md §PLAN-05C). */

test("buildLevelMeter: levelMin null nie renderuje komponentu", () => {
  assert.equal(buildLevelMeter(null, 2, "Średniozaawansowany"), null);
});

test("buildLevelMeter: levelMax null nie renderuje komponentu", () => {
  assert.equal(buildLevelMeter(1, null, "Początkujący"), null);
});

test("buildLevelMeter: brak etykiety tekstowej nie renderuje komponentu (sam pasek bez tekstu nie niesie znaczenia)", () => {
  assert.equal(buildLevelMeter(1, 2, null), null);
});

test("buildLevelMeter: levelMin === levelMax pokazuje pojedynczy poziom, nie zakres", () => {
  const meter = buildLevelMeter(2, 2, "Średniozaawansowany");
  assert.ok(meter);
  assert.equal(meter.ariaLabel, "Poziom 2 z 3: Średniozaawansowany");
  assert.deepEqual(meter.segments, [false, true, false]);
});

test("buildLevelMeter: zakres levelMin < levelMax wypełnia wszystkie segmenty w zakresie", () => {
  const meter = buildLevelMeter(1, 2, "Początkujący–średniozaawansowany");
  assert.ok(meter);
  assert.equal(meter.ariaLabel, "Poziom od 1 do 2 z 3: Początkujący–średniozaawansowany");
  assert.deepEqual(meter.segments, [true, true, false]);
});

test("buildLevelMeter: zakres górny (2–3) zostawia pierwszy segment pusty", () => {
  const meter = buildLevelMeter(2, 3, "Średnio–zaawansowany");
  assert.ok(meter);
  assert.deepEqual(meter.segments, [false, true, true]);
});

test("buildLevelMeter: liczba segmentów zawsze równa LEVEL_METER_TOTAL", () => {
  const meter = buildLevelMeter(1, 3, "Wszystkie poziomy");
  assert.ok(meter);
  assert.equal(meter.segments.length, LEVEL_METER_TOTAL);
});
