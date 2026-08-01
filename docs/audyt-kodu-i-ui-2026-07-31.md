# Audyt kodu, komponentów i UI/UX — 2026-07-31

**Zakres:** `main` @ `b975fe0` (po HOME-05b), 154 pliki w `app/`/`components/`/`lib/`, ~19,5 tys. linii.
**Metoda:** siedem równoległych przebiegów (architektura, UI/design system, a11y, wydajność/dane,
testy, treść, bezpieczeństwo/RLS) + weryfikacja punktowa najgroźniejszych tez.
**Status dokumentu:** źródło kolejki napraw. Pozycje zamknięte oznaczone ✅ z numerem PR.

## 0. Co jest mocne (nie ruszać bez powodu)

- **RLS kompletne** — 20 tabel, każda z politykami wiążącymi wiersz z `auth.uid()`, łańcuchy
  trzypoziomowe działają. Server actions świadomie ufają RLS zamiast dublować sprawdzenia i w
  każdym sprawdzonym przypadku polityka faktycznie blokuje. Service role wyłącznie w `scripts/` i CI.
- **Niezmienniki w bazie, nie w UI** — jedna otwarta sesja (indeks unikalny), walidacja serii
  triggerem (`assert_valid_completed_set`), zakresy kolumn.
- **Zero magic-hexów** w `app/` + `components/` (jeden wyjątek, poz. 8).
- **`lib/week.ts`** z realnymi testami DST, **`lib/outbox.ts`** przetestowany behawioralnie.
- **Zero `.delete()` bez `.eq("id", …)`** — reguła „nigdy hurtowo" jest dotrzymana w kodzie.

## 1. Kolejka napraw

Wagi: **P0** = utrata danych / zaufania · **P1** = blokuje użycie · **P2** = pęka przy skali ·
**P3** = spójność i dług.

### P0

| # | Problem | Miejsce | Stan |
|---|---|---|---|
| A1 | SW cache'ował RSC/HTML zalogowanego konta i podpisane URL-e zdjęć sylwetki; nic nie czyściło tego przy wylogowaniu | `app/sw.ts`, `app/login/actions.ts` | ✅ PR #60 |
| A2 | `router.refresh()` miał gubić niezapisany wpis w loggerze | `app/session/[id]/Logger.tsx:276-315` | ❌ **nie potwierdzone** — patrz §3 |
| A3 | Objętość liczona sześcioma kopiami wzoru, żadna nie znała `added_weight` | 6 plików, patrz `lib/sessionSetFacts.ts` | ✅ PR #60 |
| A4 | Brak `error.tsx` i `not-found.tsx` w całej aplikacji | `app/` | ✅ PR #60 |

### P1 — dostępność

Wszystkie jedenaście potwierdzone w kodzie przed naprawą (metoda: `arco-a11y-review`),
kontrasty policzone z realnych tokenów `app/globals.css`. Zero fałszywych alarmów —
jedyne odchylenie to B6, gdzie `TimedStopwatch` miał `min-h-11` już wcześniej.

| # | Problem | Miejsce | Stan |
|---|---|---|---|
| B1 | `text-white` na `bg-success` w dark = **2,37:1** — check zaliczonej serii znika | `SetRow.tsx:376` | ✅ nowy `--color-success-contrast` → **7,90:1** |
| B2 | `BottomSheet` bez pułapki fokusu; tło bez `inert` mimo `aria-modal="true"` | `components/ui/bottom-sheet.tsx:96-120` | ✅ `lib/inertBackground.ts` + pułapka Tab, test e2e w Chromium |
| B3 | Pola liczbowe loggera bez dostępnej nazwy (tylko `placeholder`) | `SetRow.tsx:430-520`, `ExerciseCard.tsx:255-272` | ✅ `label` wymagany w `Field`, nazwa niesie numer serii |
| B4 | „W" (rozgrzewka) = **1,91:1** w light; jedyny odróżnik od serii roboczej | `SetRow.tsx:218` | ✅ nowy `--arco-amber-700` → min. **4,89:1** |
| B5 | `destructive` w dark = **3,36:1**, na potwierdzeniach usuwania (8 miejsc) | `components/ui/button.tsx:16` | ✅ `ink-900` w dark → **5,27:1** |
| B6 | Przyciski przerwy 36 px zamiast 44 | `RestTimer.tsx:88,117,120` | ✅ `min-h-11` (w `TimedStopwatch` był już wcześniej — częściowo fałszywy alarm) |
| B7 | Onboarding nie jest dialogiem; karty wyboru bez `aria-pressed` | `WelcomeOverlay.tsx:201,262,286,311,336` | ✅ `role="dialog"` + `inert` + fokus za krokiem + 4×`aria-pressed` |
| B8 | Brak `h1` na Dziś/Plany; ćwiczenia w loggerze nie są nagłówkami | `TrainingHeader.tsx`, `ExerciseCard.tsx:145` | ✅ `h1` sr-only na obu trasach, tytuł sesji `h1`, ćwiczenia `h2` |
| B9 | `prefers-reduced-motion` pokrywa 3 z 6 animacji (brak `animate-in`, `animate-pulse`) | `globals.css:399-412` | ✅ 6/6 |
| B10 | Tinty tekstu 3,89–4,13:1 (badge supersetu, monogram, prowadzenie progresji) | `ExerciseCard.tsx:233,150`, `TrainingHeader.tsx:53` | ✅ przeniesione na violet support → **7,00 / 12,81:1** |
| B11 | Chipy poziomu udają `role="tab"` bez `tabpanel`, `aria-controls` i strzałek | `ProgramLevelChips.tsx:58-75` | ✅ `role="group"` + `aria-pressed` |

