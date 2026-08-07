/**
 * HOME-05b: regresja języka symboli passy i tygodnia na PRAWDZIWYCH komponentach.
 *
 * Dlaczego ten plik istnieje (dług PLAN-05I, pierwsza rata): cztery paczki z rzędu
 * weryfikowano ręcznie klonowanym harnessem, który odwzorowywał komponenty w pliku
 * scratch. Kopia rozjeżdża się z komponentem po pierwszej zmianie i wtedy
 * weryfikacja nic nie znaczy. Tu montujemy `StreakBadge`, `WeekCard` i
 * `MonthCalendar` przez esbuild + `createRoot` na SKOMPILOWANYM CSS-ie buildu —
 * dokładnie ten mechanizm, który `overflow.test.ts` ma dla `SetRow`/`BottomSheet`.
 *
 * Co jest tu naprawdę pilnowane:
 * 1. Header na 320 px nie przelewa się i badge trzyma 44×44 (logo + passa + awatar).
 * 2. Dzień zaliczony wygląda IDENTYCZNIE w karcie na home i w sheecie — to jest
 *    ten defekt, który HOME-05 zostawiło (dwie kopie siatki, dwa języki).
 * 3. Kalendarz historii POKAZUJE numer dnia treningowego (zgłoszenie właściciela:
 *    „nie widać tam daty") i nie ma w komórkach płomienia.
 * 4. Gradient płomienia realnie się rozwiązuje (dwa różne kolory ze zmiennych),
 *    a przy `streak=0` płomień jest niewypełniony i bez liczby.
 *
 * Wymaga wcześniejszego `npm run build` (CSS z `.next/static/css`).
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { build } from "esbuild";
import { chromium, type Browser, type Page } from "@playwright/test";

const ROOT = process.cwd();
const CSS_DIR = join(ROOT, ".next/static/css");
const SAFE_AREA = "47px";

let browser: Browser;
let cssCache: string | null = null;
let bundleCache: string | null = null;

before(async () => {
  browser = await chromium.launch();
});
after(async () => {
  await browser?.close();
});

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

function pageHtml(theme: "light" | "dark"): string {
  return `<!doctype html><html class="${theme === "dark" ? "dark" : ""}"><head><meta charset="utf-8">
  <style>${builtCss()}</style>
  <style>:root{--safe-area-top:${SAFE_AREA}}body{margin:0}</style></head>
  <body class="bg-background text-foreground"><div id="root"></div></body></html>`;
}

/** Harness: header z passą + karta „Ten tydzień" + kalendarz historii.
 *  Długość passy wstrzykiwana przez `window.__harnessStreak` (nie query string:
 *  `setContent` renderuje na `about:blank`, gdzie `history.replaceState` leci na
 *  opaque origin), żeby jeden bundle obsłużył wariant z passą i bez. */
