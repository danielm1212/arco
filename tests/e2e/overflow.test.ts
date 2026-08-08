/**
 * Regresja layoutu na wąskim viewportcie (Playwright + chromium).
 *
 * Lekcja z incydentu CI 2026-07-16 i bugów z 2026-07-20: lint/testy/build NIE
 * wykrywają poziomego overflow ani prześwitującego topbara — to wychodzi dopiero
 * w prawdziwym silniku przy realnym CSS-ie i długim tekście. Ten test wstrzykuje
 * SKOMPILOWANY CSS buildu (`.next/static/css`) i mierzy overflow / kryjące tło.
 *
 * Wymaga wcześniejszego `npm run build`. Uruchom: `npm run test:overflow`.
 * NIE jest w globie `test:unit` (leży w tests/e2e/), żeby szybki job jednostkowy
 * nie uruchamiał przeglądarki.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { build } from "esbuild";
import { chromium, type Browser, type Page } from "@playwright/test";
import { programCoverGradient, programCoverSizeClass } from "../../lib/programCover";
import {
  formatProgramCardTitle,
  formatProgramEnvironmentTag,
  formatProgramSplitTag,
} from "../../lib/programListCard";
import { buildLevelMeter } from "../../lib/levelMeter";
import { formatProgramDuration, formatProgramFrequency } from "../../lib/programDetail";
import { PROGRAMS } from "../../scripts/seed";
import { STICKY_HEADER_SAFE_AREA } from "../../components/navigation/stickyHeader";

/**
 * Odczyt stanu przeglądarki zaraz po akcji potrafi wyprzedzić efekt, który ten stan ustawia
 * (zaznaczenie pola, pomiar pozycji popovera). Na wolniejszym runnerze CI dawało to losowe
 * czerwone przebiegi przy zielonym lokalnie. Pollujemy do skutku albo do limitu — po limicie
 * zwracamy ostatnią wartość, więc realna regresja nadal wywala asercję z prawdziwą różnicą.
 */
async function pollUntil<T>(
  read: () => Promise<T>,
  ready: (value: T) => boolean,
  timeoutMs = 3000,
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  let value = await read();
  while (!ready(value) && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    value = await read();
  }
  return value;
}

const ROOT = process.cwd();
const CSS_DIR = join(ROOT, ".next/static/css");
const VIEWPORT = { width: 360, height: 780 }; // wąski Android/iPhone
const SAFE_AREA = "47px"; // wymuszona wartość notcha (headless zwraca 0)

let cssCache: string | null = null;
let bottomSheetBundleCache: string | null = null;
let setRowBundleCache: string | null = null;
let loggerHintBundleCache: string | null = null;
let confettiBundleCache: string | null = null;
function builtCss(): string {
  if (cssCache !== null) return cssCache;
  let files: string[];
  try {
    files = readdirSync(CSS_DIR).filter((f) => f.endsWith(".css"));
  } catch {
    throw new Error(`Brak ${CSS_DIR} — uruchom najpierw \`npm run build\`.`);
  }
  assert.ok(files.length > 0, `Brak plików CSS w ${CSS_DIR} — uruchom \`npm run build\`.`);
  cssCache = files.map((f) => readFileSync(join(CSS_DIR, f), "utf8")).join("\n");
  return cssCache;
}

