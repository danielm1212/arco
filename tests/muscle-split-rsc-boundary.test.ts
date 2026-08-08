import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

/**
 * Regresja produkcyjna 2026-08-08 (digest 3184562723): `muscleSplit()` żył w
 * `components/MuscleSplitBars.tsx`, które dostało `"use client"` przy okazji
 * dodania BottomSheet. Server Components (`app/history/[id]/page.tsx`,
 * `app/session/[id]/done/page.tsx`) wywoływały tę funkcję PRZED renderem —
 * "Attempted to call muscleSplit() from the server but muscleSplit is on the
 * client". Build, lint i tsc przechodziły — to czysto RUNTIME błąd RSC,
 * złapany dopiero na produkcji. Guard tekstowy, bo to jedyny tani sposób,
 * żeby złapać to wcześniej niż realny request.
 */
const ROOT = new URL("..", import.meta.url);

function read(path: string): string {
  return readFileSync(new URL(path, ROOT), "utf8");
}

test("muscleSplit() zostaje w module bez dyrektywy klienckiej", () => {
  const source = read("lib/muscleSplit.ts");
  assert.doesNotMatch(
    source,
    /^\s*["']use client["']/m,
    "lib/muscleSplit.ts dostało \"use client\" — Server Components wywołujące tę funkcję znowu rzucą w runtime",
  );
  assert.match(source, /export function muscleSplit/, "muscleSplit zniknął z lib/muscleSplit.ts");
});

test("strony serwerowe importują muscleSplit z lib/, nie z komponentu klienckiego", () => {
  for (const page of [
    "app/history/[id]/page.tsx",
    "app/session/[id]/done/page.tsx",
  ]) {
    const source = read(page);
    assert.match(
      source,
      /import\s*{\s*muscleSplit\s*}\s*from\s*"@\/lib\/muscleSplit"/,
      `${page} nie importuje muscleSplit z @/lib/muscleSplit`,
    );
    assert.doesNotMatch(
      source,
      /muscleSplit.*from\s*"@\/components\/MuscleSplitBars"/,
      `${page} znowu importuje muscleSplit z pliku klienckiego`,
    );
  }
});
