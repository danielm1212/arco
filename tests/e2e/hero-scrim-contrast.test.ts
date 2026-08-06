/**
 * Guard: scrim hero na Home trzyma WCAG AA nad KAŻDĄ okładką programu.
 *
 * Powód istnienia: pierwsza wersja scrimu (gradient 92%→55%, „na dole tekst,
 * u góry niech zdjęcie oddycha") wywaliła 14 z 15 okładek — bo w tym układzie
 * tekst jest również na górze, a padał `text-muted`, nie tekst główny. Oko tego
 * nie łapie: 3,1:1 od 4,6:1 na miniaturze nie odróżnisz.
 *
 * Test jest tu, a nie w `tests/*.test.ts`, bo dekodowanie PNG wymaga przeglądarki.
 *
 * Wywali się w dwóch sytuacjach, obu pożądanych:
 *   1. ktoś rozjaśni scrim w `app/page.tsx`,
 *   2. ktoś doda okładkę jaśniejszą niż wszystkie dotychczasowe.
 */
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Browser } from "@playwright/test";

const ROOT = process.cwd();
const COVERS = join(ROOT, "public/program-covers");

/** `.dark` → `--background` = `--arco-ink-850` = hsl(260 6% 10%). */
const SCRIM = [25, 24, 27];
/** `.dark` → `--color-text` (sand-100) i `--color-text-muted` (sand-350). */
const TEXT = { name: "text", rgb: [246, 243, 238] };
const MUTED = { name: "text-muted", rgb: [189, 184, 178] };

const CARD = { w: 358, h: 273 };

let browser: Browser | undefined;
before(async () => {
  browser = await chromium.launch();
});
after(async () => {
  await browser?.close();
});

/**
 * Krycie scrimu W MIEJSCU TEKSTU, odczytane wprost z `app/page.tsx`.
 *
 * Po przejściu na układ „zdjęcie jako pas" treść zeszła z okładki — na fotografii
 * zostały tylko etykieta (u góry) i pigułki dni (u dołu), każde pod własnym
 * gradientem gasnącym ku środkowi kadru. Liczy się więc przystanek `from-*`, bo
 * to on wypada przy krawędzi, gdzie te elementy siedzą; `via`/`to` opisują już
 * czysty środek zdjęcia, gdzie nie ma czego chronić.
 */
function weakestScrimAlpha(): number {
  const css = readFileSync(join(ROOT, "app", "globals.css"), "utf8");
  const alphas: number[] = [];
  for (const name of ["--media-scrim-top", "--media-scrim-bottom"]) {
    const start = css.indexOf(name);
    assert.ok(start > -1, `nie znalazłem tokenu ${name} w app/globals.css`);
    const block = css.slice(start, css.indexOf(";", start));
    // Interesuje nas przystanek PRZY KRAWĘDZI (0%) — tam siedzą etykieta i pigułki.
    const first = block.match(/hsl\([^)]*\/\s*([\d.]+)\)\s*0%/);
    assert.ok(first, `${name} nie ma przystanku 0% z kryciem`);
    alphas.push(Number(first[1]));
  }
  return Math.min(...alphas);
}

function relLuminance([r, g, b]: number[]): number {
  const f = (v: number) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a: number[], b: number[]): number {
  const [hi, lo] = [relLuminance(a), relLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Najjaśniejszy piksel okładki po przeskalowaniu jak `object-cover`. */
const brightestPixelScript = (dataUrl: string) => `new Promise((resolve) => {
  const W = ${CARD.w}, H = ${CARD.h};
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    const scale = Math.max(W / img.width, H / img.height);
    const w = img.width * scale, h = img.height * scale;
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
    const d = ctx.getImageData(0, 0, W, H).data;
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    let best = null;
    for (let i = 0; i < d.length; i += 4) {
      const l = 0.2126 * f(d[i]) + 0.7152 * f(d[i + 1]) + 0.0722 * f(d[i + 2]);
      if (!best || l > best.l) best = { l, px: [d[i], d[i + 1], d[i + 2]] };
    }
    resolve(best.px);
  };
  img.onerror = () => resolve(null);
  img.src = ${JSON.stringify(dataUrl)};
})`;

test("scrim hero trzyma ≥4,5:1 dla obu barw tekstu nad każdą okładką", async () => {
  const alpha = weakestScrimAlpha();
  /* `.webp`, nie `.png`: seed zapisuje do bazy `/program-covers/<slug>.webp`
     (scripts/seed.ts), więc to ten format realnie ląduje w karcie. Katalog trzyma
     obok siebie oba plus drafty i arkusz kontaktowy — mierzenie `.png` mierzyłoby
     pliki, których produkcja nie serwuje. */
  const files = readdirSync(COVERS).filter((f) => f.endsWith(".webp"));
  assert.ok(files.length > 0, `brak okładek w ${COVERS}`);

  const page = await browser!.newPage();
  await page.setContent("<html><body></body></html>");

  const failures: string[] = [];
  for (const file of files) {
    const dataUrl = `data:image/webp;base64,${readFileSync(join(COVERS, file)).toString("base64")}`;
    const px = (await page.evaluate(brightestPixelScript(dataUrl))) as number[] | null;
    assert.ok(px, `nie udało się wczytać okładki ${file}`);

    // Kompozycja scrimu nad najjaśniejszym pikselem = najgorszy przypadek karty.
    const composite = px.map((v, i) => v * (1 - alpha) + SCRIM[i] * alpha);
    for (const role of [TEXT, MUTED]) {
      const ratio = contrast(role.rgb, composite);
      if (ratio < 4.5) {
        failures.push(`${file} · ${role.name} = ${ratio.toFixed(2)}:1`);
      }
    }
  }
  await page.close();

  assert.deepEqual(
    failures,
    [],
    `Scrim (najsłabsze krycie ${(alpha * 100).toFixed(0)}%) nie trzyma AA nad:\n  ` +
      failures.join("\n  ") +
      `\nAlbo przyciemnij scrim w app/page.tsx, albo zdejmij tekst ze zdjęcia.`,
  );
});
