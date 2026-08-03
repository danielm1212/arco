# Handoff — 2026-08-01, Claude Code → kolejny agent

Przekazanie po sesji, w której zamknięto paczki A/B/C z audytu, D6/D7 oraz uporządkowano
środowisko. Ten dokument ma Cię postawić do pracy bez czytania całego audytu.

**Aktualizacja 2026-08-03:** paczka E opisana w §4 jest już **zakończona technicznie**
na gałęzi `agent/package-e-history-chrome` — nie implementuj jej drugi raz. Doszły też
guardy poprzedniego tygodnia i trzywarstwowego stosu arkuszy. Bramka tej gałęzi:
274/274 unit, 53/53 przeglądarkowych, typecheck, lint i build. Następny krok: D17,
potem paczka F.

**Czytaj w tej kolejności:** `CLAUDE.md` → ten plik → `docs/plan-po-audycie-2026-08-01.md`
(kolejka i wyceny) → `docs/audyt-kodu-i-ui-2026-07-31.md` (dopiero gdy wchodzisz w konkretną
pozycję) → trzy ostatnie wpisy w `docs/koordynacja-agentow.md`.

**Repo ma własne skille w `.claude/skills/`** — używaj ich, nie improwizuj:
`arco-session-start` na wejściu (sprawdza cudzy WIP i rezerwacje), `arco-a11y-review` przy
każdym dotknięciu UI, `arco-migration` przy paczce F, `arco-debug` przy niejednoznacznym
zgłoszeniu, `arco-session-close` na koniec.

---

## 1. Co jest na `main` po tej sesji

| PR | Zakres |
|---|---|
| #60 | Paczka A (P0): cache SW, jeden wzór objętości, stany błędu i 404 |
| #61 | Paczka B: 11 pozycji a11y (P1) + 2 znalezione po drodze + krok `typecheck` w CI |
| #62 | Paczka C: D1–D5, D7 |
| #63 | D6: daty w Europe/Warsaw + reguła ESLint zamykająca drogę powrotną |
| #64 | Martwy wpis w `tsconfig` + sprostowanie do #61 |

**Stan bramki:** `typecheck` 0 błędów · `lint` czysto · `test:unit` **271/271** ·
`test:overflow` **48/48** · kompilacja produkcyjna ~2 s (pełne polecenie build ~12 s).
CI ma **6 checków** (doszedł `npm run typecheck`).

### Nowe rzeczy wspólne, których warto użyć zamiast pisać swoje

| Moduł | Do czego |
|---|---|
| `lib/inertBackground.ts` | `inertOutside(el)` — wyłącza tło z fokusu i drzewa dostępności; `focusableWithin(root)` do pułapek fokusu |
| `lib/plural.ts` | `pluralPl` / `countPl` + słownik `WORDS` — **jedyna** poprawna odmiana liczebników w repo |
| `lib/actionError.ts` | Mapowanie błędów bazy na polskie zdania; surowy `error.message` nie ma prawa trafić do UI |
| `lib/dateTime.ts` | `formatWarsawDate(value, style)` — warianty zapisu z wymuszoną strefą |
| `lib/exerciseFilters.ts` | `muscleLabelPl(muscle)` — jedno źródło polskich nazw partii |

### Kanon, który powstał w tej sesji (nie łam go bez decyzji właściciela)

**Trzy role koloru semantycznego** — `docs/paleta-arco-warm.md` §„Trzy role koloru semantycznego":

- `bg-<kolor>` — wypełnienie, obramowanie, tint (stopień 500 w light / 400 w dark),
- `text-<kolor>-foreground` — tekst **na** tym wypełnieniu (biel w light, `ink-900` w dark),
- `text-<kolor>-text` — ta sama barwa jako **tekst na neutralnym tle**; osobne stopnie
  `amber-700`, `green-600`, `red-300`.

Cztery z trzynastu pozycji paczki B to była jedna pomyłka powtórzona cztery razy: stopień
wypełnienia użyty jako tekst. Progi liczy `tests/token-contrast.test.ts` **z realnych tokenów**,
na tincie złożonym nad KAŻDYM realnym tłem wiersza — nie nad samą białą kartą.

