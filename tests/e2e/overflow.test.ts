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
import { STICKY_HEADER_SAFE_AREA } from "../../components/navigation/stickyHeader";

const ROOT = process.cwd();
const CSS_DIR = join(ROOT, ".next/static/css");
const VIEWPORT = { width: 360, height: 780 }; // wąski Android/iPhone
const SAFE_AREA = "47px"; // wymuszona wartość notcha (headless zwraca 0)

let cssCache: string | null = null;
let bottomSheetBundleCache: string | null = null;
let setRowBundleCache: string | null = null;
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
    const selected = await weight.evaluate(
      (el: HTMLInputElement) => el.value.slice(el.selectionStart ?? 0, el.selectionEnd ?? 0),
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
