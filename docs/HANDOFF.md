# Arco — bieżący handoff

**Aktualizacja:** 2026-07-27
**Gałąź docelowa:** `main`
**Stan Git:** dokładny SHA i różnicę względem origin sprawdzaj w Git; handoff nie utrwala dynamicznych hashy
**Produkcja:** https://arco-olive.vercel.app
**Najbliższy etap:** PLAN-Q → R2.2 → R4B–R4D → CORE-1 → R4E → R3b

Ten plik opisuje wyłącznie stan na dziś. Historia jest w Git, kolejność w
`plan-sprintow-2026-07.md`, a pełna kolejka w `backlog-produktu.md`.

## 1. Stan produktu

Arco jest działającą PWA na kontach testowych. Obsługuje:

- onboarding ze stanem ukończenia zapisanym na koncie;
- aktywację i zmianę programu, bibliotekę, filtry i własne programy;
- logger z timerem, seriami, rozgrzewką, podmianą, ćwiczeniami własnymi, offline i szkicem;
- jedną niezakończoną sesję, minimalizację, mini-bar, wznowienie, usunięcie i finish;
- świadomy start „Własnego treningu” i blokadę pustej sesji w UI oraz na serwerze;
- Historię, edycję zakończonego treningu i trening po fakcie z prawdziwą datą/czasem;
- rekordy, guidance, Postępy/Ciało oraz pomiary z wagą, notatką i maks. dwoma zdjęciami;
- polskie nazwy i aliasy wyszukiwania;
- Ekipę v0: kod 8 znaków, jawna zgoda, członkowie, wiele ekip w UI, check-iny, reakcje i nudge.

Docelowa IA działa: **Trening · Postępy · Historia · Ekipa**, lokalnie **Dziś | Plany** oraz
**Trening | Ciało**, profil przez awatar. Floating nav ma równy margines 12 px i respektuje
safe area.

## 2. Co jest wdrożone

Na `main` i w migracjach są:

- R0/R0.5, R1a/R1b, R2/R2.1 i R3a;
- F0.1–F0.7, w tym `onboarding_completed_at`, badge `0/N` i wpływ sprzętu na kolejność planów;
- F0.2/F0.3: poprzedni wynik tylko dla tego samego ćwiczenia, zakresy serii, potwierdzenie
  anomalii i e1RM tylko dla 1–10 powtórzeń;
- L9/L10: cel i passa Ekipy liczone z sesji w tygodniu `Europe/Warsaw`;
- R5a core: 213 nazw PL, 94 aliasy, normalizacja diakrytyk i ranking;
- backup bazy/Storage i zweryfikowany restore;
- self-hosted obrazy ćwiczeń w Supabase Storage/CDN;
- CI: lint, unit, walidatory, build, overflow oraz smoke bazy/offline/Ekipy.

Ostatni fix `61717e6` przywraca sticky nagłówek loggera przy globalnym safe area. Automatyczna
regresja overflow jest zielona; pozostaje krótki test iPhone PWA w Q1.

**Design system (DS-UI-v1.4, scalony do `main`):** wdrożone Fazy 1–2
migracji „Arco UI v1.4" na warstwie tokenów — skala Violet + `support-*` (kolor uzupełniający:
prowadzenie/plany/dane/wykresy), `chart-*`, elevation E1–E3, role `border-*`, chłodniejsze neutrale
(canvas `#F7F7F5` / dark `#18171A`), focus ring → violet-400, `volt` usunięty (kolaps do `primary`).
Kanon: `paleta-arco-warm.md` §„Adopcja Arco UI v1.4". Build/lint/unit zielone, weryfikacja wizualna
(light+dark) OK. **Faza 3 — pierwszy slice wdrożony:** violet na `GuidanceChip`/`Sparkline`/
`MuscleHeatmap`/`ProgramReviewInsight` + `Button variant="support"`, inputy na `border-control`,
polished edge na karcie home. **Otwarte:** reszta mapowania violet per ekran.

