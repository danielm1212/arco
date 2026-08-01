import assert from "node:assert/strict";
import test from "node:test";
import {
  isCompletedWorkingSet,
  isIncompleteWorkingSet,
  setVolumeKg,
  sumVolumeKg,
} from "../lib/sessionSetFacts";

test("SESSION-01A: tylko zaliczona seria robocza jest faktem ukończenia", () => {
  assert.equal(isCompletedWorkingSet({ completed: true, set_type: "working" }), true);
  assert.equal(isCompletedWorkingSet({ completed: true, set_type: "warmup" }), false);
  assert.equal(isCompletedWorkingSet({ completed: true, set_type: "drop" }), false);
  assert.equal(isCompletedWorkingSet({ completed: false, set_type: "working" }), false);
});

test("SESSION-01A: tylko niezaliczona seria robocza blokuje czysty finish", () => {
  assert.equal(isIncompleteWorkingSet({ completed: false, set_type: "working" }), true);
  assert.equal(isIncompleteWorkingSet({ completed: false, set_type: "warmup" }), false);
  assert.equal(isIncompleteWorkingSet({ completed: true, set_type: "working" }), false);
});

/**
 * AUDIT-A3 (audyt 2026-07-31): objętość ma jeden wzór dla całej aplikacji.
 * Wcześniej istniało sześć kopii `weight * reps` i żadna nie znała `added_weight`,
 * więc podciąganie z dociążeniem wnosiło zero do tonażu na czterech ekranach.
 */

const vset = (over: Partial<Parameters<typeof setVolumeKg>[0]> = {}) => ({
  weight: null,
  reps: null,
  added_weight: null,
  ...over,
});

test("setVolumeKg: zwykła seria z ciężarem", () => {
  assert.equal(setVolumeKg(vset({ weight: 100, reps: 5 })), 500);
});

test("setVolumeKg: dociążenie przy masie własnej WCHODZI do objętości (regresja audytu)", () => {
  // Podciąganie z +20 kg: `weight` jest puste, bo UI pokazuje wtedy pole
  // „Dodatkowy ciężar". Przed poprawką ta seria dawała 0 na Home, /postępy,
  // ekranie Done i w Historii.
  assert.equal(setVolumeKg(vset({ added_weight: 20, reps: 8 })), 160);
});

test("setVolumeKg: gdyby oba pola były wypełnione, sumują się", () => {
  assert.equal(setVolumeKg(vset({ weight: 60, added_weight: 20, reps: 3 })), 240);
});

test("setVolumeKg: masa własna bez dociążenia to świadome 0 (nie znamy wagi ciała)", () => {
  assert.equal(setVolumeKg(vset({ reps: 12 })), 0);
});

test("setVolumeKg: brak powtórzeń, zero i wartości ujemne nie produkują objętości", () => {
  assert.equal(setVolumeKg(vset({ weight: 100 })), 0);
  assert.equal(setVolumeKg(vset({ weight: 100, reps: 0 })), 0);
  assert.equal(setVolumeKg(vset({ weight: -50, reps: 5 })), 0);
});

test("sumVolumeKg: sumuje serie i pomija te bez wkładu", () => {
  assert.equal(
    sumVolumeKg([
      vset({ weight: 100, reps: 5 }),
      vset({ added_weight: 10, reps: 10 }),
      vset({ reps: 15 }),
    ]),
    600,
  );
});
