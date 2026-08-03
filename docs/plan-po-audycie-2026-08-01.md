# Plan prac po audycie — stan na 2026-08-01

Kontynuacja `audyt-kodu-i-ui-2026-07-31.md` po zamknięciu paczek A, B, C oraz D6/D7.
Dokument istnieje po to, żeby kolejna sesja nie zaczynała od czytania całego audytu.

**Zamknięte:** A (PR #60) · B (#61) · C (#62) · D6+D7 (#63) · martwy wpis w tsconfig (#64).
**Otwarte:** paczka D (C1–C15), paczka F i reszta P3 (D8–D25).

**Domknięte 2026-08-03:** paczka E (E2 → E1 → E3) oraz guard historycznego celu
tygodniowego i trzywarstwowego stosu arkuszy. Bramka: typecheck i lint czysto,
274/274 unit, 53/53 przeglądarkowych, build zielony.

---

## Priorytet 1 — Paczka E: spójny chrome i Historia

Zgłoszenie właściciela 2026-08-01, waga **high**. Wszystko bez migracji.

**Status 2026-08-03: ZAKOŃCZONE TECHNICZNIE.** Historia ma pełnoszerokie „Dodaj trening”
bezpośrednio pod kalendarzem; cztery podwidoki używają `TrainingRouteHeader`; logger ma
jeden tryb zachowania `live | finished | historical`. Historia nie uruchamia nowej przerwy
i nie pokazuje prowadzenia progresji, a zwykła edycja zakończonej sesji zachowuje guidance.

Przegląd tras po E1:

| Trasa | Wynik |
|---|---|
| `/session/[id]` | świadomy wyjątek: sticky chrome sesji live zostaje |
| `/exercise/[id]` | spójny ekran szczegółowy z `PageHeader` i Back |
| `/settings` | spójny ekran szczegółowy z Back do Dziś; wejście przez monogram na Dziś pozostaje |
| `/ekipa` | poprawny lekki nagłówek top-level bez lokalnego subnavu |

### E1 · Jeden nagłówek dla przestrzeni Trening (= audyt D9)

Cztery podwidoki mają **trzy różne implementacje** nagłówka — potwierdzone w kodzie:

| Trasa | Co renderuje |
|---|---|
| `/programs` | `TrainingHeader` (logo + badge passy + monogram) |
| `/progress` | ręczny `<header className="border-b px-md py-md text-center">` |
| `/body` | ręczny `<header>`, ta sama klasa co wyżej |
| `/history` | `PageHeader` (tytuł + akcja) |

Do tego skeleton Historii nie zgadza się ze stroną (audyt D9).

**Zakres:** jeden komponent nagłówka dla całej przestrzeni Trening, `TrainingSubnav` pod nim
bez zmian. Przy okazji przejrzeć pozostałe ekrany (`/session/[id]`, `/exercise/[id]`,
`/settings`, `/ekipa`) i wypisać, które odstają — nie naprawiać wszystkiego naraz, ale
mieć listę.

**Decyzja właściciela 2026-08-01:** badge passy i monogram **wyłącznie na Home**. Czyli
`TrainingHeader` (logo + passa + monogram) zostaje na Dziś, a cztery podwidoki Treningu
dostają lżejszy nagłówek: tytuł + opcjonalna akcja, bez passy i awatara.

**Ryzyko do sprawdzenia przy tej zmianie:** monogram jest dziś jedynym wejściem do
`/settings` z poziomu `/plany`. Po zdjęciu go z podwidoków trzeba potwierdzić, że droga do
Ustawień istnieje (przez Dziś) i że nikt nie zostaje w ślepym zaułku.

### E2 · „Dodaj trening" pod kalendarzem, nie w top barze

Dziś przycisk siedzi w `PageHeader` jako akcja nagłówka. Właściciel chce go **pod
kalendarzem**, w treści strony, i pod nazwą „Dodaj trening" (dziś „Dodaj”).

Konsekwencja dla E1: gdy akcja zejdzie z nagłówka, Historia przestaje potrzebować
`PageHeader` z akcją i może wziąć ten sam nagłówek co reszta. **E2 odblokowuje E1.**

### E3 · Trening z przeszłości nie jest treningiem na żywo

Dwa potwierdzone defekty w loggerze historycznym:

1. **Przerwa startuje po zaliczeniu serii.** `useSessionMutations` ma już centralny
   `maybeStartRest` i prop `allowRest`, ale `Logger` przekazuje `!isFinished` zamiast trybu,
   który wyklucza również historię. `Logger` poprawnie pilnuje tylko przywracania przerwy
   z ciągłości (`restoreRest(isFinished || isHistorical ? null : …)`) i zegara sesji.
2. **Prowadzenie progresji się renderuje.** `ExerciseCard` nie dostaje w ogóle informacji
   o trybie; `progressionGoal(...)` liczy się zawsze.

**Zakres:** wyliczyć jeden jawny tryb `live | finished | historical` i przekazać go do
`useSessionMutations` oraz `ExerciseCard`; objąć testem brak timera i guidance dla historii.
Edycja zwykłej zakończonej sesji zachowuje dotychczasowe zachowanie. Reguła ogólna:
„tryb sesji jest jednym propsem, nie trzema warunkami".

---

## Benchmark (2026-08-01)

Pytanie, na które benchmark miał odpowiedzieć: jak wpuścić „zrób inny trening niż aktywny"
i ulubione, **nie rozmontowując wyróżnika Arco** („prowadzimy, gdzie Hevy tylko loguje" —
`konkurencja-hevy.md`).

| Aplikacja | Model | Wniosek dla Arco |
|---|---|---|
| **Hevy** | **Nie ma aktywnego planu.** Zakładka Workout = „+ Start Empty Workout" u góry i foldery rutyn pod spodem; każdą rutynę startujesz kiedy chcesz. Organizacja przez **foldery**, nie serca | Model, do którego NIE idziemy — plan przestaje prowadzić, staje się listą |
| **Boostcamp** | **Ma aktywny program** z automatyczną progresją (dobiera ciężar po wyniku) **i** obok tego „freestyle workout" na jeden raz | To jest nasz wzorzec: jeden plan prowadzący + wyjście awaryjne obok niego |

**Wniosek:** Arco idzie ścieżką Boostcampa, nie Hevy. Aktywny plan zostaje kręgosłupem
prowadzenia; trening z innego planu jest **wyjątkiem obok planu**, nie równoprawnym trybem.
Decyzja właściciela „nie rusza rotacji cyklu" jest z tym spójna.

**Rzecz, którą benchmark ujawnił, a zgłoszenie przemilczało:** freestyle w Arco **już
istnieje** (`app/FreestyleStartButton.tsx`, „Własny trening"). Czyli luka nie brzmi „nie da
się zrobić nic innego", tylko wąsko: **nie da się uruchomić USTRUKTURYZOWANEGO dnia z innego
planu**. To zawęża F1 z „nowy tryb" do „nowe wejście w istniejącą akcję" — `startSession`
przyjmuje już dowolny `programDayId`.

Skala biblioteki dla wyceny: **19 presetów** + programy własne.

---

## Priorytet 2 — Paczka F: wybór treningu i ulubione

Zgłoszenie właściciela 2026-08-01, po refinemencie i decyzjach z tego samego dnia.

### F1 · Uruchom dzień z dowolnego planu, bez zmiany aktywnego — ~4 h, bez migracji

**Stan faktyczny:** `startSession(programDayId)` przyjmuje dowolny dzień dowolnego planu —
serwer jest gotowy. Blokada jest wyłącznie w UI: `startSession` wołają tylko `app/page.tsx`
i `DayPickerSheet` (dni aktywnego planu), a na detalu nieaktywnego planu jedyny przycisk to
„Ustaw jako aktywny" (`app/programs/[id]/page.tsx:185-197`).

**Zakres:** akcja „Zacznij ten trening" na wierszach dni każdego planu + potwierdzenie
nazywające skutek wprost („Trening obok planu — Twój aktywny plan i jego rotacja zostają bez
zmian"). Do celu tygodnia i passy liczy się normalnie: `weeksMeetingGoal` liczy zakończone
sesje niezależnie od planu — nic tu nie trzeba zmieniać.

**Ryzyko do sprawdzenia:** w aplikacji obowiązuje inwariant „jedna niezakończona sesja".
Start dnia obok planu przy otwartej sesji musi trafić w tę samą ścieżkę co dziś (wznowienie
albo blokada), a nie ją obejść. To jest główny przypadek testowy tej pozycji.

### F2 · Ulubione **plany** — ~6 h, WYMAGA MIGRACJI

Decyzja właściciela 2026-08-01: ulubiony = **cały plan**, nie dzień.

- Tabela `favorite_programs (user_id, program_id, created_at)`, RLS + unikalność pary.
  Zgodnie z `CLAUDE.md`: nowa tabela z danymi użytkownika = RLS **i test wielokontowy w tej
  samej zmianie**.
- Ikona serca na wierszu planu (biblioteka + detal planu).
- Sekcja „Ulubione" na `/plany`, **pod aktywnym planem**. Na Dziś **nie** (decyzja właściciela).

**Uwaga z benchmarku:** Hevy ten sam problem rozwiązuje folderami i kolejnością, nie sercami.
Przy 19 presetach serce jest tańsze i wystarcza — ale gdy biblioteka urośnie, wróci pytanie
o grupowanie. Warto o tym pamiętać, zanim ulubione zaczną pełnić rolę folderów.

**Czego ulubione NIE załatwiają:** przy modelu „ulubiony = plan" ta funkcja **nie zamyka F1** —
skrót prowadzi do planu, a i tak trzeba wejść w dzień. F1 zostaje osobną pozycją i idzie
pierwsze; F2 jest skrótem do niej. (Przy porzuconym modelu „ulubiony = dzień" byłoby odwrotnie.)

### F3 · „Utwórz własny program" pod aktywnym planem — ~0,5 h

Dziś CTA siedzi na samym dole `/plany` (~linia 194), pod biblioteką. Kolejność docelowa
sekcji: **Aktywny plan → Utwórz własny → Ulubione → Moje programy → Biblioteka.**

---

## Priorytet 3 — Paczka D: skala (C1–C15 z audytu)

Rozbita na cztery części, bo różnią się ryzykiem i tym, czy potrzebują migracji.

### D-1 · Zapytania i budżety tras — ~1 dzień, bez migracji

| # | Rzecz |
|---|---|
| C1 | `/postępy`: **13 round-tripów** (zmierzone 2026-08-01), zakładka „Wszystko" buduje `.in()` na wszystkich ID (~69 KB URL przy 2 latach historii) |
| C8 | `/session/[id]`: 6 zapytań w 4 rundach; `getRepPRs` skanuje całą historię bez okna |
| C12 | Mini-bar dokłada 2 round-tripy do KAŻDEJ nawigacji, duplikując dane, które Home już ma |
| C2 | Dwie rosnące listy bez limitu (`history`, `done`) |

**Rozbicie C1 (pomiar z 2026-08-01):** `page.tsx` 2 · `getPeriodStats` × 2 okresy po 3 = 6 ·
`getPRs` 1 · `getActivity` 1 · `getStrengthTrends` 3. **To nie jest N+1** — wszystko idzie
przez `.in(...)`. Problem to trzy niezależne, serializowane łańcuchy nad nachodzącymi na
siebie oknami czasu. Kierunek: pobrać sesje raz dla najszerszego okna, potem jedno
`session_exercises` i jedno `session_sets`, sekcje policzyć w pamięci. **13 → ~5.**

**Warunek wykonania:** test porównujący stare wyjście z nowym na tych samych danych,
napisany PRZED refaktorem. To przelicza tonaż, rekordy i trend siły — ryzyko nie leży
w wydajności, tylko w cichej zmianie liczby.

### D-2 · Twarde granice w bazie — ~1 dzień, WYMAGA MIGRACJI

C4 (brak `CHECK` na `target_sets` → `2e9` = self-service DoS) · C5 (`body_metrics` bez `CHECK`) ·
C6 (zero limitów długości tekstów poza Ekipą) · C7 (bucket `body-photos` bez limitu rozmiaru
i typów MIME) · C14 (tekstowy PK `exercises` od klienta) · C15 (`sync_workout_activity_day`
ufa `p_previous_day` od klienta).

**Bramka przed otwarciem publicznej rejestracji.** Dziś rejestracja jest wyłączona, więc to
„DoS na samym sobie" — w dniu wpuszczenia obcych kont przestaje być teoretyczne.

### D-3 · Kod zaproszenia Ekipy — 5 h, migracja

C3: brak rotacji, wygasania i listy wykluczeń; kod widzi każdy członek, a usunięta osoba
wraca tym samym kodem. Jedyna pozycja z wymiarem bezpieczeństwa **międzykontowego**.

### D-4 · Klient i zasoby — ~1 dzień, bez migracji

C9 (`localStorage` do 60×/s przy przewijaniu) · C13 (outbox: retry 15 s bez backoffu) ·
C10 (ikony 3D 141–230 KB, 195 KB z `priority` na ścieżce LCP) · C11 (obrazy ćwiczeń surowym
`<img>`, próbka źródła 2,07 MB).

---

## Priorytet 4 — reszta P3 (D8–D25)

**Design system:** D8 (elevation E0–E3 zadeklarowane i nieużywane — nawigacja rzuca twardszy
cień niż modal nad nią) · D10 (rust+violet w jednym komponencie na karcie planu) ·
D11 (cztery języki selekcji w Ustawieniach) · D12 · D13 · D14. **D9 wchodzi wcześniej jako E1.**

**Treść:** D15 / CONTENT-03 (17 z 48 etykiet dni bez treści, 22 z 48 z angielszczyzną) +
copy komunikatów zaszytych w SQL-u (świadomie zostawione otwarte w paczce C).

**Dług testowy i architektura:** **D17 — brak testu mapy błędów zapisu; audyt określa to jako
najwyższe ryzyko utraty lub zablokowania serii. Kandydat do wyciągnięcia przed paczkę D.**
Dalej: D16, D18, D19 (RLS tylko dla Ekipy, 8 tabel bez pokrycia), D20, D21 (reszta PLAN-05I),
D22, D23, D24, D25 (`mm:ss` w siedmiu kopiach).

---

## Decyzje właściciela — rozstrzygnięte 2026-08-01

| # | Pytanie | Decyzja |
|---|---|---|
| 1 | Czy trening z nieaktywnego planu przesuwa rotację cyklu? | **Nie** — trening „obok planu" |
| 2 | Ulubiony = dzień planu czy cały plan? | **Cały plan** |
| 3 | Badge passy i monogram na podwidokach Treningu? | **Tylko na Home** |
| 4 | Ulubione na Dziś jako szybki start? | **Nie** — wyłącznie `/plany` |

## Zakres i wycena po refinemencie

| Poz. | Co | Koszt | Migracja |
|---|---|---|---|
| E2 | „Dodaj trening" pod kalendarzem | 1 h | — |
| E1 | Jeden nagłówek przestrzeni Trening (4 trasy + skeleton) | 4 h | — |
| E3 | Logger historyczny bez przerwy i progresji + test | 2 h | — |
| F1 | Uruchom dzień z dowolnego planu | 4 h | — |
| F3 | „Utwórz własny program" pod aktywnym planem | 0,5 h | — |
| F2 | Ulubione plany (tabela, RLS, test wielokontowy, UI) | 6 h | **tak** |

**Paczka E ≈ 7 h · paczka F ≈ 10,5 h.** E w całości bez migracji, więc idzie sama;
F wymaga sesji z właścicielem na `db push --dry-run` → `db push` → `migration list`.

**Kolejność wewnątrz paczek wynika z zależności, nie z wagi:**
- **E2 przed E1** — Historia używa `PageHeader` tylko dlatego, że potrzebuje akcji w nagłówku.
  Gdy „Dodaj trening" zejdzie pod kalendarz, ta potrzeba znika i Historia bierze wspólny
  nagłówek bez wyjątków. Odwrotna kolejność = ta sama robota dwa razy.
- **F1 przed F2** — ulubione są skrótem do możliwości, która musi najpierw istnieć.
- **F3 z F2** — obie ruszają układ sekcji na `/plany`, nie ma sensu robić tego dwa razy.

## Kolejność, którą rekomenduję

1. **E** (chrome + Historia + logger historyczny) — zgłoszone jako high, bez migracji.
2. **D17** — wyciągnięty z P3, bo to jedyna otwarta pozycja o wymiarze utraty danych
   (brak testu mapy błędów zapisu: retryable vs permanent).
3. **F** (wybór treningu + ulubione) — jedna migracja, sesja z właścicielem.
4. **D-1** (zapytania) → **D-3 + D-2** (migracje) → **D-4**.
5. P3 design system i treść — do refinementu; tam więcej decyzji niż roboty.
