import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import {
  clearSessionOps,
  enqueueDelete,
  enqueueNotes,
  enqueueUpsert,
  pendingCount,
  restoreSessionDraft,
  type OutboxSetRow,
} from "../lib/outbox";

class MemoryStorage implements Storage {
  private data = new Map<string, string>();

  get length() {
    return this.data.size;
  }

  clear() {
    this.data.clear();
  }

  getItem(key: string) {
    return this.data.get(key) ?? null;
  }

  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.data.delete(key);
  }

  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}

const localStorage = new MemoryStorage();
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: { localStorage },
});

const baseSet: OutboxSetRow = {
  id: "set-1",
  session_exercise_id: "exercise-1",
  set_index: 0,
  set_type: "working",
  weight: 50,
  reps: 8,
  duration_seconds: null,
  added_weight: null,
  rpe: null,
  completed: false,
};

beforeEach(() => localStorage.clear());

test("szkic loggera odzyskuje serie i notatki tylko dla właściwej sesji", () => {
  enqueueUpsert("session-1", { ...baseSet, weight: 55, completed: true });
  enqueueNotes("session-1", "exercise-1", "Pilnuj tempa");
  enqueueUpsert("session-2", { ...baseSet, id: "set-other", weight: 99 });

  const restored = restoreSessionDraft(
    [
      {
        sessionExerciseId: "exercise-1",
        notes: null,
        sets: [baseSet],
      },
    ],
    "session-1",
  );

  assert.equal(restored[0].notes, "Pilnuj tempa");
  assert.equal(restored[0].sets[0].weight, 55);
  assert.equal(restored[0].sets[0].completed, true);
  assert.equal(pendingCount("session-1"), 2);
  assert.equal(pendingCount(), 3);

  enqueueDelete("session-1", "set-1");
  assert.equal(restoreSessionDraft(restored, "session-1")[0].sets.length, 0);

  clearSessionOps("session-1");
  assert.equal(pendingCount("session-1"), 0);
  assert.equal(pendingCount(), 1);
});