---

## 2. Środowisko — co się zmieniło i czego się spodziewać

Katalog roboczy nazywa się teraz **`Arco app.nosync`** (repo w podkatalogu `arco/`).
Sufiks wyłącza synchronizację iCloud, która wcześniej blokowała dysk: `next build` wisiał
36 minut przy 0% CPU, `tsc` i `git add` po 10+ minut, `git status` ponad 2 minuty.
**Po zmianie:** `git status` 0,13 s, build ~2 s.

Usunięto ~6300 plików-duplikatów iCloud (`* 2`, `* 3`, … `* 33`) — także w
`supabase/migrations/` (17 sztuk, potencjalnie groźnych dla `migration list`), w
`.github/workflows/` i w `.git/`. **Żaden nie był śledzony.** W `tsconfig.json` był wpis
`exclude` na jeden z takich duplikatów — usunięty w #64.

Jeśli duplikaty wrócą, znaczy że katalog znowu się synchronizuje.

### Pułapki, które kosztowały czas w tej sesji

- **Nigdy `git add -A`** — w drzewie leżą obce nieśledzone pliki (`docs/arco-home-agent-handoff/`
  i inne). Staguj po nazwach własnych plików.
- **Nie logujesz się na konto.** Weryfikację rób harnessem na skompilowanym CSS
  (`tests/e2e/`, wzorzec `streak-week.test.ts` i `overflow.test.ts`). Przejście po zalogowanej
  trasie należy do właściciela.
- **`npm run build` przed weryfikacją wizualną** — `launch.json` uruchamia `next start`.
- **Testy dat puszczaj z `TZ=UTC`** — Vercel stoi w UTC, Twój Mac zwykle nie. Bez tego
  regresja strefy przechodzi lokalnie i pada na produkcji.
- **Migracje:** `db push --dry-run` → `db push` → `migration list` (local == remote) →
  dopiero merge. `supabase db reset` wolno uruchamiać wyłącznie na izolowanym, jednorazowym
  stacku — nigdy na stacku właściciela z jego dziennikiem. Gdy takiego stacka nie ma,
  migrację zastosuj punktowo, a świeży przebieg musi przejść w CI przed merge.
- **Właściciel merguje w trakcie pracy.** Sprawdzaj `git log origin/main` na starcie i przed
  wystawieniem PR-a; w tej sesji `main` przesunął się trzy razy.

---

## 3. Decyzje właściciela z 2026-08-01 (nie podważaj bez rozmowy)

| # | Decyzja |
|---|---|
| 1 | Trening z nieaktywnego planu **nie rusza rotacji cyklu** — jest „obok planu" |
| 2 | Ulubiony = **cały plan**, nie dzień planu |
| 3 | Badge passy i monogram **wyłącznie na Home**, nie na podwidokach Treningu |
| 4 | Ulubione **nie** pojawiają się na Dziś |
| 5 | `--arco-amber-700` = `hsl(40 98% 26%)` — wartość wybrana po tym, jak guard odrzucił jaśniejszą |
| 6 | Prowadzenie progresji, badge supersetu i monogram są **violet**, nie rust (v1.4: violet = prowadzenie/dane) |

---

## 4. Paczka E — wykonana 2026-08-03

Pełny opis i stan: `docs/plan-po-audycie-2026-08-01.md`. Poniższe punkty są zapisem
uzasadnienia i zakresu, a nie listą pracy do powtórzenia.

### E2 · „Dodaj trening" pod kalendarzem — 1 h

`app/history/page.tsx` — przycisk zszedł z akcji `PageHeader` pod `MonthCalendar`, do
treści strony, pod nazwą „Dodaj trening".

Kolejność E2 → E1 usunęła wyjątek Historii przed budową wspólnego chrome.

### E1 · Jeden nagłówek przestrzeni Trening — 4 h (= audytowe D9)

Cztery podwidoki, **trzy implementacje** (potwierdzone w kodzie):

| Trasa | Dziś renderuje |
|---|---|
| `/programs` | `TrainingHeader` (logo + badge passy + monogram) |
| `/progress` | ręczny `<header className="border-b px-md py-md text-center">` |
| `/body` | ręczny `<header>`, ta sama klasa |
| `/history` | `PageHeader` |