async function harnessBundle(): Promise<string> {
  if (bundleCache !== null) return bundleCache;

  const result = await build({
    bundle: true,
    format: "iife",
    platform: "browser",
    write: false,
    absWorkingDir: ROOT,
    // Komponenty headera są klienckie i importują `next/*`; poza App Routerem
    // prawdziwe hooki rzucają, więc podmieniamy je na stuby (patrz ./stubs).
    alias: {
      "next/link": join(ROOT, "tests/e2e/stubs/next-link.tsx"),
      "next/navigation": join(ROOT, "tests/e2e/stubs/next-navigation.ts"),
    },
    stdin: {
      loader: "tsx",
      resolveDir: ROOT,
      sourcefile: "home-05b-streak-harness.tsx",
      contents: `
        import React from "react";
        import { createRoot } from "react-dom/client";
        import { TrainingHeader } from "./components/TrainingHeader";
        import { StreakBadge } from "./components/StreakBadge";
        import { MonthCalendar } from "./components/MonthCalendar";
        import { WeekStrip } from "./components/WeekStrip";
        import { WeekCard } from "./app/WeekCard";
        import { localDayKey, weekStart, addWarsawDays, buildWeekDays } from "./lib/week";

        const streak = window.__harnessStreak ?? 4;
        const weeklyGoal = 4;

        // Prawdziwy generator dni (lib/week), nie ręczna tablica: poniedziałek i
        // środa zaliczone, dziś = czwartek tego tygodnia.
        const monday = weekStart(new Date());
        const doneKeys = new Set([
          localDayKey(new Date(addWarsawDays(monday, 0))),
          localDayKey(new Date(addWarsawDays(monday, 2))),
        ]);
        const todayKey = localDayKey(new Date(addWarsawDays(monday, 3)));
        const week = buildWeekDays(monday, doneKeys, todayKey);
        const weeklyDone = doneKeys.size;

        // Kalendarz otwiera się na BIEŻĄCYM miesiącu, więc jego fixture musi mieć
        // dni z tego miesiąca — nie z tego tygodnia. Pierwszego dnia miesiąca
        // poniedziałek wypada jeszcze w poprzednim i siatka nie pokazuje żadnego
        // dnia treningowego: test padał 2026-08-01, choć kod był bez zmian.
        // Dzień 5. i 12. istnieją w każdym miesiącu, więc fixture jest stabilny.
        const today = new Date();
        const inThisMonth = (dayOfMonth) =>
          localDayKey(new Date(today.getFullYear(), today.getMonth(), dayOfMonth));
        const calendarDays = [inThisMonth(5), inThisMonth(12)];

        function Harness() {
          return <div className="mx-auto flex max-w-md flex-col">
            {/* greeting + DŁUGIE imię celowo: belka Home pokazuje od 2026-08-07
                powitanie obok sygnetu, a to ono jako pierwsze walczy o miejsce
                przy 320 px. Bez tego propu asercje overflow niżej sprawdzałyby
                układ, którego Home już nie używa. Krótkie imię (Daniel)
                zmieściłoby się zawsze i test nie pilnowałby niczego.
                (Bez backticków — harness siedzi w template literalu.) */}
            <TrainingHeader
              greeting
              displayName={window.__harnessName ?? "Aleksandra-Katarzyna"}
              badgeSlot={<StreakBadge streak={streak} week={week} weeklyDone={weeklyDone} weeklyGoal={weeklyGoal} />}
            />
            <main className="space-y-lg p-md">
              <WeekCard week={week} weeklyDone={weeklyDone} weeklyGoal={weeklyGoal} />
              <WeekStrip week={week} label="Poprzedni tydzień" />
              <MonthCalendar trainingDays={calendarDays} streak={streak} />
            </main>
          </div>;
        }

        createRoot(document.getElementById("root")).render(<Harness />);
      `,
    },
  });

  bundleCache = result.outputFiles[0]?.text ?? null;
  assert.ok(bundleCache, "esbuild nie zwrócił bundla harnessu HOME-05b");
  return bundleCache;
}

async function harnessPage(
  width: number,
  opts: { theme?: "light" | "dark"; streak?: number } = {},
): Promise<{ context: Awaited<ReturnType<Browser["newContext"]>>; page: Page }> {
  const context = await browser.newContext({ viewport: { width, height: 780 } });
  const page = await context.newPage();
  await page.setContent(pageHtml(opts.theme ?? "light"), { waitUntil: "load" });
  if (opts.streak !== undefined) {
    await page.evaluate((s) => {
      (window as unknown as { __harnessStreak?: number }).__harnessStreak = s;
    }, opts.streak);
  }
  await page.addScriptTag({ content: await harnessBundle() });
  await page.getByRole("heading", { name: "Ten tydzień" }).waitFor();
  return { context, page };
}

const DAY_CIRCLE = 'ol[role="list"] li > span[aria-hidden]';

test("poprzedni tydzień nie udaje, że zna historyczny cel", async () => {
  const { context, page } = await harnessPage(375);
  try {
    await page.getByRole("list", { name: "Poprzedni tydzień: 2 treningi" }).waitFor();
    await page.getByRole("list", { name: "Ten tydzień: 2 z 4 treningów" }).first().waitFor();
    assert.equal(
      await page.getByRole("list", { name: /Poprzedni tydzień/ }).getAttribute("aria-label"),
      "Poprzedni tydzień: 2 treningi",
    );
  } finally {
    await context.close();
  }
});

