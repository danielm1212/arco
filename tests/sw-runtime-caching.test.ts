import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * AUDIT-A1 (audyt 2026-07-31): guard konfiguracji cache'u service workera.
 *
 * `defaultCache` z @serwist/next cache'ował odpowiedzi RSC/HTML zalogowanego
 * użytkownika ORAZ — przez regułę `cross-origin` — podpisane URL-e zdjęć sylwetki
 * z Supabase Storage. Nic tego nigdy nie czyściło, więc kopie przeżywały
 * wylogowanie. `app/sw.ts` odcina trzy reguły i dokłada jedną celowaną.
 *
 * Ten test uruchamia PRAWDZIWY `defaultCache` z zainstalowanej wersji biblioteki i
 * powtarza filtr z `app/sw.ts`. Dzięki temu łapie dwa scenariusze, których nie
 * złapie ani lint, ani build:
 * 1. ktoś wraca do `runtimeCaching: defaultCache` (regresja wprost),
 * 2. biblioteka zmienia nazwy albo kształt wpisów i filtr po cichu przestaje
 *    cokolwiek odcinać — bo `handler.cacheName` przestaje istnieć.
 */

const SW_SOURCE = readFileSync(join(process.cwd(), "app", "sw.ts"), "utf8");

/** Reguły, które nie mogą trafić do runtime cache'u — kopiowane z `app/sw.ts`. */
const DROPPED_CACHES = new Set(["cross-origin", "others", "apis"]);

test("app/sw.ts nie podaje `defaultCache` w całości do Serwista", () => {
  assert.ok(
    !/runtimeCaching:\s*defaultCache\b/.test(SW_SOURCE),
    "runtimeCaching znów bierze cały defaultCache — wraca cache danych konta",
  );
  for (const name of DROPPED_CACHES) {
    assert.ok(
      SW_SOURCE.includes(`"${name}"`),
      `lista odciętych cache'y w app/sw.ts nie wymienia "${name}"`,
    );
  }
});

test("filtr faktycznie odcina reguły z danymi konta i zostawia offline stron", async () => {
  // `defaultCache` rozgałęzia się po NODE_ENV w momencie ewaluacji modułu — w dev
  // to jedno NetworkOnly. Ustawiamy zmienną PRZED dynamicznym importem, żeby test
  // sprawdzał tablicę, która realnie trafia na produkcję, niezależnie od tego, jak
  // uruchomiono `test:unit`. Plik jest osobnym procesem (`node --test`), ale i tak
  // przywracamy poprzednią wartość.
  //
  // Zapis przez rzutowanie, bo Next.js deklaruje `NODE_ENV` jako read-only w
  // `NodeJS.ProcessEnv` — samo przypisanie nie przechodzi `tsc --noEmit`
  // (błąd wjechał z PR #60: build nie typuje plików testowych, więc nikt tego
  // nie zauważył). Runtime nietknięty, zmienia się wyłącznie typowanie.
  const env = process.env as Record<string, string | undefined>;
  const previousEnv = env.NODE_ENV;
  env.NODE_ENV = "production";
  const { defaultCache } = await import("@serwist/next/worker");
  env.NODE_ENV = previousEnv;
  const cacheNames = (entries: typeof defaultCache) =>
    entries.map((entry) => (entry.handler as { cacheName?: string }).cacheName);

  const before = cacheNames(defaultCache);
  for (const name of DROPPED_CACHES) {
    assert.ok(
      before.includes(name),
      `defaultCache nie zawiera już "${name}" — biblioteka zmieniła kształt, przejrzyj app/sw.ts`,
    );
  }

  const kept = defaultCache.filter((entry) => {
    const cacheName = (entry.handler as { cacheName?: string }).cacheName;
    return cacheName === undefined || !DROPPED_CACHES.has(cacheName);
  });
  const after = cacheNames(kept);

  for (const name of DROPPED_CACHES) {
    assert.ok(!after.includes(name), `reguła "${name}" przetrwała filtr`);
  }
  // Cache stron ZOSTAJE świadomie — to jedyny offline przy ubitej aplikacji.
  for (const name of ["pages", "pages-rsc", "pages-rsc-prefetch"]) {
    assert.ok(after.includes(name), `filtr zjadł "${name}" — offline loggera przestaje działać`);
  }
  assert.equal(
    defaultCache.length - kept.length,
    DROPPED_CACHES.size,
    "filtr odciął inną liczbę reguł, niż zakłada app/sw.ts",
  );
});

test("wylogowanie czyści Cache Storage", () => {
  const logout = readFileSync(
    join(process.cwd(), "app", "settings", "LogoutButton.tsx"),
    "utf8",
  );
  assert.match(
    logout,
    /clearAppCaches\(\)/,
    "wylogowanie nie czyści cache'u — kopie stron z danymi konta zostają na urządzeniu",
  );
  const caches = readFileSync(join(process.cwd(), "lib", "appCaches.ts"), "utf8");
  assert.match(caches, /caches\.keys\(\)/);
  assert.match(caches, /caches\.delete\(/);
  assert.ok(
    !/localStorage/.test(caches.replace(/\/\*[\s\S]*?\*\//g, "")),
    "clearAppCaches nie może ruszać localStorage — tam siedzi outbox z niewysłanymi seriami",
  );
});
