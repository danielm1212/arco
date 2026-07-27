import assert from "node:assert/strict";
import test from "node:test";
import {
  isCompletedWorkingSet,
  isIncompleteWorkingSet,
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
