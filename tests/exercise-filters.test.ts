import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BODY_PART_GROUPS,
  EQUIPMENT_GROUPS,
  equipmentForGroups,
  musclesForBodyParts,
} from "../lib/exerciseFilters";

test("musclesForBodyParts: pusta lista id daje pustą listę mięśni", () => {
  assert.deepEqual(musclesForBodyParts([]), []);
});

test("musclesForBodyParts: sumuje mięśnie z jednej partii", () => {
  const muscles = musclesForBodyParts(["chest"]);
  assert.deepEqual(muscles, ["chest"]);
});

test("musclesForBodyParts: łączy partie bez duplikatów (union, nie konkatenacja)", () => {
  // "back" zawiera forearms; gdyby doszła osobna partia z tym samym mięśniem,
  // wynik nie powinien go zdublować.
  const muscles = musclesForBodyParts(["back", "biceps"]);
  assert.equal(new Set(muscles).size, muscles.length);
  assert.ok(muscles.includes("lats"));
  assert.ok(muscles.includes("biceps"));
});

test("musclesForBodyParts: nieznane id jest cicho ignorowane", () => {
  assert.deepEqual(musclesForBodyParts(["nieistniejąca-partia"]), []);
});

test("equipmentForGroups: sumuje wartości equipment z grup", () => {
  const eq = equipmentForGroups(["dumbbell", "barbell"]);
  assert.ok(eq.includes("dumbbell"));
  assert.ok(eq.includes("barbell"));
  assert.ok(eq.includes("e-z curl bar"));
});

test("equipmentForGroups: pusta lista id daje pustą listę", () => {
  assert.deepEqual(equipmentForGroups([]), []);
});

test("BODY_PART_GROUPS i EQUIPMENT_GROUPS: id są unikalne (integralność definicji)", () => {
  const bodyIds = BODY_PART_GROUPS.map((g) => g.id);
  assert.equal(new Set(bodyIds).size, bodyIds.length);
  const eqIds = EQUIPMENT_GROUPS.map((g) => g.id);
  assert.equal(new Set(eqIds).size, eqIds.length);
});
