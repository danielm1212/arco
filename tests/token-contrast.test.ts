import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * HOME-05b: guard kontrastu dla glifu passy i markera dnia — liczony z PRAWDZIWYCH
 * wartości w `app/globals.css`, nie z liczb wklejonych w komentarzu.
 *
 * Powód: gradient płomienia jest jedynym gradientem wewnątrz ikony w systemie, a
 * jego stopnie wybrano pod próg WCAG 1.4.11 (≥3:1 dla elementu graficznego
 * niosącego znaczenie). Taka decyzja żyje w komentarzu tylko do pierwszej zmiany
 * „na ładniejszy odcień" — po niej komentarz kłamie, a nikt tego nie zauważy, bo
 * ikona nadal się renderuje. Ten test wywali się zamiast produkcji.
 *
 * Sprawdzamy najgorszy przypadek KAŻDEGO stopnia gradientu wobec dwóch teł, na
 * których badge realnie stoi: canvas headera i `surface-muted` (tło hoveru).
 *
 * Primitives (`--arco-*`) mają jedną definicję w `:root` — motyw dark nie zmienia
 * skali, tylko przepina na inne stopnie. Dlatego czytamy stopień z bloku
 * `:root`/`.dark` przez `--streak-flame-*`, a wartość HSL zawsze z primitives.
 */

const CSS = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");

type Hsl = [number, number, number];

/** Wartość primitive'u `--arco-*` (jedna definicja w `:root`). */
function primitive(name: string): Hsl {
  const m = CSS.match(new RegExp(`${name}:\\s*([\\d.]+)\\s+([\\d.]+)%\\s+([\\d.]+)%`));
  assert.ok(m, `nie znalazłem tokenu ${name} w app/globals.css`);
  return [Number(m![1]), Number(m![2]), Number(m![3])];
}

/** Na który primitive wskazuje `--streak-flame-from/to` w danym motywie. */
function flameStop(which: "from" | "to", scope: "light" | "dark"): Hsl {
  const anchor = scope === "light" ? ":root {\n  --streak-flame-from" : ".dark {\n  --streak-flame-from";
  const start = CSS.indexOf(anchor);
  assert.ok(start > -1, `nie znalazłem bloku ${scope} z tokenami --streak-flame-*`);
  const block = CSS.slice(start, CSS.indexOf("}", start));
  const m = block.match(new RegExp(`--streak-flame-${which}:\\s*hsl\\(var\\((--arco-[\\w-]+)\\)\\)`));
  assert.ok(m, `nie znalazłem --streak-flame-${which} dla motywu ${scope}`);
  return primitive(m![1]);
}

function hslToRgb([h, s, l]: Hsl): [number, number, number] {
  const sN = s / 100;
  const lN = l / 100;
  const c = (1 - Math.abs(2 * lN - 1)) * sN;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r1, g1, b1] =
    hp < 1
      ? [c, x, 0]
      : hp < 2
        ? [x, c, 0]
        : hp < 3
          ? [0, c, x]
          : hp < 4
            ? [0, x, c]
            : hp < 5
              ? [x, 0, c]
              : [c, 0, x];
  const m = lN - c / 2;
  return [r1 + m, g1 + m, b1 + m];
}

function contrast(a: Hsl, b: Hsl): number {
  const lum = (v: Hsl) => {
    const [r, g, bl] = hslToRgb(v).map((ch) =>
      ch <= 0.03928 ? ch / 12.92 : ((ch + 0.055) / 1.055) ** 2.4,
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const la = lum(a);
  const lb = lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const round = (n: number) => Math.round(n * 100) / 100;

const WHITE: Hsl = [0, 0, 100];
/** Tła, na których stoi badge passy: canvas + `surface-muted` (hover). */
const BACKDROPS = {
  light: { canvas: () => primitive("--arco-grey-100"), hover: () => primitive("--arco-grey-200") },
  dark: { canvas: () => primitive("--arco-ink-850"), hover: () => primitive("--arco-ink-600") },
} as const;

for (const scope of ["light", "dark"] as const) {
  for (const [where, bg] of Object.entries(BACKDROPS[scope])) {
    test(`glif passy: oba stopnie gradientu trzymają ≥3:1 (${scope}, ${where})`, () => {
      for (const which of ["from", "to"] as const) {
        const ratio = contrast(flameStop(which, scope), bg());
        assert.ok(
          ratio >= 3,
          `--streak-flame-${which} (${scope}) ma ${round(ratio)}:1 na ${where} — WCAG 1.4.11 wymaga ≥3:1`,
        );
      }
    });
  }
}

test("marker dnia: numer na wypełnionym kółku trzyma ≥4,5:1 (light i dark)", () => {
  // Dark używa CIEMNEGO tekstu na rust-400 (`--primary-foreground` = ink-900).
  // Liczenie „biel na rust" w dark dawałoby fałszywy alarm 3,34:1 — pułapka
  // udokumentowana w handoffie HOME-04/05.
  const light = contrast(WHITE, primitive("--arco-rust-500"));
  const dark = contrast(primitive("--arco-ink-900"), primitive("--arco-rust-400"));
  assert.ok(light >= 4.5, `light: ${round(light)}:1`);
  assert.ok(dark >= 4.5, `dark: ${round(dark)}:1`);
});

test("pierścień „dziś” trzyma ≥3:1 na powierzchni karty (light i dark)", () => {
  const light = contrast(primitive("--arco-rust-500"), WHITE);
  const dark = contrast(primitive("--arco-rust-400"), primitive("--arco-ink-700"));
  assert.ok(light >= 3, `light: ${round(light)}:1`);
  assert.ok(dark >= 3, `dark: ${round(dark)}:1`);
});
