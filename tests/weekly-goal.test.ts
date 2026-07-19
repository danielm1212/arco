import assert from "node:assert/strict";
import { test } from "node:test";
import {
  clampWeeklyGoal,
  goalRangeForProgram,
  formatGoalRatio,
  formatGoalProgress,
  formatGoalSentence,
  FALLBACK_GOAL_MIN,
  FALLBACK_GOAL_MAX,
} from "../lib/programRecommendation";
import { weeksMeetingGoal, weekStart } from "../lib/week";

/**
 * F0.1 + F0.6 (audyt 2026-07-18, decyzje D1 i D4).
 * D1: cel tygodniowy nie może wykraczać poza częstotliwość aktywnego planu.
 * D4 (wersja surowa): tydzień liczy się do passy tylko przy osiągniętym celu —
 * 1 z 2 wymaganych treningów przerywa passę.
 */

test("goalRangeForProgram: plan z deklarowaną częstotliwością ogranicza zakres", () => {
  assert.deepEqual(goalRangeForProgram(2, 3), { min: 2, max: 3, constrained: true });
});

test("goalRangeForProgram: plan bez deklaracji (własny program) używa zakresu awaryjnego", () => {
  assert.deepEqual(goalRangeForProgram(null, null), {
    min: FALLBACK_GOAL_MIN,
    max: FALLBACK_GOAL_MAX,
    constrained: false,
  });
});

test("clampWeeklyGoal: cel 5 przy planie 2-3 dni zostaje ścięty do 3 (bug „6/5”)", () => {
  assert.equal(clampWeeklyGoal(5, 2, 3), 3);
});

test("clampWeeklyGoal: cel poniżej minimum planu podnosi się do minimum", () => {
  assert.equal(clampWeeklyGoal(1, 3, 4), 3);
});

test("clampWeeklyGoal: cel w zakresie planu nie zmienia się", () => {
  assert.equal(clampWeeklyGoal(3, 2, 4), 3);
});

test("clampWeeklyGoal: brak wcześniejszej wartości wybiera dolną granicę planu", () => {
  assert.equal(clampWeeklyGoal(null, 3, 4), 3);
  assert.equal(clampWeeklyGoal(undefined, 2, 2), 2);
});

test("clampWeeklyGoal: plan bez deklaracji ścina do zakresu awaryjnego", () => {
  assert.equal(clampWeeklyGoal(7, null, null), FALLBACK_GOAL_MAX);
  assert.equal(clampWeeklyGoal(0, null, null), FALLBACK_GOAL_MIN);
});

test("formatGoalRatio/Progress/Sentence: pokazują bonus osobno zamiast „6/5”", () => {
  assert.equal(formatGoalRatio(6, 5), "5/5+1");
  assert.equal(formatGoalRatio(3, 5), "3/5");
  assert.equal(formatGoalProgress(6, 5), "5/5 +1 bonus");
  assert.equal(formatGoalProgress(5, 5), "5/5");
  assert.equal(formatGoalSentence(6, 5), "5 z 5 treningów + 1 bonus");
  assert.equal(formatGoalSentence(2, 5), "2 z 5 treningów");
});

test("weeksMeetingGoal (D4): tydzień z 1 z 2 wymaganych treningów NIE liczy się", () => {
  const monday = weekStart(new Date(Date.UTC(2026, 6, 13, 10, 0))); // pon 13.07.2026
  const oneWorkout = [Date.UTC(2026, 6, 14, 10, 0)]; // wtorek — tylko 1 trening
  assert.equal(weeksMeetingGoal(oneWorkout, 2).has(monday), false);
});

test("weeksMeetingGoal (D4): tydzień z 2 z 2 wymaganych treningów liczy się", () => {
  const monday = weekStart(new Date(Date.UTC(2026, 6, 13, 10, 0)));
  const twoWorkouts = [Date.UTC(2026, 6, 14, 10, 0), Date.UTC(2026, 6, 16, 10, 0)];
  assert.equal(weeksMeetingGoal(twoWorkouts, 2).has(monday), true);
});

test("weeksMeetingGoal: akceptuje instanty jako number, string ISO i Date", () => {
  const monday = weekStart(new Date(Date.UTC(2026, 6, 13, 10, 0)));
  const mixed = [
    Date.UTC(2026, 6, 14, 10, 0),
    new Date(Date.UTC(2026, 6, 15, 10, 0)).toISOString(),
    new Date(Date.UTC(2026, 6, 16, 10, 0)),
  ];
  assert.equal(weeksMeetingGoal(mixed, 3).has(monday), true);
  assert.equal(weeksMeetingGoal(mixed, 4).has(monday), false);
});