for (const width of [320, 375, 393]) {
  test(`header z passą nie przelewa się i trzyma 44 px targetu (${width} px)`, async () => {
    const { context, page } = await harnessPage(width);
    try {
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      assert.ok(overflow <= 1, `poziomy overflow ${overflow}px przy ${width}px`);

      const badge = page.getByRole("button", { name: /^Passa: / });
      const box = await badge.boundingBox();
      assert.ok(box, "badge passy nie ma boxa");
      assert.ok(
        box!.height >= 44 && box!.width >= 44,
        `badge passy ${Math.round(box!.width)}×${Math.round(box!.height)} px — poniżej 44×44`,
      );

      // Badge i awatar nie mogą się nakładać ani wyjść za header.
      const avatar = page.getByRole("link", { name: "Profil i ustawienia" });
      const avatarBox = await avatar.boundingBox();
      assert.ok(avatarBox, "awatar nie ma boxa");
      assert.ok(
        box!.x + box!.width <= avatarBox!.x + 1,
        `badge nachodzi na awatar przy ${width}px`,
      );
      assert.ok(avatarBox!.x + avatarBox!.width <= width, `awatar wychodzi za ekran przy ${width}px`);
    } finally {
      await context.close();
    }
  });
}

/**
 * Sygnet w belce bierze barwę z TOKENÓW (`text-primary` / `dark:text-foreground`),
 * a nie z hexów wklejonych w plik. Sam typecheck ani build tego nie złapią: SVG
 * z `fill="#C63F21"` skompiluje się bez słowa skargi i będzie wyglądał poprawnie
 * w light, a w dark zostanie rdzawą plamą na ciemnym tle. Dlatego sprawdzamy
 * ZRENDEROWANY kolor w obu motywach.
 *
 * Wartości niżej to nasze tokeny po zaokrągleniu HSL→RGB (rust-500 i sand-100),
 * czyli o ≤2/255 na kanał obok hexów z eksportu z Figmy — cała aplikacja maluje
 * markę właśnie tak. Jeśli ten test padnie z kolorem BLIŻSZYM eksportowi, to znak,
 * że ktoś wpisał hex na sztywno; poprawką jest token, nie zmiana oczekiwania.
 */
for (const [theme, expected] of [
  ["light", "rgb(196, 63, 33)"],
  ["dark", "rgb(246, 243, 238)"],
] as const) {
  test(`sygnet w belce bierze kolor z tokenów marki (${theme})`, async () => {
    const { context, page } = await harnessPage(375, { theme });
    try {
      const marks = page.locator('header [aria-label="Arco"]');
      assert.equal(
        await marks.count(),
        1,
        "belka powinna mieć DOKŁADNIE jeden znak marki — dwa oznaczają powrót do pary <img> z `dark:hidden`",
      );
      const mark = marks.first();
      assert.equal(
        await mark.evaluate((el) => el.tagName.toLowerCase()),
        "svg",
        "znak marki przestał być inline SVG — kolor nie pójdzie już za motywem",
      );
      assert.equal(
        await mark.evaluate((el) => getComputedStyle(el).color),
        expected,
        `sygnet nie bierze koloru z tokenu w motywie ${theme}`,
      );
      // Żaden logotyp z `public/` nie może wrócić obok sygnetu.
      assert.equal(
        await page.locator('header img[src*="logo"]').count(),
        0,
        "w belce został plikowy logotyp — sygnet miał go zastąpić",
      );
    } finally {
      await context.close();
    }
  });
}

