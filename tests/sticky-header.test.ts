import assert from "node:assert/strict";
import test from "node:test";
import { cn } from "../lib/utils";
import { STICKY_HEADER_SAFE_AREA } from "../components/navigation/stickyHeader";

/**
 * Regresja z 2026-07-22: header loggera nie przyklejał się, bo składano go przez
 * `cn(STICKY_HEADER_SAFE_AREA, "relative …")`. `cn` = tailwind-merge, a `relative`
 * konfliktuje z `sticky` (ta sama właściwość `position`) i jako ostatnie WYGRYWA —
 * usuwając `sticky` z wyniku. Header renderował się jako `position: relative`.
 *
 * Poprzedni e2e nie łapał tego, bo składał klasy stringiem (bez tailwind-merge).
 * Ten test idzie przez REALNE `cn()`, więc pilnuje właśnie tej pułapki.
 */

const hasClass = (s: string, c: string) => s.split(/\s+/).includes(c);
const POSITIONS = ["static", "fixed", "absolute", "relative", "sticky"];

test("cn() zachowuje `sticky` w headerze loggera (regresja 2026-07-22)", () => {
  // Dokładna kompozycja z Logger.tsx po fiksie.
  const composed = cn(STICKY_HEADER_SAFE_AREA, "z-10 border-b bg-background px-md py-sm");
  assert.ok(hasClass(composed, "sticky"), `zgubiono 'sticky': "${composed}"`);
  // Żadna inna klasa position nie może współistnieć (byłaby kolizją, którą merge rozstrzyga).
  for (const p of POSITIONS.filter((p) => p !== "sticky")) {
    assert.ok(!hasClass(composed, p), `konflikt position '${p}' w headerze: "${composed}"`);
  }
});

test("kontrola negatywna: dodanie `relative` FAKTYCZNIE gubi `sticky` (dokumentuje pułapkę)", () => {
  // To jest właśnie stara, błędna kompozycja — dowód, że test wykrywa regresję.
  const broken = cn(STICKY_HEADER_SAFE_AREA, "relative z-10 border-b");
  assert.ok(!hasClass(broken, "sticky"), "oczekiwano, że 'relative' wypchnie 'sticky' — jeśli nie, ten test nic nie pilnuje");
  assert.ok(hasClass(broken, "relative"));
});

test("PageHeader (tryb sticky) też zachowuje `sticky`", () => {
  const composed = cn(STICKY_HEADER_SAFE_AREA, "z-30");
  assert.ok(hasClass(composed, "sticky"), `PageHeader zgubił 'sticky': "${composed}"`);
});
