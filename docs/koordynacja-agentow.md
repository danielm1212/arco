# Arco — koordynacja agentów

**Aktualizacja:** 2026-07-28
**Rola:** aktywne rezerwacje i krótki log operacyjny. Historia pełna jest w Git.

## Zasady

1. Przed pracą przeczytaj `CLAUDE.md`, `HANDOFF.md`, aktywny sprint i
   `standard-zadania-agentow.md`.
2. Zarezerwuj tylko konkretny obszar/pliki. Rezerwacja bez aktualizacji przez 24 h wygasa.
3. Nie edytuj plików z aktywnej rezerwacji innego agenta bez uzgodnienia.
4. Migracja wymaga osobnej rezerwacji, unikalnego timestampu, RLS i smoke'a.
5. Każdy wpis końcowy podaje: zakres, commit/stan, testy, produkcję i następny krok.
6. Log przechowuje maksymalnie 10 ostatnich wpisów. Starsze usuwa się przy rebaseline; są w Git.
7. Ten plik nie jest backlogiem. Nowe pomysły trafiają do `backlog-produktu.md`.

## Aktywne rezerwacje

| Agent | Zadanie | Obszar | Od | Stan |
|---|---|---|---|---|

## Ostatnie wpisy

### 2026-07-29 · Claude · PLAN-C — WDROŻONE NA PRODUKCJĘ (15/15 planów)

- **Zakres:** osiem migracji na produkcji, `migration list` potwierdza local == remote (60, zero
  oczekujących). Pełny ślad: `plan-c-release-2026-07-29.md`.
- **Efekt:** zero twardych zer pokrycia (było 1), zero planów kłamiących o czasie sesji (było 7,
  do 26 min rozjazdu), ramiona w 13 z 15 planów, 15/15 kart w `docs/trainings/`.
- **Weryfikacja po wdrożeniu:** zrzut produkcji — 15 programów systemowych, 334 sloty, zero
  otwartych sesji, deklarowane czasy zgodne z receptą. Strona logowania renderuje się, konsola
  czysta. **Ekrany planów niesprawdzone wizualnie — są za loginem.**
- **POMYŁKA DO ODNOTOWANIA:** zaraportowałem blokującą sesję jako pustą (błąd w skrypcie —
  szukał w `session_sets` kolumny `session_id`). Miała 26 serii, 10 zaliczonych. Warunek
  bezpieczeństwa w migracji odmówił usunięcia i tylko dlatego dane przetrwały. Po podaniu
  prawdziwych liczb właściciel ponowił decyzję. Reguła zapisana jako **D-47**.
- **Awaria pierwszego pushu:** blok PL/pgSQL z `RAISE` padł na produkcji na błędzie, którego CLI
  nie pokazuje; lokalnie przechodził (pooler kontra połączenie bezpośrednie). Przepisane na jedno
  zdanie `DELETE` z warunkami w `WHERE`. Produkcja nie została w stanie połowicznym.
- **Znalezisko poza zakresem:** `advanced-gym-ppl6` ma na produkcji 36 slotów wobec 38 w seedzie —
  brak `Ab_Wheel_Rollout` w Legs A i `Hanging_Leg_Raise` w Legs B, czyli zero pracy core w dniach
  nóg. Dryf sprzed PLAN-C (P13 nigdy nie był point-syncowany). Do decyzji: mała migracja syncująca.
- **Otwarte:** checkpoint wizualny [Ty]; 56 slotów z zaślepką zdjęcia; brak coach sign-off;
  14% slotów ma alternatywę.

### 2026-07-29 · Claude · PLAN-C4 — domknięcie biblioteki (15/15)

- **Zmienione recepty (2):** `intermediate-home-fbw2` dostał łydki w obu dniach (wcześniej zero),
  `intermediate-gym-upper-lower4` glute bridge w Lower B — plan nie miał ani jednego ruchu
  z pośladkiem jako mięśniem głównym, a w sesji był czas (49 → 56 min przy deklaracji 50–70).
- **Świadomie NIE zmienione, mimo „zera" w audycie:** biceps w dwóch planach kalistenicznych
  (bez sprzętu nie ma sensownej izolacji, niosą go podciąganie i wiosłowanie, a sesje są już na
  górnej granicy czasu); pośladki jako „zero bezpośrednio" w planach z przysiadem i martwym
  ciągiem (artefakt tagowania katalogu, nie luka); pionowe przyciąganie w domowym FBW (wymagałoby
  drążka lub gumy, czyli zmiany kontraktu sprzętowego). Wszystko trzy opisane na kartach.
- **Parytet dokumentacji domknięty:** powstała brakująca karta `intermediate-home-fbw2.md` —
  ostatni z piętnastu planów bez własnej dokumentacji. `docs/trainings/` ma teraz 15 kart planów.
- **Czwarty odmrożony test:** `content01-hip-thrust` przypinał dokładną liczbę slotów
  z zatwierdzonym glute bridge. Zablokowany wariant zostaje twardym zerem, zamiennika może
  przybywać.
- **Commit/stan:** PR na `main`, stackowany na #38 i #39. **Produkcja nietknięta.**
- **Testy:** lint, build, 187/187 unit, walidatory 907/15/336 oraz 60/60, smoke Phase 1,
  migracja w rollbacku i idempotentna.
- **Następny krok:** wspólny deploy pięciu migracji procedurą `arco-release` po zgodzie [Ty].

### 2026-07-29 · Claude · PLAN-C3 — brzuch i ramiona w planach lower-body

- **Zakres:** `lower-body-gym3` nie miał **żadnej** pracy brzucha (ani bezpośredniej, ani
  pośredniej), mimo że audyt 2026-07-21 §P05 zatwierdził dla niego Pallof Press — korekta
  nigdy nie weszła. Oba plany lower-body nie miały też ani jednej serii na biceps i triceps,
  choć oba deklarują, że „góra ciała nadal dostaje regularny bodziec".
- **Trzecie znalezisko o czasie:** `lower-body-gym3` deklarował 45–60 min przy realnych 32–38,
  `lower-body-home3` 40–55 przy 28–36. Nowa praca zmieściła się w tym zapasie, deklaracje
  zeszły do prawdy (40–55 i 35–50).
- **Przy okazji `advanced-gym-ppl6`:** ostatni plan, który kłamał o czasie (55–75 przy realnych
  46–59). Audyt §P13 zatwierdził tę korektę w lipcu i też nigdy nie weszła. Teraz 45–65.
- **Nowa reguła zamknięta testem:** `tests/czas-sesji.test.ts` sprawdza deklarowany czas dla
  **wszystkich 15 planów**. Cała biblioteka przechodzi.
- **Odejście od brzmienia audytu:** Pallof Press w „Dół A · siła", nie w dniu górnym — dzień górny
  dostał ramiona i przy Pallofie miałby dziesięć pozycji. Intencja korekty spełniona.
- **Odmrożony trzeci test migawkowy:** `content01-hip-thrust` przypinał dokładne `content_version`
  dwóch planów, blokując każdą przyszłą korektę treści. Pilnuje teraz „nie mniej niż", zgodnie
  ze swoją prawdziwą intencją (blokada ryzykownego wariantu).
- **Commit/stan:** PR na `main`, stackowany na #38. **Produkcja nietknięta.**
- **Testy:** lint, build, 187/187 unit, walidatory 907/15/333 oraz 60/60, smoke Phase 1,
  migracja w rollbacku i idempotentna.
- **Następny krok:** intermediate FBW (`intermediate-home-fbw2` bez pionowego przyciągania).

### 2026-07-29 · Claude · PLAN-C2 — ramiona i prawda o czasie w planach dla początkujących

- **Zakres:** cztery z pięciu planów beginner nie miały ani jednej serii bezpośrednio na biceps
  lub triceps. Audyt zakładał „opcjonalne ramiona", ale kontrakt danych nie ma `is_optional`,
  więc opcjonalne znaczyło „nieobecne". Każda sesja kończy się teraz pracą ramion.
- **Drugie znalezisko:** każda sesja beginner kończyła się 8–26 minut przed zadeklarowanym czasem
  (`beginner-gym-fbw3`: deklaracja 45–60, realnie 31–34). Ramiona zmieściły się w tym zapasie,
  a trzy deklaracje zeszły do prawdziwych wartości.
- **Układ:** dzień krótki dostaje parę biceps + triceps po 2 serie, dzień gęsty jedno ćwiczenie
  po 3 serie — sesja początkującego nie może być listą dziesięciu ćwiczeń (maks. 9 pozycji).
  W kalistenice tylko triceps: bez sprzętu nie ma sensownej izolacji bicepsa.
- **Pliki:** `scripts/seed.ts`, `scripts/data/program-slot-alternatives.ts`,
  `supabase/migrations/20260729102750_planc2_beginner_arms.sql`,
  `tests/planc2-beginner-arms.test.ts`, pięć kart w `docs/trainings/`, dwa testy migawkowe.
- **Poprawione testy migawkowe:** `train02a4-migration` porównywał wdrożoną migrację z bieżącym
  seedem, więc każda zmiana treści go wywracała. Teraz pilnuje kształtu i zakresu migawki
  historycznej, nie zamrożonej treści.
