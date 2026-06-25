# Plan: theme toggle + naprawy + funkcje

> Status: **A/B/C ZROBIONE** (`a84e37e` theme · `6dc6925` walidacja · `f1b2c4e` steppery). Zostaje **Faza D** (funkcje).
> Data: 2026-06-25. Kontekst: po redesignie „Athletic" (foundation · Home · huby · dark logger) i descope kalkulatora talerzy. Patrz `build-brief-v0.3-addendum.md`, `HANDOFF.md`, pamięć `arco-logger-next-steps`.

## Decyzje (zamknięte)
- **Motyw:** przełącznik **3-stan** (jasny / ciemny / system), **default ciemny**.
- **Mechanizm:** klasa `.dark` na `<html>` przez `next-themes`; zapis w `localStorage` (per urządzenie). Most shadcn w `.dark` już naprawiony (commit `95a44ed`) — fundament gotowy.
- **Logger:** zostaje **zawsze ciemny** (focus mode), niezależnie od wybranego motywu.

---

## Faza A — System motywu (główna) 🎯
**Cel:** jeden sterowalny motyw w całej apce; default ciemny; wybór zapisany; opcja „system".

**Kroki:**
1. Dodać `next-themes` `ThemeProvider` w `app/layout.tsx` (`attribute="class"`, `defaultTheme="dark"`, `enableSystem`, `disableTransitionOnChange`; `suppressHydrationWarning` na `<html>`).
2. **Usunąć** blok `@media (prefers-color-scheme: dark)` z `app/globals.css` — inaczej system nadpisałby wybór usera (sterowanie oddajemy wyłącznie klasie `.dark`; „system" obsługuje `next-themes`).
3. Przełącznik 3-stan w `app/settings/SettingsForm.tsx` (segmentowany: Jasny / Ciemny / System). Ew. szybki toggle w nagłówku — opcjonalnie.
4. Logger: zostaje wymuszony `.dark` (już jest, `app/session/[id]/page.tsx`) — niezależny od motywu apki.

**Ryzyko:** średnie — dark staje się pełnoprawnym, częstym motywem. **Trzeba przejść WSZYSTKIE ekrany w obu motywach** (Home, huby, detale, login, onboarding, logger) i dopiąć kontrasty: m.in. zweryfikować pigułki `Button` secondary na ciemnym i feedback (`text-warning`/`text-success` na `*/10`).
**Weryfikacja (Preview):** każdy ekran light + dark; przełączenie działa; brak FOUC; wybór trzyma się po reloadzie. **Uwaga procesowa:** zatrzymać serwer Preview przed każdym `npm run build` (równoległy build na tym samym `.next` zacina się — patrz HANDOFF).

## Faza B — Walidacja inputów (bug klasy „2222 kg") 🐛
**Cel:** koniec absurdalnych wartości; spójne limity.
**Kroki:** wspólny helper `clampNum(value, {min,max})` w `lib/format.ts`; atrybuty `min`/`max` na `Input`. Limity: ciężar ≤ 1000 kg / ≤ 2000 lbs, powt. ≤ 999, RPE 0–10 (krok 0.5), czas ≤ 86400 s, waga ciała sensowny zakres, rest ≤ 3600 s.
**Pliki:** `lib/format.ts`, `app/session/[id]/SetRow.tsx`, `app/body/BodyForm.tsx`, `app/settings/SettingsForm.tsx`.
**Ryzyko:** niskie. **Weryfikacja:** wpisanie 99999/2222 → zacisk do limitu.

## Faza C — Logger: odchudzenie stepperów ✨ (drobne)
**Cel:** mniejszy footprint ± (dokończenie wątku UX pól serii).
**Jak:** zwęzić/uprościć przyciski ± (lub pokazywać przy aktywnym polu); wartość pozostaje dominująca.
**Pliki:** `app/session/[id]/SetRow.tsx`. **Ryzyko:** niskie (wizualne, Preview).

> Kolejność A → B → C jako jeden ciąg „naprawcze + theme".

## Faza D — Funkcje produktowe (osobno, po kolei) 🚀
1. **„Last set" inline per wiersz** — wartość z ostatniej sesji per seria („60×8 →", tap = kopiuj) zamiast placeholdera. `SetRow`/`Logger`. Wyróżnik Strong/Hevy.
2. **Kalendarz / passa** — widok miesiąca z dniami treningowymi + streak. Nowy komponent + `/progress` lub `/history`. Dane są (`sessions`).
3. **Heatmapa-sylwetka** — SVG ciała kolorowane wg serii-na-partię (mamy `sets-per-muscle`). Największa, osobna faza. Nowy `MuscleHeatmap` + `/progress`.

**Walidacja końcowa (po D):** test z 3–5 osobami wg `usability-audit.md` sekcja C.

---

## Czego ten plan NIE robi
- Nie rusza out-of-scope z briefu (social, AI auto-programming, makro, wearables, natyw, monetyzacja).
- Nie przywraca kalkulatora talerzy (świadomy descope, `02fa08e`).
