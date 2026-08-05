import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Guard dla `themeColor` w `app/layout.tsx` — koloru paska systemowego w PWA.
 *
 * Powód: `Viewport` musi być statyczny, więc to JEDYNE miejsce w repo, gdzie hex jest
 * nieunikniony i nie da się go wyprowadzić z `var(--color-bg)`. Czyli jedyne miejsce,
 * które przy zmianie canvasu cicho zostaje w tyle — i dokładnie to się stało: para
 * #F6F2ED / #1E1C1A przeżyła przejście na neutralne ciemne z v1.4, wskazując
 * brand-surface zamiast canvasu i stopień `ink-800`, którego nie ma już w palecie.
 * Nikt tego nie zgłosił, bo aplikacja renderuje się normalnie — rozjazd widać
 * wyłącznie na pasku statusu w standalone.
 *
 * Liczymy hex z PRAWDZIWYCH wartości HSL w `globals.css`, nie z hexów w komentarzach
 * przy tokenach — te są zaokrąglone o 1/255 (piszą #F7F7F5, renderuje się #F6F6F4),
 * więc przepisanie ich dałoby test, który zielenieje przy złym kolorze.
 *
 * Test celowo przechodzi CAŁĄ ścieżkę aliasów (--color-bg → --arco-*), zamiast
 * sprawdzać przypisanie na sztywno: dzięki temu wywali się także wtedy, gdy ktoś
 * przepnie `--color-bg` na inny primitive, nie ruszając samych primitive'ów.
 */

const CSS = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");
const LAYOUT = readFileSync(join(process.cwd(), "app", "layout.tsx"), "utf8");

/** Blok `:root { … }` albo `.dark { … }` z warstwą semantyczną. */
function themeBlock(scope: "light" | "dark"): string {
  const anchor = scope === "light" ? ":root {" : ".dark {";
  const start = CSS.indexOf(anchor);
  assert.ok(start > -1, `nie znalazłem bloku ${anchor} w app/globals.css`);
  return CSS.slice(start, CSS.indexOf("\n  }", start));
}

/** Na który primitive wskazuje `--color-bg` w danym motywie. */
function canvasPrimitive(scope: "light" | "dark"): string {
  const m = themeBlock(scope).match(/--color-bg:\s*var\((--arco-[\w-]+)\)/);
  assert.ok(m, `--color-bg w motywie ${scope} nie jest aliasem do primitive'u`);
  return m![1];
}

/** Surowa trójka HSL primitive'u — primitives mają jedną definicję, w `:root`. */
function primitiveHsl(name: string): [number, number, number] {
  const m = CSS.match(new RegExp(`${name}:\\s*([\\d.]+)\\s+([\\d.]+)%\\s+([\\d.]+)%`));
  assert.ok(m, `nie znalazłem primitive'u ${name} w app/globals.css`);
  return [Number(m![1]), Number(m![2]), Number(m![3])];
}

/** Ta sama konwersja, którą robi przeglądarka renderując `hsl()`. */
function hslToHex([h, s, l]: [number, number, number]): string {
  const sat = s / 100;
  const lum = l / 100;
  const c = (1 - Math.abs(2 * lum - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lum - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0]
    : h < 120 ? [x, c, 0]
    : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c]
    : h < 300 ? [x, 0, c]
    : [c, 0, x];
  const hex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
}

/** Hex zadeklarowany w `viewport.themeColor` dla danego schematu. */
function declaredThemeColor(scheme: "light" | "dark"): string {
  const m = LAYOUT.match(
    new RegExp(`prefers-color-scheme:\\s*${scheme}\\)"\\s*,\\s*color:\\s*"(#[0-9a-fA-F]{6})"`),
  );
  assert.ok(m, `nie znalazłem themeColor dla ${scheme} w app/layout.tsx`);
  return m![1].toUpperCase();
}

for (const scope of ["light", "dark"] as const) {
  test(`themeColor (${scope}) == canvas (--color-bg) z globals.css`, () => {
    const expected = hslToHex(primitiveHsl(canvasPrimitive(scope)));
    assert.equal(
      declaredThemeColor(scope),
      expected,
      `themeColor dla ${scope} rozjechał się z canvasem. ` +
        `--color-bg → ${canvasPrimitive(scope)} → ${expected}. ` +
        `Zaktualizuj hex w viewport.themeColor (app/layout.tsx).`,
    );
  });
}

test("themeColor nie wskazuje na brand-surface (regresja sprzed v1.4)", () => {
  // Konkretny błąd, który ten guard ma nie wpuścić z powrotem: canvas to neutralna
  // szarość/ink, a nie kremowa powierzchnia brandowa (sand), której używa hero.
  for (const scope of ["light", "dark"] as const) {
    const primitive = canvasPrimitive(scope);
    assert.ok(
      !primitive.includes("sand"),
      `--color-bg (${scope}) wskazuje na ${primitive} — canvas nie może być powierzchnią brandową`,
    );
  }
});
