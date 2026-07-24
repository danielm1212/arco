import assert from "node:assert/strict";
import { test } from "node:test";
import {
  validateSetNumbers,
  reviewWorkingSetWeight,
  getCompletionBlockReason,
} from "../lib/setValidation";

test("walidacja serii ogranicza dane do zakresu produktu", () => {
  assert.equal(validateSetNumbers({ weight: 1000, reps: 100 }), null);
  assert.match(validateSetNumbers({ weight: 1000.5 }) ?? "", /0–1000/);
  assert.match(validateSetNumbers({ reps: 0 }) ?? "", /1 do 100/);
  assert.match(validateSetNumbers({ reps: 10.5 }) ?? "", /całkowitą/);
});

test("nietypowa seria robocza wymaga świadomego potwierdzenia", () => {
  assert.deepEqual(
    reviewWorkingSetWeight({ type: "weighted", setType: "working", weight: 305, previousWeight: 200 }),
    { reasons: ["high_weight", "large_jump"], previousWeight: 200 },
  );
  assert.deepEqual(
    reviewWorkingSetWeight({ type: "weighted", setType: "working", weight: 151, previousWeight: 100 }),
    { reasons: ["large_jump"], previousWeight: 100 },
  );
  assert.equal(
    reviewWorkingSetWeight({ type: "weighted", setType: "warmup", weight: 400, previousWeight: 100 }),
    null,
  );
  assert.deepEqual(
    reviewWorkingSetWeight({ type: "weighted", setType: "working", weight: 501, previousWeight: 400 }),
    { reasons: ["high_weight", "very_high_weight"], previousWeight: 400 },
  );
});

test("DATA-01: zaliczona seria wymaga wyniku właściwego dla typu ćwiczenia", () => {
  // weighted: ciężar i powtórzenia
  assert.match(
    getCompletionBlockReason("weighted", { weight: null, reps: 8 }) ?? "",
    /ciężar i powtórzenia/,
  );
  assert.match(
    getCompletionBlockReason("weighted", { weight: 60, reps: null }) ?? "",
    /ciężar i powtórzenia/,
  );
  assert.equal(getCompletionBlockReason("weighted", { weight: 0, reps: 8 }), null);
  assert.equal(getCompletionBlockReason("weighted", { weight: 60, reps: 8 }), null);

  // bodyweight: tylko powtórzenia (added_weight opcjonalny)
  assert.match(
    getCompletionBlockReason("bodyweight", { reps: null }) ?? "",
    /powtórzenia/,
  );
  assert.equal(getCompletionBlockReason("bodyweight", { reps: 12 }), null);

  // timed: czas > 0
  assert.match(
    getCompletionBlockReason("timed", { duration_seconds: null }) ?? "",
    /czas/,
  );
  assert.match(
    getCompletionBlockReason("timed", { duration_seconds: 0 }) ?? "",
    /czas/,
  );
  assert.equal(getCompletionBlockReason("timed", { duration_seconds: 45 }), null);
});