- **Commit/stan:** PR [#37](https://github.com/danielm1212/arco/pull/37). **Produkcja nietknięta.**
- **Testy:** lint, build, 186/186 unit, 32/32 przeglądarkowych, walidatory 907/15/326 oraz 60/60,
  smoke Phase 1, migracja w rollbacku i idempotentna w drugim przebiegu.
- **Następny krok:** lower-body (brak brzucha w `lower-body-gym3`), potem intermediate FBW.

### 2026-07-28 · Claude · PLAN-C0 + PLAN-C1 — adopcja biblioteki v2.1 i flagowy FBW

- **Zakres:** ocena audytu v2.1, mapa `exercise_id` dla całej biblioteki (PLAN-C0) i wdrożenie
  recepty flagowca `intermediate-gym-fbw2` (PLAN-C1). Gałąź `agent/plan-c1-fbw-gym` z `origin/main`
  (`1d07e3c`). Pliki: `scripts/seed.ts`, `scripts/data/program-slot-alternatives.ts`,
  `scripts/data/exercise-names-pl.json`, `scripts/data/v21-exercise-map.json`,
  `supabase/migrations/20260728213337_planc1_intermediate_gym_fbw2_v21.sql`,
  `tests/planc1-fbw-gym-recipe.test.ts`, `tests/train01-program-safety.test.ts`,
  `tests/train02a4-migration.test.ts`, `docs/trainings/intermediate-gym-fbw2.md`,
  `docs/plan-c0-mapowanie-cwiczen-v21.md`, `docs/decyzje-produktowe.md`, `HANDOFF.md`.
- **Korekta po review [Ty]:** biblioteka v2.1 daje jedną izolację ramion na sesję, czyli po
  3 serie bezpośrednie tygodniowo przy dwóch dniach. Za mało dla celu sylwetkowego, więc oba dni
  dostały siódmą pozycję (triceps zza głowy w A, chwyt młotkowy w B) — 21/21 serii, po 5 serii na
  partię. Skutek uboczny: dzień zostaje przy 7 slotach, więc migracja nic nie usuwa i D-44 nie jest
  w tym wydaniu wykorzystane.
- **Druga korekta po review [Ty] („bez gafy w ćwiczeniach"):** policzone pokrycie mięśni pokazało,
  że literalna adopcja v2.1 zabrała flagowcowi 3 serie czworogłowych i 2 dwugłowych względem
  produkcji — wypadły wykroki i uginanie nóg, które TRAIN-01 dodał celowo. [Ty] wybrał wariant
  „zostawić krótko, opisać uczciwie": recepta bez zmian, ale opis programu, karta planu i **D-45**
  nazywają kompromis wprost, a test zamraża profil objętości. Powstał
  `npm run audit:muscle-coverage` (**D-46**) — przemiał całej biblioteki jest w §9
  `plan-c0-mapowanie-cwiczen-v21.md`; najmocniejszy sygnał to `lower-body-gym3` bez żadnej pracy
  brzucha, mimo zatwierdzonej w 2026-07-21 korekty §P05 (Pallof Press), która nigdy nie weszła.
- **Trzecia runda ([Ty]: „bez gafy, ma być solidnie"):** policzony sufit budżetu pokazał, że
  flagowiec przy 3 dniach ma zasoby na 10/11 grup, a dowoził 4/11 — problem rozkładu, nie
  kalendarza. W ramach warunków [Ty] (jedno ćwiczenie nóg na sesję, ramiona w obu dniach, łydki
  jako jedna dodatkowa pozycja, podciąganie nietknięte) wdrożony wariant D2: przysiad i RDL po
  5 serii, łydki w B. Czworogłowe 6,0 → 7,5, pośladki 6,0 → 7,5, łydki 0 → 12,0. PR #37.
- **Druga uśpiona wada seeda:** alternatywy są upsertowane, ale nigdy nie sprzątane — przepięcie
  slotu na inne ćwiczenie zostawia starą alternatywę przy nowym ruchu (18 wierszy zamiast 15).
  Seed i migracja kasują teraz osierocone wiersze, wyłącznie dla programów systemowych.
- **Flake w CI:** `tests/e2e/overflow.test.ts:365` („tap w puste pole… zaznacza go") czyta
  `selectionStart/End` zaraz po kliknięciu i bywa czerwony na CI przy zielonym lokalnie.
  Ponowienie joba przeszło. Do naprawy wyścigu osobno — nie dotykałem cudzego zakresu.
- **Decyzje:** D-42 (kanon v2.1 z wyjątkami kolejności power/skill z TRAIN-01), D-43 (alternatywy
  strukturalne = wyłącznie ścieżka sprzętowa), D-44 (korekta treści może usuwać sloty).
- **Nie adoptowane z v2.1:** trzy przesunięcia HSPU/Jump Squat w głąb sesji (P11 Upper B,
  P12 Upper A, P12 Lower A) — cofałyby wdrożony patch TRAIN-01 i łamały walidator TRAIN-07.
- **Naprawione przy okazji:** (1) seed wpisywał `position: 0` każdej alternatywie przy
  `unique(program_day_slot_id, position)` — dwie alternatywy na slot były niemożliwe;
  (2) pierwsza wersja migracji zmieniała sloty, ale nie wnosiła alternatyw na produkcję, gdzie
  seed nie jest uruchamiany — migracja niesie teraz payload 12 alternatyw, a test pilnuje
  zgodności z `program-slot-alternatives.ts`.
- **Commit/stan:** PR [#35](https://github.com/danielm1212/arco/pull/35) **zmergowany do `main`**
  2026-07-28. **Migracja `20260728213337` NIE jest na produkcji** (`migration list` → pusty
  `remote`), więc prod serwuje nadal receptę TRAIN-01. Backup proda: `backups/20260728T204449Z`.
- **Testy:** lint, build, 183/183 unit, 32/32 przeglądarkowych, `validate:training` 907/15/308,
  `validate:recommendations` 60/60, smoke Phase 1 / Phase 2 / offline, seed dwa razy idempotentny.
  Migracja sprawdzona przebiegami z rollbackiem na realnej historii (finalny kształt: zero usunięć,
  51/51 serii i wszystkie powiązania slotów zachowane), bramką otwartej sesji (podnosi wyjątek)
  i pustym katalogiem (pomija się).
  `supabase db reset` **nie wykonany** — zablokowany jako operacja niszcząca; pełny łańcuch
  migracji na świeżej bazie plus `smoke:team` przeszły w CI na PR #35.
- **Otwarte:** (1) brak weryfikacji wizualnej `/programs/[id]` — wymaga logowania; (2) dwa sloty
  flagowca mają placeholder zdjęcia (`Chest-Supported_Dumbbell_Row`, `Hanging_Knee_Raise`);
  (3) trzy plany kalisteniczne v2.1 nie mają zamienników, tylko wskazówki progresji;
  (4) `bootstrap:test-user` wymaga `TEST_USER_EMAIL`/`TEST_USER_PASSWORD`, których nie ma w
  `.env.local`.
- **Następny krok:** checkpoint [Ty] na lokalnym proda, potem PR i `arco-release`; dalej PLAN-C2
  (media i `name_pl`) oraz kolejne paczki per program.

### 2026-07-28 · Claude · PLAN-05C — pasek poziomu (`LevelMeter`): ZAKOŃCZONE TECHNICZNIE

- **Zakres:** nowy `components/LevelMeter.tsx`, nowy `lib/levelMeter.ts` (segmenty/copy jako
  czyste funkcje, wzorzec jak `lib/streakCopy.ts` z równoległej pracy nad HOME-01), nowy
  `tests/level-meter.test.ts`. Gałąź `agent/plan-05c` z czystego `main` (`e559f92`) — niezależna
  od `agent/home-01`. **Świadomie NIE wpięty** w `ProgramRow` (`app/programs/page.tsx`) ani
  `/programs/[id]/page.tsx` — spec wiąże to wpięcie z PLAN-05D/05E, które zależą od 05C i
  same je wykonują; 05D dodatkowo czeka na NAV-01 (ten sam plik). Wpinanie teraz byłoby
  robieniem cudzego zakresu i dotykaniem pliku zarezerwowanego pod NAV-01 przed czasem.
- **Wynik:** `role="img"` + pełny `aria-label` („Poziom {N|od X do Y} z 3: {etykieta}") —
  czytnik ekranu dostaje jedno zdanie, nie N osobnych `<div>`; `level_min === level_max`
  poprawnie pokazuje pojedynczy poziom, nie zakres; brak etykiety tekstowej → komponent się
  nie renderuje (sam pasek bez tekstu nie niesie znaczenia).
- **Odejście od dosłownego brzmienia spec-a (policzone, nie na oko):** spec sugerował pusty
  segment jako `bg-primary` z obniżoną krycią. Policzony kontrast WCAG: `rust-500` przy 20%
  krycia na białej karcie = **1.34:1** (próg dla elementów graficznych to 3:1); 70% krycia
  przechodzi próg, ale wygląda już prawie jak segment pełny — sprzeczne cele nie do pogodzenia
  samą krycią. Zamiast tego: pełny segment = `bg-primary` (pełna krycia), pusty = obrys
  `border-primary` na przezroczystym tle — różnica kształtu (pełny/pusty), nie tylko koloru,
  i mierzalnie zgodna: rust-500 pełną krycią ma **5.08:1** na jasnej karcie i **3.11:1** na
  ciemnej. Do potwierdzenia wizualnego przy wpinaniu w 05D/05E (komponent nie jest jeszcze
  osadzony na żadnym ekranie, więc nie ma czego zrzucić w realnej apce dzisiaj).
- **Dowód:** lint czysty; `tsc --noEmit` czysty; build produkcyjny zielony; unit **165/165**
  (7 nowych: granice `level_min`/`level_max` null, brak etykiety, poziom pojedynczy vs zakres,
  liczba segmentów zawsze równa `LEVEL_METER_TOTAL`).
- **Czego nie dotknięto:** `ProgramRow`, `/programs/[id]/page.tsx`, nawigacji, migracji,
  danych produkcyjnych, gałęzi `agent/home-01` (PR [#33](https://github.com/danielm1212/arco/pull/33)).
- **Zaległości:** [Ty] review PR [#34](https://github.com/danielm1212/arco/pull/34). Kolejne
  niezależne paczki gotowe od razu: PLAN-05A (migracja `cover_image_url`, Sonnet 5) lub HOME-02
  (Opus 5, po HOME-01). PLAN-05B/05D/05E czekają odpowiednio na 05A i NAV-01.

### 2026-07-28 · Claude · HOME-01 — powitanie i passa tygodniowa: ZAKOŃCZONE

- **Zakres:** `app/page.tsx` (powitanie + wpięcie karty passy), nowy `app/StreakCard.tsx`,
  nowy `lib/streakCopy.ts` (copy passy jako czyste funkcje, wzorzec jak `formatGoalSentence`
  w `lib/programRecommendation.ts`), nowy `tests/streak-copy.test.ts`. Zero nowych zapytań —
  `display_name`, `computeStreak`, `weeksMeetingGoal` były już liczone na Home.
- **Wynik:** „Cześć, {imię}" jako pierwsza linia treści Home (węzeł w ogóle nie istnieje bez
  imienia, potwierdzone w DOM); karta passy wchodzi pod hero (hero zostaje pierwszym modułem,
  D-03) — liczba tygodni w Gambarino gdy streak>0, neutralny fallback „Ten tydzień" gdy
  streak=0 (zero „0. tydzień passy" — zakaz straty z `tone-of-voice.md`), siedem kafelków dnia
  (wypełniony/dziś-dashed/pusty — różnica kształtu, nie tylko koloru), jedno zdanie stanu.
  Karta renderuje się wyłącznie z historią (brak historii → karty nie ma, nie pokazujemy zer),
  zgodnie z POC (`data-when="rich"` vs `fresh-note`).
- **A11y (self-review skillem `arco-a11y-review`):** jeden finding, naprawiony — `<ol>` z
  `list-none` traci domyślną rolę listy w Safari/VoiceOver (udokumentowany bug WebKit), istotne
  bo iPhone PWA/Safari jest głównym celem urządzeniowym repo; naprawione jawnym `role="list"`.
  Stan per dzień nie tylko kolorem: sr-only sufiks „zaliczony"/„dziś" obok skrótu dnia.
- **Dowód:** lint czysty; `tsc --noEmit` czysty (po `rm -rf .next` — stare typy `.next/types/*`
  zdublowane przez sync iCloud psuły build, ten sam rodzaj problemu co w pamięci
  `arco-node-modules-icloud-dupes`, tym razem poza `node_modules`); build produkcyjny zielony;
  unit **165/165** (7 nowych: wybór copy dla streak 0/1/N i cel zrobiony/brakuje 1/brakuje N).
  Weryfikacja w realnej apce (`next start`, lokalne konto): streak=0 → „Ten tydzień" +
  „Jeszcze jeden trening domyka ten tydzień." na 320 i 375 px, light i dark, bez przełamania na
  320 px. Chwilowo ustawiłem `display_name="Daniel"`, żeby potwierdzić powitanie („Cześć,
  Daniel" nad hero) — imię i motyw przywrócone do stanu sprzed sesji po weryfikacji.
- **Znalezisko przy okazji:** kilka nowych duplikatów iCloud „ 2" poza `node_modules`
  (`.claude/skills/arco-motion-review/SKILL 2.md`/`3.md`,
  `docs/audyt-train-02a-kompletnosc-planow-2026-07 2.md`,
  `scripts/audit-program-catalog-drift 2.ts`, `scripts/data/program-slot-alternatives 2.ts`,
  trzy pliki w `tests/`) — nieśledzone, nie moje, nie ruszone; rosnący koszt syncu iCloud na
  katalogu repo, warto rozłączyć (patrz pamięć `arco-node-modules-icloud-dupes`).
- **Czego nie dotknięto:** nawigacji, migracji, treści treningowej, danych produkcyjnych,
  wymienionych wyżej duplikatów iCloud.
- **Produkcja:** scalone do `main` w PR [#33](https://github.com/danielm1212/arco/pull/33)
  jako `e8f60a6`; Vercel auto-deployuje z `main` (procedura `arco-release`, deploy = merge).
- **Zaległości:** kolejna paczka w kolejności `spec-home-i-nawigacja.md` §4 to HOME-02
  (podsumowanie okresu + kafle — Model: Opus 5, budżet gorącej trasy).

### 2026-07-27 · Claude · PLAN-05 — SPEC KARTY PLANU: ZAKOŃCZONE

- **Zakres:** `docs/spec-plan-detail-card.md` (nowy), backlog, plan sprintów (dopisek do
  PLAN-Q i R2.2), HANDOFF, indeks docsów. **Zero zmian w kodzie produkcyjnym.**
- **Wynik:** diagnoza dzisiejszej karty `/programs/[id]` (trzy style kontenerów na przemian,
  zahardkodowana identyczna karta „Jak robić postęp" na 15 planach, CTA pod trzema ekranami
  tekstu) + pięć paczek 05A…05E z pełnym briefem (dane, stany UX, kryteria akceptacji, testy,
  model) zgodnie ze `standard-zadania-agentow.md`.
- **Decyzje właściciela:** fallback wizualny (gradient + istniejąca `MomentIcon3D name="plan"`)
  teraz, realne zdjęcia później jako wyłącznie dane — kolumna `cover_image_url` (nullable)
  wchodzi już w 05A, żeby zdjęcia nie wymagały kolejnego redesignu; „Jak robić postęp"
  usunięte, nie zwinięte; poziom w paskach + tekst (nie same kropki, dostępność); funkcje
  z referencyjnych zrzutów (kalendarz, share, ulubione) odrzucone jako poza zakresem (D-03).
- **Kolejność:** 05A i 05C niezależne, mogą wejść od razu. 05D (przebudowa szczegółu) czeka
  na **NAV-01** z HOME-NAV — ten sam plik — i wchodzi **przed R2.2**, z tego samego powodu co
  HOME-NAV. Dopisek w PLAN-Q: UI karty/listy jest w PLAN-05, PLAN-Q skupia się na treści.
- **Przy okazji:** wykryta i naprawiona rozjechana sekcja „Zamknięte” w HANDOFF —
  SESSION-01A2/01A3/01A4 miały trzy nachodzące na siebie, częściowo sprzeczne wpisy
  (m.in. „czeka na merge” dla PR-a już scalonego). Skonsolidowane w jeden wpis z poprawnym
  stanem: merge i auto-deploy Vercel wykonane, otwarty jest wyłącznie krok 5/6 `arco-release`
  (weryfikacja proda + regresja urządzeniowa [Ty]).
- **Czego nie dotknięto:** kodu aplikacji, migracji, treści treningowej, Ekipy.
- **Zaległości:** [Ty] podjęcie pierwszej paczki (05A/05C mogą iść równolegle z HOME-01);
  krok 5/6 `arco-release` dla SESSION-01A2…01A4 nadal otwarty, niezależnie od tego wpisu.

### 2026-07-27 · Claude · HOME-NAV — POC, REWIZJA KONTRAKTU I PLAN: ZAKOŃCZONE

- **Zakres:** `prototypes/home-dashboard-poc/**` (nowy), `docs/userflows-docelowe-2026-07.md`
  (rewizja IA), `docs/decyzje-produktowe.md` (D-38…D-41, rewizja D-01/D-02),
  `docs/spec-home-i-nawigacja.md` (nowy), backlog, plan sprintów, HANDOFF, indeks docsów.
  **Zero zmian w kodzie produkcyjnym.**
- **Wynik:** klikalny POC nowego Home i nawigacji `Home · Trening · Ekipa` z zakładkami
  `Plany | Postępy | Ciało | Historia`. Właściciel zatwierdził nazwę „Trening" w liczbie
  pojedynczej, Gambarino na passie, maksymalny zakres Home oraz start aktywnego planu
  z zakładki Plany.
- **Rozstrzygnięte pomiarem:** cztery zakładki mieszczą się na 320 px (76 px każda, bez ucięć,
  zero overflow). Chrome maleje: 4 pozycje + dwa paski zakładek → 3 pozycje + jeden pasek.
- **Znalezisko:** karta hero renderowała się o wysokości 0 px — `overflow: hidden` wyłącza
  automatyczne `min-height: auto` dla elementu flex, więc kolumna zgniotła kartę. Ta sama
  pułapka czeka przy przepisaniu POC na React; udokumentowana w CSS prototypu.
- **Plan:** HOME-01 → HOME-02 → HOME-03 → NAV-01, PLAN-04 równolegle; HOME-NAV wchodzi
  **przed R2.2**, bo obie dotykają `/programs`.
- **Czego nie dotknięto:** kodu aplikacji, migracji, treści treningowej, Ekipy oraz
  nieśledzonych plików właściciela (`docs/katalog-15-programow.md`, prezentacja onboardingowa).
- **Zaległości:** [Ty] decyzje z §6 spec-a (liczba wierszy ćwiczeń na Home, ikona taba
  Trening); podjęcie HOME-01 jako pierwszej paczki implementacyjnej.

### 2026-07-27 · Claude · SESSION-01A4 — ROZCIĄGANIE I KONFETTI: ZAKOŃCZONE TECHNICZNIE

- **Zakres:** `app/session/[id]/Logger.tsx`, `app/session/[id]/done/page.tsx`,
  `app/session/[id]/done/PrConfetti.tsx`, `lib/confetti.ts`, testy, dokumentacja stanu.
  Gałąź przebazowana na `main` po scaleniu #28; PR #29 niesie także poprawkę 01A3,
  która nie zdążyła do #28 (podpowiedź nie zamyka się już tapem w tło).
- **Wynik:** rozciąganie zeszło z ekranu Done do loggera jako ostatnia pozycja treningu
  (na podsumowaniu było już po wszystkim). Konfetti: 34 → 60 cząstek, lot 1,9–2,9 s →
  2,8–4,3 s.
- **Znalezisko:** `peak` konfetti był w PIKSELACH, więc im wyższy ekran, tym niżej kończył
  się wystrzał — przy 812 px sięgał okolic liczby-bohatera zamiast topbara. Teraz w `vh`,
  jak `floor`, który z tego samego powodu był w vh od początku.
- **Dowód:** lint i TypeScript czyste; build zielony; unit **158/158**; przeglądarkowe
  **32/32**. Nowy test montuje prawdziwe `PrConfetti` i próbkuje cały lot — zasięgu w górę
  nie sprawdzi ani statyczny HTML, ani sam model cząstki.
- **Czego nie dotknięto:** migracji, seeda, treści treningowej, danych produkcyjnych,
  `prefs` (czas rozciągania bez zmian) oraz nieśledzonych plików właściciela.
- **Zaległości:** [Ty] merge #29 i deploy całej serii SESSION-01A2…01A4. `main` do czasu
  merge'u ma podpowiedź zamykaną tapem w tło (#28 scalił się commit przed poprawką).

### 2026-07-27 · Claude · SESSION-01A3 — PODPOWIEDŹ STARTOWA: ZAKOŃCZONE TECHNICZNIE

- **Zakres:** nowy `app/session/[id]/LoggerHint.tsx`, `lib/useFocusTrap.ts`,
  `lib/bodyScrollLock.ts` (ekstrakcja z `components/ui/bottom-sheet.tsx`), `lib/prefs.ts`,
  wpięcie w `Logger.tsx`, testy jednostkowe i przeglądarkowe, dokumentacja stanu.
- **Wynik:** popover zakotwiczony pod pierwszym wierszem serii ze strzałką w check,
  na przyciemnionym tle, z przyciskiem „Rozumiem". Raz na urządzenie; znika też po
  pierwszej zaliczonej serii. Copy używa czasownika produktu („zalicz serię").
- **Kontrakt overlayów:** portal do `body`, współdzielona blokada tła, Escape, klik w tło,
  pułapka fokusu ze zwrotem fokusu. Lock wyciągnięty do wspólnego modułu, bo dwa
  niezależne liczniki referencji zapisywałyby style `body` nawzajem po sobie.
- **Znalezisko:** `prefs.ts` wołało `localStorage` bez `try/catch`. Poza testem oznacza to
  wywrócenie ekranu treningu w Safari w trybie prywatnym i przy pełnej quocie — osłonięte,
  z testem jednostkowym na rzucający storage.
- **Dowód:** lint i TypeScript czyste; build zielony; unit **157/157**; przeglądarkowe
  **31/31**, w tym TRUST-03 15/15 po ekstrakcji locka (ekstrakcja bez zmiany zachowania).
- **Dogfood:** konto `session01a2@arco.test`, sesja `0a371297-7c3d-4473-ba99-7f7c9b6d30ba`.
  Zmierzone: przyciemnienie `375×812 @ 0,0`, rodzic `BODY`, `body` `position: fixed`, tło
  nieprzewijalne, Tab nie wychodzi poza overlay, po Escape wszystko wraca i podpowiedź
  nie pokazuje się po przeładowaniu.
- **Czego nie dotknięto:** migracji, seeda, treści treningowej, danych produkcyjnych,
  samych `BottomSheet`ów (poza usunięciem zduplikowanego locka) oraz nieśledzonych plików
  właściciela.
- **Zaległości:** [Ty] merge PR i deploy; ryzyko 6 z HANDOFF wciąż otwarte — `useFocusTrap`
  istnieje, ale nie jest jeszcze podpięty do sheetów.

### 2026-07-27 · Claude · SESSION-01A2 — ZWARTY LOGGER I TIMERY: ZAKOŃCZONE TECHNICZNIE

- **Zakres:** `app/session/[id]/**` (SetRow, ExerciseCard, Logger, RoutineTimer,
  TimedStopwatch, done/page, useSessionMutations), `lib/prefs.ts`, `lib/sessionFlow.ts`,
  testy loggera oraz `docs/session-01a2-release-2026-07-27.md`. Praca przejęta po sesji
  Codex, przerwanej na przeglądzie dostępności (wyczerpany limit).
- **Wynik:** wiersz serii **~120 px → 44 px** z checkiem 44×44 w wierszu; menu pod numerem
  serii zamiast stałego `×`; per-ćwiczeniowe boksy rozgrzewkowe usunięte; regulowane timery
  rozgrzewki (2–15 min) i rozciągania (1–10 min) z trwałym `endAt`; świeże wejście bez
  fokusu, aktywnej serii i przywracania scrolla; tap w puste pole kopiuje poprzedni wynik.
- **Dostępność:** klawiatura w menu serii (strzałki/Home/End/Tab/Escape + zwrot fokusu),
  fokus po usunięciu serii, `aria-disabled` zamiast `disabled` na checku przy korekcie,
  licznik bez `aria-live` ze stałym regionem `role="status"` na koniec.
- **Usunięte:** `lib/sessionPreparation.ts` + jego testy (po wycięciu zdania o lekkich
  seriach moduł stracił konsumenta w produkcie), `handleAddWarmupSets()`.
- **Dowód:** lint i TypeScript czyste; build zielony; unit **155/155**; przeglądarkowe
  **29/29** na 320/375/393 px; katalog **907/15**, 17 placeholderów w 54 slotach;
  rekomendacje **60/60**. Trzy nowe testy montują prawdziwy `SetRow` — jeden z nich wykrył
  realny błąd fokusu (referencja do odtworzonego węzła), niewidoczny dla lint/tsc/unit.
- **Dogfood:** pełny przepływ na świeżym koncie: onboarding → plan → logger → seria → Done.
  Potwierdzone `scrollY = 0`, `activeElement = BODY`, 4 wiersze bez scrolla, 0 overflow na
  320 px, timer przeżywający wyjście z ekranu, edycja zaliczonej serii po dotknięciu wiersza.
- **Dane testowe:** konto lokalne `session01a2@arco.test` (lokalna Supabase, nie produkcja)
  zostaje świadomie; sesje `d8af7da9-31b3-44d6-92d3-76cc0c6c7308` (zakończona) i
  `973c8fec-3306-4034-a0bd-14e3bbff0954` (otwarta) do punktowego usunięcia po ID.
- **Czego nie dotknięto:** migracji, seeda, planów i treści treningowej, danych
  produkcyjnych oraz nieśledzonych plików właściciela (`docs/linear-workflow 2.md`,
  prezentacja onboardingowa).
- **Zaległości:** [Ty] merge PR i deploy (procedura `arco-release`); [Ty] checkpoint
  fizycznego iPhone PWA/Safari wspólnie z zaległą regresją R4A i SESSION-01A;
  SESSION-01A3 — jednorazowa podpowiedź startowa w loggerze.

### 2026-07-27 · Codex · SESSION-01A — PRZYGOTOWANIE I ZAKOŃCZENIE: WDROŻONE

- **Zakres:** opcjonalne przygotowanie po bezruchu, 2 lekkie serie przed pierwszym
  ciężkim/power/skill wzorcem i 1 seria przed kolejnym nowym wzorcem, CTA tworzące
  `warmup`, poprawna numeracja/fokus oraz zwinięte, spokojne zakończenie na Done.
- **Semantyka:** `warmup` nie liczy się do ukończenia, objętości, Historii, progresji,
  rekordów ani serwerowego finish guardu. Brak nowego schematu i migracji; SESSION-01B
  pozostaje poza zakresem.
- **Dogfood:** konto QA i znana sesja `4bbf32bf-8da9-468e-a113-f9368a731125`; potwierdzone
  dodanie, kolejność W → 1/2/3, fokus, zapis oraz natychmiastowy reload z odzyskaniem
  szkicu. Test odkrył rozjazd hydracji liczników outboxa — poprawiony i ponownie
  zweryfikowany bez błędów konsoli. Dwie serie testowe `warmup` usunięto punktowo przez UI;
  konto i otwarta sesja pozostają zgodnie z wcześniejszym kontraktem regresji R4A.
- **Dowód:** lint i TypeScript czyste; build zielony; unit **158/158**; przeglądarkowe
  **26/26** na 320/375/393 px; katalog **907/15/308**; rekomendacje **60/60**.
- **Produkcja:** PR [#25](https://github.com/danielm1212/arco/pull/25) scalony jako
  `47f48ae`; Vercel oraz oba joby „Jakość” na PR i `main` zielone. Publiczny login
  po przeładowaniu renderuje się bez błędów konsoli. Brak mutacji danych produkcyjnych.
- **Czego nie dotknięto:** trzech cudzych, nieśledzonych plików dokumentacyjnych, migracji,
  seeda, planów, SESSION-01B oraz danych innych kont.
- **Zaległości:** [Ty] checkpoint iPhone PWA/Safari i starego Service Workera; kolejny
  zakres produktu to PLAN-Q.

### 2026-07-27 · Codex · R4A — AKTYWNA SERIA I CIĄGŁOŚĆ: WDROŻONE

- **Zakres:** jawne stany `draft/ready/completed/edited/resting/minimized/finishing`,
  aktywny wiersz i fokus kg → powtórzenia → „Zalicz”, przejście między ćwiczeniami,
  jawny zapis korekty oraz odtworzenie szkicu, timera, aktywnej serii i scrolla.
- **Dogfood:** nowe konto QA, własna sesja z dwoma ćwiczeniami i pięcioma seriami;
  potwierdzone zaliczenie, brak autozapisu po blurze, korekta, timer, minimalizacja,
  wznowienie i bezpośredni reload. Konto pozostaje wyłącznie do dalszej regresji R4.
- **Dowód:** lint i TypeScript czyste, build produkcyjny zielony, unit **146/146**,
  przeglądarkowe overflow/BottomSheet **25/25** dla 320/375/393 px; brak błędów
  hydracji po świeżym wejściu do sesji.
- **Produkcja:** PR [#23](https://github.com/danielm1212/arco/pull/23) scalony jako
  `53be049`; Vercel i ponowne pełne CI na `main` zielone. Szczegół:
  `r4a-release-2026-07-27.md`.
- **Następny krok:** checkpoint starego cache/iPhone PWA, potem SESSION-01A → PLAN-Q.

### 2026-07-27 · Codex · CORE-0 — KONTROLA PRODUKCJI + FIX HYDRATACJI

- **Stan:** kod PR #19 i cztery migracje CORE-0 są na produkcji; ponowny push nie był potrzebny.
- **Dowód danych:** trigger i funkcje obecne; 32 zaliczone serie, 0 nieprawidłowych; 15 rekordów,
  0 opartych na niekwalifikowanym fakcie. Historia pokazuje 22 kwalifikowane serie, a Postępy
  nie liczą otwartej sesji.
- **Follow-up:** smoke wykrył rozjazd tekstu daty UTC/Warszawa w `history/[id]`. Wspólny
  formatter z `Europe/Warsaw` usuwa błąd; regresje obejmują czas letni i zimowy.
- **Bramka:** 140/140 unit, lint i build produkcyjny zielone. Szczegół:
  `core-0-release-2026-07-27.md`.
- **Następny krok:** R4A; SEC-03 pozostaje osobnym zadaniem właściciela.

### 2026-07-27 · Codex · TRAIN-02A4 — point sync pięciu planów: WDROŻONE

- **Zakres:** minimalna tabela `program_slot_alternatives` z RLS, punktowe uzupełnienie dwóch
  ćwiczeń oraz idempotentny sync P01/P03/P08/P11/P12.
- **Dowód:** lokalny reset/seed/dry-run, RLS A/B, 138/138 testów i lint; backup
  `backups/20260727T110823Z` ze sprawdzonymi sumami; po deployu 15 programów systemowych,
  15 dni/99 slotów/29 alternatyw w pięciu planach i smoke aplikacji bez błędów konsoli.
- **Produkcja:** wdrożona. Aktywne plany, sesje, serie, rekordy i ustawienia nie zmieniły się.
  Pierwsza próba A4 wycofała się w całości po wykryciu brakujących ćwiczeń; druga przeszła po
  ich punktowym uzupełnieniu. Szczegół: `train-02a4-release-2026-07-27.md`.
- **Następny krok:** SEC-03 pozostaje zadaniem właściciela; po kontroli CORE-0 przejść do R4A.

### 2026-07-27 · Codex · CORE-0 hardening — DATA-03/SYNC-01/Done: GOTOWE LOKALNIE

- **Zakres:** semantyka `session_exercises.skipped` w rekordach, poprzednich wynikach,
  statystykach, guidance, Historii, loggerze i Done; migracja
  `20260727110435_data03_exclude_skipped_exercises.sql`; przeliczanie pochodnych po edycji
  zakończonej sesji; odporny outbox z rozróżnieniem retry/quarantine, odzyskiwalnym snapshotem
  i flush bieżącej sesji przed finish; czas treningów timed na Done; policzony czas życia
  confetti. Gałąź `agent/core0-hardening`.
- **Decyzje:** trwały błąd nie jest kasowany ani nie więzi całej kolejki — trafia do lokalnej
  kwarantanny, którą poprawiona edycja zastępuje. Finish nie czeka na operacje innych sesji.
  Kwalifikowany fakt wymaga zakończonej sesji, prawidłowej zaliczonej serii roboczej i
  niepominiętego ćwiczenia.
- **Dowód:** lint czysty; unit **133/133**; build produkcyjny zielony; świeży
  `supabase db reset` ze wszystkimi migracjami; seed **907/15/308**; audyt katalogu bez driftu;
  rekomendacje **60/60**; smoke phase1, phase2, offline i Ekipa zielone; overflow/BottomSheet
  **24/24**. Pierwszy przebieg overflow nie uruchomił Chromium przez sandbox, po kontrolowanym
  uruchomieniu poza sandboxem testy przeszły w całości.
- **Produkcja:** nietknięta. Migracje CORE-0 od `20260724133849` do `20260727110435` nadal
  czekają na backup, dry-run i release; kod czeka na PR/CI/merge.
- **Następny krok:** kontrolowany release według `arco-release`, potem checkpoint produkcyjny
  i urządzeniowy. Po CORE-0 rozpocząć R4A.

### 2026-07-27 · Claude · SEC-04 — odblokowanie bramki `npm audit` (postcss, brace-expansion): ZAKOŃCZONE TECHNICZNIE

- **Zakres:** `package.json` (`overrides` + podbicie devDependency `postcss`), `package-lock.json`.
  Gałąź `agent/sec-audit-postcss-brace-expansion` z czystego `main`. Zero zmian w kodzie apki.
- **Powód:** dwa świeże advisory wysypały krok „Sprawdź podatności produkcyjnych zależności"
  w jobie **Jakość / Kod i treść**, blokując KAŻDY PR (nie tylko bieżący — `main` ma te same
  zależności): `postcss` ≤8.5.17 (path traversal przy auto-ładowaniu source map) i
  `brace-expansion` ≤5.0.7 (DoS przez nieograniczoną ekspansję).
- **Diagnoza:** override `postcss` istniał, ale był zagnieżdżony **tylko pod `next`** — Tailwind
  ciągnął własny, niezałatany egzemplarz (8.5.16). `brace-expansion` wchodzi produkcyjnie przez
  `@serwist/next` → `glob` → `minimatch`.
- **Dwie ślepe uliczki po drodze (zapisane, żeby nikt nie powtórzył):**
  1. globalny override `"postcss": "8.5.23"` → `npm error EOVERRIDE` (kolizja z bezpośrednią
     devDependency). Rozwiązanie: podbić bezpośrednią zależność do `^8.5.23` i użyć wzorca
     npm `"postcss": "$postcss"`;
  2. globalny override `"brace-expansion": "5.0.8"` **zepsuł ESLint** (`TypeError: expand is not
     a function`) — `@eslint/config-array` używa minimatch v3, który woła `expand()` jako
     funkcję, a v5 eksportuje obiekt. Rozwiązanie: **zawęzić override do podrzewa
     `@serwist/next`**, czyli dokładnie tam, gdzie siedzi podatna ścieżka produkcyjna.
- **Dowód:** `npm audit --omit=dev` → **0 podatności** (to jest bramka CI); `npm run lint` czysty
  (po zawężeniu overrideu); `test:unit` 117/117; `npm run build` zielony. Wersje potwierdzone:
  `postcss@8.5.23` we wszystkich gałęziach, `brace-expansion@5.0.8 overridden` pod serwistem.
- **Świadomie NIE naprawione:** pełny `npm audit` (z dev) nadal pokazuje 9 high w łańcuchu
  `eslint-config-next` → `eslint-plugin-react` → `minimatch`. To zależności **deweloperskie**,
  bramką CI jest `--omit=dev`, a naprawa wymaga `npm audit fix --force` (zmiany łamiące w
  toolingu lintu). Osobna decyzja, nie doklejam jej do odblokowania bramki.
- **Stan:** scalone do `main` jako PR #18.

### 2026-07-27 · Claude · MOMENT-01 — confetti po rekordzie: ZAKOŃCZONE TECHNICZNIE

- **Zakres:** `lib/confetti.ts` (model cząstki, czysta funkcja z wstrzykiwanym RNG),
  `app/session/[id]/done/PrConfetti.tsx` (komponent kliencki), `app/globals.css` (keyframes
  `confetti-drift`/`confetti-fall`/`confetti-tumble`, zmienne `--confetti-1..5` z przełączeniem
  dark, pas bezpieczeństwa w bloku reduced-motion), `app/session/[id]/done/page.tsx` (jedna
  linia pod `hasPR`), `tests/confetti.test.ts`. Gałąź `agent/moment-pr-confetti`, z czystego
  `main` (niezależne od CORE-0). Zero nowych zależności.
- **Decyzje właściciela:** paleta rust + violet + amber (jawny wyjątek od reguły v1.4 — zapisany
  jako **D-20** w `decyzje-produktowe.md`, żeby przyszła sesja tego nie „naprawiła"), gęstość
  pełna (34 cząstki), wyzwalanie bez zmian (ten sam `hasPR` co nagłówek), tor = wystrzał.
- **Fizyka (research, nie zgadywanie):** tor to parabola z ROZDZIELENIA OSI na dwa zagnieżdżone
  elementy (X z oporem `ease-out`, Y wznoszenie `ease-out` → opadanie), bo tak właśnie rozkłada
  się rzut ukośny; opadanie kończy PRĘDKOŚCIĄ GRANICZNĄ, nie przyspieszaniem bez końca
  (canvas-confetti modeluje to jako `velocity *= 0.9` co klatkę); obrót w dwóch osiach o
  niewspółmiernych okresach (720° : 584° ≈ 1 : 0,81), bo spadające kartki mają różne reżimy
  (flutter/tumble, przejście przy Fr ≈ 0,67) i jeden wspólny rytm od razu czyta się jako sztuczny.
  Źródła: varun.ca/confetti, canvas-confetti, Phys. Rev. Lett. 81, 345, J. Fluid Mech.
- **Self-review skillem `arco-motion-review` — dwa findingi, oba naprawione:**
  1. `filter: brightness()` w keyframie łamał **S6 GPU-only** („wyłącznie transform i opacity").
     34 elementy × filter to 34 warstwy kompozytowe, a nie mam pomiaru na słabszym Androidzie —
     usunięte. Skracanie perspektywiczne z rotacji 3D i tak niesie efekt papieru.
  2. `animation: … infinite` opierało się na tym, że timer JS zdąży odmontować warstwę (**S3**).
     Zastąpione policzonym `animation-iteration-count` (`ceil(duration/spin) + 1`) — obrót kończy
     się sam, nawet gdyby odmontowanie zawiodło. Test pilnuje, że nie kończy się PRZED lotem.
- **Test złapał realny błąd modelu:** przy niezależnym losowaniu szerokości i wysokości
  skalowanie potrafiło dać kwadrat 11×11, a kwadrat w obrocie 3D czyta się jak migający piksel,
  nie jak papier. Wysokość WYNIKA teraz z szerokości (proporcja 1:1,5–1:2,4).
- **Dowód:** lint czysty, `test:unit` **120/120** (3 nowe testy MOMENT-01), `build` zielony.
  Weryfikacja w realnej apce (świeże konto, prawdziwy trening z rekordem, 375×812): warstwa
  renderuje się z **34 cząstkami**, `aria-hidden="true"`, `pointer-events: none`,
  `position: fixed`, `z-index: 30`, `perspective: 600px`, `transform-style: preserve-3d`;
  pięć barw rozwiązuje się dokładnie do tokenów (rust-500/400, violet-500/400, amber), a po
  dodaniu klasy `.dark` **wszystkie schodzą o stopień jaśniej** (rust-400/300, violet-400/300);
  każdy papierek wyższy niż szerszy (9×17, 10×16, 8×19…); reguła
  `@media (prefers-reduced-motion) { .confetti-layer { display: none !important } }` jest
  obecna w SKOMPILOWANYM CSS (sprawdzone przez `document.styleSheets`).
- **Czego NIE udało się zweryfikować i dlaczego:** ruchu w locie (rozrzut cząstek, koziołkowanie)
  nie obejrzałem w apce — preview trzyma dokument w stanie `visibilityState: "hidden"`, więc
  `rAF` i animacje CSS nie tykają (widać to też po zamrożonym count-upie „0 kg"; cząstki stoją
  w punkcie startu). Sama jakość ruchu była walidowana na POC z IDENTYCZNYMI keyframe'ami.
  Do checkpointu [Ty] na urządzeniu: płynność wystrzału i brak gubienia klatek na Androidzie
  oraz zachowanie przy włączonym „Ogranicz ruch" w iOS.
- **Higiena:** na czas badania DOM podniosłem tymczasowo `CONFETTI_LIFETIME_MS` do 600000
  (bo 3,4 s okna nie dało się złapać przy ukrytym dokumencie) — **przywrócone do 3400**,
  zweryfikowane grepem, a lint/testy/build przebiegły ponownie już na wartości produkcyjnej.
  Konto testowe usunięte po ID.
- **Do obserwacji w H2 (zapisane w backlogu):** rekord powstaje przy KAŻDYM pierwszym wykonaniu
  ćwiczenia, więc na pierwszych treningach confetti odpali się seryjnie i może spowszednieć.
  Próg „tylko pobity rekord" świadomie odłożony.
- **Czego nie dotknięto:** produkcji, migracji, danych, loggera, CORE-0.
- **Następny krok:** [Ty] review + merge PR; checkpoint urządzeniowy przy najbliższej okazji.
  Równolegle wraca kolejka CORE-0: **SYNC-01** (trwały błąd outboxa nie blokuje kolejki).

### 2026-07-24 · Claude · CORE-0 / DATA-03 — jedna definicja kwalifikowanego faktu: ZAKOŃCZONE TECHNICZNIE

- **Zakres:** nowa migracja `20260724143658_data03_qualified_fact_finished_only.sql`
  (`recompute_personal_records()`, `previous_working_set()`, `previous_session_sets()` — dodane
  `s.finished_at is not null`), `lib/repPRs.ts` (zagnieżdżony filtr
  `session_exercises.sessions.finished_at`), `app/exercise/[id]/page.tsx` (`sessions!inner` +
  filtr), `app/progress/stats.ts` (`periodStats`/`getStrengthTrends` przez nowy
  `lib/qualifiedFacts.ts::finishedSessions`), `scripts/smoke-phase2.ts` (poprawka testu —
  patrz niżej). Gałąź `agent/core-0-data-03`.
- **Znalezisko (audyt przed kodem):** grep + czytanie wszystkich miejsc agregujących
  "fakt treningowy" (rekordy, trendy, Postępy, guidance) wykrył **pięć** miejsc bez warunku
  `finished_at is not null` — seria zaliczona w OTWARTEJ sesji mogła utworzyć rekord, wejść
  do trendu siły/e1RM, zasilić rep-PR albo "poprzedni wynik" progresji. Home (`app/page.tsx`)
  i Ekipa (`team_streak_warsaw.sql` i inne funkcje) już miały ten warunek poprawnie —
  potwierdzone czytaniem kodu przed jakąkolwiek zmianą, nie zgadywaniem.
- **Kontrakt:** kwalifikowany fakt = zaliczona seria robocza (`completed=true`,
  `set_type='working'`) w ZAKOŃCZONEJ sesji (`finished_at is not null`). Otwarta sesja może
  pokazać wynik wyłącznie prowizorycznie w samym loggerze (już tak działało — nie ruszone).
  Dwa niemal identyczne zapytania w `progress/stats.ts` scalone w jedną funkcję
  `finishedSessions()` — realne "jedna definicja", nie pięć kopii tej samej reguły.
- **Świadomie POZA zakresem, odnotowane jako finding:** `previous_working_set`/
  `previous_session_sets` porządkują po `s.started_at desc limit 1` względem WSZYSTKICH innych
  sesji — poprawne dla live loggingu (niezmiennik jednej otwartej sesji chroni), ale przy
  edycji BARDZO starej historii z równolegle otwartym innym treningiem "poprzedni wynik" może
  pokazać dane z sesji late-r niż ta edytowana (błędny kierunek czasu, nie tylko otwarta-vs-
  zakończona). Rzadki przypadek, osobny problem od tego, co naprawia DATA-03 — zgłoszony w
  HANDOFF/planie, nie naprawiony w tym PR (jeden PR = jedno zadanie).
- **Dowód:** `npm run build` zielony; Docker padł w trakcie (`supabase_db_arco` exited 137,
  `realtime` crash-loop) po nieudanym pierwszym `db reset` — naprawione `supabase stop` +
  `supabase start` (dane odtworzone z wolumenu, zero utraty), potem `db reset` przeszedł
  czysto z nową migracją. `npm run seed` → 907/15/308; `validate:training`/
  `validate:recommendations` zielone; lint czysty; `test:unit` 117/117; `smoke`/`smoke:offline`
  zielone. **`smoke:phase2` początkowo czerwony** („PR max_weight = undefined, oczekiwano 120")
  — test tworzył sesję BEZ `finished_at` i oczekiwał policzonego rekordu: dokładnie stary,
  błędny kontrakt, który DATA-03 świadomie zamyka. Naprawione dodaniem `finished_at` przy
  tworzeniu sesji testowej; po poprawce zielony.
- **Weryfikacja end-to-end w przeglądarce (świeże konto):** zalogowano 150kg×3 w OTWARTEJ
  sesji freestyle → `/exercise/Barbell_Squat` poprawnie „Jeszcze go nie robiłeś" (zero
  historii/rekordów/trendu) → `/progress` poprawnie 0 sesji/0 serii/0 objętości/brak rekordów
  → zakończono sesję → te same strony natychmiast poprawnie pokazują 150kg, e1RM 165kg,
  objętość 450kg, rekord 3 powt./150kg → nowa druga sesja z tym samym ćwiczeniem poprawnie
  czyta "poprzedni wynik": „Cel na dziś: 150kg × 4+ powt. (ostatnio 3)". Oba konta testowe
  usunięte po ID po weryfikacji.
- **Czego nie dotknięto:** produkcji, SYNC-01, `body_metrics`, kierunku czasu w
  `previous_working_set`/`previous_session_sets` (odnotowane, nie naprawione).
- **Następny krok:** [Ty] otworzyć/zmergować PR `agent/core-0-data-03`, potem release migracji
  (`arco-release`, dry-run). Ostatni kawałek CORE-0: **SYNC-01** (trwały błąd outboxa nie
  blokuje kolejki).

### 2026-07-24 · Claude · CORE-0 / DATA-02 — kanoniczne jednostki ciężaru: ZAKOŃCZONE TECHNICZNIE

- **Zakres:** `lib/format.ts` (nowe `weightToDisplay`/`weightToCanonicalKg`, `formatSet`
  konwertuje), `app/session/[id]/SetRow.tsx` (granica wejścia: kg state ↔ display string dla
  `weight`/`added_weight`, max/placeholder też w jednostce profilu), `app/session/[id]/Logger.tsx`
  (objętość + dialog przeglądu wagi, progi 300/500 z `setValidation` zamiast magic numbers),
  `lib/guidance.ts` (`progressionTarget` konwertuje `prev.weight`/`repPR.weight` do jednostki
  profilu tuż przed budową tekstu), `app/exercise/[id]/page.tsx` (trend + rekordy powtórzeń),
  `app/history/[id]/page.tsx` (objętość + lista PR), `app/session/[id]/done/page.tsx` (hero
  objętości), `app/progress/stats.ts` (`getStrengthTrends`), `app/progress/page.tsx`
  (`cur.volume`), `app/progress/sections.tsx` (`RecordsSection`). Nowa migracja
  `20260724141047_data02_canonical_kg_weights.sql` (trigger nie dotyczy — to zwykły UPDATE
  jednorazowy). Gałąź `agent/core-0-data-02`.
- **Kontrakt:** kg jest kanoniczną jednostką zapisu wszędzie (React state, server action, DB) —
  `unit_system` jest WYŁĄCZNIE preferencją prezentacji. Logika domenowa (walidacja zakresów,
  e1RM, `recompute_personal_records`, `LIMITS.weight`) zostaje w kg bez żadnych zmian; konwersja
  żyje wyłącznie na granicy input/output. Migracja przelicza istniejące konta `unit_system='lbs'`
  z funtów na kg (jednorazowo, `WHERE unit_system='lbs'`) — dziś brak takich kont, więc na
  świeżej/produkcyjnej bazie to bezpieczny no-op; zapisane na przyszłość.
- **Świadomie POZA zakresem:** `user_settings.bar_weight`/`available_plates` — sprawdzone w
  kodzie: zero odwołań poza wygenerowanymi typami, nigdy nie mają UI do edycji, zawsze
  domyślne z bootstrapu w kg — migracja by je BŁĘDNIE przeliczyła, gdyby je dotknęła (nigdy nie
  były w jednostce profilu). `body_metrics.weight` (Postępy/Ciało) ma identyczną klasę problemu
  (kg/lbs jako etykieta bez konwersji w `BodyForm.tsx`), ale to osobna tabela i osobny ekran —
  zgłoszone jako follow-up w HANDOFF, nie rozszerzone tutaj (jeden PR = jedno zadanie).
- **Dowód:** `npm run build` zielony; `supabase db reset` czysty na świeżej bazie (migracja
  no-op, 0 wierszy); `npm run seed` → 907/15/308; `validate:training`/`validate:recommendations`
  zielone (17 placeholderów bez wzrostu, 60/60); lint czysty; `test:unit` **117/117** (nowy test
  `weightToDisplay`/`weightToCanonicalKg` + poprawiony `formatSet` na `lbs` — stary test
  asercjonował błędne zachowanie „60kg → wyświetl 60lbs", teraz poprawnie „60kg → 132.3lbs");
  `smoke`/`smoke:phase2`/`smoke:offline` zielone (konto domyślne `kg`, transparentne, bez
  regresji happy path). `smoke:team` NIE uruchomiony — brak lokalnego `TEAM_TEST_PASSWORD`,
  niezwiązane.
- **Weryfikacja end-to-end w przeglądarce (świeże konto, `unit_system` przełączony na `lbs`
  przez UI Ustawień):** dodano serię 225lbs × 5 we freestyle treningu (Barbell Squat) →
  zapis w bazie potwierdzony bezpośrednim SQL: `weight=102.06` (=225×0,45359237, kanoniczny kg)
  → UI natychmiast po zaliczeniu nadal pokazuje „225" (round-trip transparentny) → Done: „1125
  lbs" (objętość 225×5, poprawnie w lbs, nie w kg) → Historia: „objętość 1125 lbs",
  „225lbs × 5", rekordy „225lbs"/„262.6lbs" e1RM → `/exercise/Barbell_Squat`: trend „262.6lbs",
  rekord powtórzeń „5 powt. 225 lbs" → `/progress`: „1125 Objętość lbs",
  „e1RM 262.6lbs · maks. 225lbs". Wszystkie liczby matematycznie spójne (e1RM Epley:
  102.06×(1+5/30)=119.1kg→262.6lbs). Konto testowe usunięte po ID po weryfikacji.
- **Czego nie dotknięto:** produkcji, DATA-03, SYNC-01, `body_metrics`/Postępy-Ciało (follow-up).
- **Następny krok:** [Ty] otworzyć/zmergować PR `agent/core-0-data-02`, potem release migracji
  (`arco-release`, dry-run — migracja jest no-op dziś, ale i tak przez pełną procedurę).
  Kolejny kawałek CORE-0: DATA-03 (jedna definicja kwalifikowanego faktu treningowego).

### 2026-07-24 · Claude · CORE-0 / DATA-01 — poprawna zakończona seria: ZAKOŃCZONE TECHNICZNIE

- **Zakres:** `lib/setValidation.ts` (nowa `getCompletionBlockReason`), `app/session/[id]/useSessionMutations.ts`
  (blokada w `handleToggle`/`handleTimedComplete` z toastem, przed zmianą stanu), `app/actions/sets.ts`
  (`assertCompletableSet` — druga linia obrony w `addSet`/`upsertSet`/`updateSet`), nowa migracja
  `supabase/migrations/20260724133849_data01_completed_set_guard.sql` (trigger `assert_valid_completed_set`
  — trzecia/ostatnia linia obrony w DB), `tests/set-validation.test.ts` (nowy test). Gałąź
  `agent/core-0-data-01`, PR [#14](https://github.com/danielm1212/arco/pull/14) otwarty.
- **Kontrakt:** zaliczona seria (`completed=true`) wymaga: weighted → ciężar I powtórzenia;
  bodyweight → powtórzenia; timed → czas > 0. Draft (`completed=false`) zostaje bez zmian —
  pole może być puste podczas wpisywania. Ten sam warunek w UI, server action i DB, żeby
  żaden inny klient (offline flush, przyszły import) nie ominął reguły.
  DATA-02/DATA-03/SYNC-01 (CORE-0) zostają do kolejnej sesji.
- **Dowód:** `npm run build` zielony po `rm -rf node_modules && npm ci` (znów ~139 duplikatów
  iCloud „ 2", ten sam problem co w TRUST-02 — warto rozłączyć sync iCloud dla repo, patrz
  pamięć `arco-node-modules-icloud-dupes`); `supabase db reset` czysty na świeżej bazie
  (trigger tworzy się bez błędu); `npm run seed` → 907/15/308; `validate:training` i
  `validate:recommendations` zielone (17 placeholderów bez wzrostu, 60/60); lint czysty;
  `test:unit` 116/116 (nowy test `getCompletionBlockReason` — weighted/bodyweight/timed ×
  odrzucone/przyjęte); `smoke`, `smoke:phase2`, `smoke:offline` zielone (w tym normalny zapis
  100kg×8 przechodzi bez przeszkód — guard nie łapie poprawnych danych). `smoke:team` NIE
  uruchomiony — brak lokalnego `TEAM_TEST_PASSWORD`, niezwiązane z tą zmianą.
- **Weryfikacja triggera DB (osobno od smoke'ów):** ręczny SQL w transakcji z `rollback` na
  końcu (zero trwałych danych) — 7 przypadków: weighted bez reps (odrzucone), weighted z
  danymi (OK), bodyweight bez reps (odrzucone), bodyweight z reps (OK), timed z duration=0
  (odrzucone), timed z duration=45 (OK), completed=false z pustymi polami (zawsze OK).
  Wszystkie 7 zgodne z oczekiwaniem; potwierdzone `select count(*) = 0` po rollbacku.
- **Weryfikacja UI (przeglądarka, świeże konto testowe):** freestyle trening, ćwiczenie
  weighted, próba zaliczenia pustej serii → toast „Wpisz ciężar i powtórzenia, zanim
  zaliczysz serię.", checkmark zostaje pusty; po wpisaniu 40kg×10 zaliczenie przechodzi
  normalnie i startuje przerwa. Konto testowe usunięte po ID po teście.
- **Czego nie dotknięto:** produkcji (migracja tylko lokalnie), danych innych sesji, DATA-02/03/SYNC-01.
- **Następny krok:** [Ty] review + merge PR `agent/core-0-data-01` (zawiera migrację —
  po merge kontrolowany release migracji zgodnie z `arco-release`, dry-run przed produkcją).
  Potem DATA-02 (kanoniczne jednostki) jako kolejny kawałek CORE-0.

### 2026-07-24 · Claude · TRUST-02 — fresh-account smoke F0.7: ZAKOŃCZONE

- **Zakres:** wyłącznie weryfikacja na lokalnym stacku (Supabase local, `next start`
  po `npm run build`); brak zmian w kodzie/schemacie. Dwa świeże konta testowe
  bootstrapowane przez `bootstrap:test-user`.
- **Env:** `node_modules` znowu miał ~139 duplikatów „ 2" (iCloud Desktop) —
  `tsc` wywalał build na `@types/react 2`. Naprawione czystym `rm -rf node_modules && npm ci`
  (nie punktowym usuwaniem, bo skala uzasadniała pełny reinstall). Ryzyko powrotu
  pozostaje, dopóki repo/iCloud sync nie jest rozłączone — patrz `arco-node-modules-icloud-dupes`
  w pamięci agenta.
- **Wynik:** wszystkie ścieżki F0.7 zielone, zero P0/P1:
  1) **Pełny onboarding** (7 kroków, siłownia/intermediate/Siła/całe ciało/3×tydz.) →
     aktywacja planu → Home pokazuje poprawny plan i badge `0/3`; ustawienia
     (jednostki, priorytet, kierunek, cel) trwałe po reload, potwierdzone przez DOM
     (`border-primary` na wybranych opcjach), nie tylko wizualnie.
  2) **Skip na starcie** (krok 0 „Pomiń") → poprawny empty state Home („Zacznij od
     planu”, CTA Wybierz program/Własny trening), badge `0/2` (default), trwałe po reload.
  3) **Usunięcie historii — kluczowa regresja F0.7:** zalogowałem 1 serię, zakończyłem
     trening (przeszedł LOG-04 guard niepełnej sesji poprawnie), usunąłem trening z
     Historii (`DeleteSessionButton` → `deleteSession`) — Home **nie** wrócił do
     onboardingu, badge poprawnie spadł z powrotem do `0/3`. Potwierdza to również kod:
     `app/page.tsx` liczy `completed` wyłącznie z `settings.onboarding_completed_at`,
     zero zależności od tabeli `sessions`.
  4) **Nowe urządzenie (proxy):** druga zakładka/sesja z tym samym cookie od razu
     pokazuje właściwy stan Home bez onboardingu — potwierdza, że stan jest w 100%
     server-side (brak flag klienckich). Pełny checkpoint na fizycznym iPhone PWA
     pozostaje zadaniem [Ty] razem z TRUST-01/03.
- **Znaleziony false-positive (nie bug):** w trakcie testu współrzędnościowe kliknięcia
  `computer` (nie przez `ref`) trafiały poza cel przez rozjazd skali screenshot (800×450)
  vs realny viewport (1280×720) — raz zresetowało to onboarding do kroku 0 pozornie
  bez powodu. Powtórzone wyłącznie klikami przez `ref` — zero regresji w produkcie.
  Do wiadomości innych sesji korzystających z Browser pane: wolej `ref`, nie surowe
  współrzędne z zrzutu.
- **Testy:** `npm run build` zielony po `npm ci` (TS OK, wszystkie route'y). Nie
  uruchamiano `test:unit`/`test:overflow`/walidatorów — brak zmian w kodzie produktowym.
- **Dane testowe:** dwa konta (`trust02-*@example.test`) utworzone przez
  `bootstrap:test-user` na **lokalnym** Supabase, usunięte punktowo po ID przez
  `auth.admin.deleteUser` po teście. Jeden trening testowy usunięty przez UI w
  ramach samego scenariusza. Zero dotknięcia produkcji.
- **Czego nie dotknięto:** produkcji, migracji, danych innych sesji, kodu aplikacji.
- **Następny krok:** TRUST-02 może przejść do „zamknięte" w `backlog-produktu.md`/
  `plan-sprintow-2026-07.md` (fresh-account smoke zielony). Pozostaje checkpoint
  [Ty] na fizycznym iPhone PWA/Safari (TRUST-01/03 + nowe urządzenie realne).
  Kolejny logiczny krok po Q1: CORE-0 (czeka też na SEC-03).

### 2026-07-23 · Claude · podmiana ikon 3D na Arco Performance Objects v1.1: ZAKOŃCZONE TECHNICZNIE

- **Zakres:** `components/MomentIcon3D.tsx` (uproszczony do jednego motywo-neutralnego `<Image>` —
  v1.1 nie ma osobnych wariantów light/dark, patrz `strategy/arco-3d-icon-system.md` §8),
  `public/icons-3d/` (7 nowych plików `icon-3d-{team,history,progress,plan,workout-complete,
  body-measurements,equipment}.png`, usunięte 14 osieroconych plików starego pakietu 3dicons.co),
  8 wywołań `MomentIcon3D` w `app/page.tsx`, `app/progress/page.tsx`, `app/body/page.tsx`,
  `app/history/page.tsx`, `app/history/add/page.tsx`, `app/history/[id]/page.tsx`,
  `app/ekipa/TeamPanel.tsx`, `components/WelcomeOverlay.tsx`, oraz `prototypes/product-vision-poc/app.js`
  (2 twarde odwołania poza komponentem). Commit `76572e4` na gałęzi
  `agent/icon-swap-arco-performance-objects`, wypchnięty; PR [#13](https://github.com/danielm1212/arco/pull/13)
  otwarty (jeszcze nie zmergowany). Baza i produkcja nietknięte.
- **Mapowanie:** gym→plan (home „Zacznij od planu”), history/fire→history, target→progress,
  calendar→history (reużyte), tick→workout-complete, rocket→team (Ekipa onboarding),
  rocket→equipment (WelcomeOverlay krok 8 „Plan gotowy” — na życzenie właściciela, torba
  sprzętowa pasuje semantycznie lepiej niż `05-plan`), notebook→body-measurements.
  5 ikon (`rest`, `consistency`, `personal-record`, `swap-exercise`, dodatkowo `03-training`)
  zostaje niewykorzystanych, gotowych pod przyszłe ekrany.
- **Testy:** `npm run lint` czysty, `npm run build` zielony (TS OK, wszystkie route'y). Weryfikacja
  wizualna na koncie testowym (localhost:3000, `next start`) — home/plan, progress, history,
  history/add, ekipa/team, body/measurements sprawdzone light **i** dark (przełącznik w
  Ustawieniach); jeden plik PNG działa czytelnie na obu tłach bez halo, zgodnie z założeniem v1.1.
  Motyw po teście przywrócony do „System”. Nie sprawdzono wizualnie: `WelcomeOverlay` krok 8
  (wymaga ścieżki „Aktywuj plan” z rekomendowanym programem, nie odtworzonej w tej sesji —
  sam plik `icon-3d-equipment.png` obejrzany bezpośrednio, ten sam komponent/pipeline co
  potwierdzone ekrany) oraz `history/[id]` banner potwierdzenia (wymaga realnego zapisu treningu).
  Nieuruchomione (niezwiązane): `test:unit`, `test:overflow`, walidatory treści.
- **Bonus:** zamyka ryzyko z `backlog-produktu.md` `VISUAL-04` (niepotwierdzona licencja
  3dicons.co) — nowy zestaw jest własnym projektem Arco.
- **Aktualizacja tej samej sesji:** na prośbę właściciela usunięty też `assets-source/icons-3d/`
  (pośrednie pliki starego pipeline'u recolorowania, ~20 MB, nikt ich już nie referencuje) oraz
  surowy pakiet `3dicons-*.png` w `../3d icons/` (poza repo Git) — zachowany tylko nowy master
  `../3d icons/icons/png-512-alpha/` pod przyszłe generowanie. Commit + push + PR #13 wykonane.
- **NIE dotknięto:** danych, migracji, produkcji.
- **Zaległości:** [Ty] review + merge PR #13; wizualna weryfikacja `WelcomeOverlay` krok 8
  i `history/[id]` bannera przy najbliższej okazji.

### 2026-07-22 · Claude · odświeżenie skilli: 4 nowe + fix Notion→Linear

- **Zakres:** `.claude/skills/` — cztery nowe skille + poprawka warstwy zadań. Gałąź `agent/skills-refresh`. Kod produktu, baza i produkcja nietknięte.
- **Nowe skille:** `arco-content-review` (bezpieczeństwo treści ćwiczeń — kontrakt z backlog §3, blizny Hip Thrust/Chin-Up), `arco-debug` (systematyczna diagnoza — odtwórz na właściwej powierzchni → przyczyna → dowód → guard), `arco-session-start` (bezpieczny start przy wielu agentach — gałąź/WIP/rezerwacje przed edycją), `arco-a11y-review` (WCAG 2.1 AA — fokus/kontrast/targety/zoom/aria/długie PL; konsoliduje AA rozproszone po wytycznych/palecie/DoD; symetria do motion-review).
- **Fix:** `arco-session-close` (krok 5) i `arco-release` (krok 6) mówiły „Notion" — poprawione na Linear, z zasadą **Linear tylko na prośbę właściciela**; lokalne docs zawsze. Dodany `docs/linear-workflow.md` (ściąga Linear dla zespołu).
- **NIE dotknięto:** treści `arco-migration`/`arco-session-close` poza fixem Notion (dojrzałe, incydento-sterowane); żadnego kodu, migracji, danych.
- **Dodatkowo (ta sama paczka):** `docs/workflow-zespolu.md` — standard współpracy Daniel+Piotr (PR-y, krótkie gałęzie, claim w Linear, `main` chroniony); `arco-release §4` zmieniony z „push na main" na „merge PR" (spójność z chronionym mainem). Do włączenia po stronie [Ty]: branch protection na `main` (require PR + status check „Jakość").
- **Zaległości:** [Ty] review + merge PR gałęzi `agent/skills-refresh`; włączyć branch protection na `main`.

### 2026-07-22 · Claude · FIX 2 resztki buga sticky/sheet: nakładka safe-area + skok scrolla sheet-w-sheecie

- **Zakres:** `app/session/[id]/Logger.tsx` (usunięty `-mt-[var(--safe-area-top)]` z kontenera),
  `components/ui/bottom-sheet.tsx` (współdzielona, zliczana blokada scrolla body),
  `tests/e2e/overflow.test.ts` (harness z zagnieżdżonym sheetem + testy nakładki, z kontrolami negatywnymi).
- **Stan:** **ZAKOŃCZONE**, zweryfikowane w realnej apce (preview, lokalny stack); commit na main.
- **Objaw 1 (header zasłaniał pas priorytetu):** kontener Loggera kasował globalne `pt-safe`
  ujemnym marginesem → naturalny top headera = 0 < offset sticky (safe-area) → sticky OD RAZU
  zsuwał header o pas safe-area w dół, nakrywając pierwszą treść main. Fix: bez `-mt` header
  zachowuje się jak `PageHeader` (naturalna pozycja == pozycja przyklejenia). Poprzedni e2e
  tego nie łapał, bo mierzył tylko stan PO scrollu — teraz jest asercja przy scrollu 0.
- **Objaw 2 (skok strony po „Podmień ćwiczenie"):** blokada body per instancja sheeta.
  Menu karty zamyka się i w tym samym commicie otwiera się SwapPanel (druga instancja):
  cleanup pierwszego przywracał scroll w rAF, efekt drugiego czytał `window.scrollY` ZANIM
  rAF się wykonał → zapamiętywał 0 → po zamknięciu SwapPanelu `scrollTo(0,0)`. Fix: jedna
  modułowa blokada z licznikiem referencji; kolejny sheet przejmuje zapamiętaną pozycję.
- **Dowód:** e2e 24/24 ✓ (nowy test sheet-w-sheecie na starym kodzie PADA z przewidzianym
  komunikatem — sprawdzone stashem); realna apka w preview: lock trzyma `-884px` przy
  zagnieżdżonym sheecie, po zamknięciu scroll wraca 884→884, przy scrollu 0 header nie
  nachodzi na aside (odstęp 16 px przy wymuszonym safe-area 47 px). Dane testowe sprzątnięte
  po ID sesji; konto `sticky-check@example.test` zostaje na LOKALNYM stacku do retestów.
- **Obok:** `.env.local` — nieaktualne LAN IP supabase (192.168.100.16→53, IP maszyny się
  zmieniło); naprawione, bez tego lokalna apka nie logowała. W `node_modules` były zduplikowane
  katalogi „* 2" (`@types/node 2` itd.) wywalające build — usunięte dwa blokujące; przy okazji
  warto zrobić czysty `npm ci`.
- **Następny krok:** retest [Ty] na iPhone PWA: scroll w treningu → header trzyma się pod
  status barem i NIE zasłania pasa priorytetu; ⋯ → Podmień → zamknij → strona zostaje w miejscu.

### 2026-07-22 · Claude · FIX sticky header — WŁAŚCIWA przyczyna (cn/tailwind-merge gubił `sticky`)

- **Zakres:** `app/session/[id]/Logger.tsx` (usunięte `relative` z headera), `tests/sticky-header.test.ts`
  (nowy, przez realne `cn()`), `app/globals.css` (sprostowany komentarz — `clip` to defensywa, nie fix).
- **Stan:** **ZAKOŃCZONE** (fix), zweryfikowane; commit lokalny, czeka na push + PR.
- **Przyczyna (potwierdzona empirycznie):** header składany `cn(STICKY_HEADER_SAFE_AREA, "relative z-10 …")`.
  `cn` = `twMerge(clsx())`; `sticky` (w stałej) i `relative` (dodane) to konflikt `position` —
  tailwind-merge zostawia ostatnie (`relative`) i USUWA `sticky`. Header renderował się jako
  `position: relative` → uciekał z treścią. `twMerge('sticky …','relative …')` → bez `sticky`
  (sprawdzone `node -e`). `PageHeader` używa `cn(…, "z-30")` bez `relative` — dlatego jego sticky
  działał i bug był tylko w loggerze.
- **Sprostowanie:** wcześniejszy fix `overflow-x: hidden→clip` (PR #10, na prodzie) NIE był przyczyną —
  zweryfikowane na żywym prodzie (Claude in Chrome): `body overflow-x:clip, overflow-y:visible`,
  scroll na `html`, a bug dalej występował (repro na desktop Edge). `clip` zostaje jako nieszkodliwa
  defensywa. Pierwsza diagnoza (overflow) była błędna — poszła za podręcznikowym odruchem zamiast pomiaru.
- **Dowód / uszczelnienie:** nowy `tests/sticky-header.test.ts` (node:test) idzie przez `cn()` i pilnuje,
  że `sticky` przeżywa; ma negatywny kontrol (z `relative` `sticky` znika). To łapie klasę buga,
  której stary e2e nie widział, bo składał klasy stringiem bez tailwind-merge. Testy 3/3 ✓, lint ✓.
- **Następny krok:** push gałęzi + PR → merge → retest [Ty] (header zostaje przy scrollu). Do rozważenia
  osobno: reguła w arco-motion-review/review, by NIE dokładać `position` obok `STICKY_HEADER_SAFE_AREA`.

### 2026-07-22 · Claude · FIX sticky header (overflow-x hidden→clip)

- **Zakres:** `app/globals.css` — `body { overflow-x: hidden }` → `overflow-x: clip`. Zgłoszenie
  [Ty] (iPhone PWA): sticky header loggera nie przykleja się (ucieka z treścią), a po
  otwarciu/zamknięciu bottom sheetu „pojawia się" i treść przeskakuje.
- **Stan:** **ZAKOŃCZONE** (fix), commit lokalny. NIE wypchnięte — shipped UI, czeka na retest
  [Ty] na urządzeniu (jesteś w trakcie).
- **Wynik / przyczyna:** `overflow-x: hidden` per spec wymusza `overflow-y: auto` → `<body>`
  staje się kontenerem przewijania, a sticky liczy się względem body, gdy realnie przewija się
  viewport → sticky nigdy się nie załącza. Sheet robi `body{position:fixed}`+`scrollTo`, więc po
  zamknięciu scroll ląduje przy górze i header „wraca" (to przeskok, nie działający sticky).
  `clip` tnie poziomy nadmiar BEZ tworzenia scrollportu → sticky działa. Naprawia wszystkie
  sticky headery w apce (logger + PageHeader), nie tylko logger.
- **Dowód:** przyczyna potwierdzona w kodzie (globals.css:225, `STICKY_HEADER_SAFE_AREA`
  `top: var(--safe-area-top)`); poziomy overflow nadal cięty (clip == hidden pod tym kątem),
  więc e2e overflow guards trzymają.
- **Następny krok:** [Ty] retest na iPhone PWA (scenariusz: scroll w treningu → header ma zostać
  na górze; open/close ⋯ i Podmień → brak przeskoku treści). **Luka procesu:** e2e
  `tests/e2e/overflow.test.ts` ma test sticky loggera, ale jego harness nie odtworzył realnego
  `body{overflow-x:hidden}`, więc bug przeszedł — do uszczelnienia (dodać prod-owe `overflow`
  do harnessu + negatywny kontrol z `hidden`), osobny mały task po potwierdzeniu na urządzeniu.

### 2026-07-22 · Claude · nowy skill arco-motion-review + dogfood

- **Zakres:** analiza 3 zewnętrznych repo skilli (taste-skill/impeccable/emil) pod kątem Arco;
  nowy skill projektowy `.claude/skills/arco-motion-review/SKILL.md` (metoda review z
  `review-animations` Emila, MIT; bar z `wytyczne-designu §2c` + `optymalizacja.md` + realne
  tokeny `globals.css`/`bottom-sheet.tsx`); przegląd istniejącego ruchu tą metodą. Bez kodu apki.
- **Stan:** **ZAKOŃCZONE** (skill, commit lokalny). Wniosek z analizy: taste-skill i większość
  impeccable celują w greenfield/anti-slop i biłyby się z kanonem — pominięte; z impeccable
  ewentualnie CLI `detect` do CI (osobno). Zero vendorowania cudzego drzewa.
- **Wynik dogfoodu:** biblioteki animacji — brak (S5 ✓); `SetRow animate-pulse-once` w loggerze
  = sankcjonowany moment PR (S1 ✓, pokryty reduced-motion); `flame-*`/`pr-flash` w budżecie ✓.
  **1 FINDING (S2, do decyzji [Ty]):** `components/ui/bottom-sheet.tsx` używa
  `animate-in fade-in-0 slide-in-from-bottom-8` BEZ bramki reduced-motion — blok
  `@media (prefers-reduced-motion)` w `globals.css` pokrywa tylko `animate-flame-*`/
  `animate-pulse-once`, więc najczęstszy overlay apki animuje wejście mimo preferencji usera.
  `app/history/[id]/page.tsx` robi to dobrze (`motion-safe:`), sheet nie — niespójność.
- **Dowód:** skill odwołany do realnych tokenów (zweryfikowane w `globals.css` linie 236–281,
  `bottom-sheet.tsx` 164/182); finding potwierdzony grep-em (sheet: 0× `motion-safe`, history: 1×).
- **Następny krok:** decyzja [Ty] o fixie bottom-sheet (jednoliniowy `motion-safe:` albo dopis do
  bloku reduced-motion; zero zmiany dla userów bez reduced-motion) — shipped UI, nie ruszam bez zgody.

### 2026-07-22 · Codex · TRAIN-02A3 P11/P12

- **Zakres:** pełne korekty objętości P11/P12 po TRAIN-01, estymacje czterech dni,
  wersjonowane mapowanie ławki/drążków/podpór/kotwic i regresje integralności.
- **Stan:** **ZAKOŃCZONE TECHNICZNIE** na `agent/train-02a-p11-p12`; bez SQL, bazy,
  sekretów i produkcji. A1/A2 są już na `main`.
- **Wynik:** P11 v3 ma 21/21/18/18 serii i 14 ścieżek sprzętowych; P12 v3 ma
  22/22/21/19 serii i 12 ścieżek. Częściowe zamienniki są oznaczone jawnie.
- **Dowód:** 112/112 unit, lint, build, walidator 907 ćwiczeń/15 programów/308 slotów
  oraz rekomendacje 60/60 są zielone; 17 placeholderów w 54 slotach bez wzrostu.
- **Następny krok:** zapis relacji i kanoniczna prawda sprzętowa w TRAIN-03/05; SEC-03
  wykonuje właściciel przed kontrolowanym A4, backupem i dry-runem.

### 2026-07-22 · Codex · TRAIN-02A2 P01/P03/P08

- **Zakres:** korekta źródłowych recept P01/P08, wersjonowana mapa alternatyw P03,
  walidator integralności, regresje czasu/objętości i dokumentacja trzech planów.
- **Stan:** **ZAKOŃCZONE TECHNICZNIE** i scalone do `main`; bez migracji SQL,
  bazy, sekretów i produkcji.
- **Wynik:** P01 v2 ma Lying Leg Curl i 19 serii/ok. 46 min w B; P08 v2 ma 18 serii/
  ok. 42 min w C. P03 ma trzy jawne mapowania, w tym uczciwie oznaczony częściowy Pullover.
- **Dowód:** 7/7 regresji A1/A2, walidator 907 ćwiczeń/15 programów/308 slotów,
  17 placeholderów w 54 slotach oraz rekomendacje 60/60 są zielone.
- **Następny krok:** TRAIN-02A3 dla P11/P12; zapis alternatyw P03 dopiero w TRAIN-03/05,
  a wspólny release A4 po SEC-03, backupie i dry-runie.

### 2026-07-22 · Codex · TRAIN-02A i kompletność sesji

- **Zakres:** ponowny audyt pięciu planów nieobecnych na produkcji, zależności PLAN-Q,
  rozgrzewki, zakończenia oraz hipotezy domowego programu 20–30 minut.
- **Stan:** **ZAKOŃCZONE TECHNICZNIE** na `agent/train-02a-audit`; read-only
  `audit:program-catalog` blokuje niegotowy sync. Baza, sekrety i produkcja nietknięte.
- **Wynik:** prosty sync P01/P03/P08/P11/P12 jest odrzucony. TRAIN-02A1–A3 przygotowuje
  migrację i domyka recepty bez produkcji; A4 czeka na alternatywy/prawdę sprzętową
  TRAIN-03/05, SEC-03, backup i dry-run.
- **Kompletność:** SESSION-01A dodaje po R4A małą, opcjonalną rekomendację rozgrzewki
  specyficznej i zakończenia bez obietnic regeneracji. PROGRAM-01A 20–30 minut pozostaje
  osobnym eksperymentem po sygnale H2, nie dodatkowym dniem aktywnego planu.
- **Dowód:** aktualny walidator: 907 ćwiczeń, 15 programów, 307 slotów i 17 placeholderów
  w 54 slotach; 106/106 unit, lint, build i rekomendacje 60/60 zielone; przegląd ACSM 2026
  oraz meta-analizy warm-up, stretching i split/FBW.
- **Następny krok:** agent `gpt-5.6-sol high` wykonuje A2 dla P01/P03/P08 i A3 dla P11/P12;
  [Ty] wykonuje SEC-03 po przygotowaniu A1–A3.

### 2026-07-22 · Codex · release Q1 TRAIN-01/CONTENT-01A/CONTENT-02

- **Zakres:** backup bazy i Storage, audyt otwartych sesji oraz planów, dry-run i wdrożenie
  trzech punktowych migracji produkcyjnych; niezależna kontrola danych i ekranu aplikacji.
- **Stan:** **WDROŻONE PRODUKCYJNIE**. Historia migracji lokalna/zdalna jest zgodna do
  `20260722002735_content02_chin_up_review.sql`; Vercel dla bieżącego `main` ma zielony status.
- **Dowód:** 8/8 asercji produkcyjnych: containment Barbell Hip Thrust, publikacja Glute Bridge,
  instrukcje trzech wariantów, review Chin-Up, recepta i dni P14 oraz 0 starych/3 nowe sloty.
  Ekran logowania Arco renderuje się bez błędów konsoli.
- **Backup:** baza `backups/20260722T094952Z`; Storage
  `backups/20260722T095327Z/storage` (2 `body-photos`, 0 `exercise-photos`).
- **Drift:** produkcja ma 10/15 planów systemowych, w tym brakuje P11/P12. Migracja celowo
  wykonała no-op dla nieistniejących planów; osobny TRAIN-02A zrobi audytowalny point sync.
- **Bezpieczeństwo:** CLI nieoczekiwanie wypisało legacy `service_role` do prywatnego logu.
  Klucz nie trafił do repo; SEC-03 wymaga pilnej kontrolowanej rotacji przez właściciela.
- **Następny krok:** SEC-03 → TRAIN-02A → checkpoint iPhone TRUST-01/03 + TRUST-02;
  następnie CONTENT-01B/CONTENT-03a i CORE-0.

### 2026-07-22 · Codex · TRUST-03 i refinement CONTENT-01B

- **Zakres:** wspólny `BottomSheet`, realna regresja Chromium, plan/backlog/handoff, review
  Hip Thrust i standard rekomendowania modelu przed zadaniem.
- **Stan:** **ZAKOŃCZONE TECHNICZNIE** na `agent/q1-trust-03`; inline `onOpenChange` nie
  restartuje scroll-locka, a zamknięcie przywraca dokładną pozycję i fokus. CONTENT-01B
  obejmuje finalną parę Barbell oraz pary Dumbbell/Single-Leg.
- **Dowód:** test przed poprawką odtwarzał `scrollY 1050 → 0` dla wszystkich ścieżek;
  po poprawce X, overlay, Escape, swipe i akcja przechodzą na 320/375/393 px, również po
  re-renderze otwartego sheeta, z aktywną blokadą tła i fokusem na triggerze.
- **Testy:** czyste `npm ci` (0 podatności), lint, 102/102 unit, build, walidator
  907 ćwiczeń/15 programów/307 slotów, rekomendacje 60/60 i overflow 21/21.
- **Czego nie dotknięto:** produkcji, migracji, danych, logiki treningu i assetów ćwiczeń.
- **Zaległości:** [Ty] kontrolowany release migracji Q1, następnie checkpoint iPhone
  PWA/Safari i merge po zielonym CI; potem CONTENT-01B i CORE-0.

### 2026-07-22 · Codex · SEC-02 sharp advisory

- **Zakres:** wymuszenie załatanej wersji `sharp` 0.35.3 w zależnościach produkcyjnych,
  odświeżenie lockfile oraz regresja builda i optymalizatora obrazów na gałęzi PR #4.
- **Stan:** **ZAKOŃCZONE TECHNICZNIE**; jedna wersja `sharp` 0.35.3 korzysta z libvips
  8.18.3, a `npm audit --omit=dev` raportuje 0 podatności. Produkcja nietknięta.
- **Testy:** czyste `npm ci`, 102/102 unit, lint, build, walidator 907 ćwiczeń/15 programów/
  307 slotów, rekomendacje 60/60, overflow 5/5 i runtime smoke `/_next/image` 200 z
  faktycznym przeskalowaniem PNG 192×192 → 128×128.
- **Czego nie dotknięto:** migracji, danych użytkowników, logiki treści CONTENT-02 ani produkcji.
- **Zaległości:** zielony CI PR #4, merge [Ty], następnie kontrolowany release migracji Q1.

### 2026-07-22 · Codex · CONTENT-02 Chin-Up

- **Zakres:** wersjonowany review Chin-Up, dopracowana instrukcja PL, wycofanie dwóch
  niejednoznacznych zdjęć do placeholdera, regresja seeda, punktowa migracja i dokumentacja Q1.
- **Stan:** **ZAKOŃCZONE TECHNICZNIE** na `agent/q1-content-02`; pięć slotów programowych,
  historia i parametry treningu pozostają bez zmian. Produkcja nietknięta.
- **Dowód:** źródła ACE i trzy publikacje badawcze; oba tylne kadry odrzucone, ponieważ nie
  potwierdzają jednoznacznie pełnego podchwytu ani prześwitu i neutralnej szyi na górze.
- **Testy:** świeży `db reset`, migracja na zasymulowanym starym rekordzie, seed 2×,
  102/102 unit, lint, build, 15 programów/307 slotów, rekomendacje 60/60, overflow 5/5 oraz
  smoke Phase 1/2, offline i Ekipa.
- **Czego nie dotknięto:** produkcji, slotów programowych, historii użytkowników ani nowych
  plików mediów. Lokalne konta i rekordy smoke zostały posprzątane przez skrypty.
- **Następny krok:** PR #4 jest otwarty; po zielonym CI [Ty] scalić go i wykonać
  kontrolowany release. Następnie CONTENT-01B albo CONTENT-03a.

### 2026-07-21 · Codex · CONTENT-01A Hip Thrust containment

- **Zakres:** wersjonowany review trzech wariantów Hip Thrust; twarda blokada starego
  Barbell w browse/search/swap; bezpieczny Barbell Glute Bridge w trzech slotach systemowych;
  instrukcje PL, seed, punktowy sync i dokumentacja programów.
- **Stan:** **ZAKOŃCZONE TECHNICZNIE** na `agent/q1-content-01`; migracja
  `20260721233618_content01a_hip_thrust_containment.sql` zachowuje historię i ID slotów.
- **Review mediów:** stare kadry Barbell odrzucone; kandydat AI pozycji końcowej także
  odrzucony i nie trafił do repo. Dumbbell/Single-Leg pozostają na neutralnym placeholderze
  do osobnego `CONTENT-01B`.
- **Testy:** świeży `db reset`, seed 2×, migracja na odtworzonym starym stanie
  (`content_blocked=true`, 0 starych i 3 nowe sloty), 99/99 unit, lint, build, walidatory
  15 programów i 60/60 rekomendacji, overflow 5/5 oraz smoke Phase 1/2.
- **Produkcja:** nietknięta. Lokalny test wymagał jednorazowego `127.0.0.1`, ponieważ
  `.env.local` wskazuje nieaktualny adres LAN `192.168.100.16`.
- **Następny krok:** mały PR CONTENT-01A; [Ty] kontrolowany release migracji po CI; potem
  CONTENT-01B albo równoległy review CONTENT-02.

### 2026-07-21 · Codex · TRAIN-01 P11/P12/P14

- **Zakres:** pilna korekta kolejności i objętości P11/P12 oraz przywrócenie hinge/hamstrings
  w P14, bez wciągania recepty v2 i pozostałego PLAN-Q.
- **Stan:** gotowe lokalnie na `agent/q1-train-01`; seed i dwie karty planów zaktualizowane,
  wersje treści podbite, produkcja nietknięta.
- **Migracja:** `20260721223000_train01_program_safety_patch.sql` zachowuje ID niezmienionych
  slotów, odpina wycofane sloty przez istniejące `ON DELETE SET NULL` i zatrzymuje się przy
  otwartej sesji P11/P12/P14.
- **Testy:** migracja przeszła w transakcji z rollbackiem i na lokalnej bazie; seed 2× zachował
  aktywne programy i 307 slotów. Zielone: lint, build, 94/94 unit, 60/60 rekomendacji,
  walidator treści, smoke Phase 1/2 i 5/5 testów przeglądarkowych.
- **Znane ograniczenie środowiska:** lokalna kopia `restore_prod_s11` nie zawiera tabel
  `public`, więc nie mogła służyć jako drugi dowód migracji; test wykonano na wypełnionej
  lokalnej bazie. Pełny CI Supabase pozostaje bramką PR.
- **Następny krok:** review diffu i mały commit TRAIN-01; po scaleniu bazowego PR #1 otworzyć
  osobny PR, przejść CI i zastosować migrację dopiero po audycie otwartych sesji.

### 2026-07-21 · Codex · PLAN-Q i zatwierdzenie 15 programów

- **Zakres:** ponowna ocena 15 programów i 48 dni, zatwierdzenie docelowych recept P01–P15,
  domknięcie kontraktu danych/kompatybilności, TRAIN-01–07 i włączenie PLAN-Q po R4A.
- **Stan:** spec, plan, backlog, decyzje i HANDOFF zaktualizowane; kod, baza i produkcja nietknięte.
- **Decyzja:** obecne 15 programów i wykonalność per slot są bramką przed H2; nowe programy,
  rozgrzewka oraz Minimum/Standard/Plus czekają na dane po H2. Audyt Codex zatwierdza recepty;
  zewnętrzny trener może wrócić po monetyzacji i nie blokuje Done/H2.
- **Dowód:** `audyt-biblioteki-programow-2026-07.md`; 4 recepty bez zmian programowych,
  11 zatwierdzonych po dokładnie rozpisanych korektach; wspólne warunki 15/15.
- **Testy:** `git diff --check`, kontrola odwołań i `npm run validate:training` — zielone;
  walidator potwierdza 15 programów/308 slotów i raportuje 16 placeholderów w 49 slotach.
- **Linear:** issues PLAN-Q wymagają ręcznego utworzenia, ponieważ w tej sesji brak połączenia Linear.
- **Następny krok:** Q1/ TRAIN-01, następnie CORE-0 → R4A → PLAN-Q według specyfikacji.

### 2026-07-21 · Codex · audyt core i refinement sprintu

- **Zakres:** audyt integralności danych, offline, rekomendacji programu i guidance względem
  implementacji oraz literatury; włączenie CORE-0 i CORE-1 do sekwencji przed H2.
- **Stan:** plan i backlog zaktualizowane; kod, baza i produkcja nietknięte.
- **Decyzja:** CORE-0 jest bramką przed R4A, a CORE-1 po R4D i przed R4E. Pełny model
  objętości, zmęczenia/deloadu i kalibracja rekomendatora czekają na H2.
- **Dowód:** `audyt-core-i-plan-2026-07.md`; 91/91 unit, lint, walidacja treści i 60/60
  profili rekomendacji były zielone przed refinementem.
- **Następny krok:** Q1, następnie rezerwacja DATA-01 w CORE-0.

### 2026-07-23 · Claude · DS-UI-v1.4 (Fazy 1–2)

- **Zakres:** migracja design systemu do „Arco UI v1.4" (guide z `Arco-Brand-System-v1.4`). Faza 1:
  primitives Violet 50–900, tokeny `support-*`, `chart-*`, elevation E1–E3, role `border-*`. Faza 2:
  neutrale na wartości guide (canvas `#F7F7F5` / dark `#18171A`, itd.; sand zostaje tylko pod
  brand-surface), focus ring rust→violet-400, usunięcie martwego tokenu `volt` (kolaps do `primary`
  w 6 plikach — bezstratne kolorystycznie).
- **Pliki:** `app/globals.css`, `tailwind.config.ts`; komponenty: `SessionMiniBar`, `MonthCalendar`,
  `MuscleHeatmap`, `RestTimer`, `SetRow`, `app/progress/sections.tsx`. Docs: `paleta-arco-warm.md`
  (§„Adopcja Arco UI v1.4"), `wytyczne-designu.md` (checklist 2/7), `CLAUDE.md` (Kierunek UX/UI).
- **Commit/stan:** working tree, niezacommitowane; baza i produkcja **nietknięte**.
- **Testy:** `npm run build` zielony (TS OK), `npm run lint` czysty, `test:unit` 115/115. Weryfikacja
  wizualna prod (localhost:3000) light+dark na koncie testowym — neutrale, CTA rust z ciemnym tekstem
  w dark, focus/support/chart rozwiązują się do violet-400, `--volt` usunięty, zero błędów w konsoli.
  Nieuruchomione (niezwiązane z kolorami): `test:overflow`, walidatory treści — zostają dla CI.
- **Produkcja:** nietknięta.
- **Faza 3 (pierwszy slice, ten sam dzień):** violet na kanonicznych powierzchniach prowadzenia/danych
  — `GuidanceChip` (ikona → support), `Sparkline` + `MuscleHeatmap` → `chart-primary`,
  `ProgramReviewInsight` (karta „Kolejny krok") w całości support + nowy wariant `Button variant="support"`.
  Inputy: `--input` przepięty na `border-control` (mocniejsza krawędź kontrolki). Polished edge:
  klasy `.surface-polished*` + zastosowane na karcie „Następny trening" (home). Reguła „jeden kolor
  chromatyczny/komponent" zachowana (karta home z rust-CTA dostała tylko polished, bez fioletu w środku).
- **Env (do wiadomości [Ty]):** `node_modules` ma masowe duplikaty „ 2" (Desktop pod iCloud Drive);
  tsc wywalał build na `@types/estree 2`. Usunięto ten katalog ad hoc. Ryzyko powrotu — patrz Otwarte.
- **Otwarte:** (1) reszta mapowania violet (onboarding, inne sekcje analityki, selected-secondary) —
  do decyzji per ekran; (2) role borderów w inputach outline vs wypełnione — audyt; (3) weryfikacja
  wizualna violet-surfaces wymaga konta z danymi (konto testowe puste — wykresy/guidance się nie
  renderują); (4) `node_modules` — rozważyć `npm ci` i wyłączenie synchronizacji iCloud dla repo.
- **Następny krok:** przegląd violet-surfaces na koncie z historią; decyzja o zakresie dalszego mapowania.

## Szablon rezerwacji

```md
| Agent | ID — nazwa | pliki/obszar | YYYY-MM-DD HH:MM | w toku |
```

## Szablon zamknięcia

```md
### YYYY-MM-DD · Agent · ID

- **Zakres:**
- **Commit/stan:**
- **Testy:**
- **Produkcja:** nietknięta / preview / wdrożona
- **Otwarte:**
- **Następny krok:**
```
