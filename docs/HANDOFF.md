# Arco — bieżący handoff

**Aktualizacja:** 2026-08-03
**Gałąź docelowa:** `main`
**Stan Git:** dokładny SHA i różnicę względem origin sprawdzaj w Git; handoff nie utrwala dynamicznych hashy
**Produkcja:** https://arco-olive.vercel.app
**Najbliższy etap:** [Ty] review i merge PR #66 z okładkami programów; niezależne D17
pozostaje lokalnym follow-upem. Dalsza kolejka: D-1 → D-3+D-2 → D-4 → reszta P3.

Ten plik opisuje wyłącznie stan na dziś. Historia jest w Git, kolejność w
`plan-sprintow-2026-07.md`, a pełna kolejka w `backlog-produktu.md`.

## 0. Rebaseline po audycie — 2026-08-03

`main` po PR #60–#65 ma zamknięte paczki A/B/C/E, D6/D7, paczkę F i porządek po
duplikatach iCloud. Produkcyjna baza ma od 2026-08-03 migrację F2 ulubionych
`20260803141543_favorite_programs.sql`. CI PR #66 z wariantami okładek jest zielone.

Kanon dalszej pracy i wyceny: `docs/plan-po-audycie-2026-08-01.md`; samowystarczalne
przekazanie sesji: `docs/handoff-2026-08-01-claude-code.md`. Paczka E domknięta technicznie:

1. E2 — „Dodaj trening" jest bezpośrednio pod kalendarzem Historii;
2. E1 — Plany, Postępy, Ciało i Historia używają jednego lekkiego nagłówka; passa i monogram są tylko na Dziś;
3. E3 — `live | finished | historical` steruje zachowaniem sesji; historia nie startuje przerwy i nie pokazuje guidance progresji.

Follow-up po paczce C również zamknięty: poprzedni tydzień na `/progress` nie ogłasza
dzisiejszego celu jako historycznego. Baza nie przechowuje historii celu, więc etykieta
poprzedniego tygodnia podaje samą liczbę treningów, bez mianownika. Guard przeglądarkowy
sprawdza też poprawną polską odmianę obu etykiet.

