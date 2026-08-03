/**
 * F1/F2: prawdziwe kontrolki startu dnia i ulubionego planu na 320 px.
 * Akcje serwerowe są stubowane; dialog, fokus i markup są produkcyjne.
 */
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { build } from "esbuild";
import { chromium, type Browser } from "@playwright/test";

const ROOT = process.cwd();
const CSS_DIR = join(ROOT, ".next/static/css");
const ACTION_STUB = join(ROOT, "tests/e2e/stubs/program-actions.ts");

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
  const files = readdirSync(CSS_DIR).filter((file) => file.endsWith(".css"));
  assert.ok(files.length > 0, `Brak plików CSS w ${CSS_DIR}`);
  cssCache = files.map((file) => readFileSync(join(CSS_DIR, file), "utf8")).join("\n");
  return cssCache;
}

async function actionsBundle(): Promise<string> {
  if (bundleCache !== null) return bundleCache;
  const result = await build({
    bundle: true,
    format: "iife",
    platform: "browser",
    write: false,
    absWorkingDir: ROOT,
    alias: {
      "@/app/actions/program": ACTION_STUB,
      "@/app/actions/session": ACTION_STUB,
    },
    stdin: {
      loader: "tsx",
      resolveDir: ROOT,
      sourcefile: "program-plan-actions-harness.tsx",
      contents: `
        import React from "react";
        import { createRoot } from "react-dom/client";
        import { Toaster } from "sonner";
        import { FavoriteProgramButton } from "./app/programs/FavoriteProgramButton";
        import { ProgramDayStartButton } from "./app/programs/ProgramDayStartButton";

        createRoot(document.getElementById("root")).render(
          <>
            <main className="mx-auto max-w-md space-y-md p-md">
              <FavoriteProgramButton
                programId="program-1"
                programName="Pośladki i nogi — średniozaawansowany"
                isFavorite={false}
              />
              <FavoriteProgramButton
                programId="program-2"
                programName="Plan już ulubiony"
                isFavorite
              />
              <div data-with-active-plan>
                <ProgramDayStartButton
                  dayId="day-2"
                  dayLabel="Dzień B — plecy i tylna taśma"
                  programName="Pośladki i nogi — średniozaawansowany"
                  alongsideActivePlan
                />
              </div>
              <div data-without-active-plan>
                <ProgramDayStartButton
                  dayId="day-3"
                  dayLabel="Pierwszy trening"
                  programName="Plan startowy"
                  alongsideActivePlan={false}
                />
              </div>
            </main>
            <Toaster position="top-center" richColors closeButton />
          </>,
        );
      `,
    },
  });
  bundleCache = result.outputFiles[0]?.text ?? null;
  assert.ok(bundleCache, "esbuild nie zwrócił bundla akcji planu");
  return bundleCache;
}

