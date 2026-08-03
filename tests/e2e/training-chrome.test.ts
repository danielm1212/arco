/**
 * E1: cztery podwidoki przestrzeni Trening renderują ten sam prawdziwy chrome.
 * Test montuje komponent produkcyjny, nie kopię markupu.
 * Wymaga wcześniejszego `npm run build` ze względu na skompilowany CSS.
 */
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { build } from "esbuild";
import { chromium, type Browser } from "@playwright/test";

const ROOT = process.cwd();
const CSS_DIR = join(ROOT, ".next/static/css");
const ROUTES = [
  { active: "plans", title: "Plany" },
  { active: "progress", title: "Postępy" },
  { active: "body", title: "Ciało" },
  { active: "history", title: "Historia" },
] as const;

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
    files = readdirSync(CSS_DIR).filter((file) => file.endsWith(".css"));
  } catch {
    throw new Error(`Brak ${CSS_DIR} — uruchom najpierw \`npm run build\`.`);
  }
  assert.ok(files.length > 0, `Brak plików CSS w ${CSS_DIR}`);
  cssCache = files.map((file) => readFileSync(join(CSS_DIR, file), "utf8")).join("\n");
  return cssCache;
}

async function chromeBundle(): Promise<string> {
  if (bundleCache !== null) return bundleCache;
  const result = await build({
    bundle: true,
    format: "iife",
    platform: "browser",
    write: false,
    absWorkingDir: ROOT,
    alias: {
      "next/link": join(ROOT, "tests/e2e/stubs/next-link.tsx"),
      "next/navigation": join(ROOT, "tests/e2e/stubs/next-navigation.ts"),
    },
    stdin: {
      loader: "tsx",
      resolveDir: ROOT,
      sourcefile: "training-route-header-harness.tsx",
      contents: `
        import React from "react";
        import { createRoot } from "react-dom/client";
        import { DirtyGuardProvider } from "./components/navigation/DirtyGuard";
        import { NavigationHistoryProvider } from "./components/navigation/NavigationHistory";
        import { TrainingRouteHeader } from "./components/navigation/TrainingRouteHeader";

        const route = window.__trainingRoute;
        createRoot(document.getElementById("root")).render(
          <DirtyGuardProvider>
            <NavigationHistoryProvider>
              <div className="mx-auto max-w-md">
                <TrainingRouteHeader active={route.active} title={route.title} />
              </div>
            </NavigationHistoryProvider>
          </DirtyGuardProvider>,
        );
      `,
    },
  });
  bundleCache = result.outputFiles[0]?.text ?? null;
  assert.ok(bundleCache, "esbuild nie zwrócił bundla wspólnego chrome");
  return bundleCache;
}

for (const route of ROUTES) {
  test(`E1: ${route.title} używa wspólnego lekkiego nagłówka`, async () => {
    const context = await browser.newContext({ viewport: { width: 320, height: 780 } });
    try {
      const page = await context.newPage();
      await page.setContent(
        `<!doctype html><html><head><meta charset="utf-8"><style>${builtCss()}</style></head>` +
          `<body class="bg-background text-foreground"><div id="root"></div></body></html>`,
        { waitUntil: "load" },
      );
      await page.evaluate((value) => {
        (window as unknown as { __trainingRoute: typeof value }).__trainingRoute = value;
      }, route);
      await page.addScriptTag({ content: await chromeBundle() });

      await page.getByRole("heading", { level: 1, name: route.title }).waitFor();
      assert.equal(await page.getByRole("heading", { level: 1 }).count(), 1);
      assert.equal(await page.getByRole("navigation", { name: "Sekcje treningu" }).count(), 1);
      assert.equal(await page.getByRole("link").count(), 4);
      assert.equal(
        await page.getByRole("link", { name: route.title }).getAttribute("aria-current"),
        "page",
      );
      assert.equal(await page.getByRole("link", { name: "Profil i ustawienia" }).count(), 0);
      assert.equal(await page.getByAltText("Arco").count(), 0);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      assert.ok(overflow <= 1, `${route.title}: poziomy overflow ${overflow}px przy 320 px`);
    } finally {
      await context.close();
    }
  });
}
