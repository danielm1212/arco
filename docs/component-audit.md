# Audyt komponentów — Arco (2026-08-04)

Zakres: wszystkie 74 komponenty React (`components/**` + kolokowane w `app/**`).
Metoda: inwentaryzacja → analiza użycia (grep importów) → ocena jakości względem
własnych kanonów projektu (`CLAUDE.md`, `docs/wytyczne-designu.md`, `paleta-arco-warm.md`).

---

## 1. Inwentarz — 74 komponenty

| Warstwa | Ile | Zawartość |
|---|---|---|
| `components/ui/` | 4 | `button`, `input`, `switch`, `bottom-sheet` |
| `components/navigation/` | 10 | `BackButton`, `CloseButton`, `DirtyGuard`, `NavigationHistory`, `PageHeader`, `ReplaceLink`, `ScreenChrome`, `TrainingRouteHeader`, `TrainingRouteSkeleton`, `TrainingSubnav` |
| `components/forms/` | 1 | `DraftRecoveryNotice` |
| `components/` (root) | 22 | `AppChrome`, `BottomNav`, `ExerciseInfoSheet`, `LevelMeter`, `MomentIcon3D`, `MonthCalendar`, `MuscleHeatmap`, `MuscleHeatmapLazy`, `MuscleSplitBars`, `OfflineBanner`, `ProgramCover`, `RouteError`, `RouteSkeleton`, `SessionMiniBar`, `Sparkline`, `StreakBadge`, `StreakFlame`, `TeamHomeCard`, `ThemeProvider`, `TrainingHeader`, `WeekStrip`, `WelcomeOverlay` |
| `app/**` (kolokowane) | 37 | m.in. `Logger` (866 LOC), `SetRow` (528), `ProgramEditor` (461), `SettingsForm` (432), `ExerciseBrowser` (362), `ExerciseCard` (343), `TeamPanel` (292) |

Razem ~9 500 LOC w komponentach.

**Rozkład użycia:** 1 komponent martwy · 37 z jednym konsumentem (kolokowane, OK) ·
36 współdzielonych. Najczęściej używane: `button` (41), `bottom-sheet` (20),
`input` (11), `PageHeader` (9), `NavigationHistory` (9), `MomentIcon3D` (9).

---

## 2. Co jest zrobione dobrze (nie ruszać)

- **`ui/bottom-sheet.tsx` — najlepszy komponent w repo.** Własny focus trap (Tab/Shift+Tab
  cyklicznie), `inertOutside` na tle, `role="dialog"` + `aria-modal` + `aria-labelledby`
  + `aria-describedby`, powrót fokusu do wyzwalacza z obsługą łańcucha sheetów, uchwyt
  przeciągania z `aria-label`. Lepsze niż stock shadcn/Radix w kilku miejscach.
- **`ui/button.tsx`** — czysta `cva`, wyłącznie tokeny semantyczne, `forwardRef`, `asChild`,
  domyślny rozmiar `h-11` (44 px tap target jako default, nie jako wyjątek).
- **`StreakFlame.tsx`** — jedno źródło glifu passy, z udokumentowanym powodem istnienia
  (wcześniej 5 różnych rysunków + 2 emoji). Wzorzec „symbol z jednym znaczeniem = jedno
  miejsce w kodzie" zastosowany poprawnie.
- **`WeekStrip.tsx`** — jedno źródło siatki tygodnia, zgodnie z §2b wytycznych.
- **`components/navigation/`** — spójna, dobrze wydzielona warstwa chrome'u (tryby
  `hub`/`child`/`focus`/`session`). Rzadkość w projektach tej skali.
- **`MuscleHeatmapLazy`** — poprawny code-splitting ciężkiego widoku (`dynamic`).
- **Kolokacja** — 37 komponentów jednorazowego użytku siedzi przy swoich trasach zamiast
  puchnąć w globalnym `components/`. Dobra decyzja, utrzymana konsekwentnie.

---

## 3. Znaleziska — priorytet wysoki

### H1. Brak prymitywu `Card` — 42 karty sklejane ręcznie, z dryfem

Nie ma `components/ui/card.tsx`. Każda karta to surowy `<div>` z powtarzanym
łańcuchem klas, w **20 plikach**. Efekt — ta sama rola wizualna ma dziś kilka wariantów:

| Właściwość | Rozkład |
|---|---|
| elewacja | `shadow-sm` ×35 · `shadow-md` ×2 · `shadow-lg` ×2 |
| padding | `p-md` ×32 · `p-sm` ×4 |
| obramowanie | 3 karty mają `border` — wbrew HOME-04, które borderki z kart zdjęło |

To jest dokładnie ta klasa błędu, którą HOME-05/HOME-05b naprawiały dla ikon: znaczenie
ujednolicone, rysunek nie. **Rekomendacja:** `ui/card.tsx` z wariantami
(`elevation: subtle|floating|overlay`, `padding: sm|md`) i sweep 42 wystąpień.

### H2. System elewacji E1–E3 zbudowany, ale nieużywany (1 karta na 42)

