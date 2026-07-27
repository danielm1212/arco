import assert from "node:assert/strict";
import test from "node:test";
import {
  getStretchingMinutes,
  getWarmupMinutes,
  setStretchingMinutes,
  setWarmupMinutes,
} from "../lib/prefs";

test("SESSION-01A2: czasy mają bezpieczne domyślne wartości i zakresy", () => {
  assert.equal(getWarmupMinutes(), 5);
  assert.equal(getStretchingMinutes(), 3);

  const store = new Map<string, string>();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
      },
    },
  });

  setWarmupMinutes(99);
  setStretchingMinutes(-4);
  assert.equal(getWarmupMinutes(), 15);
  assert.equal(getStretchingMinutes(), 1);

  store.set("arco:warmupMinutes", "nie-liczba");
  store.set("arco:stretchingMinutes", "4.4");
  assert.equal(getWarmupMinutes(), 5);
  assert.equal(getStretchingMinutes(), 4);

  Reflect.deleteProperty(globalThis, "window");
});
