import assert from "node:assert/strict";
import test from "node:test";
import {
  formatCycleStructure,
  formatRotationGuidance,
  formatWeeklyRotationExample,
} from "../lib/programRecommendation";

test("rotacja pokazuje wszystkie dni planu, także dla czterech i sześciu sesji", () => {
  assert.equal(formatCycleStructure(2), "A → B");
  assert.equal(formatCycleStructure(4), "A → B → C → D");
  assert.equal(formatCycleStructure(6), "A → B → C → D → E → F");
});

test("dwa treningi tygodniowo kontynuują rotację A–B–C w kolejnym tygodniu", () => {
  assert.equal(
    formatWeeklyRotationExample(3, 2),
    "Tydzień 1: A, B · tydzień 2: C, A",
  );
});

test("częstszy rytm nie resetuje krótszej rotacji", () => {
  assert.equal(
    formatWeeklyRotationExample(2, 3),
    "Tydzień 1: A, B, A · tydzień 2: B, A, B",
  );
});

test("opis rotacji wprost wyjaśnia brak resetu na początku tygodnia", () => {
  assert.match(formatRotationGuidance(3), /nowy tydzień nie resetuje kolejności/);
});
