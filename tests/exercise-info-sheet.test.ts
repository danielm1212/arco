import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

/**
 * Regresja zgłoszona przez właściciela: arkusz „jak wykonać” pokazywał nazwę
 * ćwiczenia po angielsku, mimo że karta obok tego samego przycisku (⓵) i inne
 * ekrany (`/exercise/[id]`, historia, programy, home) pokazują `name_pl`.
 *
 * Przyczyna: `ExerciseInfoSheet.tsx` nie był objęty PR-em, który wprowadził
 * `exerciseDisplayName()` na „wszystkich powierzchniach” (9eb9835) — komponent
 * istniał wcześniej i selectował samo `name`. Render tego komponentu wymaga
 * klienta Supabase i kontekstu Next routera, więc zamiast montować go w JSDOM,
 * pilnujemy źródła tekstowo — ten sam wzorzec co `tests/theme-color.test.ts`.
 */
const SOURCE = readFileSync(
  new URL("../components/ExerciseInfoSheet.tsx", import.meta.url),
  "utf8",
);

test("ExerciseInfoSheet: zapytanie o ćwiczenie pobiera name_pl", () => {
  const selectMatch = SOURCE.match(/\.select\(\s*"([^"]+)"/);
  assert.ok(selectMatch, "nie znaleziono .select(...) w ExerciseInfoSheet.tsx");
  assert.match(
    selectMatch[1],
    /\bname_pl\b/,
    "select nie zawiera name_pl — arkusz wróci do angielskiej nazwy",
  );
});

test("ExerciseInfoSheet: nazwa użytkownika idzie przez exerciseDisplayName, nie surowe detail.name", () => {
  assert.match(
    SOURCE,
    /from "@\/lib\/exerciseSearch"/,
    "brak importu exerciseDisplayName",
  );

  const usages = SOURCE.match(/exerciseDisplayName\(detail\)/g) ?? [];
  assert.ok(
    usages.length >= 3,
    `oczekiwano exerciseDisplayName(detail) w tytule, alt i potwierdzeniu usunięcia — znaleziono ${usages.length}`,
  );

  // Kontrola negatywna: dokładnie te wzorce renderowały angielską nazwę.
  assert.doesNotMatch(SOURCE, /title=\{detail\?\.name/, "tytuł znów czyta surowe detail.name");
  assert.doesNotMatch(SOURCE, /alt=\{detail\.name\}/, "alt obrazka znów czyta surowe detail.name");
  assert.doesNotMatch(
    SOURCE,
    /Usunąć „\{detail\.name\}/,
    "potwierdzenie usunięcia znów czyta surowe detail.name",
  );
});
