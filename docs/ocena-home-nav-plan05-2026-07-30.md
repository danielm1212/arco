# Ocena HOME-01/HOME-02, PLAN-05A/05C i synchronizacji dokumentacji

**Data audytu:** 2026-07-30
**Stan bazowy:** `main` / `7e8e77e`
**Pakiety:** PR #33, #34, #46, #47, #48
**Ocena łączna:** **6/10**

## 1. Werdykt

Kod nie ma znalezionego P0. Dane HOME-02 są liczone poprawnie z kwalifikowanych faktów, a
deklaracja kosztu **8 → 9 zapytań** jest prawdziwa: HOME-02 dodało jeden `head count` rekordów,
nie trzynaście zapytań. Nie jest jednak prawdą, że pakiet spełniał Definition of Done dla
gorącej trasy i UI. Przed tym audytem nie było:

- pełnego podglądu Home za loginem z historią;
- pomiaru LCP/CLS ani rzeczywistego requestu RSC w przeglądarce;
- zgodności blokującego batcha z limitem maks. czterech zapytań równolegle;
- spójnych źródeł prawdy po merge HOME-01/02 i PLAN-05A/05C.

Największy problem techniczny był starszy niż HOME-02, ale HOME-02 go odziedziczyło:
blokujący batch hero wykonywał pięć zapytań równolegle (`app/page.tsx` w stanie
`7e8e77e`, linie 74–105), ponad twardy limit z `docs/optymalizacja.md` §1. W tej paczce
audytowej połączono odczyt sesji otwartej i historii: obecny `app/page.tsx` linie 91–124
wykonuje cztery zapytania w batchu. HOME-03 nadal używa istniejącego `getHomeInsights` i
nie dodaje zapytania.

## 2. Oceny

| Obszar | Ocena | Uzasadnienie |
|---|---:|---|
| Poprawność | **7/10** | Kwalifikowane sesje/ćwiczenia/serie są filtrowane poprawnie; granice 7/30 dni oraz trend 90 dni odpowiadały `/progress`. Były drobne błędy językowe i ukryte sprzężenie liczby `90`. |
| Budżet / wydajność gorącej trasy | **4/10** | Delta HOME-02 wynosi +1, ale cały request miał 9 zapytań, a blokujący batch 5. `Suspense` chroni CTA przed waterfallem insightów, lecz nie jest dowodem LCP/CLS. |
| Dostępność | **8/10** | Kontrasty przechodzą AA, karta passy ma sensowną semantykę listy, `LevelMeter` nie komunikuje stanu samym kolorem. Brakowało pełnego review ekranu/zoomu za loginem. |
| Spójność produktu i dokumentacji | **6/10** | Kierunek Home i violet dla danych są zgodne z kanonem. Okres 90 dni był niewidoczny dla osoby widzącej, `k lb` nie jest dobrym polskim skrótem, a backlog i HANDOFF rozjechały się ze stanem Git. |
| Jakość weryfikacji | **5/10** | 202 testy, lint, TypeScript i build są realne. Fixture pojedynczego komponentu nie dowodzi złożonego Home; replay kształtu SQL nie mierzy requestu RSC, LCP ani CLS. |

## 3. Ocena pakietów

