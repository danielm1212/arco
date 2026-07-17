import assert from "node:assert/strict";
import { test } from "node:test";
import { computeStreak, localDayKey, weekStart, WEEK_MS } from "../lib/week";

test("localDayKey: formatuje datę lokalną jako YYYY-MM-DD", () => {
  assert.equal(localDayKey(new Date(2026, 6, 17)), "2026-07-17");
  assert.equal(localDayKey(new Date(2026, 0, 5)), "2026-01-05");
});

test("localDayKey: nie przechodzi przez UTC (bug 2026-07-03)", () => {
  // Godzina 23:30 lokalnie w dniu 17 nie może przeskoczyć na 18, nawet gdyby
  // konwersja przez toISOString() przesunęła datę w UTC.
  const d = new Date(2026, 6, 17, 23, 30);
  assert.equal(localDayKey(d), "2026-07-17");
});

test("weekStart: cofa do poniedziałku 00:00", () => {
  // Piątek 17.07.2026 → poniedziałek 13.07.2026
  const friday = new Date(2026, 6, 17, 15, 30);
  const monday = new Date(weekStart(friday));
  assert.equal(monday.getDay(), 1);
  assert.equal(monday.getDate(), 13);
  assert.equal(monday.getHours(), 0);
  assert.equal(monday.getMinutes(), 0);
});

test("weekStart: niedziela należy do tygodnia, który się kończy, nie zaczyna", () => {
  const sunday = new Date(2026, 6, 19); // niedziela
  const monday = new Date(weekStart(sunday));
  assert.equal(monday.getDate(), 13);
});

test("weekStart: poniedziałek jest swoim własnym startem", () => {
  const monday = new Date(2026, 6, 13, 9, 0);
  assert.equal(weekStart(monday), weekStart(new Date(2026, 6, 13)));
});

test("computeStreak: pusty zbiór to zero", () => {
  assert.equal(computeStreak(new Set()), 0);
});

test("computeStreak: liczy kolejne tygodnie wstecz od bieżącego", () => {
  const thisWeek = weekStart(new Date());
  const lastWeek = thisWeek - WEEK_MS;
  const twoWeeksAgo = thisWeek - 2 * WEEK_MS;
  assert.equal(computeStreak(new Set([thisWeek, lastWeek, twoWeeksAgo])), 3);
});

test("computeStreak: bieżący pusty tydzień nie zeruje passy", () => {
  const thisWeek = weekStart(new Date());
  const lastWeek = thisWeek - WEEK_MS;
  const twoWeeksAgo = thisWeek - 2 * WEEK_MS;
  // Brak treningu w tym tygodniu — licz od poprzedniego.
  assert.equal(computeStreak(new Set([lastWeek, twoWeeksAgo])), 2);
});

test("computeStreak: dziura przerywa passę", () => {
  const thisWeek = weekStart(new Date());
  const twoWeeksAgo = thisWeek - 2 * WEEK_MS;
  // Brak tygodnia -1 — passa liczy tylko bieżący.
  assert.equal(computeStreak(new Set([thisWeek, twoWeeksAgo])), 1);
});
