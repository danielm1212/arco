import test from "node:test";
import assert from "node:assert/strict";
import {
  formatProgramDuration,
  formatProgramFrequency,
  formatProgramLevelLabel,
  formatProgramTrainingCount,
} from "../lib/programDetail";

test("PLAN-05D: liczba treningów ma poprawną polską odmianę", () => {
  assert.equal(formatProgramTrainingCount(1), "1 trening");
  assert.equal(formatProgramTrainingCount(3), "3 treningi");
  assert.equal(formatProgramTrainingCount(5), "5 treningów");
});

test("PLAN-05D: częstotliwość jest zwarta, ale zachowuje pełny zakres", () => {
  assert.equal(formatProgramFrequency(2, 2), "2 dni/tydz.");
  assert.equal(formatProgramFrequency(2, 3), "2–3 dni/tydz.");
  assert.equal(formatProgramFrequency(null, 3), null);
});

test("PLAN-05D: czas jest zwarty, ale zachowuje pełny zakres", () => {
  assert.equal(formatProgramDuration(45, 60), "45–60 min");
  assert.equal(formatProgramDuration(50, 50), "50 min");
  assert.equal(formatProgramDuration(45, null), null);
});

test("PLAN-05D: etykieta poziomu zaczyna się wielką literą", () => {
  assert.equal(formatProgramLevelLabel("średniozaawansowany"), "Średniozaawansowany");
  assert.equal(formatProgramLevelLabel(null), null);
});