Do tego skeleton Historii nie zgadza się ze stroną (audyt D9).

**Wynik:** `TrainingRouteHeader` jest jednym nagłówkiem czterech podwidoków — tytuł +
opcjonalna akcja, **bez passy i monogramu** (decyzja 3). `TrainingHeader` z passą i
monogramem został na Dziś. `TrainingSubnav` pod spodem bez zmian.

Droga do `/settings` została potwierdzona przez Dziś; monogram nie wrócił do podwidoków.

Przegląd `/session/[id]`, `/exercise/[id]`, `/settings`, `/ekipa` jest zapisany w planie.
Logger to świadomy wyjątek, pozostałe trasy mają właściwy chrome dla swojej roli.

### E3 · Logger historyczny nie jest treningiem na żywo — 2 h

Dwa potwierdzone defekty:

1. **Przerwa startuje po zaliczeniu serii.** `app/session/[id]/useSessionMutations.ts` ma już
   centralny strażnik `allowRest`, ale `Logger.tsx` przekazuje `!isFinished` zamiast warunku
   wykluczającego także `isHistorical`. Trzy warianty startu przerwy schodzą się w jednym
   `maybeStartRest`, więc poprawka nie powinna dokładać kolejnych lokalnych warunków.
2. **Prowadzenie progresji się renderuje.** `ExerciseCard.tsx` w ogóle nie dostaje informacji
   o trybie; `progressionGoal(...)` liczy się zawsze (~linia 234).

Reguła została wdrożona jako `SessionInteractionMode = live | finished | historical`.
Test logiki i test prawdziwego `ExerciseCard` potwierdzają: historia nie odpala timera i
nie doradza progresji, a zwykła edycja zakończonej sesji zachowuje dotychczasowe guidance.

---

## 5. Prośba: oceń tę pracę krytycznie

Nie szukam potwierdzenia, tylko błędów, które przepuściłem. Pięć miejsc, gdzie
najprawdopodobniej się mylę:

1. **`lib/inertBackground.ts` — sprawdzone 2026-08-03.** Guard otwiera trzy równoczesne
   poziomy i potwierdza `inert` `[true, true, false]`, a potem przywracanie warstwa po warstwie.
2. **Pasek dwóch tygodni na `/postępy`.** Ocena wizualnego rytmu dwóch rzędów nadal należy
   do właściciela. Realny błąd celu jest naprawiony: poprzedni tydzień podaje samą liczbę
   treningów, bo baza nie przechowuje historycznego celu; test pilnuje też odmiany.
3. **B10 — przeniesienie tintów z rusta na violet** (badge supersetu, monogram, prowadzenie
   progresji). To zmiana **przypisania semantycznego**, nie samego kontrastu.
4. **`streakWeeksText` zwraca teraz `null` przy 0** — zmiana kontraktu funkcji używanej
   w trzech miejscach. Czy jest czwarty konsument, którego nie zauważyłem?
5. **Reguła ESLint dla dat** — zawęziłem ją po tym, jak pierwsza wersja dała 9 fałszywych
   trafień (`toLocaleString` na liczbach). Czy nie za bardzo?

**Sprostowanie, które warto znać:** w opisie PR #61 napisałem, że błąd typów z #60 przeszedł
niezauważony, bo „`next build` nie typuje plików testowych". **To nieprawda** — `tsconfig`
ma `include: ["**/*.ts"]`, a build realnie wywalił się później na pliku testowym. Dlaczego
tamten błąd przeszedł przez CI, pozostaje niewyjaśnione. Krok `typecheck` broni się i tak.

---

## 6. Zaległości po stronie właściciela (nie Twoje)

- Przejście z **VoiceOverem** po zalogowanej trasie: arkusze, onboarding, logger.
- Ocena **paska dwóch tygodni** na `/postępy` (rytm dwóch rzędów to decyzja projektanta).
- **Checkpoint iPhone PWA** — zaległy od PLAN-05D.
- Decyzja, czy `docs/arco-home-agent-handoff/` wchodzi do repo (folder wciąż nieśledzony).
