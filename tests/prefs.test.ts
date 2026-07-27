import assert from "node:assert/strict";
import test from "node:test";
import {
  getLoggerHintSeen,
  getStretchingMinutes,
  getWarmupMinutes,
  setLoggerHintSeen,
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

test("SESSION-01A3: podpowiedź loggera zapamiętuje się raz", () => {
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

  assert.equal(getLoggerHintSeen(), false, "domyślnie podpowiedź jeszcze nie była pokazana");
  setLoggerHintSeen(true);
  assert.equal(getLoggerHintSeen(), true);

  Reflect.deleteProperty(globalThis, "window");
});

test("SESSION-01A3: niedostępny storage nie wywraca preferencji", () => {
  // Safari w trybie prywatnym, zapełniona quota i konteksty z zablokowanym
  // storage rzucają wyjątkiem. Preferencja ma wtedy po cichu przepaść, a nie
  // wywalić ekran treningu — nieosłonięty zapis wywalał cleanup overlaya.
  const boom = () => {
    throw new Error("storage niedostępny");
  };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { localStorage: { getItem: boom, setItem: boom } },
  });

  assert.doesNotThrow(() => setLoggerHintSeen(true));
  assert.doesNotThrow(() => setWarmupMinutes(7));
  assert.equal(getLoggerHintSeen(), false, "brak odczytu = wartość domyślna");
  assert.equal(getWarmupMinutes(), 5);

  Reflect.deleteProperty(globalThis, "window");
});
