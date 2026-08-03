/**
 * E3: test zachowania na prawdziwej karcie ćwiczenia. Zależności arkuszy i
 * wierszy serii są stubowane, bo nie należą do kontraktu tego scenariusza.
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
const DEPENDENCY_STUB = join(ROOT, "tests/e2e/stubs/exercise-card-dependencies.tsx");

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

async function exerciseCardBundle(): Promise<string> {
  if (bundleCache !== null) return bundleCache;
  const result = await build({
    bundle: true,
    format: "iife",
    platform: "browser",
    write: false,
    absWorkingDir: ROOT,
    alias: {
      "@/components/ExerciseInfoSheet": DEPENDENCY_STUB,
    },
    plugins: [
      {
        name: "exercise-card-dependencies",
        setup(esbuild) {
          esbuild.onResolve(
            { filter: /^\.\/(ExerciseCardMenu|SetRow|SwapPanel)$/ },
            () => ({ path: DEPENDENCY_STUB }),
          );
        },
      },
    ],
    stdin: {
      loader: "tsx",
      resolveDir: ROOT,
      sourcefile: "session-mode-card-harness.tsx",
      contents: `
        import React from "react";
        import { createRoot } from "react-dom/client";
        import { ExerciseCard } from "./app/session/[id]/ExerciseCard";

        const noop = () => {};
        const ex = {
          sessionExerciseId: "session-exercise-1",
          exerciseId: "Barbell_Bench_Press_-_Medium_Grip",
          name: "Wyciskanie sztangi leżąc",
          type: "weighted",
          equipment: "sztanga",
          category: "strength",
          mechanic: "compound",
          movementPattern: "push",
          slot: {
            default_exercise_id: "Barbell_Bench_Press_-_Medium_Grip",
            target_sets: 3,
            target_reps_min: 8,
            target_reps_max: 10,
            rest_seconds: 120,
            notes: null,
          },
          supersetGroup: null,
          notes: null,
          skipped: false,
          sets: [],
          previous: { weight: 80, reps: 8, duration_seconds: null, added_weight: null },
          previousSets: [{ reps: 8, duration_seconds: null }],
          repPRs: {},
        };
        const common = {
          ex,
          index: 0,
          sessionId: "session-1",
          unit: "kg",
          trainingPriority: "muscle_gain",
          restSeconds: 120,
          swapOpen: false,
          noteOpen: false,
          rpeOn: false,
          prSets: {},
          activeSetId: null,
          focusSetId: null,
          editedSetIds: {},
          exerciseSummaries: [{ id: ex.sessionExerciseId, name: ex.name, group: null }],
          onToggleSwap: noop,
          onCloseSwap: noop,
          onSkip: noop,
          onDeleteExercise: noop,
          onLinkPartner: noop,
          onUnlink: noop,
          onMove: noop,
          onAdjustRest: noop,
          onOpenNote: noop,
          onPersistNotes: noop,
          onAddSet: noop,
          onToggleRpe: noop,
          onToggleSet: noop,
          onActivateSet: noop,
          onSaveEditedSet: noop,
          onTimedComplete: noop,
          onPatchSet: noop,
          onPersistSet: noop,
          onDeleteSet: noop,
        };

        createRoot(document.getElementById("root")).render(
          <>
            <div data-mode="live"><ExerciseCard {...common} mode="live" /></div>
            <div data-mode="finished"><ExerciseCard {...common} mode="finished" /></div>
            <div data-mode="historical"><ExerciseCard {...common} mode="historical" /></div>
          </>,
        );
      `,
    },
  });
  bundleCache = result.outputFiles[0]?.text ?? null;
  assert.ok(bundleCache, "esbuild nie zwrócił bundla ExerciseCard");
  return bundleCache;
}

test("E3: historia ukrywa prowadzenie progresji bez regresji zwykłej edycji", async () => {
  const context = await browser.newContext({ viewport: { width: 320, height: 780 } });
  try {
    const page = await context.newPage();
    await page.setContent(
      `<!doctype html><html><head><meta charset="utf-8"><style>${builtCss()}</style></head>` +
        `<body class="bg-background text-foreground"><div id="root"></div></body></html>`,
      { waitUntil: "load" },
    );
    await page.addScriptTag({ content: await exerciseCardBundle() });

    const live = page.locator('[data-mode="live"]');
    const finished = page.locator('[data-mode="finished"]');
    const historical = page.locator('[data-mode="historical"]');
    await live.getByText("Prowadzenie progresji:").waitFor();
    assert.equal(await finished.getByText("Prowadzenie progresji:").count(), 1);
    assert.equal(await historical.getByText("Prowadzenie progresji:").count(), 0);
  } finally {
    await context.close();
  }
});
