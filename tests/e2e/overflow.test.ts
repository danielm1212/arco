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
import { chromium, type Browser } from "@playwright/test";
import {
  LOGGER_STICKY_HEADER_SAFE_AREA,
  STICKY_HEADER_SAFE_AREA,
} from "../../components/navigation/stickyHeader";

const ROOT = process.cwd();
const CSS_DIR = join(ROOT, ".next/static/css");
const VIEWPORT = { width: 360, height: 780 }; // wąski Android/iPhone
const SAFE_AREA = "47px"; // wymuszona wartość notcha (headless zwraca 0)

let cssCache: string | null = null;
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

// Worst-case treść z realnej bazy (najdłuższe nazwy/notatki).
const LONG_SUBTITLE = "Początkujący–średniozaawansowany · Dom z hantlami · Pośladki i nogi";
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

test("logger: safe-area nie odkłada nagłówka drugi raz", async () => {
  // Logger jest wewnątrz globalnego `body pt-safe`. Tło ma zaczynać się od górnej
  // krawędzi, ale jego treść nadal musi zostać pod notch/status barem.
  const body = `<header class="${LOGGER_STICKY_HEADER_SAFE_AREA} relative bg-background px-md pb-sm">
    <div data-header-content class="h-11">Własny trening</div>
  </header>`;
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  try {
    const p = await ctx.newPage();
    await p.setContent(
      pageHtml(body).replace("body{margin:0}", "body{margin:0;padding-top:var(--safe-area-top)}"),
      { waitUntil: "load" },
    );
    const positions = await p.evaluate(() => {
      const header = document.querySelector("header")!.getBoundingClientRect();
      const content = document.querySelector("[data-header-content]")!.getBoundingClientRect();
      return { headerTop: header.top, contentTop: content.top };
    });
    assert.equal(positions.headerTop, 0, "nagłówek Loggera zostawia pusty pas nad sobą");
    assert.ok(positions.contentTop >= 47, "treść Loggera weszła pod status bar");
  } finally {
    await ctx.close();
  }
});