**Paczka F na `main` od 2026-08-03 (PR #65):** detal
każdego planu pozwala rozpocząć wybrany dzień bez aktywacji planu. Potwierdzenie mówi wprost,
że aktywny plan i rotacja się nie zmienią; istniejące RPC nadal wznawia jedyną otwartą sesję
zamiast tworzyć drugą. Ulubionym jest cały plan: serce działa na liście i detalu, sekcja
„Ulubione” jest wyłącznie na `/programs`, a kolejność to Aktywny → Utwórz własny → Ulubione
→ Moje → Biblioteka. Migracja `20260803141543_favorite_programs.sql` ma unikalność pary,
RLS i stały smoke dwóch kont w CI; nie pozwala polubić cudzego prywatnego planu.

Bramka F: świeży, odizolowany `db reset`, seed **907/15/336**, bootstrap, walidatory,
smoke Phase 1/2/offline/Ekipa/programy, typecheck i lint czysto, **274/274 unit**,
**56/56 przeglądarkowych**, build zielony (kompilacja 2,1 s). Typ tabeli porównany z
`supabase gen types`. Izolowany stack i jednorazowe konta usunięte. D17 pozostaje osobnym
lokalnym commitem na `agent/d17-write-error-contract` i nie jest częścią gałęzi F.

**Okładki programów gotowe technicznie 2026-08-03 w draft PR #66:** każdy z 15 planów
systemowych ma jawny WebP 1:1 na listę oraz WebP 16:9 na detal. Home nie dostał ani UI,
ani nowego zapytania; wariant 16:9 jest tylko kontraktem pod przyszły projekt. Własne plany
zachowują fallback. Obrazy są dekoracyjne dla czytnika, bo nazwa planu jest już w karcie.
Migracja `20260803150358_program_cover_variants.sql` jest na produkcji; dry-run wskazał
dokładnie dwie oczekiwane migracje, `db push` przeszedł, a lokalna i zdalna historia są
zgodne. Bramka PR #66: lint, typecheck, build, **276/276 unit**, **56/56 overflow**, pełne
smoke'i i ręczny checkpoint 393 px (15 miniatur 64×64, detal 361×203, zero overflow).

Decyzje właściciela z 2026-08-01/03 są utrwalone w `decyzje-produktowe.md` D-41 i
D-48–D-51. Finalne WebP okładek są częścią PR #66. Źródłowe PNG, contact sheety, drafty,
`docs/arco-home-agent-handoff/` i skrypty zaczynające się kropką pozostają obcymi,
nieśledzonymi artefaktami — nie commitować bez osobnej decyzji.

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

IA ma już docelowy kontrakt trzech przestrzeni **Home · Trening · Ekipa** (D-38…D-41).
Plany, Postępy, Ciało i Historia dzielą jeden pasek wewnątrz Treningu, a Home nie ma
lokalnych zakładek. Floating nav ma równy margines 12 px i respektuje safe area.
HOME-01…03 oraz NAV-01 są na `main` i produkcji (PR #33/#48/#49/#50); szczegóły i zaległy
checkpoint urządzeniowy są w §6 punkt 5.

**HOME-04+05 na `main` i produkcji (PR #58, merge 2026-07-31):** kontenery danych na Home
scalone z czterech pudełek w jedną kartę (hierarchia typografią, nie obrysem; liczby
`text-2xl` na wspólnej linii bazowej; zdjęta siatka kresek; scalony zdublowany tonaż) oraz
pierwszy podział semantyki symboli. Nawigacja: `Home` → `Dziś`. Bez migracji i **bez nowego
zapytania** — budżet Home nietknięty.

**HOME-05b gotowe technicznie 2026-07-31 na `agent/home-05b-streak-symbol`** (domknięcie
defektu z PR #58 + zgłoszenia właściciela „na górze miał być strike tygodniowy, a nie jakaś
tarcza" oraz „w kalendarzu nie widać daty"). Kanon symboli po tej paczce:
**płomień = wyłącznie passa · wypełnione kółko = dzień z treningiem · cel tygodnia nie ma
ikony** (niesie go liczba „2/4" w karcie „Ten tydzień"; tarcza z HOME-05 usunięta).
Header Dziś pokazuje passę (`StreakBadge`, gradientowy `StreakFlame` + „4 tyg."), karta na
home to „Ten tydzień" (`WeekCard`, bez wielkiej liczby passy — koniec duplikatu), kalendarz
historii zachowuje **numer dnia** w wypełnionym kółku zamiast zastępować go płomieniem.
Architektura: jedna siatka (`components/WeekStrip.tsx`) i jeden glif (`components/StreakFlame.tsx`)
dla całej aplikacji — dwie kopie siatki były przyczyną, dla której HOME-05 ujednoliciło
symbole tylko w połowie ekranu. Gradient w ikonie jest pierwszy w systemie i **pilnowany
testem kontrastu na tokenach** (`tests/token-contrast.test.ts`). Usunięta jedyna animacja
spoczynkowa (`animate-today-pulse`). Pierwsza rata długu PLAN-05I: `tests/e2e/streak-week.test.ts`
renderuje **prawdziwe** komponenty (esbuild + `createRoot` + skompilowany CSS), nie klon. Wynik oceny zewnętrznego planu `docs/arco-home-agent-handoff/`,
który jako całość odrzucono: proponował przebudowę już wdrożonych HOME-01…03, własne
surowe heksy rozjeżdżające się z `paleta-arco-warm.md` v1.4 (neutrale **cieplejsze**, wbrew
datowanej decyzji) i ujednolicenie okresów metryk cofające zatwierdzony POC HOME-02.
Bramka HOME-05b: lint, tsc, **251/251** unit, **45/45** overflow (w tym 8 nowych na
prawdziwych komponentach), build; 320/375/393 px, light i dark.
**Do [Ty]:** przejście po zalogowanej trasie `/` i `/history` oraz checkpoint iPhone PWA
(zaległe od PLAN-05D). Otwarte: **PLAN-05I** (reszta długu testowego), **HOME-06** (jeden
dominujący CTA) i **CONTENT-03** (semantyczne nazwy dni — 20 z 48 to „Trening A"/„Dzień A";
migracja + sesja treściowa). Wciąż nierozstrzygnięte: czy `docs/arco-home-agent-handoff/`
wchodzi do repo (folder nieśledzony).

**Audyt kodu/UI 2026-07-31 → `docs/audyt-kodu-i-ui-2026-07-31.md`.** Siedem przebiegów
(architektura, UI/DS, a11y, wydajność, testy, treść, bezpieczeństwo). Fundamenty są zdrowe: RLS
kompletne na 20 tabelach, niezmienniki w bazie, zero magic-hexów, service role tylko w skryptach.
Problem był w egzekucji: v1.4 i budżety z `optymalizacja.md` żyły w tokenach i dokumencie,
nie w komponentach i trasach. **A, B, C oraz D6/D7 są zamknięte** w PR #60–#63.
Gotowe lokalnie są D17 i paczka F. Otwarte pozostaje scalenie/release oraz D (skala:
`/postępy` 13 zapytań, kod zaproszenia Ekipy bez rotacji, brak CHECK-ów na wejściu).

**Paczka C gotowa technicznie 2026-08-01 na `agent/progress-consistency-copy` (PR #62):**
D1–D5 + D7. Pasek 14 dni na `/postępy` to teraz **dwa rzędy po siedem** zbudowane z
kanonicznego `WeekStrip` — kolumna znaczy dzień tygodnia, „dziś" ma pierścień, a skróty są
dwuliterowe (jednoliterowe „P" oznaczało poniedziałek i piątek). Przy przebudowie zniknął
dryf przy zmianie czasu: stary pasek liczył dni stałą `86_400_000` ms zamiast
`addWarsawDays`. Odmiana liczebników ma jedną regułę (`lib/plural.ts`) zamiast trzech
ręcznych kopii i czterech miejsc, które ją pomijały („3 ćwiczeń", „1 serie", „22 treningów");
refaktor pilnuje test porównujący stare implementacje z nową na 0..130. Surowe `error.message`
z Postgresa nie docierają już do toastów (`lib/actionError.ts`) — to była też ekspozycja nazw
tabel i polityk RLS. Do tego polskie nazwy partii na `/postępy`, strażnik zera w
`streakWeeksText` i `/ciało`, które przestało się przedstawiać jako „Postępy".
Bramka: typecheck, lint, **268/268** unit, build, **48/48** overflow. Bez migracji.
**Otwarte z tej rodziny:** copy komunikatów zaszytych w SQL-u oraz poprawa etykiety
poprzedniego tygodnia bez historycznego celu. D6 zamknięte w PR #63.
**Do [Ty]:** spojrzenie na nowy pasek na zalogowanym `/postępy`.

**Paczka B gotowa technicznie 2026-08-01 na `agent/a11y-p1`:** wszystkie jedenaście pozycji
P1 (dostępność) z audytu plus dwa znaleziska własne. Najważniejsze: `BottomSheet` i onboarding
mają wreszcie pułapkę fokusu i `inert` na tle (wspólny `lib/inertBackground.ts`) — dotąd Tab
wychodził z arkusza w listę pod spodem, również na potwierdzeniach usuwania; pola liczbowe
loggera mają dostępne nazwy z numerem serii („Ciężar w kg, seria 3") zamiast samego
`placeholdera`; Dziś i Plany dostały `h1`, a ćwiczenia w loggerze są `h2` (rotor VoiceOvera
daje spis ćwiczeń zamiast 30 serii z rzędu); `prefers-reduced-motion` objęło 6 z 6 animacji.
**Wniosek systemowy:** cztery z trzynastu pozycji to ta sama pomyłka — stopień WYPEŁNIENIA
użyty jako tekst (`text-white` na `bg-success` = 2,37:1 w dark, amber jako tekst 1,91:1 w
light, zieleń 4,18:1 na canvas, czerwień w dark 3,98:1 na własnym tincie). Stąd kontrakt
trzech ról koloru semantycznego — `bg-<kolor>` (wypełnienie) · `text-<kolor>-foreground`
(tekst NA wypełnieniu) · `text-<kolor>-text` (barwa jako tekst) — i trzy nowe, wyłącznie
tekstowe stopnie: `amber-700`, `green-600`, `red-300`. Kanon w `paleta-arco-warm.md`
§„Trzy role koloru semantycznego". Progi liczy `tests/token-contrast.test.ts` na tincie
złożonym nad KAŻDYM realnym tłem wiersza — pierwsza wersja `amber-700` przechodziła tylko
na białej karcie i test to wyłapał. CI dostało brakujący krok `npm run typecheck`.
Pierwotne wyjaśnienie, że `next build` nie typuje testów, było fałszywe: `tsconfig` obejmuje
`**/*.ts`, a build później realnie wyłożył się na pliku testowym. Przyczyna wcześniejszego
przejścia błędu pozostaje niewyjaśniona; osobny typecheck jest obroną niezależnie od niej.
Bez migracji. **Do [Ty]:** przejście po zalogowanej trasie z VoiceOverem — arkusze, onboarding
i logger.

**Paczka A gotowa technicznie 2026-07-31 na `agent/audit-a-data-trust` (PR #60):**
service worker przestał cache'ować odpowiedzi RSC/HTML zalogowanego konta i podpisane URL-e zdjęć
sylwetki, a wylogowanie czyści Cache Storage (`lib/appCaches.ts`); objętość liczy jeden wzór
(`setVolumeKg`) i **wreszcie uwzględnia `added_weight`** — historyczny tonaż wzrośnie tam, gdzie
były dociążenia; aplikacja dostała pierwsze w historii stany błędu i 404 (`app/error.tsx`,
`app/not-found.tsx`, `app/session/[id]/error.tsx`). Bramka: lint, tsc, **260/260** unit, build.
Bez migracji.

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
  158/158 unit, 26/26 testów przeglądarkowych i walidatory 907/15/309 oraz 60/60.
  CI PR oraz ponowne CI `main` są zielone, Vercel wdrożył `47f48ae`, a publiczny login
  po przeładowaniu nie zgłasza błędów. Pozostaje checkpoint urządzeniowy [Ty].
- **SESSION-01A2…01A4 — na produkcji, scalone w PR [#27](https://github.com/danielm1212/arco/pull/27)/[#28](https://github.com/danielm1212/arco/pull/28)/[#29](https://github.com/danielm1212/arco/pull/29):**
  przebudowa prezentacji loggera po dogfoodzie SESSION-01A. Wiersz serii ~120 px → **44 px**
  (check w wierszu, menu robocza/rozgrzewkowa/usuń pod numerem); rozgrzewka i rozciąganie jako
  regulowane timery, rozciąganie ostatnią pozycją treningu (nie na Done); świeże wejście na
  `scrollY = 0` bez fokusu; jednorazowa podpowiedź startowa (popover + `useFocusTrap` +
  współdzielony `lib/bodyScrollLock.ts`, zamyka wyłącznie „Rozumiem"/Escape — świadomy wyjątek
  od reguły „overlay zamyka się kliknięciem w tło"); moment rekordu 34 → 60 cząstek, zasięg
  w `vh` zamiast px. Bramka na finalnym commicie: lint, TypeScript, build, 158/158 unit,
  32/32 przeglądarkowych. **Pozostaje wyłącznie krok 5/6 procedury `arco-release`** —
  weryfikacja proda w przeglądarce i regresja urządzeniowa [Ty], **nie merge** (już wykonany).
  Szczegóły: `session-01a2-release-2026-07-27.md`, `session-01a3-release-2026-07-27.md`,
  `session-01a4-release-2026-07-27.md`.

- **PLAN-C0–C4 — WDROŻONE NA PRODUKCJĘ 2026-07-29 (PR #35–#44):** biblioteka v2.1
  (`training_programs_v2`) przyjęta jako kanon recept (**D-42**, `audyt-biblioteki-programow-2026-07.md`
  superseded z trzema wyjątkami — kolejność power/skill z TRAIN-01 zostaje). Osiem migracji
  (`20260728213337`…`20260729143423`) na produkcji, `migration list` potwierdza `local == remote`
  (60 migracji, zero oczekujących). Efekt zweryfikowany bezpośrednio w bazie produkcyjnej:
  **15 programów systemowych, 334 sloty, zero otwartych sesji**; zero twardych zer pokrycia
  mięśni (było 1 — `lower-body-gym3` brzuch); zero planów z nieprawdziwym deklarowanym czasem
  (było 7, do 26 min rozjazdu); bezpośrednia praca ramion w 13/15 planów (kalistenika świadomie
  bez izolacji — brak sprzętu); 15/15 kart w `docs/trainings/`. Kluczowe decyzje po drodze:
  **D-43** (zamiennik dziś = wyłącznie ścieżka sprzętowa), **D-44** (korekta treści może usuwać
  sloty — historia zachowuje `exercise_id`, traci powiązanie ze slotem), **D-45** (profil
  objętości `intermediate-gym-fbw2` zamrożony testem), **D-46** (`npm run audit:muscle-coverage`
  obowiązkowy przy każdej zmianie recepty — PLAN-C1 omal nie zabrał serii nóg niezauważenie),
  **D-47** (operacja usuwająca dane ma mieć warunek bezpieczeństwa w SQL, nie w analizie
  poprzedzającej — patrz niżej). Bramka: lint, build, 187/187 unit, walidatory 907/15/336
  oraz 60/60, smoke Phase 1/2/offline. Pełny ślad: `plan-c-release-2026-07-29.md`.
  **Pomyłka odnotowana (D-47):** sesja blokująca usunięcie zaraportowana jako pusta na
  podstawie błędnego zapytania (szukało `session_id` w `session_sets`, która wiąże się przez
  `session_exercise_id`) — miała w rzeczywistości 26 serii, 10 zaliczonych. Warunek
  bezpieczeństwa `WHERE` w migracji odmówił usunięcia i to jedyny powód, dla którego dane
  przetrwały; po przedstawieniu prawdziwych liczb właściciel ponowił decyzję świadomie.
  **Otwarte poza zakresem PLAN-C:** dryf `advanced-gym-ppl6` — 36 slotów na produkcji vs 38
  w seedzie, brak `Ab_Wheel_Rollout`/`Hanging_Leg_Raise` w obu dniach nóg (sprzed PLAN-C, P13
  nigdy nie był point-syncowany); mała migracja synchronizująca czeka na decyzję [Ty].
  **Otwarte ogólnie:** checkpoint wizualny [Ty] (ekrany planów są za loginem, niesprawdzone),
  56 slotów z zaślepką zdjęcia (17 unikalnych ćwiczeń), brak niezależnego coach sign-off,
  14% slotów ma alternatywę. **Nowy dokument `droga-do-gotowosci-bety-2026-07.md`** (2026-07-29)
  ocenia dystans do zamkniętej bety na **4/10** — nie mierzy jakości treści (już poprawionej),
  tylko bramkę dostarczenia: media ćwiczeń, safety feedback po sesji, zatwierdzenie trenerskie,
  snapshot recepty (CORE-1), analitykę rdzenia, prowadzenie pierwszej sesji, zamienniki. Ten
  dokument jest teraz źródłem prawdy o kolejności pozostałej części PLAN-Q — jawnie **nie**
  obejmuje redesignu kart (PLAN-05/TRAIN-06), który zostaje osobnym torem.

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
   przygotowania. **PLAN-C0–C4 (2026-07-29) zamknęło korektę treści 15/15 programów na
   produkcji** — zero twardych zer pokrycia, zero nieprawdziwych czasów sesji, patrz §2 wyżej.
   Pozostaje: **56 slotów z zaślepką zdjęcia** (17 unikalnych ćwiczeń, lista i kolejność wg
   zasięgu w `droga-do-gotowosci-bety-2026-07.md` §2), **brak niezależnego zatwierdzenia
   trenerskiego** (P0 z audytu v2.1, zewnętrzne, 1–2 tyg. kalendarzowo), **14% slotów ma
   alternatywę** (dziesięć planów bez ani jednej), oraz dryf `advanced-gym-ppl6` (patrz §2,
   PLAN-C) czekający na decyzję [Ty]. Pełne TRAIN-03/05 (kanoniczny sprzęt, wykonalność per
   slot i rozszerzona recepta) pozostaje otwarte — `droga-do-gotowosci-bety-2026-07.md` jest
   teraz źródłem prawdy o kolejności tego, co zostało do zamkniętej bety (ocena dziś: 4/10).
3. **PWA:** ostatni fix sticky i techniczna poprawka pozycji bottom sheeta (`TRUST-03`)
   wymagają potwierdzenia na iPhone PWA/Safari i przy starym cache.
4. **Fresh account:** F0.7 zweryfikowane lokalnie 2026-07-24 (skip/finish, `0/N`,
   usunięcie historii — zero P0/P1); brakuje wyłącznie regresji na fizycznym nowym
   urządzeniu (iPhone PWA, razem z TRUST-01/03).
5. **Android:** brak pełnego checkpointu systemowego Back/PWA.
6. **A11y:** `BottomSheet` ma już focus trap, zwrot fokusu, `inert` tła i obsługę stosu
   arkuszy; bramka przeglądarkowa obejmuje klawiaturę i trzy poziomy. Nadal brakuje
   ręcznego przejścia VoiceOver na fizycznym iPhonie — automaty nie potwierdzają jakości
   ogłoszeń i gestów czytnika.
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
- 907 rekordów ćwiczeń, 15 programów, 334 sloty na produkcji; bieżące liczby potwierdza
  `npm run validate:training` (lokalnie seed daje 336 slotów — rozjazd to znany dryf
  `advanced-gym-ppl6`, patrz §4 punkt 2);
- publiczna rejestracja wyłączona;
- migracje produkcyjne są zastosowane do
  `20260729212437_plan05a_program_cover_image.sql` (PLAN-05A), czyli 61 migracji;
  `migration list` potwierdza zgodność local == remote. Kolumna
  `programs.cover_image_url` jest nullable i ma dziś `null` dla wszystkich 16 programów
  (15 systemowych + 1 własny).

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
4. [Ty] checkpoint starego cache/iPhone PWA dla R4A, SESSION-01A i SESSION-01A2…01A4
   (procedura `arco-release` krok 5/6 — merge już wykonany, patrz punkt 7 poniżej);
   fizyczna regresja nie blokuje rozpoczęcia PLAN-Q.
5. **HOME-NAV — na `main` i produkcji:** kontrakt IA zrewidowany (trzy taby Home · Trening · Ekipa, D-38…D-41),
   POC zatwierdzony, paczki HOME-01…03, NAV-01 i PLAN-04 rozpisane w `spec-home-i-nawigacja.md`.
   **HOME-01 (PR [#33](https://github.com/danielm1212/arco/pull/33)) i HOME-02
   (PR #48), HOME-03 (PR #49) są na `main`. HOME-03 pokazuje** trzy ostatnio trenowane ćwiczenia
   (min. dwie kwalifikowane sesje
   w 90 dni), rekord, 1RM, progres, neutralny brak zmian, sparkline i link „Wykresy".
   Reużywa `getHomeInsights` i dodaje **zero zapytań**. Audyt pakietów #33/#34/#46/#47/#48
   jest w `ocena-home-nav-plan05-2026-07-30.md`; wykryty P1 blokującego batcha naprawiono
   przed HOME-03 przez połączenie dwóch odczytów sesji (5 → 4 równolegle).
   Budżet HOME-02 był wcześniej **zmierzony przez
   `pg_stat_statements` przed implementacją**: naiwny reuse `periodStats`/`getStrengthTrends`
   dawał **+13 zapytań** (8 → 21), więc agregaty liczą się z wierszy, które `getHomeGuidance`
   i tak już pobiera — koszt realny **+1** (licznik rekordów, `head: true`, równolegle,
   bez pogłębiania waterfalla). Po poprawce P1 serwerowy RSC Home wykonuje 8 wywołań
   zamiast 9. Audyt przeglądarkowy doprecyzował wcześniejsze liczenie: globalny mini-bar
   aktywnej sesji dodaje po hydratacji jeden odroczony odczyt, więc pełne wejście to
   **8 RSC + 1 mini-bar = 9**, przy delcie HOME-03 nadal równej **0**.
   CTA startu nie czeka na statystyki (wspólny `Suspense`
   po hero). „Największy progres" liczony w oknie 90 dni, tym samym co `getStrengthTrends`,
   żeby Home i Postępy nie rozjechały się na tym samym ruchu. Pełny Home za lokalnym
   loginem sprawdzony po buildzie na 320/375/393 px light i 393 px dark, bez overflow;
   209/209 unit i 32/32 przeglądarkowych. Re-audyt PR #49 podniósł ocenę techniczną
   **6 → 8,6/10**: początkowy JS Home ma **171,2 KiB gzip** (budżet < 200 KiB), trzy
   przebiegi Lighthouse na uwierzytelnionym buildzie dały performance/accessibility
   **100/100**, medianę **LCP 751 ms, TBT 19 ms, CLS 0**. Usunięto klienta Supabase
   z początkowego bundle'a globalnego mini-baru, poprawiono kontrast aktywnej nawigacji,
   label-in-name celu tygodniowego, rozmiar logo i target „Zmień" do 44×44 px.
   Stan bez historii oraz offline smoke są zielone.
   **NAV-01 scalone w PR [#50](https://github.com/danielm1212/arco/pull/50) i wdrożone
   2026-07-30:**
   BottomNav ma Home | Trening | Ekipa, wspólny pasek ma Plany | Postępy | Ciało | Historia,
   Home nie renderuje lokalnego paska, a loadingi zachowują chrome. Naprawiono też semantykę
   `replace`, gdy z podwidoku Treningu wracamy globalnym tabem do Planów. Bramka: lint, build,
   210/210 unit, 33/33 testów przeglądarkowych; realny build 320/393 px bez overflow.
   Zachowany profil starego service workera, deep linki i przepływ tab → zakładka → child →
   Back są zielone w automatycznym smoke; `arco-a11y-review` bez findingów. CI PR-a i `main`
   oraz deployment Vercel dla scalonego SHA są zielone. Uwierzytelnionego flow produkcyjnego
   nie zweryfikowano z tej sesji, bo lokalne konto nie odpowiada produkcyjnemu.
   **Do [Ty]: checkpoint fizycznego iPhone PWA/Androida dla HOME-01…03 i nowego chrome.**
   Bramka kolejności została spełniona: NAV-01 weszło przed PLAN-05D i R2.2.
   **PLAN-04 gotowe technicznie w paczce F:** dowolny dzień startuje bez zmiany aktywnego
   planu, a test RPC pilnuje także wznowienia jedynej otwartej sesji.
6. **PLAN-05 — w toku:** redesign karty i listy planu (zdjęcie/fallback, poziom w paskach,
   CTA nad zgięciem, akordeon opisu, usunięcie zahardkodowanej karty „Jak robić postęp").
   Paczki 05A…05E rozpisane w `spec-plan-detail-card.md`. **05C (`LevelMeter`) gotowe
   technicznie 2026-07-28, PR [#34](https://github.com/danielm1212/arco/pull/34)** —
   komponent + `lib/levelMeter.ts` (dane/copy jako czyste funkcje), lint/tsc/build zielone;
   jest już wpięty w `/programs/[id]` przez 05D, a `ProgramRow` czeka na 05E. Self-review
   a11y policzył kontrast: `bg-primary/20` na pustym segmencie
   wychodzi 1.34:1 (poniżej progu 3:1 dla elementów graficznych), więc pusty segment jest
   obrysem (`border-primary`), nie przezroczystym wypełnieniem — odejście od dosłownego
   brzmienia spec-a („obniżona krycia"), uzasadnione policzonym kontrastem, do potwierdzenia
   wizualnego przy 05D/05E. **05A (migracja `cover_image_url`) wdrożone na produkcję
   2026-07-30** —
   `programs.cover_image_url` (nullable, bez zmian RLS), `db reset`/seed/walidatory/smoke
   Phase 1/2/offline/Ekipa zielone. Przed wdrożeniem wykonano backup
   `backups/20260730T111541Z`; dry-run zawierał wyłącznie PLAN-05A, a `migration list`
   potwierdziło 61/61. Odczyt produkcyjny potwierdził 16 programów i zero niepustych
   okładek. **05B (`ProgramCover`) jest na `main` po PR
   [#52](https://github.com/danielm1212/arco/pull/52):** jeden komponent `row`/`hero`,
   fallback pod obrazem
   (bez migotania), obsługa błędu ładowania, opisowy `alt` realnego zdjęcia i dekoracyjny
   fallback. Do `next/image` dopuszczono wyłącznie publiczny Storage Supabase; Tailwind skanuje
   `lib/`, aby klasy gradientów nie znikały z buildu. Jest wpięty w `/programs/[id]`
   przez 05D, a lista `/programs` czeka na 05E. Lint, unit **213/213**, build i overflow
   **34/34** są zielone; ręcznie potwierdzono 320 px, light/dark oraz fallback po 404.
   **05D jest na `main` po PR
   [#53](https://github.com/danielm1212/arco/pull/53):**
   docelowy ekran presetu ma hero 4:3, pełne fakty z ikonami, `LevelMeter`, CTA/stan
   „Aktywny" nad zgięciem, domyślnie otwarty opis, sprzęt i zachowaną rotację; usunięto
   powtarzalną kartę „Jak robić postęp". Własny plan nadal otwiera dotychczasowy edytor
   focus. Realny build na koncie lokalnym potwierdził stany CTA i akordeonu; na 320 px trzy
   fakty są w jednym rzędzie, poziom w drugim, zero overflow. Bramka: lint, build,
   **217/217** unit i **35/35** przeglądarkowych. `arco-a11y-review` poprawił kontrast
   napisu stanu aktywnego (4,00:1 → `text-foreground`); brak nowych findingów AA.
   Konto testowe usunięto punktowo po znanym ID.
   **05E jest gotowe technicznie 2026-07-30 na `agent/plan-05e-program-list`, bez commita:**
   redesign karty zaakceptowany wizualnie przez właściciela. Tytuł jest prezentacyjny
   (`lib/programListCard.ts` zdejmuje z nazwy poziom, środowisko i częstotliwość — bez
   migracji, pełna nazwa zostaje w bazie i w szczególe), środowisko jest małym tagiem,
   fakty zwarte, a poziom to nowy `LevelMeter variant="list"` — trzy małe pionowe słupki
   o rosnącej wysokości. „Ustaw" wyszło spod miniatury do stopki karty (60×44 px), więc
   kolumna zdjęcia jest wyłącznie zdjęciem. Aktywny plan to stan całej karty
   (obrys `primary/80` + tło + „✓ Aktywny"), nie osobny przycisk. Wariant `bars` i ekran
   `/programs/[id]` z 05D pozostały nietknięte. Bramka: lint, build, **226/226** unit
   i **36/36** overflow; 320/393 px, light i dark, bez overflow; reflow trzyma do 200%
   powiększenia tekstu. Kontrasty policzone z tokenów — jedyne świadome odstępstwo to
   pełny vs pusty słupek w dark (**2,44:1**), udokumentowane w `components/LevelMeter.tsx`:
   słupki są warstwą pomocniczą, bo poziom stoi słownie obok i w `aria-label`.
   Bez migracji, deployu i zmian w Linearze.
   **05F+05G jest gotowe technicznie 2026-07-31 na `agent/plan-05fg-program-naming`:**
   karta biblioteki dostała nazwę własną i metodę. Migracja
   `20260731103500_plan05f_program_split_and_short_name.sql` dodaje `split_key`
   (enum: `fbw`/`upper_lower`/`ppl`/`lower_body_focus`) i `short_name`, z backfillem 15
   presetów i guardem na pusty stan; `scripts/seed.ts` ustawia te same wartości.
   Zmierzony problem wyjściowy: **14/15 kart dzieliło tytuł** („Całe ciało" ×8) — po zmianie
   0 kolizji w każdej grupie poziomu, zabezpieczone testem. Tytuł to `short_name`
   („Spokojny start", „Siła bez ciężarów", „Pełen gaz"), metoda to drugi tag obok środowiska
   w języku siłowni (`FBW A/B`, `Upper/Lower`, `Push/Pull/Legs`) — zgodnie z regułą
   „terminologia siłowni, nie słownikowa" z `r5a-slownik-pl-propozycja.md` §1. Fakty dostały
   ikonę kalendarza i zegara jak w szczególe 05D. **Miernik poziomu przeszedł na skalę
   narastającą** (1/2/3 kropki zamiast zapalania samego segmentu poziomu) — to zmienia także
   wariant `bars` na `/programs/[id]`, zamierzenie, nie regresja; zakres 1–2 daje 2 kropki
   i są równane do nazwy `level_max` — miernik używa wyłącznie trzech nazw:
   „Początkujący", „Średniozaawansowany", „Zaawansowany". `split_key` odblokowuje
   filtr metody w R2.2.
   Bramka: lint, tsc, **237/237** unit, **36/36** overflow, `validate:training`,
   `validate:recommendations` **60/60**, build. Karty mają równe 144 px na 320 i 393 px,
   light i dark, bez overflow. `supabase db reset` świadomie pominięty (skasowałby lokalny
   dziennik treningowy) — świeżą bazę pokrywa CI. Bez deployu i zmian w Linearze.
   **PLAN-05H jest gotowe technicznie 2026-07-31 na `agent/plan-05h-level-nav`:** druga
   iteracja po przeglądzie właściciela na produkcji. Cztery poprawki:
   1) **Chipy poziomu zamiast nagłówków grup** — „Wszystkie/Początkujący/Średniozaawansowany/
      Zaawansowany", przewijalne w poziomie (`overflow-x-auto`, nie zawijają się),
      „Wszystkie" domyślnie aktywne. Filtrują ten sam `?level=`, którego już używał sheet
      filtrów — usunięto z niego zdublowaną sekcję „Poziom", zostawiając środowisko/kierunek/
      cel. Lista jest teraz płaska (sortowanie zamiast koszy po `level_min`), więc plan
      o zakresie poziomów nie może już stanąć pod niepasującym nagłówkiem.
   2) **Migracja `20260731115619_plan05h_lower_body_intermediate_only.sql`**: dwa plany
      `lower-body-*` miały `level_min=1, level_max=2` — świadomy plan-pomost (jedyne dwa
      slugi bez prefiksu poziomu w całym katalogu), ale renderowały się ze sprzeczną
      etykietą wobec nowych chipów. Zwężone do `2-2` (decyzja właściciela, po pokazaniu
      diffu macierzy rekomendacji: rekomendowany program się nie zmienia, zmienia się
      tylko framing 4/60 profili onboardingu z „Dopasowany" na „Najbliższy w bibliotece").
      `name`/`level`/`level_min` zaktualizowane razem — `buildLevelMeter` czyta `level`
      wprost, gdy `level_min === level_max`, więc rozjazd dałby dwie kropki obok starej
      etykiety zakresu.
   3) **Miernik: rosnące słupki zamiast równych kropek** (wzorzec Tempo/Gymshark), etykieta
      tekstowa teraz na KAŻDEJ karcie presetu (nie tylko aktywnej — nagłówki grup, które
      wcześniej niosły to słowo, zniknęły).
   4) **Bug: klikalna miniatura** — `ProgramCover` leżał poza `<Link>`; przeniesiony do
      środka, `<Link>` rozciąga się na obie kolumny w rzędzie 1.
   Znalezisko z weryfikacji wizualnej: słupki+etykieta+„Ustaw" w jednym wierszu **nie
   mieściły się na 320 px dla 10 z 15 presetów** (poziom 2–3, brakowało ~30–40 px — więcej
   niż da się odzyskać ścieśnieniem odstępów). Naprawione przeniesieniem miernika na własną
   linię nad stopką; stopka jest teraz wyłącznie akcją. Wszystkie karty **równe 172 px**
   na 320/393 px, light/dark, zero overflow (wcześniej 144/164 px na przemian).
   Korekta oceny: „martwy chip «Pasuje do Twojego kierunku»" z poprzedniego audytu to
   NIE bug — `training_focus` jest realnym ustawieniem w `SettingsForm.tsx`, chip po
   prostu nie renderuje się dla domyślnej wartości `balanced`. `force-dynamic`/cache
   katalogu odłożone — większa zmiana architektoniczna poza zakresem tej paczki.
   Bramka: lint, tsc, **239/239** unit, **37/37** overflow, `validate:training`,
   `validate:recommendations` **60/60**, build. Migracja zastosowana lokalnie
   (`migration up`, nie `db reset` — ochrona lokalnego dziennika treningowego).
   **Do [Ty]:** `db push` na produkcję przed merge (ten PR ma migrację — patrz
   `arco-migration` §6), przejście po zalogowanej trasie `/programs` i checkpoint
   iPhone PWA dla 05D/05E/05F/05G/05H. Potem PLAN-05I (test na realnym `ProgramRow`
   zamiast trzech ręcznie synchronizowanych kopii markupu), następnie R2.2 (może wejść
   dopiero po 05H — dotyka tej samej powierzchni `/programs`).
7. [Ty] krok 5/6 `arco-release` dla SESSION-01A2…01A4 — weryfikacja proda w przeglądarce
   i regresja urządzeniowa (merge i auto-deploy Vercel już wykonane, #27/#28/#29 w `main`).
   Opcjonalny follow-up domykający ryzyko 6: podpiąć `lib/useFocusTrap.ts` do
   `components/ui/bottom-sheet.tsx` (`A11Y-SHEETS` w backlogu).
8. **PLAN-Q — treść 15/15 zamknięta przez PLAN-C (§2), reszta w toku:** [Ty] decyzja o
   punktowym syncu dryfu `advanced-gym-ppl6`; kolejność pozostałych kroków (media zdjęć →
   safety feedback → zatwierdzenie trenerskie → CORE-1 snapshot → analityka → prowadzenie
   pierwszej sesji → zamienniki) jest w `droga-do-gotowosci-bety-2026-07.md` (dziś 4/10).
   Prawda sprzętowa (TRAIN-05) i recepta v2 (TRAIN-03) nadal otwarte. UI karty planu jest
   w PLAN-05, nie tutaj.
9. R2.2 → R4B–R4D → CORE-1 → R4E → R3b → R5b → R6 → H2. Domowy plan 20–30 minut
   (`PROGRAM-01A`) pozostaje osobnym eksperymentem po sygnale H2, nie dodatkowym dniem.

## 7. Reguły operacyjne

- Migracje wyłącznie przez `supabase/migrations`; każda tabela użytkownika ma RLS i test wielokontowy.
- Produkcyjne dane testowe usuwamy tylko po znanych ID.
- Jeden build Next.js naraz.
- Deploy i zamknięcie sesji zgodnie z `.claude/skills/`.
- Każda zmiana stanu aktualizuje HANDOFF, backlog/plan i `koordynacja-agentow.md`.
- Warstwa operacyjna zadań: Linear (workspace `trainarco`; od 2026-07-21 zastępuje Notion). Repo docs pozostają źródłem prawdy.
