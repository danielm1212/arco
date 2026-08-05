import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { Button } from "@/components/ui/button";
import { Card, cardVariants } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

/**
 * Kontrakt prymitywów `components/ui/*` — pierwsze testy w repo, które faktycznie
 * RENDERUJĄ komponent (audyt komponentów 2026-08-04, M4).
 *
 * Do audytu wszystkie 46 plików testowych badało logikę i tokeny; ani jeden nie
 * montował komponentu. Warstwa danych była więc pilnowana bardzo dobrze, a warstwa,
 * której dotyka każda zmiana UI — wcale.
 *
 * Renderujemy przez `react-dom/server`, bez Testing Library i bez jsdom: to
 * komponenty bezstanowe, więc statyczny markup wystarcza, a repo świadomie nie
 * dokłada zależności na to, co robi standard (ta sama zasada, przez którą nie ma
 * tu framer-motion). Interakcje żyją w `tests/e2e/` na Playwrighcie.
 *
 * Zakres jest celowo wąski: KONTRAKT, nie wygląd. Testujemy te własności, których
 * złamanie jest ciche — stan przekazany czytnikowi ekranu, próg dotyku, wykluczanie
 * się tła z gradientową krawędzią. Nie testujemy wartości cieni ani odstępów; od
 * tego jest kanon i przegląd, a test na każdą klasę zamarłby przy pierwszym
 * przemalowaniu.
 */

const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);

// ── Button ────────────────────────────────────────────────────────────────────

test("Button: `pending` ogłasza zajętość ORAZ blokuje przycisk", () => {
  const markup = html(h(Button, { pending: true }, "Zapisz"));
  assert.match(markup, /aria-busy="true"/, "brak aria-busy — czytnik nie wie, że trwa");
  assert.match(markup, /disabled/, "pending musi blokować, inaczej akcja pójdzie dwa razy");
  assert.match(markup, /Zapisz/, "treść przycisku nie może zniknąć pod spinnerem");
});

test("Button: `disabled` bez `pending` NIE ogłasza zajętości", () => {
  // Rozróżnienie jest całym sensem propu: „niedostępny" i „zajęty" to dla czytnika
  // dwa różne komunikaty, a przed tą zmianą wszystko było tylko `disabled`.
  const markup = html(h(Button, { disabled: true }, "Zapisz"));
  assert.match(markup, /disabled/);
  assert.doesNotMatch(markup, /aria-busy/);
});

test("Button: wariant `sm` trzyma próg dotyku 44 px", () => {
  // Checklist wytycznych §3.2. Wariant miał `h-9` (36 px), a konsumenci łatali to
  // ręcznie `min-h-11` w 4 z 14 wywołań — czyli niespójnie.
  const markup = html(h(Button, { size: "sm" }, "Dzięki"));
  assert.match(markup, /min-h-11/);
  assert.doesNotMatch(markup, /\bh-9\b/, "sztywne h-9 wraca poniżej progu dotyku");
});

test("Button: `asChild` nie wstrzykuje spinnera (Slot przyjmuje jedno dziecko)", () => {
  const markup = html(
    h(Button, { asChild: true, pending: true }, h("a", { href: "/programs" }, "Programy")),
  );
  assert.match(markup, /<a[^>]*href="\/programs"/, "asChild musi oddać własny tag");
  assert.match(markup, /aria-busy="true"/, "sam stan ma się przenieść mimo braku spinnera");
});

// ── Card ──────────────────────────────────────────────────────────────────────

test("Card: `polished` wyklucza się z `bg-card`", () => {
  // Kolizja, nie redundancja: `.surface-polished` maluje powierzchnię gradientem
  // `padding-box`, a utility `bg-card` wygrywa warstwą i skasowałoby całą krawędź.
  const polished = cardVariants({ polished: true });
  assert.match(polished, /surface-polished/);
  assert.doesNotMatch(polished, /\bbg-card\b/);

  const plain = cardVariants();
  assert.match(plain, /\bbg-card\b/);
  assert.doesNotMatch(plain, /surface-polished/);
});

test("Card: `polished` paruje się z elewacją E1 (kanon §9/§10)", () => {
  // Hero na Home to jedyne miejsce już na kanonie — po refaktorze ma wyglądać
  // identycznie, więc `polished` + domyślne `subtle` musi dać E1, nie legacy shadow-sm.
  const markup = cardVariants({ polished: true, padding: "none" });
  assert.match(markup, /shadow-e1/);
  assert.doesNotMatch(markup, /shadow-sm/);
});

test("Card: żaden wariant nie sięga po `shadow-lg` (magic value spoza tokenów)", () => {
  // `tailwind.config.ts` nie definiuje `lg` — taka klasa spada na stockowy cień
  // Tailwinda, poza paletą i poza dark-modem.
  for (const elevation of ["none", "subtle", "floating", "overlay"] as const) {
    assert.doesNotMatch(cardVariants({ elevation }), /shadow-lg/, `elevation=${elevation}`);
  }
});

test("Card: `asChild` zachowuje tag semantyczny", () => {
  const markup = html(
    h(Card, { asChild: true }, h("section", { "aria-label": "Ten tydzień" }, "…")),
  );
  assert.match(markup, /<section[^>]*aria-label="Ten tydzień"/);
  assert.match(markup, /rounded-xl/, "klasy karty muszą trafić na podmieniony tag");
});

// ── Input ─────────────────────────────────────────────────────────────────────

test("Input: `aria-invalid` włącza wizualny stan błędu", () => {
  // Wiązanie stylu z atrybutem, a nie z osobnym propem, ma gwarantować, że czerwona
  // ramka i komunikat dla czytnika nie mogą się rozjechać.
  const markup = html(h(Input, { "aria-invalid": true }));
  assert.match(markup, /aria-invalid="true"/);
  assert.match(markup, /aria-\[invalid=true\]:border-danger/);
});

test("Input: domyślnie nie ogłasza błędu", () => {
  assert.doesNotMatch(html(h(Input, {})), /aria-invalid="true"/);
});
