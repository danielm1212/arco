import assert from "node:assert/strict";
import { test } from "node:test";
import { countPl, pluralPl, WORDS } from "../lib/plural";
import { setWord, streakWeeksText, trainingWord, weekWord } from "../lib/streakCopy";

/**
 * D1 (audyt 2026-07-31): odmiana liczebników. Test pilnuje liczb, na których
 * realnie się wykładała — nie 1/2/5, tylko granic: 12–14 (idą do „many" mimo
 * końcówki 2–4) i setek (102 wraca do „few"). To jest ten przypadek, przez
 * który `WeeklyGoalBadge` mówił „22 tygodni" zamiast „22 tygodnie".
 */
test("pluralPl trzyma trzy formy na granicach, nie tylko dla 1/2/5", () => {
  const cases: [number, string][] = [
    [1, "trening"],
    [2, "treningi"],
    [4, "treningi"],
    [5, "treningów"],
    [11, "treningów"],
    [12, "treningów"],
    [13, "treningów"],
    [14, "treningów"],
    [15, "treningów"],
    [21, "treningów"],
    [22, "treningi"],
    [24, "treningi"],
    [25, "treningów"],
    [102, "treningi"],
    [112, "treningów"],
    [0, "treningów"],
  ];
  for (const [n, expected] of cases) {
    assert.equal(pluralPl(n, WORDS.training), expected, `n=${n}`);
  }
});

test("countPl skleja liczbę z odmienionym rzeczownikiem", () => {
  assert.equal(countPl(1, WORDS.exercise), "1 ćwiczenie");
  assert.equal(countPl(3, WORDS.exercise), "3 ćwiczenia");
  assert.equal(countPl(7, WORDS.exercise), "7 ćwiczeń");
  assert.equal(countPl(1, WORDS.session), "1 sesja");
  assert.equal(countPl(22, WORDS.plan), "22 plany");
});

test("stare helpery odmiany dają dokładnie to samo co pluralPl", () => {
  // Zostały jako nazwane skróty, ale nie mogą się rozjechać z regułą.
  for (let n = 0; n <= 130; n++) {
    assert.equal(trainingWord(n), pluralPl(n, WORDS.training), `trening n=${n}`);
    assert.equal(weekWord(n), pluralPl(n, WORDS.week), `tydzień n=${n}`);
    assert.equal(setWord(n), pluralPl(n, WORDS.set), `seria n=${n}`);
  }
});

/** D5: passa nigdy nie mówi przez stratę — „0 tygodni z rzędu" nie istnieje. */
test("streakWeeksText milczy przy zerowej passie", () => {
  assert.equal(streakWeeksText(0), null);
  assert.equal(streakWeeksText(1), "1 tydzień z rzędu");
  assert.equal(streakWeeksText(22), "22 tygodnie z rzędu");
});