**Znalezione przy okazji, poza listą audytu (decyzja właściciela: naprawiamy w tej samej paczce).**
Ta sama klasa błędu co B4 — stopień WYPEŁNIENIA użyty jako tekst:

| # | Problem | Stan |
|---|---|---|
| B12 | `text-success` = **4,18:1** na canvas (light) — `/postępy`, `/ciało`, `SettingsForm` | ✅ nowy `--arco-green-600` → min. **4,98:1** |
| B13 | `text-danger` w dark = **4,47:1** na powierzchni i **3,98:1** na `danger/10` — wszystkie komunikaty błędu | ✅ nowy `--arco-red-300` → min. **5,13:1** |

Wnioskiem systemowym z całej paczki jest kontrakt trzech ról koloru semantycznego
(`bg-<kolor>` · `text-<kolor>-foreground` · `text-<kolor>-text`), opisany przy tokenach
w `app/globals.css` i w `tailwind.config.ts`. Cztery z trzynastu pozycji to jedna
pomyłka powtórzona cztery razy: użycie stopnia wypełnienia jako tekstu.

### P2 — skala

| # | Problem | Miejsce | Dowód | Koszt |
|---|---|---|---|---|
| C1 | `/postępy`: 13 zapytań w 4 rundach; zakładka „Wszystko" buduje `.in()` na wszystkich ID (~69 KB URL przy 2 latach historii) | `app/progress/stats.ts` | budżet: ≤4 równolegle | 1 h obejście / 8-12 h porządnie |
| C2 | Dwie rosnące listy bez limitu ciągną całą historię | `history/page.tsx:26`, `done/page.tsx:48` | wzorzec okna istnieje w `stats.ts:174` | 1,5 h |
| C3 | Kod zaproszenia Ekipy: brak rotacji, wygasania i listy wykluczeń; widzi go każdy członek | `20260714153000_short_team_invite_codes.sql`, `TeamPanel.tsx:239` | usunięta osoba wraca tym samym kodem | 5 h |
| C4 | Brak CHECK na `target_sets` + `generate_series` w `start_or_resume_session` | `init_schema.sql:72`, `single_open_session.sql:142` | `target_sets = 2e9` = self-service DoS | 2 h |
| C5 | `body_metrics` bez CHECK; `logBodyMetric` waliduje tylko „waga > 0" | `app/actions/body.ts:23-29` | `weight: 1e12` trwale psuje wykres, brak edycji pomiaru | 2 h |
| C6 | Zero limitów długości tekstów poza Ekipą (notatki, nazwy planów, etykiety dni) | `app/actions/program.ts`, `sets.ts:215` | kilka MB notatek = logger się nie otwiera | 2 h |
| C7 | Bucket `body-photos` bez `file_size_limit` i `allowed_mime_types`; upload przed akcją serwerową | `20260623213314_body_photos.sql:3-5` | osierocone obiekty poza jakąkolwiek ścieżką kasowania | 2 h |
| C8 | `/session/[id]`: 6 zapytań w 4 rundach; `getRepPRs` skanuje całą historię bez okna | `app/session/[id]/page.tsx`, `lib/repPRs.ts:24-37` | rundy 1-3 dają się scalić | 4-6 h |
| C9 | Logger zapisuje `localStorage` synchronicznie do 60×/s przy przewijaniu | `Logger.tsx:317-350` | `scrollY` w zależnościach efektu zapisu | 2-3 h |
| C10 | Ikony 3D: PNG 141-230 KB z `unoptimized`, 195 KB z `priority` na ścieżce LCP | `MomentIcon3D.tsx:28-36` | budżet: obraz < 100 KB | 2-3 h |
| C11 | Obrazy ćwiczeń surowym `<img>` mimo gotowego `remotePatterns`; picker ładuje do 30 oryginałów | `ExerciseBrowser.tsx:242`, `ExerciseInfoSheet.tsx:113` | próbka źródła: 2,07 MB | 3-4 h |
| C12 | Mini-bar dokłada 2 round-tripy do KAŻDEJ nawigacji, duplikując dane, które Home już ma | `SessionMiniBar.tsx:38-51` | Home: 10 zapytań przy budżecie 4 | 2-3 h |
| C13 | Outbox: stały retry 15 s bez backoffu, pełny flush na każdy tap ✓ | `lib/useSync.ts:120-145` | 4 żądania/min w nieskończoność przy awarii | 3-4 h |
| C14 | `exercises`: tekstowy PK od klienta — da się zająć `id` z seeda i wywrócić następną migrację | `user_exercises.sql:17-19` | `arco-migration` §5 ostrzega przed tą klasą | 1 h |
| C15 | `sync_workout_activity_day` ufa `p_previous_day` od klienta | `20260714133500…sql:29-49` | rozjazd passy widocznej dla Ekipy | 1 h |

