# Plan zmian po audytach zewnętrznych (UX + Specyfikacja rdzenia v1 + Biblioteka treningów)

**Data:** 2026-07-18 (aktualizacja: decyzje właściciela + audyt biblioteki)
**Źródła:** `Audyt_Arco_UX_i_produkt.docx`, `Specyfikacja_rdzenia_Arco_v1.docx`, `Audyt_biblioteki_treningow_Arco.docx` (wszystkie z 18.07.2026)
**Metoda:** każdy zarzut audytu zweryfikowany w kodzie na `main` (stan po R3a). Plan nie zastępuje `plan-sprintow-2026-07.md` — wplata się w sekwencję R3b → R4 → R5b → R6 → R7.

---

## 1. Weryfikacja audytu względem kodu

Audyt powstał ze screenów, częściowo starszych niż prod. Sporo zarzutów jest już
zamkniętych. Poniżej uczciwy bilans.

### 1.1. Już zrobione (audyt nieaktualny w tym punkcie)

| Zarzut audytu | Stan w kodzie |
|---|---|
| „Puste pola kg/powt., brak ostatnich wyników" | Częściowo zrobione: `SetRow` ma placeholder z poprzedniej sesji + tap-to-copy („Last set", wzorzec Strong/Hevy) + badge rep-PR. Brakuje tylko **sugestii progresji** (patrz 1.3). |
| „Mieszany język PL/EN" | R5a na prodzie od 17.07: 213 `name_pl` + 94 aliasy, polskie nazwy na wszystkich powierzchniach, wyszukiwanie bez diakrytyk. Zostaje ogon: dalsza część bazy (907 ćw.) i ewentualne metadane. |
| „Destrukcyjne akcje bez potwierdzenia" | „Porzuć" (SessionMiniBar) i „Usuń trening" (DeleteSessionButton) mają bottom sheet z potwierdzeniem i opisem skutku. Zostaje: undo, ekspozycja kosza na liście historii, styl „Usuń ekipę". |
| „Ściana filtrów w podmianie, wyniki pod foldem" | SwapPanel po redesignie (feedback 2026-07-11): domyślnie **rankowani kandydaci** z `getSubstitutes` (tiery: wzorzec+mięsień → fallbacki), chipy/search dopiero jako pełny browse. Zostaje: powód dopasowania i „Zapisz w planie" (patrz 1.3). |
| „Czy timer w ogóle startuje po serii" | Startuje (maybeStartRest), `endAt` liczony z timestampu (odporny na tło w ramach zamontowanego loggera), +30 s/pomiń, wibracja+beep na końcu, wake lock. |
| „Safe area, sticky, przycinanie" | **KOREKTA (właściciel, 18.07): zarzut aktualny** — na wielu ekranach tło nie dochodzi do samej góry. Przyczyna systemowa zdiagnozowana (patrz F0.4): safe-area-top wisi na paddingu `body`, a sticky headery przypinają się dopiero pod paskiem statusu. Sprint 15 naprawił dolne safe area i overlaye, nie górny pasek. |
| „Ekipa nie tworzy odpowiedzialności" | Ekipa v0 ma już check-iny, reakcje i nudge (konta testowe). Reszta = R3b, już zaplanowane. |
| „Codzienna passa karze za odpoczynek" | Passa jest tygodniowa (`computeStreak`), zgodnie z audytem i spec §11.3. |

### 1.2. Potwierdzone luki — audyt ma rację

**L1. Cel tygodniowy vs częstotliwość planu (audyt 4.1, spec §11.2) — P0 zaufania.**
✅ **Zrobione 2026-07-18 (F0.1).** `weekly_goal` był wolnym wyborem 2–5 w ustawieniach,
bez sprzężenia z planem. Naprawione: `lib/programRecommendation.ts` (`clampWeeklyGoal`,
`goalRangeForProgram`) ścina cel do `frequency_min..frequency_max` aktywnego planu —
przy zapisie ustawień (`updateSettings`) i przy każdej zmianie planu (`saveActiveProgram`,
natychmiast, bez wizyty w Ustawieniach). Plan bez deklaracji (własny program) używa
zakresu awaryjnego 2–5 (zgodnego z dotychczasowym onboardingiem). `SettingsForm` pokazuje
tylko wybór w dopuszczalnym zakresie; przy planie z jedną wartością (min=max) pokazuje
stały tekst zamiast przycisków. „6/5" naprawione też wizualnie: `formatGoalRatio` /
`formatGoalProgress` / `formatGoalSentence` pokazują nadwyżkę jako „+N bonus" zamiast
większego licznika przy tym samym mianowniku (badge, ekran Done, Ekipa). Migracja danych
istniejących kont: `20260718165434_clamp_weekly_goal_to_plan.sql`.