`globals.css` §9 definiuje `--shadow-e1/e2/e3` + klasy `.surface-polished-*`,
`tailwind.config.ts` wystawia `shadow-e1/e2/e3`. Realne użycie:

- utility `shadow-e1` / `shadow-e2` / `shadow-e3`: **0 wystąpień**
- `.surface-polished*`: **1 wystąpienie** (hero na `app/page.tsx:263`)
- stary `shadow-sm`/`md`/`lg`: **50 wystąpień**

Cała warstwa „polished edge" (guide §10) i skala elewacji (§9) żyją w kanonie i w CSS,
ale nie w produkcie. Albo adopcja, albo świadome wycofanie z dokumentacji — obecny stan
to koszt utrzymania bez zwrotu.

### H3. `shadow-lg` to magic value spoza systemu tokenów

`tailwind.config.ts` rozszerza `boxShadow` o `sm`, `md`, `e1`, `e2`, `e3` — **`lg` nie
istnieje**. Pięć użyć (`SessionMiniBar`, `BottomNav`, `SetRow`, `LoggerHint` ×2) spada
więc na stockowy cień Tailwinda, poza paletą i poza dark-modem. Łamie regułę „Zero magic
numbers" z CLAUDE.md. Trzy z tych pięciu to elementy pływające → docelowo `E2`.

### H4. `Button` nie ma stanu `pending` — 30 ręcznych implementacji

Aplikacja stoi na Server Actions, ale wskaźnik zajętości jest budowany od zera w
**15 plikach** (`useFormStatus` / `useTransition` / `isPending`, 30 wystąpień), każdy
z własnym copy i własnym `disabled`. Kandydat na prop `pending` w `ui/button.tsx`
(spinner + `aria-busy` + auto-`disabled`) i sweep.

### H5. `themeColor` w `layout.tsx` to martwe hexy sprzed v1.4

```
light: #F6F2ED   → to sand-100 (brand-surface), a canvas light to grey-100 #F7F7F5
dark:  #1E1C1A   → stary CIEPŁY ink-800; po v1.4 ink-800 = #1C1B1F, a canvas dark = ink-850 #18171A
```

Pasek adresu/status bar w PWA nie zgadza się z tłem aplikacji, a wartość dark nie
istnieje już w palecie w ogóle. To ten sam dryf, który złapaliśmy w Figmie.
Powinno czytać `--color-bg` z obu trybów.

---

## 4. Znaleziska — priorytet średni

### ~~M1. `TeamHomeCard.tsx` — martwy kod~~ → WYCOFANE (fałszywy alarm)

Pierwsza wersja audytu klasyfikowała ten plik jako martwy kod na podstawie samego
grepu importów (0 referencji). Po otwarciu pliku: w nagłówku jest jawna adnotacja
„celowo bez importów od R2 (stała karta Ekipy zeszła z Home). Zachowany do R3b
(Ekipa jako hub) — nie usuwać jako martwy kod". Komponent jest **zaparkowany
świadomie**, nie zapomniany. Zostaje bez zmian.

Wniosek metodyczny: liczba importów nie wystarcza do orzekania o martwym kodzie w tym
repo — kilka rzeczy jest zaparkowanych pod przyszłe fazy z adnotacją w pliku.

### M2. `size="sm"` = 36 px, poniżej własnego progu 44 px

`ui/button.tsx` daje `sm: "h-9"` (36 px), a checklist §3.2 wytycznych mówi „wszystkie
targety ≥44 px". Użyć: 14, z czego **4 mają ręczną łatkę `min-h-11`** — czyli konsumenci
już obchodzą wariant, niespójnie. Albo `sm` dostaje `min-h-11` u źródła, albo znika.

### M3. `Input` bez stanu błędu — `aria-invalid` nie występuje w apce ani razu