test("dzień zaliczony wygląda identycznie w karcie na home i w sheecie passy", async () => {
  const { context, page } = await harnessPage(375);
  try {
    const cardCircle = page.locator(`section[aria-label="Ten tydzień"] ${DAY_CIRCLE}`).first();
    const cardStyle = await cardCircle.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        background: s.backgroundColor,
        radius: s.borderTopLeftRadius === "50%" ? "50%" : s.borderTopLeftRadius,
        color: s.color,
        hasCheck: !!el.querySelector("svg"),
      };
    });

    await page.getByRole("button", { name: /^Passa: / }).click();
    await page.getByRole("dialog").waitFor();
    const sheetCircle = page.locator(`[role="dialog"] ${DAY_CIRCLE}`).first();
    const sheetStyle = await sheetCircle.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        background: s.backgroundColor,
        radius: s.borderTopLeftRadius === "50%" ? "50%" : s.borderTopLeftRadius,
        color: s.color,
        hasCheck: !!el.querySelector("svg"),
      };
    });

    // To jest guard defektu z HOME-05: dwie kopie siatki, dwa języki wizualne.
    assert.deepEqual(
      sheetStyle,
      cardStyle,
      "dzień zaliczony renderuje się inaczej w karcie i w sheecie — siatka znów ma dwie implementacje",
    );
    assert.ok(cardStyle.hasCheck, "zaliczony dzień powinien mieć check w kółku");
  } finally {
    await context.close();
  }
});

test("kalendarz historii pokazuje NUMER dnia treningowego i nie używa płomienia w komórkach", async () => {
  const { context, page } = await harnessPage(375);
  try {
    const calendar = page.locator("section", { has: page.getByLabel("poprzedni miesiąc") });
    const trained = calendar.locator("span.bg-primary");
    const count = await trained.count();
    assert.ok(count >= 1, "brak dnia treningowego w kalendarzu — fixture nie zadziałał");

    for (let i = 0; i < count; i++) {
      const text = ((await trained.nth(i).textContent()) ?? "").trim();
      assert.match(
        text,
        /^\d{1,2}/,
        `dzień treningowy w kalendarzu nie pokazuje numeru (textContent: "${text}")`,
      );
      const svgInside = await trained.nth(i).locator("svg").count();
      assert.equal(svgInside, 0, "komórka kalendarza nie powinna zawierać glifu (numer wystarcza)");
    }

    // Płomień żyje wyłącznie w linii passy pod siatką.
    const flamesInGrid = await calendar.locator("div.grid svg").count();
    assert.equal(flamesInGrid, 0, "w siatce kalendarza został glif — płomień oznacza tylko passę");
  } finally {
    await context.close();
  }
});

for (const theme of ["light", "dark"] as const) {
  test(`glif passy rozwiązuje gradient na dwa różne kolory (${theme})`, async () => {
    const { context, page } = await harnessPage(375, { theme });
    try {
      const stops = await page
        .locator("header svg linearGradient stop")
        .evaluateAll((els) => els.map((el) => getComputedStyle(el).stopColor));
      assert.equal(stops.length, 2, "płomień powinien mieć dwa stopnie gradientu");
      for (const c of stops) {
        assert.match(c, /^rgb/, `stop-color nie rozwiązał się do koloru: "${c}"`);
        assert.ok(!c.includes("rgba(0, 0, 0, 0)"), "stop-color wyszedł przezroczysty");
      }
      assert.notEqual(stops[0], stops[1], `oba stopnie mają ten sam kolor (${stops[0]}) — gradient jest płaski`);
    } finally {
      await context.close();
    }
  });
}

test("streak=0: płomień niewypełniony, bez liczby, bez „0 tyg.”", async () => {
  const { context, page } = await harnessPage(375, { streak: 0 });
  try {
    const badge = page.getByRole("button", { name: /Passa jeszcze nie zaczęta/ });
    await badge.waitFor();
    assert.equal((await badge.textContent())?.trim(), "", "badge bez passy nie powinien mieć etykiety");
    const fill = await badge.locator("svg").evaluate((el) => el.getAttribute("fill"));
    assert.equal(fill, "none", "płomień bez passy powinien być obrysem, nie wypełnieniem");
    const gradients = await badge.locator("linearGradient").count();
    assert.equal(gradients, 0, "wariant bez passy nie powinien rysować gradientu");

    const html = await page.content();
    assert.ok(!html.includes("0 tyg."), "nigdzie nie może pojawić się „0 tyg.” (framing przez stratę)");
  } finally {
    await context.close();
  }
});
