import assert from "node:assert/strict";
import { test } from "node:test";
import { aggregateHomeExerciseProgress } from "../lib/homeExerciseProgress";
import type { HomeFactRow } from "../lib/homePeriods";

const NOW = Date.UTC(2026, 6, 30, 12);
const ago = (days: number) => new Date(NOW - days * 86_400_000);

function row(
  exerciseId: string,
  daysAgo: number,
  weight: number,
  over: Partial<HomeFactRow> = {},
): HomeFactRow {
  return {
    sessionDate: ago(daysAgo),
    sessionId: `${exerciseId}-${daysAgo}`,
    exerciseId,
    exerciseName: exerciseId,
    type: "weighted",
    weight,
    reps: 5,
    duration_seconds: null,
    ...over,
  };
}

test("HOME-03: wybiera trzy ostatnio trenowane ćwiczenia z min. dwoma punktami", () => {
  const rows = [
    row("A", 40, 100),
    row("A", 1, 120),
    row("B", 30, 60),
    row("B", 2, 60),
    row("C", 20, 70),
    row("C", 3, 75),
    row("D", 10, 80),
    row("D", 4, 82),
    row("E", 0, 100), // ostatnio trenowane, ale bez sparkline — tylko jedna sesja
  ];

  const result = aggregateHomeExerciseProgress(rows, "kg");
  assert.deepEqual(result.map((item) => item.id), ["A", "B", "C"]);
});

test("HOME-03: rekord, 1RM i progres weighted są spójne z setMetric", () => {
  const [result] = aggregateHomeExerciseProgress(
    [row("Przysiad", 40, 100), row("Przysiad", 1, 120)],
    "kg",
  );

  assert.equal(result.record, "120kg × 5");
  assert.equal(result.metricLabel, "1RM");
  assert.equal(result.metricValue, "140 kg");
  assert.equal(result.delta, 23.3);
  assert.equal(result.deltaLabel, "+23,3 kg");
  assert.deepEqual(result.series, [116.7, 140]);
});

test("HOME-03: brak dodatniego progresu jest neutralny, nie negatywny", () => {
  const [result] = aggregateHomeExerciseProgress(
    [row("Wyciskanie", 20, 60), row("Wyciskanie", 1, 60)],
    "kg",
  );

  assert.equal(result.delta, 0);
  assert.equal(result.deltaLabel, "bez zmian");
});

test("HOME-03: typy bodyweight i timed nie udają 1RM", () => {
  const result = aggregateHomeExerciseProgress(
    [
      row("Podciąganie", 20, 0, { type: "bodyweight", weight: null, reps: 8 }),
      row("Podciąganie", 1, 0, { type: "bodyweight", weight: null, reps: 10 }),
      row("Plank", 20, 0, { type: "timed", weight: null, reps: null, duration_seconds: 45 }),
      row("Plank", 2, 0, { type: "timed", weight: null, reps: null, duration_seconds: 60 }),
    ],
    "kg",
  );

  assert.equal(result[0].id, "Podciąganie");
  assert.equal(result[0].metricLabel, "Powtórzenia");
  assert.equal(result[0].record, "10 powt.");
  assert.equal(result[1].metricLabel, "Czas");
  assert.equal(result[1].record, "60s");
});