test("F1/F2: kontrolki mają poprawne nazwy, targety i dialog bez overflow", async () => {
  const context = await browser.newContext({ viewport: { width: 320, height: 780 } });
  try {
    const page = await context.newPage();
    await page.setContent(
      `<!doctype html><html><head><meta charset="utf-8"><style>${builtCss()}</style></head>` +
        `<body class="bg-background text-foreground"><div id="root"></div></body></html>`,
      { waitUntil: "load" },
    );
    await page.addScriptTag({ content: await actionsBundle() });

    const favorite = page.getByRole("button", {
      name: "Dodaj plan „Pośladki i nogi — średniozaawansowany” do ulubionych",
    });
    await favorite.waitFor();
    assert.equal(await favorite.getAttribute("aria-pressed"), "false");
    const favoriteBox = await favorite.boundingBox();
    assert.ok(favoriteBox && favoriteBox.width >= 44 && favoriteBox.height >= 44);
    await page.evaluate(() => {
      (window as unknown as { __favoriteProgramActionDelay?: boolean })
        .__favoriteProgramActionDelay = true;
    });
    await favorite.click();
    const pendingFavorite = page.getByRole("button", {
      name: "Zapisuję ulubiony plan „Pośladki i nogi — średniozaawansowany”",
    });
    await pendingFavorite.waitFor();
    assert.equal(await pendingFavorite.isDisabled(), true);
    assert.equal(await pendingFavorite.getAttribute("aria-busy"), "true");
    await page.evaluate(() => {
      (window as unknown as { __resolveFavoriteProgramAction?: () => void })
        .__resolveFavoriteProgramAction?.();
    });
    await page.waitForFunction(
      () =>
        (window as unknown as { __favoriteProgramAction?: { favorite: boolean } })
          .__favoriteProgramAction?.favorite === true,
    );
    const successToast = page.getByText("Dodano do ulubionych.", { exact: true });
    await successToast.waitFor();
    assert.equal(await successToast.locator("xpath=ancestor::*[@data-sonner-toast]").count(), 1);
    const notificationRegion = page.locator('section[aria-label="Notifications alt+T"]');
    assert.equal(await notificationRegion.getAttribute("aria-live"), "polite");
    await favorite.waitFor();
    assert.equal(await favorite.isEnabled(), true);
    await page.waitForFunction(
      () => document.activeElement?.getAttribute("data-program-favorite-id") === "program-1",
    );

    await page.evaluate(() => {
      const testWindow = window as unknown as {
        __favoriteProgramActionDelay?: boolean;
        __favoriteProgramActionShouldFail?: boolean;
      };
      testWindow.__favoriteProgramActionDelay = false;
      testWindow.__favoriteProgramActionShouldFail = true;
    });
    await favorite.click();
    await page
      .getByText("Nie udało się zmienić ulubionych. Spróbuj ponownie.", { exact: true })
      .waitFor();
    assert.equal(await favorite.isEnabled(), true);
    await page.locator("[data-sonner-toast] [data-close-button]").evaluateAll((buttons) => {
      buttons.forEach((button) => (button as HTMLButtonElement).click());
    });
    await page.waitForFunction(
      () => document.querySelectorAll("[data-sonner-toast]:not([data-removed='true'])").length === 0,
    );

    await page.evaluate(() => {
      (window as unknown as { __favoriteProgramActionShouldFail?: boolean })
        .__favoriteProgramActionShouldFail = false;
    });
    const removeFavorite = page.getByRole("button", {
      name: "Usuń plan „Plan już ulubiony” z ulubionych",
    });
    await removeFavorite.click();
    await page.waitForFunction(
      () => {
        const action = (
          window as unknown as {
            __favoriteProgramAction?: { programId: string; favorite: boolean };
          }
        ).__favoriteProgramAction;
        return action?.programId === "program-2" && action.favorite === false;
      },
    );
    await page.getByText("Usunięto z ulubionych.", { exact: true }).waitFor();
    await page.locator("[data-sonner-toast] [data-close-button]").click();
    await page.waitForFunction(
      () => document.querySelectorAll("[data-sonner-toast]:not([data-removed='true'])").length === 0,
    );

    const trigger = page
      .locator("[data-with-active-plan]")
      .getByRole("button", { name: "Zacznij ten trening" });
    const triggerBox = await trigger.boundingBox();
    assert.ok(triggerBox && triggerBox.height >= 44);
    await trigger.click();

    const dialog = page.getByRole("dialog", {
      name: "Zacząć „Dzień B — plecy i tylna taśma”?",
    });
    await dialog.waitFor();
    assert.equal(
      await page.getByText("Twój aktywny plan i jego rotacja zostają bez zmian.").count(),
      1,
    );
    assert.equal(
      await page.getByText("nie utworzymy drugiej sesji", { exact: false }).count(),
      1,
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
      0,
    );

    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "detached" });
    await page.waitForFunction(
      () => document.activeElement?.textContent?.includes("Zacznij ten trening") === true,
    );

    await trigger.click();
    await page.getByRole("button", { name: "Zacznij", exact: true }).click();
    await page.waitForFunction(
      () => (window as unknown as { __startedProgramDay?: string }).__startedProgramDay === "day-2",
    );
    await page.keyboard.press("Escape");

    await page
      .locator("[data-without-active-plan]")
      .getByRole("button", { name: "Zacznij ten trening" })
      .click();
    await page.getByRole("dialog", { name: "Zacząć „Pierwszy trening”?" }).waitFor();
    assert.equal(
      await page.getByText("Twój aktywny plan i jego rotacja zostają bez zmian.").count(),
      0,
    );
  } finally {
    await context.close();
  }
});
