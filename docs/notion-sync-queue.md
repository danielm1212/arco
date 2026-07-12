# Kolejka sync do Notion (NA ŻĄDANIE od 2026-07-05 — patrz CLAUDE.md)

> Domyślny tryb (od 2026-07-05): dopisuj tu operacje ZAWSZE, niezależnie od dostępności Notion MCP.
> Wypychaj do Notion TYLKO gdy Daniel poprosi („zsynchronizuj Notion") — wtedy flush całej listy → usuń wykonane → pusta sekcja „Oczekujące".
> Tablica: „ARCO — Baza pomysłów" (data source `e037aac8-6857-46b7-80ef-95d011d1816e`).

## Format wpisu

```
- [ ] UPDATE | tytuł wpisu w bazie | Etap→Do testu [Ty] | Notatka: <hash> — co zrobione, co przetestować
- [ ] CREATE | tytuł nowego wpisu | Priorytet | Kto wykonuje | Etap | Faza | Kategoria | Notatka
```

## Oczekujące

- [ ] CREATE | Kalibracja guidance na literaturze (progi potwierdzone + R1) | Wysoki | Claude | Refinement | — | Produkt | Notatka: 2026-07-11 — docs/kalibracja-guidance.md; staleness/deload/balans potwierdzone (Coleman 2024 RCT wspiera stagnation-triggered deload!), balans oznaczony jako heurystyka; R1 do decyzji [Ty]: copy progresji dla ciężarów <20 kg; kandydat volume-low po H2; mapa epistemiczna = treść pod „dlaczego" w Kroku 3.
- [ ] CREATE | Onboarding v3 WDROŻONY (moment Gambarino, outcome-first) | Wysoki | Claude | Do testu [Ty] | — | UX | Notatka: 2026-07-11 — WelcomeOverlay v3: E0 moment, 1 decyzja/ekran, cel wg poziomu, E5 karta planu + mikro-potwierdzenie, eventy wpięte, kg/lbs w E1; flaga arco-onboarded-v3; tsc ✓; do testu: pełny flow + skipy na świeżym koncie; H2 Z1 testuje to.

- [ ] CREATE | Audyt wizualny + mini-sprint „rymy" WYKONANY | Wysoki | Ty+Claude | Do testu [Ty] | — | UX | Notatka: 2026-07-11 — docs/audyt-wizualny.md; wdrożone W1+W2+W3+W5+W9: jeden glif ognia (FlameWeek+kalendarz historii), Gambarino na wszystkich liczbach-momentach, norma wag (0×font-bold) i radiusów (0×rounded-lg) w wytyczne-designu §2b, cichsza celebracja; tsc ✓; do testu: /history, /progress, /body, done, dark mode; commit [Ty]. Odłożone: W6 (ikony clay), W7 (login przy Kroku 2).
- [ ] CREATE | Landing ZBUDOWANY (landing/index.html) — do recenzji i foto | Wysoki | Ty+Claude | Do testu [Ty] | — | Marketing | Notatka: 2026-07-11 — diagnoza prototypu (D1–D7) → brief → budowa przez Claude: Gambarino, ziarno tylko na momentach, mockupy wierne redesignowi, placeholdery foto art-directed, founder+FAQ dopisane, A/B cen ?v=b, form pod ESP; do zrobienia [Ty]: przegląd w przeglądarce, foto (prompt w briefie), ESP+domena+deploy (osobny Vercel static); checklist QA w landing-brief-framer.md §4.
- [ ] CREATE | Onboarding v3: 6 ekranów, moment Gambarino, outcome-first | Wysoki | Ty+Claude | Refinement | — | UX | Notatka: 2026-07-11 — docs/onboarding-v3.md; audyt v2 (O1–O6) → v3 ≤60 s, 1 decyzja/ekran; E0 moment display-typo, E5 karta planu „Aktywuj" bez auto-startu; jednostki out (kg default); furtki: signup przed E0, pod-invite, trial-ekran; ~1,5 wieczora; czeka akcept [Ty]. + Review wdrożenia home+logger: 9/10.
- [ ] CREATE | Audyt UX loggera: karta ⋯, jedno „poprzednio", finish-sheet | Wysoki | Ty+Claude | Do testu [Ty] | — | UX | Notatka: 2026-07-11 — docs/audyt-loggera.md, sprint „logger polish" KOMPLETNY: R1+R2 (menu ⋯ per karta + ⋯ sesji, jedno „poprzednio") → R6a+R6b (przerwa świadoma supersetu + „Połącz w superset" kierunko-agnostyczne) → R7 (reorder ⋯ wyżej/niżej, grupa SS jako jednostka) → R3 (targety 44px) → R4 (finish-sheet) → R5 (copy/affordance). Commity: 0301394, 275e431, 416cb98, 6bfb98a, f696a1c, 441f261. Do testu w Z2 scenariusza H2.
- [ ] CREATE | Redesign home: FlameWeek + hero + guidance-chip | Wysoki | Ty+Claude | Do testu [Ty] | — | UX | Notatka: 2026-07-11 — docs/redesign-home.md, F1+F2 KOMPLETNE (e9596b5, 5550739): 7 bloków → 3 sekcje, hero V4 (biały kafel, jedyne rust-CTA), FlameWeek (day-pills → płomienie, ukryty do 1. treningu), GuidanceChip. Flaga [Ty]: pusty stan wariant A (§3.6, hero z konkretnym programem po onboardingu) NIE wdrożony — wymaga persystencji poziom/środowisko z WelcomeOverlay do user_settings, poza zakresem tej paczki; „Ułóż własny" pominięty (brak route'a). Do testu w Z0 scenariusza H2.

## Ostatni flush: 2026-07-10

Wykonane (17 CREATE + 13 UPDATE; uwagi mapujące kolejkę na realny stan tablicy):
- Dwa wpisy kolejki o S9-cz.2 (plan + kompletny) → scalone w JEDEN wpis „S9-cz.2: higiena kodu — KOMPLETNY" (Do testu [Ty]).
- „Plan landinga" — bez CREATE: zaktualizowany istniejący „Landing page we Framerze" → In Progress, Wysoki (plan + copy + prototyp HTML od Claude).
- „Wizja v2" — bez CREATE: istniejący „Wypracować wizję…" (In Progress) zamknięty jako Done z notą kanonu.
- „Programy zaktualizowane" — bez CREATE: zaktualizowany istniejący „Dodać treningi A i B…" (wdrożone na prod).
- „Kuracja bazy" — bez CREATE: zaktualizowany istniejący „Kuracja bazy ćwiczeń…" Refinement → Do testu [Ty] (wdrożone na prod).
- Kategorie inżynieryjne zmapowane na istniejące selecty (schemat tablicy NIE ruszany — ALTER SELECT ryzykowałby opcje/kolory).
- **Porządki („usuń niepotrzebne")** — zamknięte jako Done z adnotacją-dlaczego (nic nie skasowano twardo): „Deploy na Vercel…" (N1 done + kolejne deploye działają) · „Styl stalowych ikon 3D" (metalik odrzucony → clay) · „Font Athletics" (kierunek Athletic porzucony) · „PWA vs natywne" (rozstrzygnięte w wizji v2) · „Podzielić pracę na user flows" (zastąpione Krokami 0–5) · „Model monetyzacji" (rozstrzygnięty w wizji v2, zostaje A/B pricingu) · „Aktualizacja master promptów" (skonsumowane organicznie przez CLAUDE.md).
- Re-priorytetyzacja wg wizji v2: „Tablica aktywności (nudge)" Niski→Wysoki (pody = silnik wzrostu) · „Udostępnianie treningów podopiecznym" Średni→Niski (trenerska odłożona).

## Ostatni flush: 2026-07-06

Wykonane operacje (uwagi mapujące kolejkę na realny stan tablicy):
- „Wypracować styl dużych stalowych ikon 3D" — notatka uzupełniona o paletę v2 (canvas neutralny #F7F7F7, akcent bez zmian #C63F21) + info o nocie NIEAKTUALNE przy torze assetów.
- Reskin Warm v2 — **bez CREATE**: wpis „Sprint N3: reskin Arco Warm" (Do testu [Ty]) już zawierał pełną notatkę v2; zamiast tego **duplikat** „Sprint N3 — Reskin…" (Backlog) zamknięty jako Done z adnotacją DUPLIKAT.
- 2 autorskie programy — **bez CREATE**: zaktualizowano istniejący wpis „Dodać treningi A i B po weryfikacji z trenerem" → Do testu [Ty] + notatka (e56a404).
- Strategia monetyzacji — **bez CREATE**: zaktualizowano istniejący wpis „Model monetyzacji: co premium i w jakiej cenie" → Refinement, Priorytet: Wysoki, pełna notatka (kanon `docs/monetyzacja.md`, R3 rozstrzygnięte: guidance-lite free / full paid, otwarte: pricing).
- Dodatkowe porządki: „Bramka: multi-user, konta i RODO" — notatka o prerekwizycie etapu 1 monetyzacji (R4); „Analiza konkurencji: Gymshark…" → Done; „Analiza Ladder" → Done; „Możliwość wyłączenia przerw" → Do testu [Ty] (zrobione w Sprint 1).
- FYI o zasadzie sync na-żądanie przekazane w rozmowie.