Formularzy jest sporo (`SettingsForm`, `BodyForm`, `HistoricalWorkoutForm`,
`CustomExerciseForm`, `TeamPanel`, `login`), ale `ui/input.tsx` nie ma wariantu
błędu, a w całym kodzie jest **0 × `aria-invalid`**, 2 × `role="alert"`, 3 × `aria-live`.
Błędy walidacji nie są programowo powiązane z polem (WCAG 3.3.1). Punkt 4 checklisty
(„stany: pusty / ładowanie / błąd / offline zaprojektowane") jest tu niedomknięty.

### M4. Zero testów renderujących komponenty

46 plików testowych, **wszystkie `.test.ts`** (logika, dane, kontrast tokenów) —
ani jednego `.test.tsx`. Warstwa logiczna i tokeny są pilnowane bardzo dobrze
(`token-contrast.test.ts` to świetny guard), ale żaden test nie renderuje komponentu.
Największe ryzyko: `Logger` (866 LOC) i `SetRow` (528 LOC) — najbardziej złożone i
najczęściej zmieniane pliki w repo.

### M5. `text-black` w `OfflineBanner` — brakuje tokenu `warning-foreground`

`success` ma trójkę ról (`DEFAULT` / `foreground` / `text`), `warning` i `danger` mają
tylko dwie — brakuje `foreground`. Dlatego baner offline używa `text-black` zamiast
tokenu. Uzupełnić `--color-warning-contrast` i `--color-danger-contrast`
(w Figmie semantic light/dark już mają komplet po dzisiejszej synchronizacji).

---

## 5. Obserwacje (bez akcji)

- **`MonthCalendar` powiela siatkę 7-kolumnową z `WeekStrip`** — świadomie, bo kalendarz
  musi zmieścić numer dnia w kółku. Zgodność wizualna trzymana komentarzem, nie kodem.
  Akceptowalne, ale krucha przy zmianie kształtu kółka.
- **60/74 komponentów ma `"use client"`** (81%). Po weryfikacji — uzasadnione:
  jedyni kandydaci bez interakcji (`MuscleHeatmap*`, `ThemeProvider`, `error.tsx`) mają
  techniczny powód (dynamic `ssr:false`, next-themes, wymóg Next.js). Fałszywy alarm.
- **`Logger.tsx` 866 LOC** — na granicy. Nie rekomenduję rozbicia bez konkretnego powodu
  (podział na siłę rozproszy stan sesji), ale to pierwszy kandydat, jeśli dojdzie
  kolejna funkcja.

---

## 6. Sugerowana kolejność

| # | Zadanie | Status |
|---|---|---|
| 1 | `ui/card.tsx` + sweep 44 kart (H1) — domknęło H2 i H3 | ✅ zrobione |
| 2 | `themeColor` z tokenów (H5) | ✅ zrobione |
| 3 | Usunąć `TeamHomeCard` (M1) | ⛔ wycofane — fałszywy alarm |
| 4 | `pending` w `Button` + sweep (H4) | ✅ zrobione |
| 5 | `warning/danger-contrast` + `OfflineBanner` (M5) | ✅ zrobione |
| 6 | Stan błędu w `Input` + `aria-invalid` (M3) | ✅ prymityw gotowy, brak konsumentów |
| 7 | `size="sm"` → 44 px (M2) | ✅ zrobione |
| 8 | Pierwsze testy renderujące (M4) | ✅ prymitywy `ui/*`; złożone komponenty zostają |

## 7. Stan po wdrożeniu (2026-08-04)

Weryfikacja: `lint` ✓ · `typecheck` ✓ · `test:unit` 289/290 ✓ · `build` ✓.
Jedyny czerwony test (`CONTENT-02: Chin-Up`) padał już przed tą pracą — czyta
`scripts/data/exercise-content-reviews.json`, zmieniony w drzewie roboczym razem
z nowym katalogiem `public/exercise-images/arco/Chin-Up/`. To cudza robota w toku
nad podmianą zdjęć, nie regresja tego refaktoru.

**Nowe guardy** (żeby znaleziska nie wróciły cicho):
- `tests/theme-color.test.ts` — liczy hex canvasu z HSL w `globals.css` i porównuje
  z `viewport.themeColor`; przechodzi cały łańcuch aliasów, więc łapie też przepięcie
  `--color-bg` na inny primitive.
- `tests/ui-primitives.test.ts` — pierwsze testy renderujące w repo (10 przypadków,
  `react-dom/server`, bez nowych zależności).
- `tests/token-contrast.test.ts` — nowy przypadek: każda barwa funkcyjna MUSI mieć
  `*-contrast` i trzymać ≥4,5:1; brak tokenu wywala się tak samo jak zły kontrast.
  Helper `semantic()` podąża teraz za pełnym łańcuchem aliasów (most → semantyka →
  primitive), zamiast zakładać jeden skok.

**Dowód na H3** wyszedł dopiero z arkusza: `.shadow-lg` generowało regułę
`0 10px 15px -3px rgb(0 0 0/0.1)` — czystą czerń spoza palety. Po sweepie reguły nie
ma w wysyłanym CSS, a `.shadow-e1/e2/e3` są. Przy okazji pułapka warta zapamiętania:
skaner Tailwinda dopasowuje nazwy klas **także w komentarzach**, więc pierwsza wersja
dokumentacji w `card.tsx` sama regenerowała usuniętą regułę.

**Świadome zmiany wizualne** (reszta sweepu jest 1:1):
- Dwie karty z `shadow-md` (empty state na Home, karta w onboardingu) zeszły do
  domyślnego `subtle`. Jeśli to była zaprojektowana hierarchia, a nie dryf —
  wracają jednym propem `elevation="floating"`.
- 10 z 14 przycisków `size="sm"` urosło z 36 px do 44 px (pozostałe 4 miały już
  ręczną łatkę `min-h-11`).

**Do decyzji właściciela identyfikacji:** `subtle` nadal trzyma legacy `shadow-sm`,
nie kanoniczne E1. Przepięcie całej aplikacji na kanon (§9/§10) to jedna linia
w `cardVariants` — świadomie nie zrobione przy sprzątaniu, bo to zmiana wyglądu
44 kart naraz, nie porządkowanie kodu.

**Nie zamknięte:** `aria-invalid` ma teraz wsparcie w prymitywie, ale ŻADEN formularz
jeszcze go nie ustawia — komunikaty walidacji nadal nie są programowo powiązane
z polami (WCAG 3.3.1). To osobna praca na sześciu ekranach z formularzami.