// Owija fragment realnym CSS-em buildu + wąskim viewportem + wymuszoną safe-area.
// Override `--safe-area-top` jest poza @layer, więc wygrywa z warstwowym base.
function pageHtml(body: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${builtCss()}</style>
  <style>:root{--safe-area-top:${SAFE_AREA}}body{margin:0}</style></head><body>${body}</body></html>`;
}

async function bottomSheetBundle(): Promise<string> {
  if (bottomSheetBundleCache !== null) return bottomSheetBundleCache;

  const result = await build({
    bundle: true,
    format: "iife",
    platform: "browser",
    write: false,
    absWorkingDir: ROOT,
    stdin: {
      loader: "tsx",
      resolveDir: ROOT,
      sourcefile: "trust03-bottom-sheet-harness.tsx",
      contents: `
        import React, { useState } from "react";
        import { createRoot } from "react-dom/client";
        import { BottomSheet } from "./components/ui/bottom-sheet";

        function Harness() {
          const [open, setOpen] = useState(false);
          const [nestedOpen, setNestedOpen] = useState(false);
          const [secondLevelOpen, setSecondLevelOpen] = useState(false);
          const [thirdLevelOpen, setThirdLevelOpen] = useState(false);
          const [renderCount, setRenderCount] = useState(0);

          return <main>
            <div style={{ height: 1200 }} />
            <BottomSheet
              open={open}
              onOpenChange={(nextOpen) => setOpen(nextOpen)}
              trigger={<button type="button">Otwórz arkusz</button>}
              title="Arkusz testowy"
              description="Regresja pozycji strony"
            >
              <p>Render: {renderCount}</p>
              <button type="button" onClick={() => setRenderCount((value) => value + 1)}>
                Wymuś render
              </button>
              <button type="button" onClick={() => setOpen(false)}>
                Zamknij akcją
              </button>
              {/* Wzorzec „Podmień ćwiczenie": zamknięcie tego sheeta i otwarcie
                  KOLEJNEJ instancji w tym samym commicie (ExerciseCardMenu → SwapPanel) */}
              <button type="button" onClick={() => { setOpen(false); setNestedOpen(true); }}>
                Podmień
              </button>
              <button type="button" onClick={() => setSecondLevelOpen(true)}>
                Otwórz drugi poziom
              </button>
            </BottomSheet>
            <BottomSheet
              open={nestedOpen}
              onOpenChange={(nextOpen) => setNestedOpen(nextOpen)}
              title="Arkusz zagnieżdżony"
              description="Regresja pozycji strony po łańcuchu sheetów"
            >
              <button type="button" onClick={() => setNestedOpen(false)}>
                Zamknij zagnieżdżony
              </button>
            </BottomSheet>
            <BottomSheet
              open={secondLevelOpen}
              onOpenChange={setSecondLevelOpen}
              title="Drugi poziom"
              description="Drugi równocześnie otwarty arkusz"
            >
              <button type="button" onClick={() => setThirdLevelOpen(true)}>
                Otwórz trzeci poziom
              </button>
            </BottomSheet>
            <BottomSheet
              open={thirdLevelOpen}
              onOpenChange={setThirdLevelOpen}
              title="Trzeci poziom"
              description="Trzeci równocześnie otwarty arkusz"
            >
              <button type="button" onClick={() => setThirdLevelOpen(false)}>
                Zamknij trzeci poziom
              </button>
            </BottomSheet>
            <div style={{ height: 1800 }} />
          </main>;
        }

        createRoot(document.getElementById("root")).render(<Harness />);
      `,
    },
  });

  bottomSheetBundleCache = result.outputFiles[0]?.text ?? null;
  assert.ok(bottomSheetBundleCache, "esbuild nie zwrócił bundla harnessu BottomSheet");
  return bottomSheetBundleCache;
}

async function bottomSheetPage(viewport: { width: number; height: number }): Promise<{ context: Awaited<ReturnType<Browser["newContext"]>>; page: Page; scrollY: number }> {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await page.setContent(pageHtml('<div id="root"></div>'), { waitUntil: "load" });
  await page.addScriptTag({ content: await bottomSheetBundle() });
  await page.getByRole("button", { name: "Otwórz arkusz" }).waitFor();
  await page.evaluate(() => window.scrollTo(0, 1050));
  const scrollY = await page.evaluate(() => window.scrollY);
  assert.ok(scrollY > 900, `harness nie przewinął strony: ${scrollY}px`);
  await page.getByRole("button", { name: "Otwórz arkusz" }).click();
  await page.getByRole("dialog", { name: "Arkusz testowy" }).waitFor();

  // Re-render tworzy nową referencję inline `onOpenChange`. TRUST-03 pilnuje,
  // żeby sam render otwartego sheeta nie przeinicjalizował scroll-locka.
  await page.getByRole("button", { name: "Wymuś render" }).click();
  const lock = await page.evaluate(() => ({
    position: document.body.style.position,
    top: document.body.style.top,
  }));
  assert.deepEqual(lock, { position: "fixed", top: `${-scrollY}px` }, "re-render poluzował blokadę tła");
  return { context, page, scrollY };
}

async function expectRestoredScroll(page: Page, expected: number) {
  await page.evaluate(() => new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  }));
  const actual = await page.evaluate(() => window.scrollY);
  assert.ok(Math.abs(actual - expected) <= 1, `scroll po zamknięciu: ${actual}px zamiast ${expected}px`);
}

let browser: Browser;
before(async () => {
  browser = await chromium.launch();
});
after(async () => {
  await browser?.close();
});

async function pageOverflow(body: string): Promise<number> {
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  try {
    const p = await ctx.newPage();
    await p.setContent(pageHtml(body), { waitUntil: "load" });
    return await p.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
  } finally {
    await ctx.close();
  }
}

test("NAV-01: cztery zakładki Treningu mieszczą się na 320/375/393 px", async () => {
  const body = `<main class="mx-auto max-w-md">
    <div class="px-md pt-md">
      <nav aria-label="Sekcje treningu" class="grid grid-cols-4 rounded-full bg-muted p-1">
        ${["Plany", "Postępy", "Ciało", "Historia"]
          .map(
            (label, index) => `<a
              href="#"
              ${index === 0 ? 'aria-current="page"' : ""}
              class="flex min-h-11 min-w-0 items-center justify-center rounded-full px-1 text-xs font-medium ${index === 0 ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}"
            >${label}</a>`,
          )
          .join("")}
      </nav>
    </div>
  </main>`;

  for (const width of [320, 375, 393]) {
    const context = await browser.newContext({ viewport: { width, height: 780 } });
    try {
      const page = await context.newPage();
      await page.setContent(pageHtml(body), { waitUntil: "load" });
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        links: [...document.querySelectorAll<HTMLElement>('nav[aria-label="Sekcje treningu"] a')]
          .map((link) => ({
            height: link.getBoundingClientRect().height,
            clipped: link.scrollWidth > link.clientWidth,
          })),
      }));

      assert.ok(metrics.overflow <= 1, `poziomy overflow ${metrics.overflow}px przy ${width}px`);
      assert.equal(metrics.links.length, 4);
      for (const link of metrics.links) {
        assert.ok(link.height >= 44, `target ma ${link.height}px przy ${width}px`);
        assert.equal(link.clipped, false, `ucięta etykieta przy ${width}px`);
      }
    } finally {
      await context.close();
    }
  }
});

test("PLAN-05B: miniatura ProgramCover size=row nie rozpycha wąskiej listy", async () => {
  const coverClass = `${programCoverSizeClass("row")} ${programCoverGradient("lower_body")}`;
  const row = (name: string) => `<li class="flex min-w-0 items-center gap-sm rounded-xl bg-card p-sm">
    <div data-program-cover aria-hidden="true" class="${coverClass}"></div>
    <div class="min-w-0 flex-1"><p class="break-words text-sm font-semibold">${name}</p>
      <p class="text-xs text-muted-foreground">3 treningi · 45–60 min</p></div>
  </li>`;
  const body = `<main class="mx-auto max-w-md p-md"><ul class="space-y-xs">${[
    "Pośladki i nogi — poziom średniozaawansowany",
    "Całe ciało z hantlami",
    "Siła od podstaw",
  ].map(row).join("")}</ul></main>`;

  for (const width of [320, 375, 393]) {
    const context = await browser.newContext({ viewport: { width, height: 780 } });
    try {
      const page = await context.newPage();
      await page.setContent(pageHtml(body), { waitUntil: "load" });
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        coverWidths: [...document.querySelectorAll<HTMLElement>("[data-program-cover]")].map(
          (cover) => cover.getBoundingClientRect().width,
        ),
      }));

      assert.ok(metrics.overflow <= 1, `poziomy overflow ${metrics.overflow}px przy ${width}px`);
      assert.deepEqual(metrics.coverWidths, [64, 64, 64]);
    } finally {
      await context.close();
    }
  }
});

test("PLAN-05F/05G: pełna lista 15 presetów i własnego planu mieści tytuł, dwa tagi, ikony, kropki i serce na 320/393 px", async () => {
  // Dane idą z REALNEGO seeda przez REALNE formattery — nie z ręcznie przepisanej
  // kopii katalogu. Zmiana `short_name`/`split_key` w treści albo zmiana notacji
  // metody wywala ten test, a nie dopiero podgląd na telefonie.
  const catalog = PROGRAMS.map((program) => ({
    title: formatProgramCardTitle(program.short_name, program.name),
    environment: formatProgramEnvironmentTag(program.environment),
    split: formatProgramSplitTag(program.split_key, program.days.length),
    meter: buildLevelMeter(program.level_min, program.level_max, program.level),
    frequency: formatProgramFrequency(program.frequency_min, program.frequency_max),
    duration: formatProgramDuration(
      program.estimated_minutes_min,
      program.estimated_minutes_max,
    ),
    focusKey: program.focus_key ?? "balanced",
  }));

  /** PLAN-05H: odwzorowanie `LevelMeter variant="list"` — trzy pionowe słupki rosnącej
   *  wysokości (nie kropki równej wielkości), etykieta zawsze widoczna. */
  const LIST_BAR_HEIGHTS = ["h-2", "h-3", "h-4"];
  const meterHtml = (meter: NonNullable<ReturnType<typeof buildLevelMeter>>) => `<span
    role="img" aria-label="${meter.ariaLabel}" class="inline-flex min-w-0 flex-wrap items-center gap-x-xs gap-y-2xs">
    <span aria-hidden="true" class="flex shrink-0 items-end gap-1">
      ${meter.segments
        .map(
          (filled, i) =>
            `<span class="w-2 rounded-full ${LIST_BAR_HEIGHTS[i]} ${
              filled ? "bg-primary" : "bg-muted-foreground/30"
            }"></span>`,
        )
        .join("")}
    </span>
    <span aria-hidden="true" class="min-w-0 break-words text-xs text-muted-foreground">${meter.label}</span>
  </span>`;

  // Ikony jak w karcie: `size-3.5`, dekoracyjne. Kształt bez znaczenia dla pomiaru,
  // liczy się zajmowana szerokość, więc wystarczy pusty svg o tych samych klasach.
  const icon = '<svg aria-hidden="true" class="size-3.5 shrink-0"></svg>';
  const tag = (text: string) =>
    `<span class="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">${text}</span>`;

  const row = (card: (typeof catalog)[number], index: number, own = false) => {
    const coverClass = `${programCoverSizeClass("row")} ${programCoverGradient(
      card.focusKey === "lower_body" ? "lower_body" : "balanced",
    )}`;
    const isActive = index === 0;

    return `<article data-program-row class="relative grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] items-start gap-x-sm rounded-xl border bg-card p-sm text-card-foreground shadow-sm ${
      isActive ? "border-primary/80" : "border-transparent"
    }">
      <div class="absolute right-xs top-xs z-10">
        <button data-program-favorite aria-label="Dodaj plan do ulubionych" aria-pressed="false" class="inline-flex size-11 items-center justify-center rounded-md text-muted-foreground">♡</button>
      </div>
      <div data-program-cover aria-hidden="true" class="${coverClass}"></div>
      <a href="#" class="col-start-2 row-start-1 block min-w-0 rounded-md">
        <p data-program-title class="break-words pr-11 font-medium leading-snug">${card.title}</p>
        <div data-program-tags class="mt-2xs flex flex-wrap items-center gap-2xs">
          ${card.environment ? tag(card.environment) : ""}${own || !card.split ? "" : tag(card.split)}
        </div>
        <p class="mt-2xs flex flex-wrap items-center gap-x-sm gap-y-2xs text-xs text-muted-foreground">
          ${own ? "3 dni w cyklu · edytuj →" : `<span class="inline-flex items-center gap-1">${icon}${card.frequency}</span><span class="inline-flex items-center gap-1">${icon}${card.duration}</span>`}
        </p>
        ${
          !own && card.meter
            ? `<div class="mt-2xs">${meterHtml(card.meter)}</div>`
            : ""
        }
        ${
          index === 6
            ? '<p class="mt-2xs break-words text-xs text-amber-800">Potrzebujesz: drążek</p>'
            : ""
        }
      </a>
    </article>`;
  };

  const ownCard = {
    title: "Mój własny plan z bardzo długą nazwą",
    environment: null,
    split: null,
    meter: null,
    frequency: null,
    duration: null,
    focusKey: "balanced" as const,
  };
  const rows = [
    ...catalog.map((card, index) => row(card, index)),
    row(ownCard, catalog.length, true),
  ];
  const body = `<main class="mx-auto max-w-md space-y-sm p-md">${rows.join("")}</main>`;

  // 393 px to Pixel/iPhone-owa szerokość z macierzy regresji; 320 px pozostaje
  // najwęższym obsługiwanym urządzeniem. Redesign musi trzymać oba, nie jedno.
  for (const width of [320, 393]) {
    const context = await browser.newContext({ viewport: { width, height: 780 } });

    try {
      const page = await context.newPage();
      await page.setContent(pageHtml(body), { waitUntil: "load" });
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        rows: [...document.querySelectorAll<HTMLElement>("[data-program-row]")].map(
          (programRow) => programRow.scrollWidth - programRow.clientWidth,
        ),
        coverWidths: [...document.querySelectorAll<HTMLElement>("[data-program-cover]")].map(
          (cover) => cover.getBoundingClientRect().width,
        ),
        titles: [...document.querySelectorAll<HTMLElement>("[data-program-title]")].map(
          (title) => title.textContent?.trim() ?? "",
        ),
        // Wysokość wiersza tagów: jeden rząd czy zawinięty na dwa.
        tagRowHeights: [...document.querySelectorAll<HTMLElement>("[data-program-tags]")].map(
          (tags) => Math.round(tags.getBoundingClientRect().height),
        ),
        meterCount: document.querySelectorAll('[role="img"][aria-label^="Poziom"]').length,
        activeCount: document.querySelectorAll("[data-program-row].border-primary\\/80").length,
        favoriteBoxes: [...document.querySelectorAll<HTMLElement>("[data-program-favorite]")].map(
          (action) => {
            const box = action.getBoundingClientRect();
            const card = action.closest("[data-program-row]") as HTMLElement;
            const cardBox = card.getBoundingClientRect();
            return { width: box.width, height: box.height, top: box.top - cardBox.top, right: cardBox.right - box.right };
          },
        ),
      }));

      assert.ok(
        metrics.overflow <= 1,
        `lista ma poziomy overflow ${metrics.overflow}px przy ${width}px`,
      );
      assert.equal(metrics.rows.length, 16);
      assert.ok(
        metrics.rows.every((overflow) => overflow <= 1),
        `wiersze mają overflow przy ${width}px: ${metrics.rows.join(", ")}`,
      );
      assert.deepEqual(metrics.coverWidths, Array(16).fill(64));
      assert.equal(metrics.meterCount, 15);

      // Feedback właściciela 2026-07-30: tytuł nie powtarza POZIOMU (niesie go nagłówek
      // grupy) ani CZĘSTOTLIWOŚCI (stoi w wierszu faktów).
      //
      // Środowiska celowo NIE pilnujemy. Przy parserze „Siłownia" w tytule oznaczała
      // przeciek członu specyfikacji, ale `short_name` jest treścią redakcyjną i słowo
      // może być częścią nazwy własnej — „Siłownia w domu" (tag: Dom) czy „Start bez
      // siłowni" to zatwierdzone nazwy, nie duplikaty taga.
      for (const title of metrics.titles) {
        assert.ok(
          !/w tygodniu|Początkując|Średniozaawansowan|Zaawansowan/.test(title),
          `tytuł powtarza poziom lub częstotliwość: „${title}”`,
        );
      }

      // Zgłoszenie „te nazwy są praktycznie takie same" (2026-07-31): przed zmianą
      // 14/15 kart dzieliło tytuł. Tu pilnujemy tego na realnym katalogu.
      const presetTitles = metrics.titles.slice(0, catalog.length);
      assert.equal(
        new Set(presetTitles).size,
        catalog.length,
        `powtórzone tytuły presetów: ${presetTitles.join(", ")}`,
      );

      // Dwa tagi (środowisko + metoda) muszą zmieścić się w JEDNYM rzędzie —
      // inaczej karta rośnie o 20 px na każdej z 15 pozycji.
      assert.ok(
        metrics.tagRowHeights.slice(0, catalog.length).every((height) => height <= 24),
        `wiersz tagów zawija się przy ${width}px: ${metrics.tagRowHeights.join(", ")}`,
      );

      // Aktywny plan sygnalizuje stan wyłącznie obrysem karty (2026-08-08: zniknął
      // też tekst „✓ Aktywny” — obrys + nagłówek sekcji „Aktywny plan” wystarczą).
      assert.equal(metrics.activeCount, 1);
      assert.equal(metrics.favoriteBoxes.length, 16);
      assert.ok(
        metrics.favoriteBoxes.every((box) => box.height >= 44 && box.width >= 44),
        `serce poniżej 44×44 px przy ${width}px`,
      );
      // 2026-08-08 (zgłoszenie właściciela): „Ustaw" usunięte z karty (aktywacja
      // tylko ze szczegółu planu), serce przeniesione z prawego dolnego rogu
      // stopki do prawego górnego rogu całej karty.
      // `--space-xs` = 8px; próg 10 daje margines na subpikselowe zaokrąglenie
      // layoutu (zmierzone konsekwentnie 9px), nie rozszerza realnej tolerancji —
      // stopka („Ustaw"/serce na dole) dawałaby dziesiątki pikseli, nie ~9.
      assert.ok(
        metrics.favoriteBoxes.every((box) => box.top <= 10 && box.right <= 10),
        `serce nie siedzi w prawym górnym rogu karty przy ${width}px: ${metrics.favoriteBoxes
          .map((box) => `top=${Math.round(box.top)} right=${Math.round(box.right)}`)
          .join(", ")}`,
      );
    } finally {
      await context.close();
    }
  }
});

test("PLAN-05H: chipy poziomu przewijają się w poziomie i nie łamią do drugiej linii na 320 px", async () => {
  // Odwzorowanie `ProgramLevelChips` — cztery etykiety, `overflow-x-auto` + `shrink-0`
  // na chipie, wzorzec z `TeamPanel.tsx`. Właściciel wprost zastrzegł: "nie przeskakujące
  // do następnej linijki" — to jest dokładnie klasa regresji, którą ten plik ma łapać,
  // bo `flex-wrap` zamiast `overflow-x-auto` przechodzi lint/build/unit bez ostrzeżenia.
  const chips = ["Wszystkie", "Początkujący", "Średniozaawansowany", "Zaawansowany"];
  const body = `<main class="mx-auto max-w-md p-md">
    <div data-chip-row role="tablist" class="flex gap-xs overflow-x-auto pb-1">
      ${chips
        .map(
          (label, i) =>
            `<button type="button" data-chip role="tab" aria-selected="${i === 0}" class="h-11 shrink-0 rounded-full px-4 text-sm font-medium ${
              i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }">${label}</button>`,
        )
        .join("")}
    </div>
  </main>`;
  const context = await browser.newContext({ viewport: { width: 320, height: 400 } });

  try {
    const page = await context.newPage();
    await page.setContent(pageHtml(body), { waitUntil: "load" });
    const metrics = await page.evaluate(() => {
      const row = document.querySelector<HTMLElement>("[data-chip-row]")!;
      const chipEls = [...document.querySelectorAll<HTMLElement>("[data-chip]")];
      return {
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        rowHeight: Math.round(row.getBoundingClientRect().height),
        chipHeights: chipEls.map((chip) => Math.round(chip.getBoundingClientRect().height)),
        // Dowód, że jest CO przewijać — inaczej test nic by nie pilnował.
        hasOverflowToScroll: row.scrollWidth > row.clientWidth,
      };
    });

    assert.ok(
      metrics.pageOverflow <= 1,
      `strona ma poziomy overflow ${metrics.pageOverflow}px — kontener chipów rozepchnął layout zamiast przewijać się sam`,
    );
    // 44 px (target dotykowy) + `pb-1` (4 px) = 48 px w jednej linii. Złamanie do drugiej
    // linii dawałoby ~2×44 + odstęp ≈ 90+ px — próg 60 px wyraźnie odróżnia oba stany,
    // nie łapiąc przy tym własnego paddingu jako fałszywej regresji.
    assert.ok(
      metrics.rowHeight <= 60,
      `rząd chipów ma ${metrics.rowHeight}px — łamie się do drugiej linii zamiast przewijać w poziomie`,
    );
    assert.ok(
      metrics.chipHeights.every((height) => height === 44),
      `chipy poniżej targetu 44 px: ${metrics.chipHeights.join(", ")}`,
    );
    assert.ok(
      metrics.hasOverflowToScroll,
      "test nic nie pilnuje — cztery chipy zmieściły się bez potrzeby przewijania na 320 px",
    );
  } finally {
    await context.close();
  }
});

test("PLAN-05D: hero, pełne fakty, poziom i opis mieszczą się na 320/375/393 px", async () => {
  // Najdłuższy opis obecny w katalogu produkcyjnym (277 znaków). Trzymamy tu
  // realny worst-case zamiast sztucznego lorem ipsum, żeby regresja odpowiadała
  // temu, co użytkownik faktycznie może otworzyć.
  const longestDescription =
    "Dwa treningi całego ciała na pełnym sprzęcie, z lekkim naciskiem na górę. Jedno duże ćwiczenie na dół w sesji, pełny push i pull, bezpośredni biceps i triceps. Plan projektowany na 3 dni w tygodniu — przy dwóch działa, ale rozwija wolniej. Zostaw 1 lub 2 powtórzenia w zapasie.";
  const heroClass = `${programCoverSizeClass("hero")} ${programCoverGradient("lower_body")}`;
  const icon = '<span aria-hidden="true" class="block size-3.5 shrink-0 rounded-sm border min-[360px]:size-4"></span>';
  const description = `<details data-program-description class="group rounded-xl bg-card text-card-foreground shadow-sm">
    <summary class="flex min-h-11 cursor-pointer list-none items-center justify-between gap-sm rounded-xl px-md py-sm font-semibold">
      Opis <span aria-hidden="true">⌄</span>
    </summary>
    <p class="break-words border-t px-md pb-md pt-sm text-sm leading-relaxed text-muted-foreground">${longestDescription}</p>
  </details>`;
  const body = (withDescription: boolean) => `<div class="mx-auto flex min-h-dvh max-w-md flex-col">
    <header class="grid min-h-[60px] grid-cols-[minmax(2.75rem,1fr)_minmax(0,auto)_minmax(2.75rem,1fr)] items-center border-b bg-background px-sm">
      <button class="size-11">←</button><h1 class="truncate px-xs text-center font-semibold">Plan treningowy</h1><div></div>
    </header>
    <main class="flex-1 space-y-lg p-md">
      <section data-program-detail class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-sm">
        <div data-program-cover aria-hidden="true" class="${heroClass}"></div>
        <div class="space-y-md p-md">
          <div class="space-y-xs">
            <h2 class="break-words text-xl font-semibold leading-tight">Pośladki i nogi — średniozaawansowany</h2>
            <div data-program-facts class="space-y-xs">
              <div data-primary-facts class="flex flex-wrap items-center gap-x-2xs gap-y-xs text-xs text-muted-foreground min-[360px]:gap-x-sm min-[360px]:text-sm">
                <span data-fact class="inline-flex items-center gap-2xs whitespace-nowrap">${icon}3 treningi</span>
                <span data-fact class="inline-flex items-center gap-2xs whitespace-nowrap">${icon}2–3 dni/tydz.</span>
                <span data-fact class="inline-flex items-center gap-2xs whitespace-nowrap">${icon}45–60 min</span>
              </div>
              <div data-program-level class="flex flex-wrap items-center gap-x-sm gap-y-xs">
                <span role="img" aria-label="Poziom 2 z 3: Średniozaawansowany" class="inline-flex items-center gap-xs">
                  <span aria-hidden="true" class="flex gap-2xs">
                    <span class="h-2 w-5 rounded-full border border-primary"></span>
                    <span class="h-2 w-5 rounded-full bg-primary"></span>
                    <span class="h-2 w-5 rounded-full border border-primary"></span>
                  </span>
                  <span aria-hidden="true" class="text-sm text-muted-foreground">Średniozaawansowany</span>
                </span>
                <span class="text-sm text-muted-foreground">Siłownia · pośladki i nogi</span>
                <span class="text-sm font-medium text-support">Pasuje do Twojego kierunku</span>
              </div>
            </div>
          </div>
          <form data-program-cta><button class="h-11 w-full rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground">Ustaw jako aktywny</button></form>
        </div>
      </section>
      ${withDescription ? description : ""}
    </main>
    <nav data-bottom-nav class="rounded-full bg-card shadow-e2" style="position:fixed;left:16px;right:16px;bottom:12px;height:68px"></nav>
  </div>`;

  for (const width of [320, 375, 393]) {
    const viewport = { width, height: width === 375 ? 667 : 780 };
    const context = await browser.newContext({ viewport });
    try {
      const page = await context.newPage();
      await page.setContent(pageHtml(body(true)), { waitUntil: "load" });
      const metrics = await page.evaluate(() => {
        const facts = [...document.querySelectorAll<HTMLElement>("[data-fact]")];
        const primaryFacts = document.querySelector<HTMLElement>("[data-primary-facts]")!;
        const level = document.querySelector<HTMLElement>("[data-program-level]")!;
        const cta = document.querySelector<HTMLElement>("[data-program-cta]")!;
        const bottomNav = document.querySelector<HTMLElement>("[data-bottom-nav]")!;
        const description = document.querySelector<HTMLElement>("[data-program-description]") as HTMLDetailsElement;
        const descriptionOpenByDefault = description.open;
        // Overflow tylko obchodzi, jak wygląda OTWARTY akordeon — zamknięty domyślnie
        // (właściciel: mniej treści na pierwszy rzut oka) nie ma czego przelewać.
        description.open = true;
        const descriptionOverflow = description.scrollWidth - description.clientWidth;
        return {
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          factTexts: facts.map((fact) => fact.textContent?.trim()),
          factOverflow: facts.map((fact) => fact.scrollWidth - fact.clientWidth),
          levelBelowFacts:
            level.getBoundingClientRect().top >= primaryFacts.getBoundingClientRect().bottom,
          factsShareRow:
            new Set(facts.map((fact) => Math.round(fact.getBoundingClientRect().top))).size === 1,
          ctaBottom: cta.getBoundingClientRect().bottom,
          navTop: bottomNav.getBoundingClientRect().top,
          descriptionOverflow,
          descriptionOpenByDefault,
        };
      });

      assert.ok(metrics.overflow <= 1, `poziomy overflow ${metrics.overflow}px przy ${width}px`);
      assert.deepEqual(metrics.factTexts, ["3 treningi", "2–3 dni/tydz.", "45–60 min"]);
      assert.ok(
        metrics.factOverflow.every((overflow) => overflow <= 1),
        `ucięty fakt przy ${width}px: ${metrics.factOverflow.join(", ")}`,
      );
      assert.equal(metrics.descriptionOpenByDefault, false, "opis powinien być domyślnie zamknięty");
      assert.ok(
        metrics.descriptionOverflow <= 1,
        `opis ma overflow ${metrics.descriptionOverflow}px przy ${width}px (po otwarciu)`,
      );
      if (width === 320) {
        assert.equal(metrics.factsShareRow, true, "trzy fakty nie mieszczą się w jednym rzędzie");
        assert.equal(metrics.levelBelowFacts, true, "LevelMeter nie zszedł pod trzy fakty");
      }
      if (width === 375) {
        assert.ok(
          metrics.ctaBottom < metrics.navTop,
          `CTA kończy się na ${metrics.ctaBottom}px i wpada pod nav od ${metrics.navTop}px`,
        );
      }
    } finally {
      await context.close();
    }
  }

  const noDescriptionContext = await browser.newContext({ viewport: { width: 320, height: 780 } });
  try {
    const page = await noDescriptionContext.newPage();
    await page.setContent(pageHtml(body(false)), { waitUntil: "load" });
    assert.equal(
      await page.locator("[data-program-description]").count(),
      0,
      "plan bez opisu renderuje pusty akordeon",
    );
  } finally {
    await noDescriptionContext.close();
  }
});

test("SESSION-01A2: zwarty wiersz serii mieści pola i check na 320/375/393 px", async () => {
  const body = `<main class="mx-auto max-w-md p-md"><section class="rounded-xl bg-card p-md">
    <ul class="space-y-xs">
      <li data-compact-row class="relative flex flex-wrap items-center gap-xs rounded-md">
        <button class="size-11 shrink-0 rounded-md border">1</button>
        <input data-set-field class="h-11 min-w-0 flex-1 rounded-md border text-center" value="62.5">
        <input data-set-field class="h-11 min-w-0 flex-1 rounded-md border text-center" value="8">
        <button data-inline-check class="flex size-11 shrink-0 items-center justify-center rounded-md border">✓</button>
      </li>
      <li class="relative flex flex-wrap items-center gap-xs rounded-md">
        <button class="size-11 shrink-0 rounded-md border">2</button>
        <input data-set-field class="h-11 min-w-0 flex-1 rounded-md border text-center" value="65">
        <input data-set-field class="h-11 min-w-0 flex-1 rounded-md border text-center" value="8">
        <button class="flex size-11 shrink-0 items-center justify-center rounded-md border">✓</button>
        <button data-save-edit class="order-last flex min-h-11 w-full items-center justify-center rounded-md border px-sm text-sm font-semibold">
          Zapisz zmianę
        </button>
      </li>
    </ul>
  </section></main>`;

  for (const width of [320, 375, 393]) {
    const ctx = await browser.newContext({ viewport: { width, height: 780 } });
    try {
      const page = await ctx.newPage();
      await page.setContent(pageHtml(body), { waitUntil: "load" });
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        fieldWidths: [...document.querySelectorAll<HTMLElement>("[data-set-field]")].map(
          (field) => field.getBoundingClientRect().width,
        ),
        rowHeight: document.querySelector<HTMLElement>("[data-compact-row]")!
          .getBoundingClientRect().height,
        checkSize: (() => {
          const rect = document.querySelector<HTMLElement>("[data-inline-check]")!
            .getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        })(),
        actionHeight: document.querySelector<HTMLElement>("[data-save-edit]")!
          .getBoundingClientRect().height,
      }));
      assert.ok(metrics.overflow <= 1, `overflow ${metrics.overflow}px przy ${width}px`);
      assert.ok(
        metrics.fieldWidths.every((fieldWidth) => fieldWidth >= 56),
        `pole serii węższe niż 56px przy ${width}px: ${metrics.fieldWidths.join(", ")}`,
      );
      assert.ok(metrics.rowHeight <= 45, `zwykły wiersz wyższy niż 44px przy ${width}px`);
      assert.ok(
        metrics.checkSize.width >= 44 && metrics.checkSize.height >= 44,
        `check mniejszy niż 44px przy ${width}px`,
      );
      assert.ok(metrics.actionHeight >= 44, `CTA niższe niż 44px przy ${width}px`);
    } finally {
      await ctx.close();
    }
  }
});

test("SESSION-01A2: regulowane timery mieszczą się na 320/375/393 px i zachowują target 44 px", async () => {
  const body = `<main class="mx-auto max-w-md space-y-md p-md">
    <section class="rounded-xl border border-support/20 bg-card px-sm py-sm">
      <p class="text-sm font-semibold">Rozgrzewka</p>
      <p class="mt-2xs text-xs leading-relaxed text-muted-foreground">Lekki marsz, krążenia barków i bioder, potem 2 lekkie serie: Wykroki chodzone ze sztangą.</p>
      <div class="mt-sm flex items-center gap-xs">
        <div class="flex shrink-0 items-center rounded-md border">
          <button data-routine-action class="flex size-11 items-center justify-center">−</button>
          <span class="min-w-14 text-center text-sm font-semibold">5 min</span>
          <button data-routine-action class="flex size-11 items-center justify-center">+</button>
        </div>
        <button data-routine-action class="flex h-11 min-w-0 flex-1 items-center justify-center rounded-md bg-primary px-sm">Start</button>
      </div>
    </section>
    <section class="rounded-xl border border-support/20 bg-card px-sm py-sm">
      <p class="text-sm font-semibold">Rozciąganie</p>
      <p class="mt-2xs text-xs leading-relaxed text-muted-foreground">Spokojny oddech, potem łagodne pozycje na mięśnie czworogłowe i pośladki.</p>
      <div class="mt-sm flex items-center gap-xs">
        <span class="min-w-0 flex-1 font-mono text-xl font-semibold">02:41</span>
        <button data-routine-action class="flex size-11 items-center justify-center rounded-md border">+1</button>
        <button data-routine-action class="flex h-11 items-center justify-center rounded-md border px-sm">Zakończ</button>
      </div>
    </section>
  </main>`;

  for (const width of [320, 375, 393]) {
    const ctx = await browser.newContext({ viewport: { width, height: 780 } });
    try {
      const page = await ctx.newPage();
      await page.setContent(pageHtml(body), { waitUntil: "load" });
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        actionHeights: [
          ...document.querySelectorAll<HTMLElement>("[data-routine-action]"),
        ].map((action) => action.getBoundingClientRect().height),
      }));
      assert.ok(metrics.overflow <= 1, `overflow ${metrics.overflow}px przy ${width}px`);
      assert.ok(
        metrics.actionHeights.every((height) => height >= 44),
        `target niższy niż 44px przy ${width}px: ${metrics.actionHeights.join(", ")}`,
      );
    } finally {
      await ctx.close();
    }
  }
});

// Harness montuje PRAWDZIWY SetRow (nie makietę klas jak testy layoutu wyżej),
// bo prefill z poprzedniej sesji i klawiatura menu to zachowanie, którego statyczny
// HTML nie sprawdzi, a lint/tsc/unit nie mają jak wykryć.
async function setRowBundle(): Promise<string> {
  if (setRowBundleCache !== null) return setRowBundleCache;

  const result = await build({
    bundle: true,
    format: "iife",
    platform: "browser",
    write: false,
    absWorkingDir: ROOT,
    stdin: {
      loader: "tsx",
      resolveDir: ROOT,
      sourcefile: "session01a2-set-row-harness.tsx",
      contents: `
        import React, { useState } from "react";
        import { createRoot } from "react-dom/client";
        import { SetRow } from "./app/session/[id]/SetRow";

        const PREV = { set_index: 1, weight: 60, reps: 8, duration_seconds: null, added_weight: null };
        const makeSet = (id, index) => ({
          id,
          session_exercise_id: "se-1",
          set_index: index,
          set_type: "working",
          weight: null,
          reps: null,
          duration_seconds: null,
          added_weight: null,
          rpe: null,
          completed: false,
        });

        function Harness() {
          const [sets, setSets] = useState([makeSet("s1", 1), makeSet("s2", 2)]);
          const [activeId, setActiveId] = useState(null);

          return <main className="mx-auto max-w-md p-md">
            <ul className="space-y-xs">
              {sets.map((set, i) => (
                <SetRow
                  key={set.id}
                  index={i + 1}
                  set={set}
                  prev={PREV}
                  type="weighted"
                  unit="kg"
                  active={activeId === set.id}
                  onPatch={(patch) =>
                    setSets((all) => all.map((s) => (s.id === set.id ? { ...s, ...patch } : s)))
                  }
                  onPersist={() => {}}
                  onToggle={() =>
                    setSets((all) =>
                      all.map((s) => (s.id === set.id ? { ...s, completed: !s.completed } : s)),
                    )
                  }
                  onActivate={() => setActiveId(set.id)}
                  onSaveEdit={() => {}}
                  onDelete={() => setSets((all) => all.filter((s) => s.id !== set.id))}
                />
              ))}
            </ul>
            <button type="button" data-add-set>+ seria</button>
          </main>;
        }

        createRoot(document.getElementById("root")).render(<Harness />);
      `,
    },
  });

  setRowBundleCache = result.outputFiles[0]?.text ?? null;
  assert.ok(setRowBundleCache, "esbuild nie zwrócił bundla harnessu SetRow");
  return setRowBundleCache;
}

async function setRowPage(): Promise<{ context: Awaited<ReturnType<Browser["newContext"]>>; page: Page }> {
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();
  await page.setContent(pageHtml('<div id="root"></div>'), { waitUntil: "load" });
  await page.addScriptTag({ content: await setRowBundle() });
  await page.getByRole("button", { name: "Opcje serii 1" }).waitFor();
  return { context, page };
}

test("SESSION-01A2: tap w puste pole kopiuje poprzedni wynik i zaznacza go", async () => {
  const { context, page } = await setRowPage();
  try {
    const weight = page.locator("input").first();
    await weight.click();

    assert.equal(await weight.inputValue(), "60", "pole nie przejęło wagi z poprzedniej sesji");
    const selected = await pollUntil(
      () =>
        weight.evaluate(
          (el: HTMLInputElement) => el.value.slice(el.selectionStart ?? 0, el.selectionEnd ?? 0),
        ),
      (value) => value !== "",
    );
    assert.equal(selected, "60", "skopiowana wartość nie jest zaznaczona");

    // Sedno kompromisu: podpowiedź nie może kosztować nic w cięższej sesji.
    await page.keyboard.type("65");
    assert.equal(await weight.inputValue(), "65", "wpisanie innej liczby nie zastąpiło podpowiedzi");

    // Powrót do pola z treścią niczego nie nadpisuje.
    await page.locator("input").nth(1).click();
    await weight.click();
    assert.equal(await weight.inputValue(), "65", "ponowny tap nadpisał wpisaną wartość");
  } finally {
    await context.close();
  }
});

test("SESSION-01A2: menu serii obsługuje klawiaturę i oddaje fokus", async () => {
  const { context, page } = await setRowPage();
  try {
    const trigger = page.getByRole("button", { name: "Opcje serii 1" });
    await trigger.focus();
    await page.keyboard.press("Enter");

    const focusedRole = () =>
      page.evaluate(() => ({
        role: document.activeElement?.getAttribute("role") ?? null,
        text: document.activeElement?.textContent?.trim() ?? null,
      }));
    assert.deepEqual(
      await focusedRole(),
      { role: "menuitemradio", text: "Seria robocza" },
      "fokus nie wszedł w menu po otwarciu",
    );

    await page.keyboard.press("ArrowDown");
    assert.equal((await focusedRole()).text, "Seria rozgrzewkowa", "ArrowDown nie przesuwa fokusu");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    assert.equal((await focusedRole()).text, "Usuń serię", "ArrowUp nie zawija na koniec listy");

    await page.keyboard.press("Escape");
    await page.getByRole("menu").waitFor({ state: "detached" });
    const returned = await page.evaluate(
      () => document.activeElement?.getAttribute("aria-label") ?? null,
    );
    assert.equal(returned, "Opcje serii 1", "Escape nie oddał fokusu przyciskowi numeru");
  } finally {
    await context.close();
  }
});

test("SESSION-01A2: usunięcie serii przenosi fokus na sąsiedni wiersz", async () => {
  const { context, page } = await setRowPage();
  try {
    await page.getByRole("button", { name: "Opcje serii 1" }).click();
    await page.getByRole("menuitem", { name: "Usuń serię" }).click();

    // Wiersz znika razem z fokusem — bez jawnego przeniesienia ląduje on na <body>.
    await page.waitForFunction(() => document.querySelectorAll("li").length === 1);
    const focused = await page.evaluate(
      () => document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.tagName ?? null,
    );
    assert.equal(focused, "Opcje serii 1", "fokus nie trafił na pozostały wiersz");

    await page.getByRole("button", { name: "Opcje serii 1" }).click();
    await page.getByRole("menuitem", { name: "Usuń serię" }).click();
    await page.waitForFunction(() => document.querySelectorAll("li").length === 0);
    const fallback = await page.evaluate(
      () => document.activeElement?.textContent?.trim() ?? null,
    );
    assert.equal(fallback, "+ seria", "po usunięciu ostatniej serii fokus nie wrócił do „+ seria”");
  } finally {
    await context.close();
  }
});

// SESSION-01A3: podpowiedź startowa jest overlayem, więc obowiązuje ją pełny
// kontrakt z CLAUDE.md — blokada tła, Escape, pułapka fokusu i zwrot fokusu.
// Harness montuje prawdziwy LoggerHint razem z wierszem serii jako kotwicą.
async function loggerHintBundle(): Promise<string> {
  if (loggerHintBundleCache !== null) return loggerHintBundleCache;

  const result = await build({
    bundle: true,
    format: "iife",
    platform: "browser",
    write: false,
    absWorkingDir: ROOT,
    stdin: {
      loader: "tsx",
      resolveDir: ROOT,
      sourcefile: "session01a3-logger-hint-harness.tsx",
      contents: `
        import React, { useState } from "react";
        import { createRoot } from "react-dom/client";
        import { LoggerHint } from "./app/session/[id]/LoggerHint";

        function Harness() {
          const [open, setOpen] = useState(false);
          return <main className="mx-auto max-w-md p-md">
            <button type="button" onClick={() => setOpen(true)}>Otwórz logger</button>
            <div style={{ height: 600 }} />
            <ul>
              <li data-set-state="empty" className="relative flex items-center gap-xs">
                <button type="button" aria-haspopup="menu" className="size-11">1</button>
                <input className="h-11 flex-1" />
                <input className="h-11 flex-1" />
                <button type="button" aria-label="Zalicz serię" className="size-11">✓</button>
              </li>
            </ul>
            <div style={{ height: 1400 }} />
            {open && <LoggerHint onDismiss={() => setOpen(false)} />}
          </main>;
        }

        createRoot(document.getElementById("root")).render(<Harness />);
      `,
    },
  });

  loggerHintBundleCache = result.outputFiles[0]?.text ?? null;
  assert.ok(loggerHintBundleCache, "esbuild nie zwrócił bundla harnessu LoggerHint");
  return loggerHintBundleCache;
}

async function loggerHintPage() {
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();
  await page.setContent(pageHtml('<div id="root"></div>'), { waitUntil: "load" });
  await page.addScriptTag({ content: await loggerHintBundle() });
  const opener = page.getByRole("button", { name: "Otwórz logger" });
  await opener.waitFor();
  await opener.click();
  await page.getByRole("dialog").waitFor();
  return { context, page };
}

test("SESSION-01A3: podpowiedź kotwiczy się pod wierszem serii i pokrywa cały ekran", async () => {
  const { context, page } = await loggerHintPage();
  try {
    const readGeometry = () => page.evaluate(() => {
      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      const scrim = dialog.parentElement!;
      const row = document.querySelector<HTMLElement>("li[data-set-state]")!;
      const scrimRect = scrim.getBoundingClientRect();
      const dialogRect = dialog.getBoundingClientRect();
      return {
        scrimParent: scrim.parentElement?.tagName ?? null,
        scrim: { w: scrimRect.width, h: scrimRect.height, x: scrimRect.left, y: scrimRect.top },
        viewport: { w: window.innerWidth, h: window.innerHeight },
        dialogBelowRow: dialogRect.top >= row.getBoundingClientRect().bottom,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    // Pozycję popovera liczy efekt po montażu, więc czekamy na zakotwiczenie zamiast
    // czytać geometrię w tej samej klatce, w której dialog się pojawił.
    const geometry = await pollUntil(readGeometry, (value) => value.dialogBelowRow);

    // Portal do body: wewnątrz drzewa loggera przodek z `transform` zabrałby
    // `position: fixed` cały ekran i przyciemnienie przestałoby pokrywać widok.
    assert.equal(geometry.scrimParent, "BODY", "overlay nie jest portalowany do body");
    assert.deepEqual(
      { w: geometry.scrim.w, h: geometry.scrim.h, x: geometry.scrim.x, y: geometry.scrim.y },
      { w: geometry.viewport.w, h: geometry.viewport.h, x: 0, y: 0 },
      "przyciemnienie nie pokrywa całego widoku",
    );
    assert.ok(geometry.dialogBelowRow, "podpowiedź nie jest zakotwiczona pod wierszem serii");
    assert.ok(geometry.overflow <= 1, `poziomy overflow ${geometry.overflow}px`);
  } finally {
    await context.close();
  }
});

test("SESSION-01A3: overlay blokuje tło, trzyma fokus i oddaje go po zamknięciu", async () => {
  const { context, page } = await loggerHintPage();
  try {
    const locked = await page.evaluate(() => {
      const before = window.scrollY;
      window.scrollTo(0, 500);
      const after = window.scrollY;
      return { moved: after !== before, bodyPosition: getComputedStyle(document.body).position };
    });
    assert.equal(locked.bodyPosition, "fixed", "tło nie jest unieruchomione");
    assert.equal(locked.moved, false, "tło przewija się pod podpowiedzią");

    // Tap w tło NIE zamyka: podpowiedź pokazuje się raz w życiu, więc przypadkowe
    // muśnięcie ekranu nie może jej skasować w jedynym momencie, gdy jest potrzebna.
    await page.mouse.click(VIEWPORT.width - 6, 6);
    assert.equal(
      await page.getByRole("dialog").count(),
      1,
      "kliknięcie w tło zamknęło podpowiedź",
    );

    // Pułapka fokusu: Tab nie może wyprowadzić poza overlay.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const trapped = await page.evaluate(() =>
      document.querySelector('[role="dialog"]')!.contains(document.activeElement),
    );
    assert.ok(trapped, "Tab wyprowadził fokus poza overlay");

    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "detached" });
    // `setContent` daje origin bez dostępu do localStorage — i dobrze, bo dzięki
    // temu ten sam test pilnuje, że zapis preferencji nie wywala komponentu.
    // Samą trwałość flagi sprawdzają testy jednostkowe `prefs`.
    const released = await page.evaluate(() => ({
      bodyPosition: getComputedStyle(document.body).position,
      focus: document.activeElement?.textContent?.trim() ?? null,
      opener: document.body.innerText.includes("Otwórz logger"),
    }));
    assert.notEqual(released.bodyPosition, "fixed", "blokada tła została po zamknięciu");
    assert.ok(released.opener, "harness rozpadł się przy zamykaniu podpowiedzi");
    assert.equal(released.focus, "Otwórz logger", "fokus nie wrócił do elementu otwierającego");
  } finally {
    await context.close();
  }
});

// MOMENT-01: zasięg wystrzału da się sprawdzić tylko w locie — statyczny HTML ani
// model cząstki nie powiedzą, jak wysoko konfetti realnie dolatuje, bo wynik zależy
// od jednostki `--confetti-peak` i punktu startu w CSS (`top: 32%`). Feedback
// 2026-07-27: „powinno polecieć aż do topbara".
async function confettiBundle(): Promise<string> {
  if (confettiBundleCache !== null) return confettiBundleCache;

  const result = await build({
    bundle: true,
    format: "iife",
    platform: "browser",
    write: false,
    absWorkingDir: ROOT,
    stdin: {
      loader: "tsx",
      resolveDir: ROOT,
      sourcefile: "moment01-confetti-harness.tsx",
      contents: `
        import React from "react";
        import { createRoot } from "react-dom/client";
        import { PrConfetti } from "./app/session/[id]/done/PrConfetti";

        createRoot(document.getElementById("root")).render(<PrConfetti />);
      `,
    },
  });

  confettiBundleCache = result.outputFiles[0]?.text ?? null;
  assert.ok(confettiBundleCache, "esbuild nie zwrócił bundla harnessu konfetti");
  return confettiBundleCache;
}

test("MOMENT-01: wystrzał dolatuje do góry ekranu i ma pełną liczbę cząstek", async () => {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    reducedMotion: "no-preference",
  });
  try {
    const page = await context.newPage();
    await page.setContent(pageHtml('<div id="root"></div>'), { waitUntil: "load" });
    await page.addScriptTag({ content: await confettiBundle() });
    await page.locator(".confetti-paper").first().waitFor();

    // Próbkujemy CAŁY lot: szczyt paraboli wypada ok. 34% czasu trwania. Pętla
    // siedzi po stronie Node — nazwana funkcja w `page.evaluate` dostaje od esbuilda
    // wrapper `__name`, którego w przeglądarce nie ma.
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    let minTop = Number.POSITIVE_INFINITY;
    let maxCount = 0;
    const deadline = Date.now() + 2600;
    while (Date.now() < deadline) {
      const frame = await page.evaluate(() => {
        const papers = Array.from(
          document.querySelectorAll<HTMLElement>(".confetti-paper"),
        );
        return {
          count: papers.length,
          top: papers.reduce(
            (lowest, paper) => Math.min(lowest, paper.getBoundingClientRect().top),
            Number.POSITIVE_INFINITY,
          ),
        };
      });
      maxCount = Math.max(maxCount, frame.count);
      minTop = Math.min(minTop, frame.top);
    }
    const flight = { minTop, maxCount, viewportHeight };

    assert.equal(flight.maxCount, 60, `w locie było ${flight.maxCount} cząstek`);
    // Topbar to górne ~10% ekranu. Wystrzał ma tam dolecieć, a nie kończyć się
    // w połowie — wcześniej `peak` był w px i na wyższych ekranach ginął nisko.
    assert.ok(
      flight.minTop <= flight.viewportHeight * 0.1,
      `najwyższy punkt ${Math.round(flight.minTop)}px na ekranie ${flight.viewportHeight}px — za nisko`,
    );
  } finally {
    await context.close();
  }
});

// Worst-case treść z realnej bazy (najdłuższe nazwy/notatki).
// PLAN-05H: poprzedni rekord długości (`lower-body-*`) zwężony do jednego poziomu
// (level_min=2), więc nazwa się skróciła — podmienione na aktualnie najdłuższą.
const LONG_SUBTITLE = "Początkujący · Dom z hantlami · Całe ciało · 2–3× w tygodniu";
const LONG_NOTES =
  "Zrób prawie maksymalną liczbę poprawnych powtórzeń. Zostaw 1 lub 2 w zapasie. Nachwyt.";

// Odwzorowuje strukturę klas z app/history/add/HistoricalWorkoutForm.tsx (fieldset kart wyboru dnia).
function historyRadioFieldset(fieldsetCls: string): string {
  const card = `<label class="flex min-h-14 items-center justify-between rounded-lg border px-sm border-border">
    <span class="min-w-0"><span class="block truncate text-sm font-semibold">Dół A · siła</span>
    <span class="block truncate text-xs text-muted-foreground">${LONG_SUBTITLE}</span></span>
    <input type="radio" class="size-4 shrink-0 accent-primary"></label>`;
  return `<main class="mx-auto max-w-md p-md"><section class="rounded-xl bg-card p-md">
    <fieldset class="${fieldsetCls}">${card.repeat(3)}</fieldset></section></main>`;
}

test("history/add: karty wyboru dnia nie rozpychają widoku (fieldset min-w-0)", async () => {
  const overflow = await pageOverflow(historyRadioFieldset("min-w-0 space-y-xs"));
  assert.ok(overflow <= 1, `poziomy overflow ${overflow}px na ${VIEWPORT.width}px`);
});

test("kontrola negatywna: bez min-w-0 fieldset FAKTYCZNIE rozpycha (test wykrywa regresję)", async () => {
  const overflow = await pageOverflow(historyRadioFieldset("space-y-xs"));
  assert.ok(overflow > 1, "oczekiwano overflow bez min-w-0 — jeśli brak, test nic nie pilnuje");
});

test("programs/[id]: długi notes w schemacie serii zawija się bez overflow", async () => {
  const body = `<main class="mx-auto max-w-md p-md"><section class="rounded-xl bg-card p-md">
    <ul class="text-sm"><li class="flex items-center justify-between gap-sm">
      <button class="flex min-h-11 min-w-0 items-center text-left">Podciąganie nachwytem</button>
      <span class="min-w-0 shrink break-words text-right text-muted-foreground">4 × ${LONG_NOTES}</span>
    </li></ul></section></main>`;
  const overflow = await pageOverflow(body);
  assert.ok(overflow <= 1, `poziomy overflow ${overflow}px na ${VIEWPORT.width}px`);
});

test("sticky header (F0.4): ::before kryje pas safe-area — treść nie prześwituje", async () => {
  // Używa realnej stałej STICKY_HEADER_SAFE_AREA — jeśli ktoś usunie z niej `before:` tło, test padnie.
  const body = `<div style="height:200px;overflow:auto">
    <div style="height:80px"></div>
    <header class="grid min-h-[60px] items-center bg-background px-sm ${STICKY_HEADER_SAFE_AREA} z-30"><h1>Tytuł</h1></header>
    <div style="height:600px"></div></div>`;
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  try {
    const p = await ctx.newPage();
    await p.setContent(pageHtml(body), { waitUntil: "load" });
    const before = await p.evaluate(() => {
      const h = document.querySelector("header")!;
      const cs = getComputedStyle(h, "::before");
      return { height: cs.height, bg: cs.backgroundColor, position: cs.position };
    });
    assert.equal(before.height, SAFE_AREA, "::before nie kryje pełnego pasa safe-area");
    assert.equal(before.position, "absolute");
    assert.notEqual(before.bg, "rgba(0, 0, 0, 0)", "::before bez tła — treść będzie prześwitywać");
  } finally {
    await ctx.close();
  }
});

// Struktura Loggera: body ma globalne pt-safe, kontener BEZ ujemnego marginesu.
// pullUp=true odtwarza starą, błędną wersję z `-mt-[var(--safe-area-top)]` —
// inline stylem, bo po usunięciu klasy z Loggera Tailwind JIT już jej nie emituje.
function loggerStructure(pullUp: boolean): string {
  return `<div${pullUp ? ' style="margin-top:calc(var(--safe-area-top) * -1)"' : ""} class="flex min-h-dvh flex-col">
    <header class="${STICKY_HEADER_SAFE_AREA} z-10 min-h-[60px] bg-background px-md py-sm">
      <div data-header-content class="h-11">Własny trening</div>
    </header>
    <main><div data-first-content>Sylwetka: dobierz ciężar tak…</div></main>
    <div style="height:900px"></div>
  </div>`;
}

async function loggerPositions(pullUp: boolean, scrollTo: number) {
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  try {
    const p = await ctx.newPage();
    await p.setContent(
      pageHtml(loggerStructure(pullUp)).replace(
        "body{margin:0}",
        "body{margin:0;padding-top:var(--safe-area-top)}",
      ),
      { waitUntil: "load" },
    );
    await p.evaluate((y) => window.scrollTo(0, y), scrollTo);
    return await p.evaluate(() => {
      const header = document.querySelector("header")!.getBoundingClientRect();
      const first = document.querySelector("[data-first-content]")!.getBoundingClientRect();
      return { headerTop: header.top, headerBottom: header.bottom, firstTop: first.top };
    });
  } finally {
    await ctx.close();
  }
}

test("logger: sticky header nie zasłania pierwszej treści przy scrollu 0 (regresja 2026-07-22)", async () => {
  // Z `-mt` naturalny top headera = 0 < offset sticky (47) → sticky OD RAZU
  // zsuwał header o 47 px w dół, nakrywając pas z podpowiedzią priorytetu.
  const positions = await loggerPositions(false, 0);
  assert.ok(
    positions.firstTop >= positions.headerBottom - 1,
    `header nachodzi na pierwszą treść: content@${positions.firstTop}px < headerBottom@${positions.headerBottom}px`,
  );
});

test("logger: header przykleja się pod status barem po scrollu", async () => {
  const positions = await loggerPositions(false, 100);
  // Treść PO scrollu chowa się pod header — to poprawne; pilnujemy tylko pozycji headera.
  assert.equal(positions.headerTop, 47, "nagłówek Loggera nie przykleił się pod status barem");
});

test("kontrola negatywna: z `-mt` header FAKTYCZNIE nakrywa treść (test wykrywa regresję)", async () => {
  const positions = await loggerPositions(true, 0);
  assert.ok(
    positions.firstTop < positions.headerBottom - 1,
    "oczekiwano nakładki przy starej strukturze — jeśli brak, ten test nic nie pilnuje",
  );
});

test("sheet-w-sheecie (Podmień ćwiczenie): blokada przejmuje pozycję, zamknięcie wraca do niej", async () => {
  // Reprodukcja buga 2026-07-22: menu karty zamyka się i w tym samym commicie
  // otwiera się SwapPanel. Blokada per instancja czytała scrollY=0 (przywrócenie
  // z rAF pierwszego sheeta jeszcze nie zdążyło się wykonać) i po zamknięciu
  // drugiego arkusza strona skakała na górę.
  const { context, page, scrollY } = await bottomSheetPage({ width: 375, height: 780 });
  try {
    await page.getByRole("button", { name: "Podmień", exact: true }).click();
    await page.getByRole("dialog", { name: "Arkusz testowy" }).waitFor({ state: "detached" });
    await page.getByRole("dialog", { name: "Arkusz zagnieżdżony" }).waitFor();
    const lock = await page.evaluate(() => ({
      position: document.body.style.position,
      top: document.body.style.top,
    }));
    assert.deepEqual(
      lock,
      { position: "fixed", top: `${-scrollY}px` },
      "zagnieżdżony sheet zgubił pozycję strony (zapamiętał wyzerowany scroll)",
    );
    await page.getByRole("button", { name: "Zamknij zagnieżdżony" }).click();
    await page.getByRole("dialog", { name: "Arkusz zagnieżdżony" }).waitFor({ state: "detached" });
    await expectRestoredScroll(page, scrollY);
  } finally {
    await context.close();
  }
});

test("trzypoziomowy stos arkuszy przywraca inert wyłącznie warstwa po warstwie", async () => {
  const { context, page } = await bottomSheetPage({ width: 375, height: 780 });
  try {
    await page.getByRole("button", { name: "Otwórz drugi poziom" }).click();
    await page.getByRole("dialog", { name: "Drugi poziom" }).waitFor();
    await page.getByRole("button", { name: "Otwórz trzeci poziom" }).click();
    await page.getByRole("dialog", { name: "Trzeci poziom" }).waitFor();

    const inertStack = () =>
      page.evaluate(() => ({
        root: document.getElementById("root")?.inert ?? false,
        overlays: [...document.body.children]
          .filter((element) => element.querySelector('[role="dialog"]'))
          .map((element) => (element as HTMLElement).inert),
      }));

    assert.deepEqual(await inertStack(), {
      root: true,
      overlays: [true, true, false],
    });

    await page.getByRole("button", { name: "Zamknij trzeci poziom" }).click();
    await page.getByRole("dialog", { name: "Trzeci poziom" }).waitFor({ state: "detached" });
    assert.deepEqual(await inertStack(), { root: true, overlays: [true, false] });

    await page
      .getByRole("dialog", { name: "Drugi poziom" })
      .getByRole("button", { name: "Zamknij", exact: true })
      .click();
    await page.getByRole("dialog", { name: "Drugi poziom" }).waitFor({ state: "detached" });
    assert.deepEqual(await inertStack(), { root: true, overlays: [false] });

    await page
      .getByRole("dialog", { name: "Arkusz testowy" })
      .getByRole("button", { name: "Zamknij", exact: true })
      .click();
    await page.getByRole("dialog", { name: "Arkusz testowy" }).waitFor({ state: "detached" });
    assert.deepEqual(await inertStack(), { root: false, overlays: [] });
  } finally {
    await context.close();
  }
});

test("TRUST-03: BottomSheet zachowuje pozycję strony przy każdym sposobie zamknięcia", async (t) => {
  const widths = [320, 375, 393];
  const cases: Array<[string, (page: Page) => Promise<void>]> = [
    ["X", async (page) => page.getByRole("button", { name: "Zamknij", exact: true }).click()],
    ["overlay", async (page) => page.locator("div[aria-hidden]").click({ position: { x: 8, y: 8 } })],
    ["Escape", async (page) => page.keyboard.press("Escape")],
    ["swipe", async (page) => {
      const handle = page.getByRole("button", { name: "Przeciągnij w dół, aby zamknąć" });
      const box = await handle.boundingBox();
      assert.ok(box, "brak uchwytu gestu");
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 100, { steps: 4 });
      await page.mouse.up();
    }],
    ["akcja wewnętrzna", async (page) => page.getByRole("button", { name: "Zamknij akcją" }).click()],
  ];

  for (const width of widths) {
    for (const [name, closeSheet] of cases) {
      await t.test(`${width}px / ${name}`, async () => {
        const { context, page, scrollY } = await bottomSheetPage({ width, height: 780 });
        try {
          await closeSheet(page);
          await page.getByRole("dialog", { name: "Arkusz testowy" }).waitFor({ state: "detached" });
          await expectRestoredScroll(page, scrollY);
          await assert.doesNotReject(() => page.getByRole("button", { name: "Otwórz arkusz" }).evaluate((element) => {
            if (document.activeElement !== element) throw new Error("fokus nie wrócił na trigger");
          }));
        } finally {
          await context.close();
        }
      });
    }
  }
});

/**
 * B2 (audyt 2026-07-31 §1 P1): arkusz deklarował `aria-modal="true"`, ale tło
 * zostawało dostępne — Tab wychodził z arkusza w listę pod spodem, również na
 * potwierdzeniach usuwania. `CLAUDE.md` §overlaye wymaga tego wprost.
 *
 * Test jedzie na PRAWDZIWYM `BottomSheet` w Chromium, bo obie rzeczy, które tu
 * sprawdzamy (`inert` i kolejność Tab), w jsdomie po prostu nie istnieją.
 */
test("B2: BottomSheet zamyka fokus w arkuszu i wyłącza tło", async (t) => {
  const inDialog = (page: Page) =>
    page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return !!dialog && !!document.activeElement && dialog.contains(document.activeElement);
    });
  const rootInert = (page: Page) =>
    page.evaluate(() => document.getElementById("root")?.inert === true);

  await t.test("tło jest `inert`, a Tab i Shift+Tab krążą w arkuszu", async () => {
    const { context, page } = await bottomSheetPage({ width: 375, height: 780 });
    try {
      assert.ok(await rootInert(page), "tło nie zostało wyłączone przez `inert`");

      // 12 kroków to więcej niż fokusowalnych elementów w arkuszu — pętla musi
      // się domknąć, a nie wypaść na <body> albo na przycisk pod spodem.
      for (let i = 1; i <= 12; i++) {
        await page.keyboard.press("Tab");
        assert.ok(await inDialog(page), `fokus wyszedł poza arkusz po ${i} × Tab`);
      }
      for (let i = 1; i <= 12; i++) {
        await page.keyboard.press("Shift+Tab");
        assert.ok(await inDialog(page), `fokus wyszedł poza arkusz po ${i} × Shift+Tab`);
      }
    } finally {
      await context.close();
    }
  });

  await t.test("zamknięcie przywraca tło", async () => {
    const { context, page } = await bottomSheetPage({ width: 375, height: 780 });
    try {
      await page.keyboard.press("Escape");
      await page.getByRole("dialog", { name: "Arkusz testowy" }).waitFor({ state: "detached" });
      assert.equal(await rootInert(page), false, "tło zostało wyłączone na stałe");
    } finally {
      await context.close();
    }
  });
});