**L2. Brak sugestii progresji (audyt 4.2, spec §7) — sedno produktu.**
`guidance.ts` to flagi tygodniowe (balans/staleness/deload), nie rekomendacja
następnej ekspozycji. Nie ma: podwójnej progresji, prefillu z sugestią, reason
codes, stanów CALIBRATING/ACTIVE, snapshotu prescription + `algorithm_version`,
`load_basis` (per_hand/total). To największy pojedynczy strumień pracy.

**L3. BUG: podmiana może „przenieść" ciężar starego ćwiczenia — P0 poprawności danych.**
`previous_session_sets` dopasowuje po `slot_id`, gdy jest (`se.slot_id = p_slot`),
a swap **zachowuje** `slot_id` przy zmianie `exercise_id`. Efekt: po podmianie
placeholder/„Last set" pokaże serie **innego ćwiczenia** — dokładnie to, czego
spec §4.2 zakazuje („nigdy nie przenosi ciężaru z poprzedniego ruchu").
Znalezione dopiero przy tym porównaniu; nie ma tego w żadnym wewnętrznym audycie.

**L4. Walidacja anomalii i e1RM (audyt 4.3, spec §13.2).**
`LIMITS`: weight 2000, reps 999 → Epley dopuszcza absurdy typu e1RM 68 600 kg
(2000 kg × 999 powt. przechodzi walidację). Brak progów: >1,5× poprzedniego
wyniku, >300/500 kg, e1RM liczony bez ograniczenia do 1–10 powtórzeń
(`setMetric` liczy dla dowolnych powtórzeń).

**L5. Timer: tło poza loggerem i zablokowany ekran (audyt 7, spec §9).**
Stan przerwy żyje w hooku loggera — nawigacja do innej zakładki gubi widok
timera (timestamp przetrwa, UI nie). Brak powiadomienia/haptyki przy
zablokowanym ekranie. Do tego copy: „Pomiń" → „Koniec".

**L6. Podmiana: powód dopasowania i zakres zmiany (audyt 6, spec §10).**
Kandydaci są rankowani, ale karta nie mówi **dlaczego** (ten sam wzorzec /
partia / sprzęt). Brak wyboru „Użyj dzisiaj / Zapisz w planie" — swap działa
tylko w sesji.

**L7. Postępy: interpretacja zamiast dekoracji (audyt 5.6).**
Są okresy 7/30/wszystko + delta vs poprzedni okres. Brakuje 3M/6M, interpretacji
względem celu (redukcja/budowanie) i jawnej metodologii e1RM.

**L8. Passa liczy „≥1 trening", nie „minimalny cel planu" (spec §11.3).**
✅ **Zrobione 2026-07-18 (F0.6, decyzja D4 — wersja surowa).** `lib/week.ts` ma nową
`weeksMeetingGoal(times, goal)` — tydzień liczy się do passy tylko, gdy liczba treningów
osiągnęła cel planu; 1 z 2 wymaganych treningów **przerywa** passę (nie tylko „nie
przedłuża"). Zastosowane wszędzie, gdzie liczona jest passa: Dziś (`app/page.tsx`),
ekran Done, Postępy (`app/progress/stats.ts`). `computeStreak` samo w sobie się nie
zmieniło — nadal operuje na przekazanym zbiorze „tygodni, które się liczą"; zmieniła się
tylko definicja tego zbioru u wywołujących.

**L9 (nowe, znalezione przy F0.6). Ekipa liczy passę inną logiką — SQL, nie JS.**
`streak_weeks` w Ekipie pochodzi z osobnej funkcji PL/pgSQL (`emit_workout_activity`,
migracja `20260713130000`), niezależnej od `lib/week.ts`. Ta funkcja nadal liczy „≥1
trening w tygodniu" — **nie** ma wersji D4 (min. cel planu). Efekt: po tej zmianie
własna passa na Dziś (surowa) i passa widoczna w Ekipie (stara semantyka) mogą się
różnić dla tej samej osoby. Naprawa wymaga przepisania SQL-owej funkcji `SECURITY
DEFINER` z pełnym cyklem migracji (`supabase db reset` + `smoke:team`), którego nie dało
się zweryfikować w tej sesji (brak Dockera w sandboxie) — nie ruszone teraz świadomie,
zamiast wypchnąć niezweryfikowaną zmianę na współdzieloną, security-definer funkcję.
**Do zaplanowania jako osobny, mały fix przed R3b albo razem z nim.**

**L10 (nowe, znalezione przy F0.6). `get_pod_members`: `current_date` w Postgres, nie
Europe/Warsaw.** Licznik `weekly_done` dla członków Ekipy filtruje
`e.occurred_on >= date_trunc('week', current_date)`, gdzie `current_date` zależy od
strefy sesji Postgres (domyślnie UTC na Supabase, brak jawnego `set timezone` w
migracjach). To ten sam bug co F0.5, ale po stronie SQL i węższy: same zapisane
`occurred_on` są już poprawne (pochodzą z `sessions.date` = `localDayKey`, naprawione
w F0.5), problem dotyczy tylko **żywego** odczytu granicy tygodnia w oknie
~00:00–02:00 czasu PL. Niska dotkliwość, ale ten sam wzorzec błędu — wart naprawy przy
okazji L9 (ta sama funkcja, ten sam plik migracji).

### 1.3. Wnioski z porównania

1. Fundament jest lepszy, niż sugeruje audyt — ok. 40% zarzutów już zamknięte
   (R1–R3a, R5a). Nie zaczynamy od zera.
2. Dwie rzeczy audyt trafia bezbłędnie i obie są niezamknięte: **sprzężenie
   celu z planem** i **silnik sugestii**. To jest różnica między trackerem
   a produktem „mniej decyzji".
3. Porównanie ujawniło buga L3, którego żaden dokument nie widział — argument
   za regułą spec §16.2 (złote przypadki QA dla logiki rdzenia).
4. Spec v1 jest zgodna z niepodważalnymi zasadami z `CLAUDE.md` (jawne reguły,
   nie AI; rdzeń darmowy). Można ją przyjąć jako kanon rdzenia po review
   otwartych decyzji D-001–D-010.

---

## 2. Plan: fale F0–F2 wplecione w R3b–R7

Zasada: **nie wywracamy sekwencji R**. F0 to krótka wrzutka przed R3b
(P0 zaufania + poprawność danych). F1 (silnik) ma część bez-UI, którą można
robić równolegle, a UI wpiąć w R4, bo R4 i tak przebudowuje logger — robienie
prefillu osobno oznaczałoby dwukrotną pracę na tym samym ekranie.

### Fala F0 — P0 zaufania i danych (2,5–4 dni, przed R3b)

| # | Zadanie | Zakres | Czas |
|---|---|---|---|
| F0.1 | Cel tygodniowy sprzężony z planem | **✅ Zrobione 2026-07-18.** `clampWeeklyGoal`/`goalRangeForProgram` w `lib/programRecommendation.ts`; ścinanie przy zapisie ustawień i przy zmianie planu (natychmiast, bez wizyty w Ustawieniach — prostsza wersja „propozycji korekty" niż osobny dialog, zgodna z D1 „nie w UI ustawień"); `SettingsForm` pokazuje tylko dopuszczalny zakres (stały tekst, gdy plan ma jedną wartość); „6/5"→„5/5 +1 bonus" na badge/Done/Ekipie (`formatGoalRatio/Progress/Sentence`); migracja `20260718165434_clamp_weekly_goal_to_plan.sql` (zawiera guard na pustą bazę, idempotentna). Testy: `tests/weekly-goal.test.ts` (11 nowych, 85/85 łącznie). Migracji SQL nie dało się uruchomić na świeżej bazie w sandboksie (brak Dockera) — do potwierdzenia `supabase db reset` przy najbliższym dostępie do lokalnego stacku, zgodnie z checklistą `arco-migration`. | 1–1,5 d |
| F0.2 | Fix L3: prev sets po podmianie | `previous_session_sets`: dopasowanie po slocie **tylko przy zgodnym `exercise_id`** (albo rozdzielenie: target z planu po slocie, prefill wyników po exercise_id); test regresji „swap nie przenosi ciężaru" | 0,5–1 d |
| F0.3 | Walidacja anomalii | reps 1–100; e1RM tylko dla 1–10 powt.; potwierdzenie przy >1,5× poprzedniego prawidłowego wyniku i przy >300 kg (>500 kg zawsze); rekord tylko z serii working; przeliczenie rekordów po edycji/usunięciu (weryfikacja istniejącego zachowania) | 1 d |
| F0.4 | Górny pasek statusu — fix systemowy | **Root cause:** `body` ma `pt-[var(--safe-area-top)]` (goły padding = „tło"), a `PageHeader sticky` przypina się do `top-[var(--safe-area-top)]` — pasek statusu nie należy do żadnej warstwy z tłem, więc treść scrolluje pod zegarem, a tła sekcji nie dochodzą do góry. Fix w warstwie chrome (jest centralna macierz z R1a): headery rysują tło od `top-0` i same dokładają `padding-top: safe-area-top`; ekrany bez headera dostają inset na kontenerze; zdjąć padding z `body`. Uwaga na hack `max(env, 3.25rem)` dla iOS standalone i na offsety toastów w `layout.tsx`. Regresja: wszystkie huby + logger + sheety na iPhone PWA [Ty] | 1–1,5 d |
| F0.5 | Strefa czasowa tygodnia (warunek D4) | **✅ Zrobione 2026-07-18.** `lib/week.ts` liczy `localDayKey`/`weekStart`/`computeStreak` jawnie w Europe/Warsaw (Intl, niezależnie od `TZ` procesu), z arytmetyką kalendarzową odporną na DST (`addWarsawDays` zamiast stałych 168h — tydzień ze zmianą czasu trwa 167 lub 169h). Skonsolidowano 4 niezależne kopie tej samej (błędnej) logiki: `app/page.tsx`, `app/progress/stats.ts`, `lib/getHomeGuidance.ts`, `components/MonthCalendar.tsx` — wszystkie teraz importują z `lib/week`. Testy (`tests/week.test.ts`) przepisane na `Date.UTC(...)` (niezależne od strefy uruchomienia) + nowe przypadki DST na realnych granicach 2026 (29.03, 25.10) i na oryginalnym buga late-night. Zweryfikowane: `tsc`, lint, 74/74 testów pod TZ=UTC / Europe/Warsaw / America/Los_Angeles — identyczny wynik. Build produkcyjny nie uruchomiony lokalnie (env bez dostępu do Google Fonts) — do potwierdzenia na najbliższym CI/preview. | 0,5–1 d |
| F0.6 | Passa wg minimum planu (D4, wersja surowa) | **✅ Zrobione 2026-07-18.** Nowa `weeksMeetingGoal(times, goal)` w `lib/week.ts` — tydzień liczy się do passy tylko przy `count >= goal` (nie ≥1). Zastosowane w Dziś, Done, Postępach. **Znaleziono przy okazji (L9, L10):** Ekipa liczy własną passę i tygodniowy licznik osobną funkcją SQL, nieobjętą tą zmianą i z tym samym bugiem strefy co F0.5 po stronie Postgres — patrz §1.2, wymaga osobnego fixu (migracja `SECURITY DEFINER`, nie dało się zweryfikować bez Dockera). Komunikat powrotu po przerwie bez winy: copy już istniejące w `WeeklyGoalBadge`, nie wymagało zmiany. | 0,5 d |

**Done F0:** licznik celu nie może pokazać wyniku sprzecznego z planem; po
podmianie żaden hint nie pochodzi z innego ćwiczenia; absurdalny rekord wymaga
świadomego potwierdzenia; passa i tydzień liczą się poprawnie niezależnie od
strefy serwera.

### Fala F1 — silnik progresji v1 (shadow-first, 5–8 dni, równolegle z R3b/R4)

Kolejność wg spec §20.1: model danych → silnik czysty → shadow → UI.

| # | Zadanie | Zakres | Czas |
|---|---|---|---|
| F1.1 | Model danych rdzenia | Migracje: `load_basis` (per_hand/total) na ćwiczeniu/slocie, snapshot prescription + `algorithm_version` przy rekomendacji, typ AMRAP w `set_type` jeśli potrzebny (enum ma już warmup/working/drop) | 1–1,5 d |
| F1.2 | `lib/progression.ts` — podwójna progresja | Czysta funkcja: historia prawidłowych serii → rekomendacja (HOLD / ADD_REP / ADVANCE_LOAD) + reason code; skoki z profilu sprzętu, reguła ≤10%; stany CALIBRATING (2 pierwsze ekspozycje) → ACTIVE; **pain_flag / „za ciężko" wyłącza progresję tej ekspozycji** (spec §12.4, funkcja bezpieczeństwa — zawsze darmowa); **30 złotych przypadków QA** jako testy (spec §16.2) | 2–2,5 d |
| F1.3 | Shadow mode | Silnik liczy po każdej sesji, wynik do logu/tabeli, zero UI; porównanie z realnymi wyborami użytkownika (override rate liczony wstecznie na istniejącej historii) | 0,5–1 d |
| F1.4 | UI prefillu (wpiąć w R4) | Pola wstępnie wypełnione sugestią, „Ostatnio" zostaje; jedno zdanie powodu („wszystkie serie na górze zakresu → +2,5 kg"); akceptacja = zero tapów, edycja zawsze możliwa; fokus następnego pola po ✓ | 1,5–2 d w ramach R4 |

**Gate włączenia UI:** shadow review na własnej historii + override rate
policzony; żadnej rekomendacji ADVANCE bez min. 2 prawidłowych ekspozycji.
Reguły X ze spec (drabiny bodyweight, progi) — dopiero po decyzji D2 (trener).

### Fala F2 — domknięcia UX (rozłożone w istniejące etapy)

| Zadanie | Gdzie wpiąć | Czas |
|---|---|---|
| Powód dopasowania na karcie zamiennika + CTA „Użyj dzisiaj / Zapisz w planie" (zapis = zmiana `default_exercise_id` slotu z potwierdzeniem) | R4 (logger) | 1–1,5 d |
| Timer: widoczny po wyjściu z loggera (mini-bar), powiadomienie przy zablokowanym ekranie (PWA notification, wymaga zgody), „Pomiń"→„Koniec", konfigurowalny skok +15/+30 s | R4 / R5b | 1–2 d |
| Postępy: zakresy 3M/6M, interpretacja masy względem celu, metodologia e1RM jednym zdaniem przy wykresie | R3a follow-up / backlog po H2 | 1–1,5 d |
| Passa wg minimalnego celu planu (po F0.1) + komunikat powrotu bez winy | razem z F0.1 lub R4 | 0,5 d |
| Kalendarz historii: daty + marker treningu zamiast samych płomieni | R4 (Historia) | 0,5 d |
| Mikrocopy audytu: „Dodaj trening/pomiar", spójność plan/program, komunikaty zamiany | R4/R5b przy okazji ekranów | rozproszone |
| Skrócenie nazw programów (dziś: „Początkujący · Siłownia · Całe ciało · 2× w tygodniu") — krótki tytuł + metadane osobno; szczegóły programu: podsumowanie na 1. ekranie, rotacja w rozwijanych sekcjach | F3.3 (zmiana treści) + R4 (widok) | 0,5–1 d |
| Undo/kosz: usuwanie wpisu historii do menu lub gestu z cofnięciem; „Usuń ekipę" jawnie destrukcyjne z opisem skutku dla członków | R4 (Historia) / R3b (Ekipa) | 0,5–1 d |
| Logger — domknięcia z audytu 5.4: zwijanie karty ukończonego ćwiczenia, „Objętość: 0 kg" zamiast „0 kg", autofokus kolejnego pola | R4 (razem z F1.4) | w ramach R4 |
| Gęstość ekranów narzędziowych i wysokość chrome (−15–20%): przegląd wizualny, mniejsze karty/cienie na ekranach roboczych | R5b, decyzje [Ty] | 1–1,5 d |
| Filtry biblioteki: sticky CTA „Pokaż N planów", widoczne aktywne filtry po zamknięciu sheetu, jasne single/multi | weryfikacja w R4; fix jeśli brak | 0,5 d |
| Done: obok PR-ów (już są) pokazać następny krok z silnika („następnym razem: 12 kg × 8") | F1.4 | w ramach F1.4 |

### Poza planem — świadomie NIE robimy (zgodnie z audytem §10.3 i CLAUDE.md)

Rozbudowane wykresy, kolejne filtry biblioteki, AI-coach, automatyczny deload,
paywall/cennik (hipotezy cenowe audytu = do eksperymentu po H2), tryb trenera,
lifetime. Audyt potwierdza dotychczasową dyscyplinę zakresu — utrzymać.

---

## 3. Wpływ na sekwencję i bramkę H2

```text
F0 (2,5–4 d) → R3b → R4 (+F1.4, +F2 loggerowe) → R5b → R6 → R7 (H2)
                └─ F1.1–F1.3 równolegle (bez UI, bez ryzyka dla R3b/R4)
```

Do bramki H2 (`plan-sprintow` §6) dochodzą trzy warunki:

1. Zamknięte F0 (cel/plan, swap-prev, anomalie) — inaczej H2 zmierzy znane
   usterki zaufania zamiast wartości koncepcji (audyt §10 ma tu rację).
2. Prefill z sugestią działa przynajmniej w wariancie minimalnym — metryka H2
   „odsetek zaakceptowanych sugestii bez ręcznej zmiany" wymaga istnienia sugestii.
3. Scenariusz H2 uzupełniony o metryki audytu §12: czas do pierwszej serii,
   odsetek dokończonych podmian, treningi zgodne z planem (nie surowa liczba).

Szacunek łączny nowej pracy: **F0 + F1 + F2 ≈ 12–18 dni roboczych [Claude]**,
z czego ~40% pokrywa się z już zaplanowanym zakresem R4/R5b (logger, timer,
copy), więc realny narzut na kalendarz to ok. **7–10 dni**.

---

## 4. Decyzje właściciela — ROZSTRZYGNIĘTE 2026-07-18

| # | Decyzja | Werdykt |
|---|---|---|
| D1 | Cel tygodniowy poza zakresem planu | **NIE** — cel ograniczony do `frequency_min..max` planu, nadwyżka jako bonus |
| D2 | Trener-konsultant dla reguł X | **OK** — zaangażować przed włączeniem UI F1.4; shadow mode rusza bez podpisu |
| D3 | Minimalny prefill przed H2 | **TAK** |
| D4 | Passa wg min. celu planu | **TAK, wersja surowa** — passa rośnie tylko w tygodniu z wykonanym minimum planu; 1 z 2 = passa przerwana. Komunikat powrotu bez winy (spec §11.3). Wdrożenie w F0.1 |
| D5 | Spec v1 jako kanon rdzenia | **OK** — po zamknięciu D-001–D-010, §18 podlega zasadom CLAUDE.md |

**Konsekwencja D4:** skoro passa staje się surowsza, jej liczenie musi być
bezbłędne — stąd F0.5 (strefa czasowa tygodnia) wchodzi do F0 jako warunek D4.

---

## 5. Audyt biblioteki treningów — weryfikacja i fala F3

### 5.1. Weryfikacja względem danych (seed + migracje)

**Najważniejsze: audyt robiony był na nieaktualnych plikach.** Analizował
`docs/trainings/` (13 programów Markdown), a seed/baza mają **15 programów** —
w tym `intermediate-gym-fbw2` i `intermediate-home-fbw2`, których „brak" audyt
uznał za lukę nr 1. Te programy istnieją. Realny problem to **dryf dokumentacji
względem seeda** (w tym nazewnictwo: plik `beginner-dumbbell-fbw3.md` vs slug
`beginner-home-fbw3`).

Co się potwierdza w danych:

| Zarzut | Stan faktyczny (seed.ts) | Werdykt |
|---|---|---|
| Upper B za długi (8 ćw., ~23 serie) | Upper B · hipertrofia: **8 ćw. / 26 serii** (gym i home) | Potwierdzone, nawet mocniej |
| Deadlift w Pull A dzień przed Legs A (squat+RDL) | Pull A: `Barbell_Deadlift` → Legs A: `Barbell_Squat` + `Romanian_Deadlift` | Potwierdzone |
| Domowe plany za ciężkie logistycznie | `intermediate-home-fbw2` Trening B: **9 ćwiczeń** | Potwierdzone |
| Brak kontraktu danych | `content_version`, `required/optional_equipment`, `frequency_min/max` **już są** na programie; brakuje na slocie: RIR, entry criteria, standard rozgrzewki, `load_basis` | Częściowo — połowa zrobiona |
| „Body only" wymaga drążka/poręczy | `beginner-bodyweight-fbw3` zawiera ruchy wymagające podporów/drążka | Potwierdzone |

Ocena merytoryczna programów (statusy A/B/C, dips ≠ isolation, jump squat bez
double progression, regresje Nordic/HSPU) to domena trenera-konsultanta — spójne
z D2 i spec §19. Nie rozstrzygamy tego inżyniersko.

### 5.2. Fala F3 — biblioteka (równolegle z F1, treść niezależna od kodu)

| # | Zadanie | Zakres | Czas |
|---|---|---|---|
| F3.1 | Jedno źródło prawdy treści | Generator `docs/trainings/` z seeda (albo odwrotnie) + check w CI, że dokumentacja == baza; ujednolicenie slug/nazwa pliku | 0,5–1 d [Claude] |
| F3.2 | Rozszerzenie walidatora treści | `validate:training` + reguły z audytu: szacowany czas sesji vs deklarowany, liczba ćwiczeń/serii na dzień z progami ostrzeżeń, prawdziwość `required_equipment` (żadnego „body only" z drążkiem), osierocone swapy | 1 d [Claude] |
| F3.3 | Korekty objętości i sekwencji | **✅ Wdrożone 2026-07-18 (bez podpisu trenera — decyzja właściciela, wystarczające na testy ze znajomymi, nie na publiczny launch).** `scripts/seed.ts`: Upper B siłownia 26→20 serii, Upper B dom 26→19 serii (bez usuwania ćwiczeń — bezpieczne pod `SAFE SEED STOP` w sync loggerze); PPL Pull A 23→19 serii + Legs A 25→23 serii (deadlift zostaje w Pull A jako sygnaturowy ciężki ruch, zredukowane wiosła i RDL zamiast przenoszenia — mniejsze ryzyko niż zmiana kolejności ćwiczeń bez trenera); Dzień C beginner-home-fbw3 — biceps/triceps/core oznaczone `notes: "Opcjonalny finisher..."`. **Sprawdzone i NIE ruszone:** `intermediate-home-fbw2` Trening B ma w seedzie faktycznie 8 ćwiczeń, nie 9 jak w audycie (stary dokument) — czas sesji wychodzi w deklarowanym zakresie, zmiana byłaby nieuzasadniona. `content_version` podbite 2→3 na czterech zmienionych programach. Zweryfikowane: tsc/lint/85 testów, `validate:training` (16/49 placeholderów bez zmian) i `validate:recommendations` (60/60) zielone. **NIE uruchomione: `npm run seed` na żadnej bazie** (sandbox bez Dockera/Supabase) — patrz „Do zrobienia przed wysyłką" niżej. | 1–2 d [trener + Ty], wdrożenie 0,5 d — **wdrożenie zrobione, brak wgrania do bazy** |
| F3.4 | Slot-level kontrakt danych | Migracja: RIR target, `load_basis`, oznaczenie „opcjonalny finisher"; entry criteria na programie (advanced) | 1 d [Claude], razem z F1.1 |
| F3.5 | Nowe programy (dopiero po F3.1–F3.3) | Tylko realne luki: FBW2 zero-equipment (uczciwy, bez drążka), FBW2 gumy+kotwa; machine-first beginner jako opcja P1. Intermediate FBW2 ×2 z audytu **już istnieją** | 2–3 d [trener + Ty] |

Zasada z audytu do przyjęcia wprost: **nie mnożyć wariantów kosmetycznych**,
bez wersji „dla kobiet", bez planu na każdą kombinację dni. Biblioteka to wejście
do systemu prowadzenia (F1), nie samodzielny moat.

**Kolejność:** F3.1–F3.2 od razu (chronią przed kolejnym audytem na złych danych
i przed regresją treści), F3.3–F3.4 po podpisie trenera, F3.5 przed H2 tylko
jeśli rekrutacja testerów wymaga planu bez sprzętu — inaczej po H2.

---

## 6. Harmonogram wykonawczy (dni robocze, start = najbliższy sprint)

| Blok | Zakres | Dni | Kto | Gate wyjścia |
|---|---|---|---|---|
| **T1: F0 komplet** | F0.5 → F0.1+F0.6 (cel+passa jedną zmianą semantyki) → F0.2 → F0.3 → F0.4 (systemowy fix górnego safe area) | 5–6,5 | Claude + checkpoint iPhone PWA [Ty] | Tydzień/passa poprawne w UTC-deployu; „6/5" niemożliwe; swap nie przenosi ciężaru; anomalie wymagają potwierdzenia; tło każdego ekranu dochodzi do samej góry, nic nie scrolluje pod zegarem |
| **T1–T2 równolegle: F3 fundament** | F3.1 (sync docs↔seed + CI) → F3.2 (walidator: czas sesji, progi objętości, prawdziwość sprzętu) | 1,5–2 | Claude | CI blokuje dryf treści; walidator flaguje Upper B i „body only" z drążkiem |
| **T2: R3b** | Ekipa jako hub — wg planu sprintów, bez zmian | 2–3 | Claude + dogfooding [Ty] | wg `plan-sprintow` |
| **T2–T3: F1 bez UI** | F1.1+F3.4 (jedna migracja: prescription snapshot, algorithm_version, load_basis, RIR, finisher-flag) → F1.2 (silnik + 30 złotych przypadków, pain_flag) → F1.3 (shadow) | 4,5–6 | Claude; start współpracy z trenerem (D2) | Silnik liczy w shadow na realnej historii; override rate policzony wstecznie |
| **T3–T5: R4 rozszerzony** | Logger/Historia wg planu sprintów **+** F1.4 (prefill+reason) **+** F2 loggerowe: swap reasons i „Zapisz w planie", timer (widoczność poza loggerem, „Koniec", powiadomienie), kalendarz z datami, undo historii, zwijanie kart, autofokus, Done z następnym krokiem | 8–9 (było 5–6) | Claude + regresja iOS [Ty]; UI prefillu za zgodą trenera | Sugestia w polach działa e2e; nic z R4 bazowego nie wypadło |
| **T5: F3 treść** | F3.3 wdrożenie korekt po podpisie trenera (Upper B, PPL deadlift, home FBW2, nazwy programów); decyzja o F3.5 (nowe programy przed H2 tylko jeśli potrzebne do rekrutacji) | 1–2 | Ty + trener; wdrożenie Claude | Walidator F3.2 zielony po zmianach |
| **T5–T6: R5b** | Dostępność i regresja wg planu **+** gęstość/chrome (F2) | 4–5 | Claude + macierz [Ty] | wg `plan-sprintow` |
| **T6: R6 + bramka H2** | Przygotowanie H2 z rozszerzoną bramką (pkt 3 tego dokumentu) + postępy 3M/6M jeśli zostaje czasu | 1–2 | Claude + pilot [Ty] | Bramka §6 plan-sprintów + 3 warunki z §3 |
| **T7+: R7 / H2** | 3–5 sesji, metryki audytu §12 (akceptacja sugestii, czas do 1. serii, zgodność z planem) | 1–2 tyg. kal. | Ty | Decyzja B1 |

Łącznie do startu H2: **~27–33 dni robocze** (wobec ~20–28 w samym planie R;
narzut audytów to ~6–7 dni dzięki scaleniu F1.4/F2 z R4 i F3.4 z F1.1).

Reguły: P0/P1 nadal zatrzymuje przejście; freeze od R6; żadne zadanie F2/F3.5
nie wchodzi kosztem gate'ów T1/T2.

---

## 7. Macierz pokrycia — czy zaadresowaliśmy wszystko

Przegląd każdego problemu z trzech audytów → gdzie jest w planie.
Legenda: ✅ w planie/zrobione · 🟡 częściowo, świadomie · ⛔ świadomie NIE (z powodem).

**Audyt UX — P0:** sprzeczność 6/5 → F0.1 ✅ · prefill/ostatnie wyniki → SetRow (już jest) + F1 ✅ · safe area → F0.4 ✅ · język ćwiczeń → R5a (213 nazw) 🟡 ogon ~700 nazw i instrukcji po H2 (backlog, świadomie) · walidacja e1RM/ciężarów → F0.3 ✅ · destrukcyjne akcje → potwierdzenia są; undo+kosz+Ekipa → F2/R4 ✅ · krótsze nazwy programów → F2+F3.3 ✅

**Audyt UX — P1:** jeden rekomendowany plan → onboarding E6 (jest) 🟡 wzmocnienie po H2 · podmiana wokół 3 zamienników → SwapPanel (jest) + powody/„Zapisz w planie" F2 ✅ · progres po treningu → Done z PR (jest) + następny krok F1.4 ✅ · Ekipa status/wsparcie → R3b ✅ · Postępy jako odpowiedzi → F2 (3M/6M + interpretacja) 🟡 pełna wersja po H2 · gęstość/chrome → F2/R5b ✅

**Audyt UX — pozostałe (5.x, 8.x):** filtry biblioteki (sticky CTA, aktywne chipy) → weryfikacja R4 ✅ · szczegóły programu (podsumowanie 1. ekranu) → F2 ✅ · logger 5.4 (zwijanie, objętość, autofokus) → R4 ✅ · info o ćwiczeniu → instrukcje PL są (scripts/data) 🟡 skrócenie do 3–4 kroków = content po H2 · kalendarz z datami → F2 ✅ · profil treningowy vs ustawienia (5.9) → 🟡 backlog po H2 (IA świeżo po R2, nie ruszamy przed H2) · Dynamic Type/kontrast → R5b ✅ · mikrocopy → F2 ✅

**Audyt UX — P2:** materiały wideo, adaptacje planu, zaawansowane statystyki, język marki → ⛔ świadomie po H2 (zgodnie z audytem §10.3) · timer tło/lockscreen → F2 ✅ · 16 placeholderów zdjęć → decyzja [Ty] odroczona, warunek bramki H2 (bez zmian)

**Spec rdzenia:** silnik §7 → F1 ✅ · model danych §4 (load_basis, snapshot, wersje) → F1.1+F3.4 ✅ · stany sesji §5 → R1b (zrobione) ✅ · onboarding kalibracja §6 → F1.2 (CALIBRATING) ✅ · typy ćwiczeń §8 → 🟡 unilateral/drabinki = reguły X, po podpisie trenera; enum set_type zgodny · timer §9 → F2 ✅ · podmiana §10 → F0.2+F2 ✅ · rotacja/cel/passa §11 → F0.1+F0.6+D4 ✅ (próg 70% rotacji = decyzja trenera) · regeneracja/deload §12 → ⛔ v1 nie robi auto-deloadu (zgodnie ze spec); pain_flag → F1.2 ✅ · e1RM §13 → F0.3 ✅ · UX kontrakty §14 → F1.4+F2 ✅ · edge case'y §16 → złote przypadki F1.2 ✅; dwa urządzenia/strefa czasowa → R1b (jest) + F0.5 ✅; 10k serii → budżety `optymalizacja.md` (jest) ✅ · analityka §17 → F1.3 (shadow) 🟡 produkcyjna analityka = decyzja prawna, znane ryzyko 6 HANDOFF · Free/Pro §18 → ⛔ po H2, podlega CLAUDE.md · walidacja ekspercka §19 → D2 ✅

**Audyt biblioteki:** „brak FBW2 intermediate" → istnieją (audyt na starych plikach); dryf docs↔seed → F3.1 ✅ · kontrakt danych §13 → połowa jest, reszta F3.4 ✅ · walidacja publikacji → F3.2 ✅ · objętość/sekwencje (Upper B 26 serii, PPL deadlift, home 9 ćw., dzień C finisher) → F3.3 [trener] ✅ · statusy A/B/C, swapy ryzykowne, dips, jump squat, regresje/entry criteria → F3.3+F3.4 [trener] ✅ · ścieżka nauki maszyna→sztanga w onboardingu → 🟡 razem z F3.5, decyzja przy trenerze · drabinka startowa bodyweight → reguła X, po podpisie ✅ · nowe programy → F3.5 (zredukowane do realnych luk) ✅ · raportowanie objętości per cykl → F3.3 copy ✅ · „czego nie robić" (warianty kosmetyczne, paywall bezpieczeństwa, etykieta AI, wersja „dla kobiet") → ⛔ przyjęte wprost ✅

Nie znaleziono pozycji bez przypisania. Jedyne pozycje odłożone świadomie mają
powód i moment powrotu (po H2 albo po podpisie trenera).

---

## 8. Status dokumentu

Zaktualizowany o decyzje D1–D5, audyt biblioteki (F3), harmonogram T1–T7
i macierz pokrycia. Po akceptacji: wpisy F0.x/F3.1–F3.2 do aktywnego backlogu
w `plan-sprintow-2026-07.md`, aktualizacja `HANDOFF.md` i kolejki Notion zgodnie
z procedurą zamknięcia sesji.
