import test from "node:test";
import assert from "node:assert/strict";
import { missingProgramEquipment } from "@/lib/programRecommendation";

test("program zgodny ze sprzętem nie zgłasza braków", () => {
  assert.deepEqual(
    missingProgramEquipment(["dumbbell", "body only"], ["dumbbell", "body only"]),
    [],
  );
});

test("biblioteka wskazuje dokładnie brakujący sprzęt zamiast ukrywać plan", () => {
  assert.deepEqual(
    missingProgramEquipment(["body only", "pull-up bar"], ["body only"]),
    ["pull-up bar"],
  );
});

test("plan bez wymagań pozostaje dostępny dla każdego profilu sprzętu", () => {
  assert.deepEqual(missingProgramEquipment([], []), []);
});
