import assert from "node:assert/strict";
import test from "node:test";
import {
  applySessionEdits,
  firstIncompleteSetId,
  loggerSessionState,
  loggerSetState,
  nextIncompleteSetId,
  readSessionContinuity,
  shouldRestoreSessionPosition,
  writeSessionContinuity,
} from "../lib/sessionFlow";
import type { SessionSet } from "../lib/types";

const baseSet: SessionSet = {
  id: "set-1",
  session_exercise_id: "exercise-1",
  set_index: 0,
  set_type: "working",
  weight: null,
  reps: null,
  duration_seconds: null,
  added_weight: null,
  rpe: null,
  completed: false,
};

test("R4A: stan serii odróżnia draft, ready, completed i edited", () => {
  assert.equal(loggerSetState("weighted", baseSet), "draft");
  assert.equal(
    loggerSetState("weighted", { ...baseSet, weight: 60, reps: 8 }),
    "ready",
  );
  assert.equal(
    loggerSetState("weighted", { ...baseSet, weight: 60, reps: 8, completed: true }),
    "completed",
  );
  assert.equal(
    loggerSetState(
      "weighted",
      { ...baseSet, weight: 62.5, reps: 8, completed: true },
      true,
    ),
    "edited",
  );
});

test("R4A: nadrzędny stan sesji ma jednoznaczny priorytet", () => {
  assert.equal(
    loggerSessionState({
      setState: "ready",
      resting: true,
      minimized: false,
      finishing: false,
    }),
    "resting",
  );
  assert.equal(
    loggerSessionState({
      setState: "edited",
      resting: true,
      minimized: true,
      finishing: false,
    }),
    "minimized",
  );
  assert.equal(
    loggerSessionState({
      setState: "ready",
      resting: true,
      minimized: true,
      finishing: true,
    }),
    "finishing",
  );
});

test("R4A: po zaliczeniu przechodzi do kolejnej niezaliczonej serii między ćwiczeniami", () => {
  const exercises = [
    {
      skipped: false,
      sets: [
        { id: "a1", completed: true },
        { id: "a2", completed: false },
      ],
    },
    {
      skipped: true,
      sets: [{ id: "skip", completed: false }],
    },
    {
      skipped: false,
      sets: [{ id: "b1", completed: false }],
    },
  ];
  assert.equal(firstIncompleteSetId(exercises), "a2");
  assert.equal(nextIncompleteSetId(exercises, "a2"), "b1");
  assert.equal(nextIncompleteSetId(exercises, "b1"), "a2");
});

test("R4A: szkic korekty zaliczonej serii nie zmienia innych wierszy", () => {
  const exercises = [
    {
      sets: [
        { ...baseSet, id: "done", completed: true, weight: 60, reps: 8 },
        { ...baseSet, id: "draft" },
      ],
    },
  ];
  const restored = applySessionEdits(exercises, { done: { weight: 62.5 } });
  assert.equal(restored[0].sets[0].weight, 62.5);
  assert.equal(restored[0].sets[0].completed, true);
  assert.equal(restored[0].sets[1], exercises[0].sets[1]);
});

test("R4A: ciągłość odtwarza aktywną serię, korektę i działający timer", () => {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
        removeItem: (key: string) => store.delete(key),
      },
    },
  });
  writeSessionContinuity("session-1", {
    activeSetId: "set-2",
    scrollY: 420,
    minimized: true,
    rest: { endAt: 20_000, label: "Przysiad" },
    edits: { "set-1": { weight: 62.5 } },
  });
  assert.deepEqual(readSessionContinuity("session-1", 10_000), {
    activeSetId: "set-2",
    scrollY: 420,
    minimized: true,
    rest: { endAt: 20_000, label: "Przysiad" },
    edits: { "set-1": { weight: 62.5 } },
  });
  assert.equal(readSessionContinuity("session-1", 30_000).rest, null);
  Reflect.deleteProperty(globalThis, "window");
});

test("SESSION-01A2: świeże wejście zaczyna u góry, a prawdziwe wznowienie zachowuje pozycję", () => {
  // Sam zapis scrolla nie może utrwalać starej, zakończonej pozycji na świeżym wejściu.
  assert.equal(
    shouldRestoreSessionPosition(
      {
        activeSetId: null,
        scrollY: 0,
        minimized: false,
        rest: null,
        edits: {},
      },
      false,
    ),
    false,
  );
  assert.equal(
    shouldRestoreSessionPosition(
      {
        activeSetId: null,
        scrollY: 640,
        minimized: false,
        rest: null,
        edits: {},
      },
      false,
    ),
    false,
  );
  assert.equal(
    shouldRestoreSessionPosition(
      {
        activeSetId: "set-2",
        scrollY: 0,
        minimized: false,
        rest: null,
        edits: {},
      },
      true,
    ),
    true,
  );
  assert.equal(
    shouldRestoreSessionPosition(
      {
        activeSetId: null,
        scrollY: 640,
        minimized: true,
        rest: null,
        edits: {},
      },
      false,
    ),
    true,
  );
});
