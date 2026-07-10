# Plan sprintu S9-cz.2 — higiena kodu — ✅ WYKONANY W CAŁOŚCI (2026-07-10)

> **Status:** paczki 1–2 (2026-07-08, `a0fdecf`) · paczki 3–5 (2026-07-10, `fcf8669` + `dbce3fa`). Raport: HANDOFF wpis X; Lighthouse przed→po i statusy findingów: `audyt-kodu-zaleznosci.md` §3 + `optymalizacja.md` §Findings. Jedyne odstępstwo: cache detalu ćwiczenia sprawdzony i ODRZUCONY (RLS wymaga authenticated — nowa powierzchnia nieproporcjonalna do zysku).

> **Data:** 2026-07-08 · **Zasada:** plan przed kodem (CLAUDE.md). Zakres = higiena z audytu zależności + findings z `optymalizacja.md`. **Cel sprintu:** kod gotowy na dobudowy Kroku 3 (paywall/limity wejdą w te pliki!) i na lata danych w historii. Zero zmian funkcjonalnych widocznych dla usera (poza szybszym działaniem).
> **Prerekwizyt kolejności:** ten sprint PRZED Krokiem 3 (audyt-kodu §4.3 — nie doklejamy paywalla do monolitów).

---

## Zakres (5 paczek, kolejność wykonania)

### 1. Batch „poprzednio" (N+1 → 1 zapytanie)
- Nowa funkcja SQL `previous_session_sets_batch(p_pairs jsonb, p_session uuid)` (albo wariant: jedna funkcja przyjmująca tablice slotów/ćwiczeń) zwracająca wiersze dla WSZYSTKICH ćwiczeń sesji naraz; migracja + wąski select.
- `session/[id]/page.tsx`: Promise.all z N wywołań RPC → 1 wywołanie; mapowanie po stronie JS.
- **Akceptacja:** logger sesji z 8 ćwiczeniami = 1 RPC zamiast 8; smoke offline zielony; identyczne dane w UI.

### 2. Paginacja historii
- `/history`: pierwsza strona = 20 sesji + „Pokaż starsze" (server action / searchParam `?before=`); kalendarz+passa liczone jak dotąd (osobne, lekkie zapytanie po datach — nie z listy!).
- Wąski select listy (bez ciężkich joinów tam, gdzie liczymy tylko podsumowanie).
- **Akceptacja:** przy 200+ sesjach transfer pierwszego widoku spada wielokrotnie; kalendarz pokazuje pełny miesiąc niezależnie od paginacji listy.

### 3. Split `Logger.tsx` (768 linii) — bez zmiany zachowania
Proponowany podział (pliki obok, ta sama trasa): `Logger.tsx` (orkiestracja+stan, cel <250 linii) · `ExerciseCard.tsx` (karta ćwiczenia + notatka + swap-trigger) · `SetRow` już osobno ✓ · `useRestTimer.ts` (logika przerwy/wibracje z odliczaniem) · `useSessionOutbox.ts` (integracja outbox/sync — przygotowuje grunt pod S10!) · `finish.ts` (handleFinish + walidacje).
- Przy okazji: `memo` na `SetRow`/`ExerciseCard` (re-render tylko dotkniętej serii) — pomiar przed/po w React DevTools.
- **Akceptacja:** zero zmian UX; tap serii nie renderuje całej listy; diff czytelny (przenosiny, nie przepisanie).

### 4. Split `progress/page.tsx` (474 linie) + tanie wygrane
- Wydzielenie sekcji (Rekordy / Trendy / MuscleSplit / Heatmapa) do komponentów; **heatmapa przez `next/dynamic`** (vendor poza initial bundle).
- Detal ćwiczenia (`exercise/[id]`): dane seedowe → sprawdzić i włączyć cache (`revalidate`), user-część (historia PR) zostaje dynamiczna.
- **Akceptacja:** initial JS trasy /progress spada; Lighthouse home/logger ≥90 (baseline do zapisania przed sprintem!).

### 5. Domknięcie
- `npm audit` + przegląd; aktualizacja `audyt-kodu-zaleznosci.md` (część 2 = done) i `optymalizacja.md` (findings → ✅).
- Weryfikacja pełna: build + Preview + smoke 3/3 + Lighthouse przed/po (tabelka do HANDOFF).

## Poza zakresem (świadomie)
Reorder ćwiczeń w sesji (#7 z N2 — osobna decyzja) · jakiekolwiek zmiany wizualne · S10 offline correctness (następny) · majory zależności (decyzja [Ty], osobno).

## Wycena i ryzyka
**~3–5 wieczorów** (paczki 1–2 po ~1, paczka 3 największa ~1,5–2, paczka 4 ~1). Ryzyka: (a) split Loggera = najwrażliwszy kawałek rdzenia — dlatego przenosiny bez przepisywania, po jednej paczce na commit, smoke po każdej; (b) funkcja batch SQL wymaga migracji → koordynacja z Twoim wdrożeniem kuracji (najlepiej: kuracja wjeżdża pierwsza, potem ten sprint); (c) baseline Lighthouse trzeba zdjąć PRZED zmianami, inaczej nie udowodnimy poprawy.

## Kolejność zdarzeń (propozycja)
1. [Ty] wdrożenie kuracji (migracja+seed) i commit — czyste drzewo.
2. [Claude] S9-cz.2 paczkami 1→5, commit po każdej, raport w HANDOFF.
3. Po sprincie: S10 (offline+longevity) wg planu.

**Akceptujesz zakres/kolejność?** Ewentualne cięcia: paczka 4 może spaść do S10, jeśli chcesz szybciej przejść do offline.
