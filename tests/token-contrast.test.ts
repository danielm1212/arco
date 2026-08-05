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

/* ── Paczka B (a11y, audyt 2026-07-31 §1 P1) ──────────────────────────────
   Trzy pary, które audyt złapał POD progiem, każda naprawiona nowym tokenem.
   Guard liczy je z globals.css, bo wszystkie trzy da się cofnąć jedną „drobną”
   podmianą stopnia, a UI nadal się wyrenderuje — po prostu nieczytelnie.       */

/** Blok motywu w `@layer base` (`:root` = light, `.dark` = dark). */
function themeBlock(scope: "light" | "dark"): string {
  const start = CSS.indexOf(scope === "light" ? "\n  :root {" : "\n  .dark {");
  assert.ok(start > -1, `nie znalazłem bloku ${scope} w app/globals.css`);
  const end = CSS.indexOf("\n  }", start);
  return CSS.slice(start, end);
}

/**
 * Token semantyczny → primitive, na który wskazuje w danym motywie.
 *
 * Podąża za CAŁYM łańcuchem aliasów, nie tylko za skokiem wprost do `--arco-*`:
 * most (L3) czyta z semantyki (L2), więc np. `--destructive-foreground` →
 * `--color-danger-contrast` → `--arco-grey-0` to trzy ogniwa. Wcześniej helper
 * zakładał jeden skok i przy porządkowaniu warstw wywaliłby się na moście, mimo że
 * kontrast byłby poprawny — czyli testowałby kształt zapisu, nie kolor.
 */
function semantic(name: string, scope: "light" | "dark", depth = 0): Hsl {
  assert.ok(depth < 8, `cykl aliasów przy ${name} (motyw ${scope})`);
  const found = [
    ...themeBlock(scope).matchAll(new RegExp(`${name}:\\s*var\\((--[\\w-]+)\\)`, "g")),
  ];
  // Ostatnia deklaracja wygrywa — tak jak w kaskadzie.
  const last = found.at(-1);
  assert.ok(last, `nie znalazłem ${name} w motywie ${scope}`);
  const target = last![1];
  return target.startsWith("--arco-")
    ? primitive(target)
    : semantic(target, scope, depth + 1);
}

/** Tint `bg-<kolor>/<alpha>` skomponowany na tle powierzchni. */
function tint(color: Hsl, surface: Hsl, alpha: number): Hsl {
  // Kompozycja musi iść po sRGB, nie po HSL — mieszanie kanałów H/S/L dawałoby
  // inny kolor niż ten, który realnie rysuje przeglądarka.
  const [r1, g1, b1] = hslToRgb(color);
  const [r2, g2, b2] = hslToRgb(surface);
  const mixed: [number, number, number] = [
    r1 * alpha + r2 * (1 - alpha),
    g1 * alpha + g2 * (1 - alpha),
    b1 * alpha + b2 * (1 - alpha),
  ];
  // `contrast()` przyjmuje HSL, więc wracamy do HSL — konwersja jest stratna co
  // do zaokrągleń, ale nie co do luminancji, a to ją tu mierzymy.
  return rgbToHsl(mixed);
}

function rgbToHsl([r, g, b]: [number, number, number]): Hsl {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s * 100, l * 100];
}

test("każda barwa funkcyjna ma `*-contrast` i trzyma ≥4,5:1 na własnym wypełnieniu", () => {
  // Audyt komponentów 2026-08-04 (M5): `success` miał komplet trzech ról od początku,
  // `warning` i `danger` tylko dwie. Skutek nie był teoretyczny — `OfflineBanner`,
  // jedyna powierzchnia `bg-warning` z tekstem, wpisał `text-black`, bo nie miał
  // czego użyć. Ten test pilnuje, żeby dziura nie wróciła: brak tokenu wywali się
  // tak samo jak zły kontrast, więc nie da się dodać `bg-*` bez pary `*-foreground`.
  for (const role of ["success", "warning", "danger"] as const) {
    for (const scope of ["light", "dark"] as const) {
      const ratio = contrast(
        semantic(`--color-${role}-contrast`, scope),
        semantic(`--color-${role}`, scope),
      );
      assert.ok(
        ratio >= 4.5,
        `${role}-contrast na ${role} (${scope}) = ${round(ratio)}:1, poniżej 4,5:1`,
      );
    }
  }
});

test("B1 — check zaliczonej serii: tekst na `bg-success` trzyma ≥4,5:1", () => {
  // Był to jedyny magic-color w repo (`text-white`): biel na `green-400`
  // dawała w dark 2,37:1 i check po prostu znikał.
  for (const scope of ["light", "dark"] as const) {
    const ratio = contrast(semantic("--color-success-contrast", scope), semantic("--color-success", scope));
    assert.ok(ratio >= 4.5, `${scope}: ${round(ratio)}:1 — tekst na bg-success`);
  }
});