**Ikony 3D (PR [#13](https://github.com/danielm1212/arco/pull/13), scalony do `main`):**
podmienione z generycznego pakietu 3dicons.co
na własny zestaw Arco Performance Objects v1.1 (`strategy/arco-3d-icon-system.md`
w `Arco-Brand-System-v1.4`) — zamyka ryzyko licencyjne `VISUAL-04`. `MomentIcon3D` uproszczony do
jednego pliku na ikonę (v1.1 nie rozróżnia light/dark). Osierocony `assets-source/icons-3d/`
(~20 MB starego pipeline'u) usunięty. Lint/build zielone, 6 z 8 ekranów
zweryfikowanych wizualnie light+dark. Do checkpointu urządzeniowego pozostaje sprawdzić
`WelcomeOverlay` krok 8 („Plan gotowy") i baner potwierdzenia w `history/[id]` — nieodtworzone
w tej sesji. Szczegóły w dzienniku
koordynacji (2026-07-23).

## 3. Stan planu

### Zamknięte

- R0–R3a i integralność F0;
- funkcjonalne zachowanie bottom sheetów: overlay, scroll lock, scroll wnętrza i swipe;
- iPhone checkpoint z 2026-07-18 dla wcześniejszej macierzy 8/8;
- polskie wyszukiwanie i podstawowy kontrakt treści programów;
- SEC-02: `sharp` 0.35.3 z libvips 8.18.3 jest na produkcji po zielonym CI i deployu PR #4.
- TRAIN-01: migracja P11/P12/P14 została zastosowana na produkcji 2026-07-22; P14 ma
  poprawioną receptę v3, a brakujące P11/P12 nie zostały utworzone „przy okazji”.
- release CONTENT-01A/CONTENT-02: blokada starego Barbell Hip Thrust, zamiana trzech slotów,
  instrukcje wariantów i review Chin-Up są aktywne na produkcji.
- **TRAIN-02A4:** kontrolowany point sync P01/P03/P08/P11/P12 jest na produkcji od
  2026-07-27. Minimalny kontrakt `program_slot_alternatives` ma RLS; pięć planów wnosi 15 dni,
  99 slotów i 29 alternatyw. Backup, dry-run, RLS A/B oraz odczytowy smoke aplikacji przeszły.
  Pełny ślad wdrożenia: `train-02a4-release-2026-07-27.md`.
- **CORE-0:** DATA-01/02/03 i SYNC-01 są na `main` oraz produkcji. Trigger i funkcje DB,
  kwalifikowane fakty, kanoniczne kg oraz odporny outbox przeszły kontrolę danych i smoke.
  Follow-up usuwa znaleziony przy smoke błąd hydratacji daty Historii. Pełny ślad:
  `core-0-release-2026-07-27.md`.
- **R4A — wdrożone produkcyjnie w PR [#23](https://github.com/danielm1212/arco/pull/23):**
  logger ma jawne stany serii i sesji,
  aktywny wiersz, logiczny fokus kg → powtórzenia → „Zalicz”, przejście między ćwiczeniami,
  osobny zapis korekty zaliczonej serii oraz trwałe odtworzenie szkicu, timera, aktywnego
  wiersza i scrolla po minimalizacji lub przeładowaniu. Timer nie blokuje dalszego wpisywania.
  Bramka lokalna i CI: lint, TypeScript, build, 146/146 unit, 25/25 testów
  przeglądarkowych oraz pełny smoke bazy/offline/Ekipy; bezpośredni reload buildu nie zgłasza
  błędu hydracji. Pełny ślad: `r4a-release-2026-07-27.md`.
- **SESSION-01A — wdrożone produkcyjnie w PR [#25](https://github.com/danielm1212/arco/pull/25):**
  logger pokazuje pomijalne przygotowanie po bezruchu
  oraz rekomenduje 2 lekkie serie przed pierwszym ciężkim/power/skill wzorcem i 1 serię przed
  kolejnym nowym wzorcem. Serie można dodać jednym CTA jako `warmup`; nie liczą się do
  ukończenia, objętości, Historii, rekordów ani progresji. Done ma zwinięte, opcjonalne
  2–5 min spokojnego zakończenia bez obietnic regeneracji. Dogfood potwierdził zapis,
  reload i odzyskanie szkicu bez błędu hydracji; bramka: lint, TypeScript, build,
  158/158 unit, 26/26 testów przeglądarkowych i walidatory 907/15/308 oraz 60/60.
  CI PR oraz ponowne CI `main` są zielone, Vercel wdrożył `47f48ae`, a publiczny login
  po przeładowaniu nie zgłasza błędów. Pozostaje checkpoint urządzeniowy [Ty].
- **SESSION-01A4 — gotowe technicznie na `agent/session-01a4` (na 01A3), czeka na merge [Ty]:**
  rozciąganie zeszło z ekranu Done do loggera jako **ostatnia pozycja treningu** — na
  podsumowaniu było już po wszystkim, a wtedy nikt do niego nie wraca. Moment rekordu jest
  mocniejszy: 34 → 60 cząstek, lot 1,9–2,9 s → 2,8–4,3 s, a `peak` przeszedł z pikseli na
  `vh`. To ostatnie było realnym błędem: w px im wyższy ekran, tym niżej kończył się
  wystrzał (przy 812 px sięgał okolic liczby-bohatera zamiast topbara), podczas gdy `floor`
  był w vh od początku dokładnie z tego powodu. Bramka: lint, TypeScript, build,
  **158/158** unit, **32/32** przeglądarkowych. Szczegóły: `session-01a4-release-2026-07-27.md`.
- **SESSION-01A3 — gotowe technicznie na `agent/session-01a3`, czeka na merge i deploy [Ty]:**
  jednorazowa podpowiedź startowa loggera — popover zakotwiczony pod pierwszym wierszem serii,
  strzałka celuje w check, tło przyciemnione, przycisk „Rozumiem". Pokazywana raz na urządzenie
  (`prefs.loggerHintSeen`) i znikająca także po pierwszej zaliczonej serii. Pełny kontrakt
  overlayów: portal do `body`, współdzielona blokada tła (`lib/bodyScrollLock.ts` wyciągnięte
  z `BottomSheet` bez zmiany zachowania), Escape, pułapka fokusu ze zwrotem fokusu
  (`lib/useFocusTrap.ts`). Przy okazji osłonięto `prefs.ts` — `localStorage` rzuca w Safari
  w trybie prywatnym i przy pełnej quocie, co wywracało cleanup overlaya. Bramka: lint,
  TypeScript, build, **157/157** unit, **31/31** przeglądarkowych (TRUST-03 15/15).
  Szczegóły: `session-01a3-release-2026-07-27.md`.
- **SESSION-01A2 — wdrożone w PR [#27](https://github.com/danielm1212/arco/pull/27), czeka na deploy [Ty]:**
  przebudowa prezentacji loggera po dogfoodzie SESSION-01A (ocena 4/10 za nadmiar instrukcji).
  Wiersz serii zszedł ze ~120 px do **44 px** — check 44×44 jest częścią wiersza, pełnoszerokie
  „Zalicz" zniknęło, a stały `×` zastąpiło menu pod numerem serii (robocza/rozgrzewkowa/usuń).
  Per-ćwiczeniowe boksy rozgrzewkowe wycięte; zostały dwa moduły czasowe: rozgrzewka nad
  pierwszym ćwiczeniem (2–15 min) i rozciąganie na Done (1–10 min), z zapamiętanym czasem
  i licznikiem przeżywającym przeładowanie oraz tło. Świeże wejście zaczyna się na
  `scrollY = 0`, bez fokusu i aktywnej serii; pozycja wraca tylko przy realnym wznowieniu.
  Tap w puste pole kopiuje wynik z poprzedniej sesji. Semantyka `warmup` bez zmian, brak
  migracji. Usunięto `lib/sessionPreparation.ts` (bez konsumenta w produkcie).
  Bramka: lint, TypeScript, build, **155/155** unit, **29/29** przeglądarkowych,
  katalog 907/15 i rekomendacje 60/60. Szczegóły: `session-01a2-release-2026-07-27.md`.

### Częściowe i szczegóły wdrożeń

- **CONTENT-01:** część A jest na produkcji: Barbell Hip Thrust jest wstrzymany, systemowe sloty
  używają sprawdzonego Barbell Glute Bridge, a wszystkie trzy warianty mają poprawione
  instrukcje. CONTENT-01B obejmuje finalną parę Barbell i pary Dumbbell/Single-Leg.
- **CONTENT-02:** zmiana jest na produkcji: Chin-Up zachowuje pięć slotów, publikuje poprawioną
  instrukcję, a niejednoznaczne zdjęcia zastępuje placeholder do czasu zatwierdzenia nowej
  pary.
- **R3b:** istnieje dużo v0, ale hub nie ma jeszcze trwałego ostatniego wyboru, unread na tabie,
  jednego kontekstowego zdarzenia Home i finalnego dogfoodu dwóch kont.
- **R4:** R4A domyka aktywną serię, jawne zaliczenie/korektę, logiczny fokus i ciągłość
  timera/szkicu. Brakuje prowadzenia pierwszej sesji,
  CTA finish na dole, zapisu własnej sesji jako programu,
  pełnoekranowych mediów i części zachowania scrolla/kontekstu Historii.
- **R5b:** brakuje pełnego focus trapu/zwrotu fokusu, radiogroup oraz pełnej macierzy Android.
- **TRUST-03:** scalone do `main` i wdrożone: wspólny scroll-lock nie restartuje
  się po re-renderze, pozycja strony i fokus wracają dla X/overlay/Escape/swipe/akcji;
  automatyczna macierz 320/375/393 px jest zielona. Pozostaje checkpoint iPhone [Ty].
- **TRUST-02:** zweryfikowane lokalnie 2026-07-24 (fresh-account smoke F0.7), zero P0/P1.
  Pełny onboarding, skip, badge `0/N` i ustawienia trwałe po reload; kluczowa regresja
  (usunięcie treningu z Historii ponownie otwierało onboarding) nie odtwarza się —
  `completed` na Home liczy się wyłącznie z `onboarding_completed_at`. Pozostaje
  checkpoint [Ty] na fizycznym iPhone PWA (razem z TRUST-01/03).
- **CORE-0 / DATA-01:** ZAKOŃCZONE, PR [#14](https://github.com/danielm1212/arco/pull/14)
  scalony do `main`. Zaliczona seria wymaga wyniku właściwego dla typu ćwiczenia (weighted:
  ciężar+powtórzenia; bodyweight: powtórzenia; timed: czas > 0) w trzech warstwach — UI,
  server action (`assertCompletableSet`) i DB (trigger `assert_valid_completed_set`).
- **CORE-0 / DATA-02:** ZAKOŃCZONE, PR [#15](https://github.com/danielm1212/arco/pull/15)
  scalony do `main`. kg jest teraz kanoniczną jednostką zapisu ciężaru
  (`session_sets.weight`/`added_weight`); `unit_system` jest wyłącznie preferencją prezentacji.
  **Poza zakresem — follow-up:** `body_metrics.weight` (Postępy/Ciało) ma tę samą klasę
  problemu (kg/lbs jako etykieta bez konwersji), osobna tabela/funkcja, niedotknięta.
- **CORE-0 / DATA-03:** PR
  [#16](https://github.com/danielm1212/arco/pull/16) scalony do `main`; hardening
  `agent/core0-hardening` domyka dodatkowo semantykę `skipped`.
  Audyt wykrył pięć miejsc liczących fakt treningowy bez `sessions.finished_at is not null`:
  `recompute_personal_records()`, `previous_working_set`/`previous_session_sets` (migracja
  `20260724143658_data03_qualified_fact_finished_only.sql`), `lib/repPRs.ts`,
  `app/exercise/[id]/page.tsx`, oraz `periodStats`/`getStrengthTrends` w `app/progress/stats.ts`
  (naprawione przez nowy współdzielony `lib/qualifiedFacts.ts::finishedSessions`). Home i Ekipa
  już miały ten warunek poprawnie. Nowa migracja
  `20260727110435_data03_exclude_skipped_exercises.sql` wyklucza pominięte ćwiczenia z rekordów
  i poprzednich wyników; aplikacja stosuje tę samą regułę w statystykach, guidance, Historii,
  loggerze i Done. **Poza zakresem, odnotowane:** `previous_working_set`/
  `previous_session_sets` wybierają globalnie najnowszą inną sesję, nie czasowo poprzedzającą
  przeglądaną — przy edycji starej historii z równolegle otwartym innym treningiem "poprzedni
  wynik" może być z późniejszej sesji. Rzadki przypadek, osobny finding na przyszłość.
- **CORE-0 / SYNC-01:** scalone do `main` i wdrożone. Błędy chwilowe
  pozostają w kolejce do retry; błędy trwałe trafiają do odzyskiwalnej kwarantanny i nie
  blokują późniejszych zapisów. Finish czeka na flush i ocenia wyłącznie bieżącą sesję.
- **MOMENT-01 (confetti po rekordzie):** PR
  [#17](https://github.com/danielm1212/arco/pull/17) scalony do `main`. Wystrzał CSS bez
  biblioteki na done-screenie, pod tym samym
  sygnałem `hasPR` co nagłówek „Nowy rekord"; bez rekordu komponent nie jest renderowany.
  Paleta rust + violet + amber to jawny wyjątek od reguły v1.4, zapisany jako **D-20**
  w `decyzje-produktowe.md`. `prefers-reduced-motion` → zero cząstek (plus reguła CSS jako
  pas bezpieczeństwa). Hardening z 2026-07-27 wylicza czas życia warstwy z maksymalnego lotu,
  więc ostatnia cząstka nie jest ucinana. Zweryfikowane: testy jednostkowe, lint, build, a w realnej apce struktura,
  34 cząstki, tokeny kolorów i przełączenie dark. **Nie zweryfikowano ruchu w locie** — preview
  trzyma dokument jako `hidden`, więc animacje CSS i `rAF` nie tykają; jakość ruchu walidowana
  na POC z identycznymi keyframe'ami. Do checkpointu [Ty]: płynność na Androidzie i zachowanie
  przy „Ogranicz ruch" w iOS.

## 4. Otwarte ryzyka

1. **Sekret serwerowy:** legacy `service_role` został niezamierzenie ujawniony w prywatnym
   logu narzędzia CLI podczas release'u. Nie trafił do repo ani dokumentów, ale należy pilnie
   utworzyć nowy sekret, podmienić go w Vercel/automatyzacjach, sprawdzić akcje serwerowe i
   dopiero wtedy odwołać stary klucz (`SEC-03`). **2026-07-24: [Ty] wstrzymuje SEC-03 na razie
   (czeka na zewnętrzne wsparcie), czas nieokreślony.** SEC-03 nie blokuje CORE-0/R4A ani
   kolejnych punktowych migracji wykonywanych przez kontrolowane połączenie z bazą, ale pozostaje
   osobnym pilnym ryzykiem do zamknięcia przed publicznym rozszerzaniem dostępu.
2. **Treści i programy:** ryzykowne zdjęcia Barbell Hip Thrust są punktowo wstrzymane na
   produkcji; nowe media Dumbbell/Single-Leg oraz zatwierdzona para Chin-Up nadal wymagają
   przygotowania,
   a audyt 15 planów wykazał błędy kolejności/objętości, brakujące
   regresje i nieprawdziwe metadane sprzętu. Q1 zawiera pilny patch, a PLAN-Q jest pełną
   bramką treści, danych i wersjonowanego audytu Codex przed H2. Docelowe recepty 15/15 są
   zatwierdzone w `audyt-biblioteki-programow-2026-07.md`. Produkcja ma 15/15 programów
   systemowych. TRAIN-02A4 opublikował pięć brakujących planów po dodaniu minimalnego zapisu
   alternatyw; bez pełnego reseedu i bez naruszania planów własnych, aktywnych sesji lub historii.
   Pełne TRAIN-03/05 (kanoniczny sprzęt, wykonalność per slot i rozszerzona recepta) pozostaje
   częścią PLAN-Q.
   Walidator pokazuje 17 unikalnych placeholderów mediów użytych w 54 slotach.
3. **PWA:** ostatni fix sticky i techniczna poprawka pozycji bottom sheeta (`TRUST-03`)
   wymagają potwierdzenia na iPhone PWA/Safari i przy starym cache.
4. **Fresh account:** F0.7 zweryfikowane lokalnie 2026-07-24 (skip/finish, `0/N`,
   usunięcie historii — zero P0/P1); brakuje wyłącznie regresji na fizycznym nowym
   urządzeniu (iPhone PWA, razem z TRUST-01/03).
5. **Android:** brak pełnego checkpointu systemowego Back/PWA.
6. **A11y:** funkcjonalne sheety nadal nie mają kompletnego focus trapu i zwrotu fokusu.
   SESSION-01A3 dodało gotowe narzędzie — `lib/useFocusTrap.ts`, używane przez podpowiedź
   startową loggera — ale **nie podpięło go do sheetów**. Spłata długu to podmiana obsługi
   fokusu w `components/ui/bottom-sheet.tsx` na ten hook; blokada tła jest już współdzielona
   (`lib/bodyScrollLock.ts`).
7. **Backup:** zweryfikowana kopia pozostaje na laptopie; potrzebna zaszyfrowana kopia poza nim.
8. **Publiczność:** signup, RODO, eksport/usunięcie, abuse protection i publiczna Ekipa są zamknięte.
9. **Badania:** większość wiedzy pochodzi z dogfoodu właściciela; wymagane są H2-Lab oraz
   trzytygodniowy H2-Field, zanim ruszą publiczne konta i premium.
10. **Prawo:** commity `2aa4191` i `d10e51e` dodały drafty w `docs/legal/` oraz docelową domenę;
   nie zaliczają PRIV-1 bez review prawnego, eksportu/usunięcia, audytu RLS i weryfikacji
   dostawców/regionu.
11. **Sklepy:** obecny dynamiczny Next.js nie jest gotowym bundle'em Capacitor. PWA pozostaje
    drogą do H2-F/PAY-01; decyzja Expo/React Native kontra lokalny Capacitor jest w MOBILE-0.

## 5. Dane i technologia

- Next.js 16.2, React 19.2, TypeScript, Tailwind CSS 3;
- Supabase Auth/Postgres/Storage/RLS, Serwist i Vercel;
- 907 rekordów ćwiczeń lokalnie; bieżące liczby potwierdza `npm run validate:training`;
- publiczna rejestracja wyłączona;
- migracje produkcyjne do `20260727134500_train02a4_missing_programs.sql` zostały zastosowane;
  obejmuje to migracje CORE-0 od `20260724133849` do `20260727110435`.

## 6. Najbliższa praca

1. [Ty] SEC-03 wstrzymane na razie (czeka na zewnętrzne wsparcie) — **nie blokuje** punktów
   poniżej. Wykonać, gdy wsparcie się odblokuje: nowy sekret, Vercel/automatyzacje, smoke
   akcji serwerowych, a na końcu odwołanie starego.
2. **CORE-0 zamknięte produkcyjnie (Codex, 2026-07-27):** DATA-01–03 i SYNC-01 są wdrożone.
   Produkcyjny schemat, dane, Home, Historia i Postępy przeszły kontrolę; po poprawce hydratacji
   bramka ma lint, build i 140/140 unit. Follow-upy poza CORE-0: `body_metrics.weight`
   (jednostki, jak DATA-02) i `previous_working_set`/`previous_session_sets` liczące najnowszą
   sesję zamiast czasowo poprzedzającej przeglądaną (odkryte przy DATA-03, rzadki przypadek).
3. Checkpoint iPhone [Ty] TRUST-01/03 + TRUST-02 (fresh-account smoke zweryfikowany
   lokalnie; brakuje wyłącznie fizycznego urządzenia) oraz CONTENT-01B/CONTENT-03a.
4. [Ty] checkpoint starego cache/iPhone PWA dla R4A, SESSION-01A, SESSION-01A2 i SESSION-01A3;
   fizyczna regresja nie blokuje rozpoczęcia PLAN-Q.
5. [Ty] merge w kolejności: **SESSION-01A3 (`agent/session-01a3`) → SESSION-01A4
   (`agent/session-01a4`)** — druga gałąź jest odbita z pierwszej. Potem deploy całej serii
   loggera procedurą `arco-release` (SESSION-01A2 jest już w `main`). Opcjonalny follow-up
   domykający ryzyko 6: podpiąć `lib/useFocusTrap.ts` do `components/ui/bottom-sheet.tsx`.
6. PLAN-Q: jeden katalog, recepta v2, korekta 15/15 planów, prawda sprzętowa, UI i gate publikacji.
7. R2.2 → R4B–R4D → CORE-1 → R4E → R3b → R5b → R6 → H2. Domowy plan 20–30 minut
   (`PROGRAM-01A`) pozostaje osobnym eksperymentem po sygnale H2, nie dodatkowym dniem.

## 7. Reguły operacyjne

- Migracje wyłącznie przez `supabase/migrations`; każda tabela użytkownika ma RLS i test wielokontowy.
- Produkcyjne dane testowe usuwamy tylko po znanych ID.
- Jeden build Next.js naraz.
- Deploy i zamknięcie sesji zgodnie z `.claude/skills/`.
- Każda zmiana stanu aktualizuje HANDOFF, backlog/plan i `koordynacja-agentow.md`.
- Warstwa operacyjna zadań: Linear (workspace `trainarco`; od 2026-07-21 zastępuje Notion). Repo docs pozostają źródłem prawdy.