| Pakiet | Ocena | Co jest dobre | Co obniża ocenę |
|---|---:|---|---|
| #46 synchronizacja HANDOFF/planu | **7/10** | Naprawiła fałszywy stan PLAN-C i jawnie opisała dryf P13 oraz otwarte bramki. | Nie objęła `backlog-produktu.md`; po kolejnych merge’ach źródła prawdy znów się rozjechały. |
| #33 HOME-01 | **7/10** | Hero pozostał pierwszym modułem, brak imienia usuwa węzeł, passa ma pozytywny copy i listę czytelną dla VoiceOver. | `font-bold` łamał kanon; copy dawało „5 treningi”; pełny ekran nie był sprawdzony za loginem. |
| #34 PLAN-05C | **7/10** | Czysta funkcja, jawny `aria-label`, obrys pustego segmentu zamiast niekontrastowego wypełnienia. | Komponent jest nadal martwy i nie ma dowodu renderu w docelowej karcie. Osobny merge jest akceptowalny wyłącznie jako zależność 05D/05E, nie jako wartość użytkownika. |
| #47 PLAN-05A | **8/10** | Minimalna, nullable migracja, bez zmiany modelu dostępu; typy są zgodne. | Migracja nie jest na produkcji i nie może być konsumowana przed `db push`; HANDOFF jednocześnie twierdził „local == remote”, choć lokalnie pojawiła się 61. migracja. |
| #48 HOME-02 | **6/10** | Poprawna semantyka kwalifikowanych faktów, +1 zamiast +13, CTA poza waterfallem, sensowne testy przypadków zerowych i ujemnych. | Nie spełniał budżetu batcha, ukrywał okres 90 dni przed osobą widzącą, używał `k lb`, nie miał pełnego dowodu wizualnego ani pomiaru Web Vitals. |

## 4. Dziesięć punktów kontrolnych

### 4.1 Ukryte sprzężenie 90 dni

**Zarzut potwierdzony.** W stanie `7e8e77e` liczba `90` żyła niezależnie w
`lib/getHomeGuidance.ts` i `app/progress/stats.ts`; testy agregatora przyjmowały gotowe
wiersze, więc zwężenie zapytania guidance cicho zmieniałoby „największy progres”.

Naprawa: `lib/exerciseMetrics.ts` eksportuje `STRENGTH_TREND_WINDOW_DAYS` i
`strengthTrendCutoff`; korzystają z nich Home i `/progress`. Test
`tests/exercise-metrics.test.ts` przypina 90 dni.

### 4.2 Pełny Home za loginem

Przed audytem dowodu nie było. Wpis w `docs/koordynacja-agentow.md` przyznaje wprost, że
sprawdzono tymczasową publiczną trasę z fixture’em, nie złożony ekran. To nie spełnia
`docs/standard-zadania-agentow.md` §4 i nie uzasadnia pełnego „Done”.

W audycie sprawdzono lokalny build produkcyjny za loginem na deterministycznym koncie z
czterema sesjami: hero → passa → podsumowanie → kafle → guidance, prawdziwe liczby i brak
poziomego overflow przy 320 px. HOME-03 porządkuje finalnie kolejność jako hero → passa →
podsumowanie → kafle → postęp ćwiczeń → wskazówki.

### 4.3 Mieszane okresy

Technicznie poprawne, produktowo zbyt słabo opisane. Tonaż miał „vs poprzedni tydzień”,
rekordy „30 dni”, lecz 90 dni progresu istniało wyłącznie w `sr-only`
(`app/HomeStats.tsx` w bazowym commicie, linie 142–147). Osoba widząca nie miała tej samej
informacji co czytnik.

Naprawa: widoczna etykieta `Progres · 90 dni`.

### 4.4 Format objętości

Tony dla kg są akceptowalnym, powszechnym skrótem na wąskim kaflu. `k lb` jest angielskim
prefiksem w polskim UI i nie powinno zostać. Home może mieć format kompaktowy inny niż
`/progress`, ale jednostka musi być lokalizowana. Zmieniono ją na `tys. lb`; pełne wartości
na `/progress` pozostają bez zmian.

### 4.5 Budżet gorącej trasy

Deklaracja **+1, nie +13** jest zgodna z kodem:

- bazowy hero: 5 zapytań;
- bazowe guidance: 3 zapytania przy danych;
- HOME-02: dodatkowy count `personal_records`, równoległy do pierwszego poziomu;
- suma: 8 → 9.

Polecenia dowodowe:

```text
git diff 7e8e77e^ 7e8e77e -- app/page.tsx lib/getHomeGuidance.ts
rg -n '\\.from\\(' app/page.tsx lib/getHomeGuidance.ts
```

