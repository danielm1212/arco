import assert from "node:assert/strict";
import { test } from "node:test";
import {
  aggregateHomePeriods,
  formatPct,
  formatVolumeCompact,
  type HomeFactRow,
} from "../lib/homePeriods";

/** HOME-02: semantyka okresów i formatowanie liczb (spec-home-i-nawigacja.md §HOME-02). */

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 6, 30, 12, 0, 0); // stały punkt — okna muszą być deterministyczne
const ago = (days: number) => new Date(NOW - days * DAY);

function row(daysAgo: number, over: Partial<HomeFactRow> = {}): HomeFactRow {
  return {
    sessionDate: ago(daysAgo),
    sessionId: `s-${daysAgo}`,
    exerciseId: "Barbell_Squat",
    exerciseName: "Przysiad ze sztangą",
    type: "weighted",
    weight: 100,
    reps: 5,
    duration_seconds: null,
    ...over,
  };
}

test("aggregateHomePeriods: brak zakończonych sesji → null (sekcje się nie renderują, nie pokazujemy zer)", () => {
  assert.equal(
    aggregateHomePeriods({ rows: [], sessionDates: [], prCount30: 0, unit: "kg", now: NOW }),
    null,
  );
});

test("aggregateHomePeriods: sesje liczą się z listy sesji, nie z serii (sesja bez serii nadal jest sesją)", () => {
  const facts = aggregateHomePeriods({
    rows: [],
    sessionDates: [ago(1), ago(6), ago(20), ago(45)],
    prCount30: 0,
    unit: "kg",
    now: NOW,
  });
  assert.ok(facts);
  assert.equal(facts.sessions7, 2); // 1d, 6d
  assert.equal(facts.sessions30, 3); // + 20d; 45d poza oknem
  assert.equal(facts.workingSets30, 0);
});

test("aggregateHomePeriods: objętość 7 dni i wzrost vs poprzedni tydzień", () => {
  const facts = aggregateHomePeriods({
    // bieżący tydzień: 2 × 100kg × 5 = 1000; poprzedni: 1 × 100 × 5 = 500
    rows: [row(1), row(3), row(10)],
    sessionDates: [ago(1), ago(3), ago(10)],
    prCount30: 0,
    unit: "kg",
    now: NOW,
  });
  assert.ok(facts);
  assert.equal(facts.volume7, 1000);
  assert.equal(facts.volumePct, 100);
  assert.equal(facts.workingSets30, 3);
});

test("aggregateHomePeriods: spadek objętości jest informacją, nie ukrywamy go", () => {
  const facts = aggregateHomePeriods({
    rows: [row(1, { reps: 2 }), row(10, { reps: 5 })], // 200 vs 500 → −60%
    sessionDates: [ago(1), ago(10)],
    prCount30: 0,
    unit: "kg",
    now: NOW,
  });
  assert.ok(facts);
  assert.equal(facts.volumePct, -60);
});

test("aggregateHomePeriods: brak poprzedniego tygodnia → brak procentu zamiast fałszywego +100%", () => {
  const facts = aggregateHomePeriods({
    rows: [row(2)],
    sessionDates: [ago(2)],
    prCount30: 0,
    unit: "kg",
    now: NOW,
  });
  assert.ok(facts);
  assert.equal(facts.volumePct, null);
});

test("aggregateHomePeriods: seria bez ciężaru lub powtórzeń nie wchodzi do objętości, ale liczy się do serii", () => {
  const facts = aggregateHomePeriods({
    rows: [row(1, { weight: null }), row(2, { reps: null }), row(3)],
    sessionDates: [ago(1), ago(2), ago(3)],
    prCount30: 0,
    unit: "kg",
    now: NOW,
  });
  assert.ok(facts);
  assert.equal(facts.volume7, 500); // tylko pełna seria
  assert.equal(facts.workingSets30, 3);
});

test("aggregateHomePeriods: topProgress wymaga dwóch sesji tego samego ćwiczenia", () => {
  const facts = aggregateHomePeriods({
    rows: [row(3)],
    sessionDates: [ago(3)],
    prCount30: 0,
    unit: "kg",
    now: NOW,
  });
  assert.ok(facts);
  assert.equal(facts.topProgress, null);
});

test("aggregateHomePeriods: topProgress wybiera największy przyrost e1RM (jak /progress)", () => {
  const facts = aggregateHomePeriods({
    rows: [
      // przysiad: 100 → 120 kg
      row(40, { weight: 100 }),
      row(2, { weight: 120 }),
      // wyciskanie: 60 → 62,5 kg (mniejszy przyrost)
      row(40, { exerciseId: "Bench", exerciseName: "Wyciskanie", weight: 60, sessionId: "b-40" }),
      row(2, { exerciseId: "Bench", exerciseName: "Wyciskanie", weight: 62.5, sessionId: "b-2" }),
    ],
    sessionDates: [ago(40), ago(2)],
    prCount30: 0,
    unit: "kg",
    now: NOW,
  });
  assert.ok(facts?.topProgress);
  assert.equal(facts.topProgress.name, "Przysiad ze sztangą");
  // e1RM Epley przy 5 powt.: 100 × (1+5/30) = 116,7 → 120 × … = 140,0; delta 23,3
  assert.equal(facts.topProgress.delta, 23.3);
  assert.equal(facts.topProgress.suffix, "kg");
});

test("aggregateHomePeriods: regres siły nie jest pokazywany jako „progres”", () => {
  const facts = aggregateHomePeriods({
    rows: [row(40, { weight: 120 }), row(2, { weight: 100 })],
    sessionDates: [ago(40), ago(2)],
    prCount30: 0,
    unit: "kg",
    now: NOW,
  });
  assert.ok(facts);
  assert.equal(facts.topProgress, null);
});

test("aggregateHomePeriods: lbs konwertuje objętość na granicy prezentacji (DATA-02)", () => {
  const facts = aggregateHomePeriods({
    rows: [row(1)], // 500 kg
    sessionDates: [ago(1)],
    prCount30: 0,
    unit: "lbs",
    now: NOW,
  });
  assert.ok(facts);
  assert.equal(facts.volume7, 1102.3); // 500 / 0,45359237
  assert.equal(facts.unit, "lbs");
});

test("aggregateHomePeriods: licznik rekordów przechodzi bez zmian", () => {
  const facts = aggregateHomePeriods({
    rows: [],
    sessionDates: [ago(5)],
    prCount30: 3,
    unit: "kg",
    now: NOW,
  });
  assert.equal(facts?.prCount30, 3);
});

test("formatVolumeCompact: kg powyżej tysiąca skraca się do ton", () => {
  assert.deepEqual(formatVolumeCompact(13_400, "kg"), { value: "13,4", suffix: "t" });
});

test("formatVolumeCompact: lbs powyżej tysiąca skraca się do tysięcy, nie do ton metrycznych", () => {
  assert.deepEqual(formatVolumeCompact(29_500, "lbs"), { value: "29,5", suffix: "tys. lb" });
});

test("formatVolumeCompact: poniżej tysiąca pełna liczba w jednostce profilu", () => {
  assert.deepEqual(formatVolumeCompact(940, "kg"), { value: "940", suffix: "kg" });
  assert.deepEqual(formatVolumeCompact(0, "kg"), { value: "0", suffix: "kg" });
});

test("formatPct: znak jest zawsze jawny", () => {
  assert.equal(formatPct(12), "+12%");
  assert.equal(formatPct(-8), "-8%");
  assert.equal(formatPct(0), "+0%");
});