### P3 — spójność, treść, dług testowy

| # | Problem | Miejsce | Koszt |
|---|---|---|---|
| D1 | Odmiana liczebników zepsuta w 12 miejscach („3 ćwiczeń", „1 serie", „22 treningów") + **„gdy schudam"** (niesłowo) | `trainingPriority.ts:10` i 11 innych | 4 h |
| D2 | Surowe `error.message` z Postgresa w polskich toastach (7 miejsc) + komunikaty w SQL-u poza recenzją copy („Jej cel… zagrożony", „szturchnięcie") | `app/actions/team.ts`, `userExercises.ts`, migracja `20260720153000:250` | 3 h |
| D3 | **Pasek 14 dni na `/postępy`** — trzeci język dnia treningowego (prostokąty, brak „dziś", alfabet gdzie „P" = poniedziałek i piątek) | `progress/sections.tsx:36-43`, `stats.ts:183-187` | 3,5 h |
| D4 | Nazwy mięśni po angielsku na `/postępy`, choć mapa PL istnieje i działa na Done | `progress/sections.tsx:159` | 0,5 h |
| D5 | „0 tygodni z rzędu" — jedyne miejsce łamiące regułę „passa nigdy przez zero" | `progress/sections.tsx:33` | 1 h |
| D6 | Trzy ekrany formatują daty bez strefy → Historia pokazuje inny dzień niż kalendarz nad nią | `history/page.tsx:119`, `exercise/[id]:306`, `body/page.tsx:109` | 1,5 h |
| D7 | `/ciało` ma w nagłówku napis „Postępy" | `body/page.tsx:66`, `body/loading.tsx:4` | 0,5 h |
| D8 | Elevation E0–E3 zadeklarowane i nieużywane; nawigacja rzuca twardszy cień niż modal nad nią | `globals.css:113-121` vs 43× `shadow-sm`, 5× `shadow-lg` | 4 h |
| D9 | Cztery podwidoki Treningu, trzy różne headery; skeleton Historii nie zgadza się ze stroną | `TrainingHeader` / `PageHeader` / ręczne `<header>` | 3 h |
| D10 | Rust + violet w jednym komponencie na karcie planu — obok komentarza cytującego regułę, którą łamie | `programs/page.tsx:239,285` | 1,5 h |
| D11 | Ustawienia: wypełniony rust jako stan zaznaczenia (4 różne języki selekcji), więc „Zapisz" niczym się nie wyróżnia | `SettingsForm.tsx` | 3 h |
| D12 | Drugi wypełniony przycisk na Home (violet `support` w karcie „Kolejny krok") — HOME-06, ale nie w hero | `ProgramReviewInsight.tsx:70-77` | 2 h |
| D13 | Ikony 3D clay w warstwie narzędzia: fallback okładki KAŻDEGO planu + nagłówek formularza | `ProgramCover.tsx:49`, `history/add/page.tsx:34` | 2,5 h |
| D14 | Emoji w warstwie narzędzia; 🔥 jako reakcja obok `StreakFlame` jako passy na tej samej liście | `TeamPanel.tsx:268`, `RestTimer.tsx:86`, `history/[id]:169` | 2 h |
| D15 | CONTENT-03: 17/48 etykiet dni bez treści („Trening A"), 22/48 z angielszczyzną („Upper A · siła"), katalog niespójny sam ze sobą | `scripts/seed.ts` | 6 h + 1 h walidator |
| D16 | Trzy testy asertują **regex na kodzie źródłowym**, nie zachowanie | `sync-hydration`, `session-finish`, `session-done` | 4 h |
| D17 | Brak testu mapy błędów zapisu (retryable vs permanent) — najwyższe ryzyko utraty/zablokowania serii | `app/actions/sets.ts:14-25,216-238` | 6 h |
| D18 | RPC `start_or_resume_session` i trigger DATA-01 nie są wołane w żadnym smoke'u | `scripts/smoke-phase1.ts` | 5 h |
| D19 | Test wielokontowy RLS istnieje tylko dla Ekipy; 8 tabel bez pokrycia | `scripts/smoke-team.ts:188` | 4 h |
| D20 | `tsconfig` wyklucza `scripts/`, więc `seed.ts` (źródło katalogu planów) nie jest typecheckowany; glob `tests/*.test.ts` nie schodzi w podkatalogi | `tsconfig.json:37`, `package.json:9` | 2 h |
| D21 | Reszta długu PLAN-05I: `HomeStats`/`HomeExerciseProgress` (tanie), `ProgramRow` (wymaga wyciągnięcia), `Logger` (bloker: `useSync` → `next/headers`) | `tests/e2e/` | 1 dzień + osobno Logger |
| D22 | `LoggerExercise` — kontrakt danych trasy — mieszka w 867-liniowym komponencie klienckim; `page.tsx` (serwerowy) importuje go z modułu `"use client"` | `Logger.tsx:58-87` | 1,5 h |
| D23 | Dwie martwe server actions (`addSet`, `updateSet`) — żywe, nietestowane endpointy zapisu | `app/actions/sets.ts:95-132,165-185` | 0,5 h |
| D24 | Dwie sprzeczne konwencje błędu w `app/actions/*`, mieszane w jednym pliku | `session.ts` vs `team.ts` | 4-6 h |
| D25 | `mm:ss` formatowane siedmioma kopiami; mini-bar pokaże „1687:23" zamiast „28:07:23" | `SessionMiniBar.tsx:18`, +6 | 1-1,5 h |

## 2. Sprostowania kanonu

Trzy zapisy w dokumentach były nieprawdziwe w chwili audytu:

1. `optymalizacja.md` §3 wymieniał „Serwist precache + defaultCache" po stronie „✅ Dobre".
   Poprawione w PR #60.
2. Budżet „≤4 zapytania na widok" jest przekroczony na `/postępy` (13), `/session/[id]` (6) i
   Home (10 z mini-barem). `HANDOFF.md` liczy Home jako „8 → 21", więc rozjazd był znany, ale
   nieskonfrontowany z progiem.
3. Wpis o obrazach pomija, że rozmiar źródła nie jest kontrolowany (C10, C11).

## 3. Znalezisko odrzucone po weryfikacji

**A2 — „`router.refresh()` kasuje niezapisany wpis w loggerze" nie reprodukuje się.**
Teza brzmiała: prop `initialExercises` dostaje nową referencję, efekt hydracji podmienia stan i
wartość wpisana w niezaliczoną serię ginie. Sprawdzone: pole persystuje **na `onBlur`**
(`SetRow.tsx:488-492` → `persistSet` → outbox), a hydracja nakłada outbox z powrotem
(`restoreSessionDraft`, `lib/outbox.ts:336`). Wszystkie 14 wywołań `router.refresh()` siedzi w
handlerach akcji użytkownika — tap w cokolwiek najpierw zabiera fokus z pola. `useSync` reaguje
na `online` i interwał, ale **nie** woła `refresh`. Okno utraty wymagałoby odświeżenia bez
uprzedniego blura i takiej ścieżki w kodzie nie ma.

Zostawiam jako notatkę, bo teza jest wiarygodna i wróci przy następnym audycie: gdyby
kiedykolwiek pojawił się `router.refresh()` poza handlerem (np. po synchronizacji albo na
`visibilitychange`), ten bug stanie się realny tego samego dnia.

## 4. Kolejność, którą rekomendowałem

| Paczka | Zawartość | Koszt |
|---|---|---|
| **A. Dane i zaufanie** | A1, A3, A4 | ✅ PR #60 |
| **B. Dostępność** | B1–B11 | ~1 dzień |
| **C. Spójność `/postępy` + copy** | D3, D4, D5, D1, D2 | ~1,5 dnia |
| **D. Skala** | C1–C15 | ~2,5 dnia |

Pozycje P2/P3 spoza tych paczek wracają do `backlog-produktu.md` przy najbliższym refinemencie.