`pg_stat_statements` z replayem kształtu zapytań nadaje się do porównania delty SQL, ale
nie do dowodu czasu strony. Lepszy pomiar: prawdziwe wejście na uwierzytelniony Home,
log wywołań PostgREST dla jednego requestu oraz Lighthouse/Web Vitals dla LCP i CLS.

Naprawiono P1 blokującego batcha: odczyt otwartej i zakończonej sesji jest jednym
zapytaniem, więc batch ma teraz 4 wywołania. Insighty nadal streamują się później.

### 4.6 Martwy `LevelMeter`

Osobny komponent był rozsądną paczką zależności: kontrakt ma dwa przyszłe miejsca użycia,
jest mały i testowalny. Nie należy jednak przedstawiać #34 jako ukończonej funkcji produktu.
Do PLAN-05D/05E pozostaje martwym kodem, a jego dowód wizualny dopiero wtedy ma sens.

### 4.7 Polska odmiana liczebnika

Bazowy `sessionsWord` poprawnie dawał:

- 22 → `treningi`;
- 102 → `treningi`;
- 112 → `treningów`.

Nie obejmował jednak copy HOME-01: `streakStatusText` dla pięciu brakujących treningów
dawał „5 treningi”. Wspólny `trainingWord` usuwa duplikację i ma testy 22/102/112 oraz 5.

### 4.8 Kontrasty

Niezależne przeliczenie z HSL w `app/globals.css`:

| Para | Wynik |
|---|---:|
| violet-500 na białej karcie | **5,081:1** |
| violet-400 na `ink-700` w dark | **4,697:1** |
| muted light (`grey-600` na białym) | **5,661:1** |
| muted dark (`sand-350` na `ink-700`) | **8,083:1** |

Deklarowane 5,08 i 4,68 są zatem zasadniczo prawdziwe; różnica 4,68/4,70 wynika z
zaokrąglenia tokenu. Wszystkie pary tekstowe przechodzą 4,5:1.

### 4.9 `periodStats` a HOME-02

Semantyka jest zgodna:

- sesje liczą się z listy zakończonych sesji, również bez serii;
- ćwiczenia `skipped=true` odpadają;
- liczba serii i objętość używają tylko `completed=true`, `set_type=working`;
- objętość wymaga jednocześnie ciężaru i powtórzeń;
- trend używa `setMetric` i najlepszego wyniku per ćwiczenie/per sesja.

Granice obu implementacji są rolling windows w milisekundach (`Date.now() - N * DAY`), a
nie dniami kalendarzowymi Warszawy. To jest spójność 1:1, ale nie należy opisywać tych
okien jako „tydzień kalendarzowy”. Passa i bieżący tydzień nadal korzystają z `weekStart`
Warszawy.

### 4.10 Gambarino w HOME-01

Decyzja właściciela broni się. Krój obejmuje wyłącznie dużą liczbę passy, czyli moment
retencyjny, a nie kontrolkę narzędzia. Nie rozlewa się na opis ani dni tygodnia. Usunięto
jedynie niezgodne z kanonem `font-bold` na dopisku.

## 5. Bramki uruchomione w audycie

- `npm run lint`;
- `npx tsc --noEmit`;
- `npm run test:unit` — stan bazowy: **202/202**, po poprawkach i HOME-03: **209/209**;
- `npm run test:overflow` — **32/32**;
- `npm run build` — build produkcyjny zielony;
- `npm run validate:training` — 907 ćwiczeń, 15 programów, 336 slotów; znane
  56 placeholderów, zero błędów integralności;
- `npm run validate:recommendations` — **60/60**;
- `npm run audit:muscle-coverage` — wykonany, bez zmiany recept;
- niezależne przeliczenie kontrastów z tokenów;
- pełny Home za loginem na lokalnym buildzie i czterech znanych sesjach;
- viewporty 320/375/393 px w light oraz 393 px w dark:
  `scrollWidth === clientWidth`, link „Wykresy" ma 44 px wysokości.

Nie wykonano checkpointu fizycznego iPhone PWA ani starego cache. To nadal bramka
właściciela i nie może zostać zastąpione desktopowym Chromium.
