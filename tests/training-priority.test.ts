import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_TRAINING_PRIORITY,
  TRAINING_PRIORITIES,
  trainingPriorityMeta,
} from "../lib/trainingPriority";

test("trainingPriorityMeta: zwraca metadane dla znanego id", () => {
  const meta = trainingPriorityMeta("strength");
  assert.equal(meta.id, "strength");
  assert.equal(meta.label, "Siła");
  assert.ok(meta.loggerHint.length > 0);
});

test("trainingPriorityMeta: każdy zdefiniowany priorytet jest odnajdywalny", () => {
  for (const p of TRAINING_PRIORITIES) {
    assert.equal(trainingPriorityMeta(p.id).id, p.id);
  }
});

test("trainingPriorityMeta: fallback do pierwszego wpisu przy nieznanym id", () => {
  const meta = trainingPriorityMeta("nieistniejący" as never);
  assert.equal(meta.id, TRAINING_PRIORITIES[0].id);
});

test("DEFAULT_TRAINING_PRIORITY jest realnym wpisem listy", () => {
  assert.ok(TRAINING_PRIORITIES.some((p) => p.id === DEFAULT_TRAINING_PRIORITY));
});
