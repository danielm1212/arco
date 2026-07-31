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

/* PLAN-05G: skala narastająca zamiast zakresu (decyzja właściciela 2026-07-31 —
   „początkujący = jedna kropka, średniozaawansowany = dwie, zaawansowany = trzy”).
   Liczba zapalonych segmentów zależy WYŁĄCZNIE od `level_max`. */

test("buildLevelMeter: poziom 1 zapala jeden segment", () => {
  const meter = buildLevelMeter(1, 1, "Początkujący");
  assert.ok(meter);
  assert.equal(meter.ariaLabel, "Poziom 1 z 3: Początkujący");
  assert.deepEqual(meter.segments, [true, false, false]);
});

test("buildLevelMeter: poziom 2 zapala DWA segmenty narastająco, nie sam środkowy", () => {
  const meter = buildLevelMeter(2, 2, "Średniozaawansowany");
  assert.ok(meter);
  assert.equal(meter.ariaLabel, "Poziom 2 z 3: Średniozaawansowany");
  assert.deepEqual(meter.segments, [true, true, false]);
});

test("buildLevelMeter: poziom 3 zapala wszystkie trzy segmenty", () => {
  const meter = buildLevelMeter(3, 3, "Zaawansowany");
  assert.ok(meter);
  assert.deepEqual(meter.segments, [true, true, true]);
});

test("buildLevelMeter: zakres 1–2 wygląda jak poziom 2 i dostaje etykietę „do ...”", () => {
  const meter = buildLevelMeter(1, 2, "Początkujący–średniozaawansowany");
  assert.ok(meter);
  assert.equal(meter.label, "Do średniozaawansowanego");
  assert.equal(meter.ariaLabel, "Poziom 2 z 3: Do średniozaawansowanego");
  assert.deepEqual(meter.segments, [true, true, false]);
});

test("buildLevelMeter: zakres 2–3 zapala wszystko i mówi „Do zaawansowanego”", () => {
  const meter = buildLevelMeter(2, 3, "Średnio–zaawansowany");
  assert.ok(meter);
  assert.equal(meter.label, "Do zaawansowanego");
  assert.deepEqual(meter.segments, [true, true, true]);
});

test("buildLevelMeter: pojedynczy poziom zachowuje etykietę z bazy, nie podmienia jej na „do ...”", () => {
  const meter = buildLevelMeter(3, 3, "Zaawansowany");
  assert.ok(meter);
  assert.equal(meter.label, "Zaawansowany");
});

test("buildLevelMeter: liczba segmentów zawsze równa LEVEL_METER_TOTAL", () => {
  const meter = buildLevelMeter(1, 3, "Wszystkie poziomy");
  assert.ok(meter);
  assert.equal(meter.segments.length, LEVEL_METER_TOTAL);
});