test("B4 — badge rozgrzewki trzyma ≥4,5:1 na tincie nad KAŻDYM tłem wiersza", () => {
  // `--color-warning` jest tokenem WYPEŁNIENIA: jako tekst dawał w light 1,91:1.
  // Stąd osobny `--color-warning-text` — i stąd ta lista teł. Badge stoi na
  // tincie `warning/15`, ale wiersz pod nim bywa zaliczony (`success/10`) albo
  // rekordowy (`primary/10`); liczenie tylko na białej karcie przepuściło już
  // raz stopień, który na wierszu PR miał 4,39:1.
  const surfaces = {
    light: () => ({
      karta: primitive("--arco-grey-0"),
      aktywny: tint(primitive("--arco-grey-200"), primitive("--arco-grey-0"), 0.6),
      zaliczony: tint(primitive("--arco-green-500"), primitive("--arco-grey-0"), 0.1),
      rekord: tint(primitive("--arco-rust-500"), primitive("--arco-grey-0"), 0.1),
      canvas: primitive("--arco-grey-100"),
    }),
    dark: () => ({
      karta: primitive("--arco-ink-700"),
      aktywny: tint(primitive("--arco-ink-600"), primitive("--arco-ink-700"), 0.6),
      zaliczony: tint(primitive("--arco-green-400"), primitive("--arco-ink-700"), 0.1),
      rekord: tint(primitive("--arco-rust-400"), primitive("--arco-ink-700"), 0.1),
      canvas: primitive("--arco-ink-850"),
    }),
  } as const;
  for (const scope of ["light", "dark"] as const) {
    const text = semantic("--color-warning-text", scope);
    const fill = semantic("--color-warning", scope);
    for (const [where, surface] of Object.entries(surfaces[scope]())) {
      const ratio = contrast(text, tint(fill, surface, 0.15));
      assert.ok(ratio >= 4.5, `${scope}/${where}: ${round(ratio)}:1 — tekst badge'a rozgrzewki`);
    }
  }
});

test("kolory semantyczne jako TEKST trzymają ≥4,5:1 na neutralnych tłach", () => {
  // Rozszerzenie B4 na zieleń i czerwień (znalezione przy paczce B, poza listą
  // audytu): `success` miał w light 4,18:1 na canvas, a `danger` w dark 3,98:1
  // na własnym tincie — czyli komunikat błędu był najsłabiej czytelnym tekstem
  // w aplikacji. Stopnie wypełnienia zostały; tekst dostał własne.
  const backdrops = {
    light: () => ({
      canvas: primitive("--arco-grey-100"),
      karta: primitive("--arco-grey-0"),
      hover: primitive("--arco-grey-200"),
    }),
    dark: () => ({
      canvas: primitive("--arco-ink-850"),
      karta: primitive("--arco-ink-700"),
      hover: primitive("--arco-ink-600"),
    }),
  } as const;

  for (const scope of ["light", "dark"] as const) {
    for (const role of ["success", "danger"] as const) {
      const text = semantic(`--color-${role}-text`, scope);
      const fill = semantic(`--color-${role}`, scope);
      for (const [where, surface] of Object.entries(backdrops[scope]())) {
        const plain = contrast(text, surface);
        assert.ok(plain >= 4.5, `${scope}/${role}/${where}: ${round(plain)}:1`);
      }
      // Tint `bg-<rola>/10` bywa tłem hoveru (np. „Usuń"), więc leży na canvas
      // albo na karcie — NIE na `surface-muted`. Te dwa tła się wykluczają:
      // kafel dostaje albo szary hover, albo kolorowy, nigdy oba naraz.
      for (const where of ["canvas", "karta"] as const) {
        const onTint = contrast(text, tint(fill, backdrops[scope]()[where], 0.1));
        assert.ok(onTint >= 4.5, `${scope}/${role}/tint na ${where}: ${round(onTint)}:1`);
      }
    }
  }
});

test("B5 — `destructive` trzyma ≥4,5:1 na ośmiu potwierdzeniach usuwania", () => {
  // W dark tekst na barwie chromatycznej jest CIEMNY (jak przy rust i violet).
  // Odziedziczony jasny `sand-50` dawał 3,36:1.
  for (const scope of ["light", "dark"] as const) {
    const ratio = contrast(semantic("--destructive-foreground", scope), semantic("--color-danger", scope));
    assert.ok(ratio >= 4.5, `${scope}: ${round(ratio)}:1 — tekst na przycisku destructive`);
  }
});
