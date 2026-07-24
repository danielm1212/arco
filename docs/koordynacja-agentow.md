# Arco — koordynacja agentów

**Aktualizacja:** 2026-07-22
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
| — | — | — | — | brak aktywnych rezerwacji |

## Ostatnie wpisy

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
