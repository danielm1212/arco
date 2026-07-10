# Hevy — analiza UX ekran-po-ekranie (Mobbin) + matryca wdrożeń dla Arco

> Data: 2026-07-02. Uzupełnienie strategicznego `konkurencja-hevy.md` (filozofia/pricing/dziury) o warstwę **konkretnych flows, ekranów i patternów**. Źródło: Mobbin iOS, 5 flows / ~60 ekranów.
>
> Flows (linki do pełnych sekwencji):
> - [Logging a workout (21 ekranów)](https://mobbin.com/flows/7b6374ff-8ff6-4d7b-babe-077e72b6ee1f)
> - [Onboarding (18 ekranów)](https://mobbin.com/flows/a38ff0a3-66d1-41b1-9644-308171c57ce9)
> - [Creating a routine](https://mobbin.com/flows/49e3ad2c-6e8a-4f75-8a1a-96010829280f) · [Routine folders](https://mobbin.com/flows/381db4b6-b405-4e4e-a734-5541cf3676cb)
> - [Workout detail](https://mobbin.com/flows/db811e54-0baf-4b1e-a5a4-968f79748b60) · [Exercise detail](https://mobbin.com/flows/c2621492-cd68-4948-b2dc-07435ee63203)
> - [Logging measurements](https://mobbin.com/flows/b702dcc4-3422-4f75-8baa-7d0b91a48134)

---

## 1. Architektura informacji

**3 taby: Home (feed) · Workout (hub) · Profile.** Wszystko treningowe wychodzi z jednego huba „Workout"; statystyki, pomiary i kalendarz są schowane w Profile → Dashboard. Home = feed social (dla usera bez znajomych praktycznie martwy — potwierdza nasz argument cold-start z `konkurencja-hevy.md`).

**Wniosek dla Arco:** nasza IA (home = „dziś" + guidance) jest lepsza dla usera solo. Ale u Hevy imponuje **dyscyplina 3 tabów** — zero rozlanej nawigacji. Trzymać się tego.

## 2. Workout hub (tab „Workout")

Co widać:
- **Quick Start → „Start Empty Workout"** jako pierwsza opcja (logger-first DNA: ty wiesz, co robisz).
- Sekcja **Routines**: „New Routine" + „Explore Routines"; **foldery rutyn** (np. „PPL (Push/Pull/Legs)") z „+ Add new routine" per folder.
- Karta rutyny = nazwa + **preview listy ćwiczeń w 2 liniach** + duży CTA „Start Routine".
- ⭐ **Sticky mini-bar „Workout in Progress · ▶ Resume / ✕ Discard"** przyklejony nad tab-barem — sesja w toku przeżywa dowolną nawigację po apce i jest zawsze o jeden tap.

Ocena: hub jest wzorowo prosty. Mini-bar in-progress to najlepszy pojedynczy pattern nawigacyjny w całej apce — rozwiązuje „wyszedłem z loggera i nie umiem wrócić / boję się, że straciłem sesję".

## 3. Logger (rdzeń — porównanie 1:1 z naszym)

Struktura ekranu:
- Header: chevron (minimize do mini-bara!) · ikona rest-timera · **Finish** (primary, zawsze widoczny).
- Pasek live: **Duration / Volume / Sets** u góry.
- Karta per ćwiczenie: miniatura + nazwa (→ detal ćwiczenia), menu ⋮, **notatka inline** („Add notes here…" zawsze widoczne pod nazwą), „Rest Timer: 2min 30s / OFF" ustawiany **per ćwiczenie**.
- Tabela **SET | PREVIOUS | KG | REPS | ✓**. Kolumna PREVIOUS = ghost z ostatniej sesji (kontekst, ale user i tak wpisuje ręcznie — tu jest ich tarcie).
- **Typy serii:** „W" = warmup (pomarańczowe, poza volume), numerowane normalne; serie czasowe (TIME z ▶) żyją w tym samym gridzie co kg/reps.
- Zaliczenie ✓ → **cały wiersz zalany zielenią** + automatyczny start przerwy.
- ⭐ **Rest timer jako bottom-bar**: wielki countdown (02:29) + **−15 / +15 / Skip**, przypięty na dole — **nie zasłania tabeli**, można dalej edytować kolejne serie.
- „+ Add Set" pod tabelą. Superset = kolorowy badge nad ćwiczeniem.

Ocena: najlepszy mainstream-logger na rynku, ale **pasywny** — wszystko wpisujesz sam, zero podpowiedzi „ile dziś". Nasza przewaga (pre-fill + guidance) jest realna; ich przewaga to ergonomia drobiazgów (timer nie zasłania, notatka zawsze pod ręką, warmup-serie, timer per ćwiczenie).

## 4. Finish flow — najważniejsze odkrycie

**Hevy NIE ma celebracji.** Finish → ekran **„Save Workout"**: tytuł (auto „Leg day"), Duration/Volume/Sets, edytowalna data, „Add a photo/video", Description, **Visibility (Everyone ▸)**, Discard → post ląduje w feedzie. Koniec treningu = **formularz publikacji**, emocjonalnie płaski, z domyślnym wystawieniem na publikę.

**Wniosek:** nasz ekran celebracji (Sprint 2) trafia dokładnie w ich dziurę. Nie kopiować formularza — ale **podebrać 2 elementy**: (a) auto-tytuł/nazwa sesji + edytowalna notatka podsumowująca, (b) docelowo zdjęcie sesji (H5: check-in do poda będzie tego chciał).

## 5. Workout detail (historia)

- **Muscle Split** — poziome bary % per partia (Legs 59%, Core 38%…) na górze detalu.
- Lista ćwiczeń: „158kg × 8 reps" per seria, **fioletowe badge „Superset"** parujące ćwiczenia.

Ocena: Muscle Split to tani, czytelny pattern — u nas naturalnie pasuje do ekranu celebracji i detalu historii (dane z `sets-per-muscle` już są).

## 6. Picker ćwiczeń („Add Exercise")

- Search + **2 chipy-filtry: Equipment / Muscles** (aktywny filtr = wypełniony chip + ✕ reset).
- Sekcje: **Recent Exercises** (na górze!) → Popular → All (A–Z).
- **Multi-select**: niebieska belka na lewej krawędzi wybranych + sticky CTA **„Add 3 exercises"**.
- ⭐ **Ikona wykresu przy każdym wierszu** — skok do progresu ćwiczenia wprost z pickera.
- „Create" w headerze = custom ćwiczenie (u nas: S6 w toku).

Ocena: nasz `ExerciseBrowser` (S4) ma filtry partia/sprzęt/wzorzec — parytet. Brakuje nam: sekcji **Recent**, multi-select z licznikiem, skoku do progresu z wiersza.

## 7. Detal ćwiczenia — najbogatszy ekran Hevy

Taby **Summary / History / How to / Leaderboard**:
- Ilustracja z zaznaczonymi mięśniami primary/secondary (jak nasza baza).
- Wykres z chipami metryk: **Heaviest Weight / One Rep Max / Best Set…** + zakres (Year).
- **Personal Records:** Heaviest · Best 1RM · Best Set Volume · Best Session Volume.
- ⭐⭐ **Set Records per reps** — tabela PR **dla każdej liczby powtórzeń** (3 → 100 kg, 5 → 95 kg, 8 → 75 kg, 10 → 20 kg). Złoto dla naszego rule-based guidance: „przy 8 powt. twój rekord to X → dziś proponuję X+2,5".
- ⭐ **Strength Level:** pasek Beginner → Intermediate → Advanced → Elite + „You are stronger than 48% of male lifters your age and bodyweight". Odblokowywany **progressive profile prompt**: „Add your sex, age and weight (0/3)".

Ocena: to jest ich realna głębia produktowa. Rep-PRs = niski koszt (mamy `personal_records` + recompute), wysoka wartość i **karmi guidance**. Strength Level wymaga danych populacyjnych — u nas wersja adaptowana (open-source strength standards albo poziom vs własna historia), H3.

## 8. Profil / statystyki

- Header: avatar + Workouts / Followers / Following.
- **„2 hours this week"** + bar chart ~12 tygodni z toggle **Duration / Volume / Reps**.
- Dashboard: **Statistics · Exercises · Measures · Calendar** (kafelki).
- **Muscle distribution:** radar 6 osi **current vs previous** (30 dni) + 4 karty stat (Workouts/Duration/Volume/Sets) z **zielonymi deltami ↑ vs poprzedni okres**.
- **Body distribution:** anatomiczna sylwetka przód/tył (jak nasza heatmapa) + **tabela liczbowa setów per mięsień** + week-strip dni.
- **Set count per muscle:** multi-line chart z checkboxami mięśni.
- „Compare" (porównanie z innym userem) — vanity, pomijamy.

Ocena: delta-karty („↑ 16k kg vs poprzednie 30 dni") to najtańszy „wow" — sama liczba nabiera znaczenia. Tabela setów pod heatmapą dopowiada to, czego kolor nie umie.

## 9. Pomiary ciała

Waga + obwody (talia, kark, biceps…) + **progress pictures** w jednym flow „Log Measurements"; wykres per metryka przełączany chipami; historia z ikonką aparatu przy wpisach ze zdjęciem. U nas /body już to w większości ma — ewentualnie chipy metryk nad wykresem.

## 10. Onboarding

Splash (dark!) → jednostki (kg/lbs segmented) → krótka karuzela value-prop (mockup wykresu „Measure progress") → od razu do apki + karta „How to get started". **Zero personalizacji celu/doświadczenia** — nasz S7 (doświadczenie → sugestia planu + imię + cel tygodniowy) będzie od razu głębszy.

---

## Matryca rekomendacji

Werdykty: ✅ wdrożyć · 🔶 zaadaptować pod nasz klin · ❌ świadomie nie. Koszt: S/M/L. „Kiedy" mapowane na `plan-sprintow-2026-07.md`.

| # | Pattern (Hevy) | Werdykt | Wpływ | Koszt | Kiedy | Dlaczego / jak u nas |
|---|---|---|---|---|---|---|
| 1 | **Set Records per reps** (PR per liczba powtórzeń) | ✅ | 🔥🔥🔥 | M | S8/H1 | Karmi rule-based guidance konkretem („PR przy 8 powt. = X → dziś X+2,5"). Mamy `personal_records` + recompute — rozszerzyć o wymiar reps. |
| 2 | **Mini-bar „Workout in Progress · Resume/Discard"** nad nawigacją | ✅ | 🔥🔥🔥 | S–M | N2 | Anty-utrata sesji, swobodna nawigacja w trakcie treningu. Sprawdzić, jak dziś zachowuje się wyjście z loggera. |
| 3 | **Rest timer bottom-bar** (countdown + ±15 + Skip, nie zasłania tabeli) | ✅/🔶 | 🔥🔥 | S | N2 | Porównać z naszym timerem; zasada do przejęcia: **przerwa nie może blokować edycji kolejnych serii**. |
| 4 | **Sekcja „Recent"** w pickerze ćwiczeń | ✅ | 🔥🔥 | S | N2/S7 | Najczęstszy przypadek to ćwiczenie sprzed tygodnia; A–Z + filtry nie wystarczą. |
| 5 | **Multi-select w pickerze** + sticky „Dodaj N ćwiczeń" | ✅ | 🔥 | S | S7 | Budowanie programu / dorzucanie kilku naraz bez wracania. |
| 6 | **Skok do progresu ćwiczenia z wiersza pickera** (ikona wykresu) | ✅ | 🔥 | S | S8 | Spójne z „liczba-bohater"; mamy detal ćwiczenia — to tylko link. |
| 7 | **Muscle Split %** w podsumowaniu/detalu treningu | ✅ | 🔥🔥 | S | S8 | Dane z `sets-per-muscle` już są; wzmacnia celebrację i historię. |
| 8 | **Delta-karty stat vs poprzedni okres** (↑ zielone) | ✅ | 🔥🔥 | S | S8 | Najtańszy „wow" na /progress; liczba-bohater dostaje kontekst. |
| 9 | **Tabela setów per mięsień** pod heatmapą + zakres tygodnia | ✅ | 🔥 | S | S8 | Kolor heatmapy + liczby = pełny obraz; dziś kolor bywa niejednoznaczny. |
| 10 | **Typ serii „W" (warmup)** poza volume/PR | 🔶 | 🔥🔥 | M | S8 | U nas wg reguły „kto/kiedy" jak RPE: ukryte za menu wiersza, nie kolumna-domyślna. |
| 11 | **Notatka inline per ćwiczenie** zawsze widoczna | 🔶 | 🔥 | S | N2 | Mamy zwijaną notatkę (S1) — sprawdzić, czy trigger jest wystarczająco odkrywalny; u Hevy placeholder zaprasza. |
| 12 | **Rest timer per ćwiczenie** (nie globalny) | 🔶 | 🔥 | M | S8+ | Sensowne (przysiad ≠ biceps); u nas default globalny + override per ćwiczenie w programie. |
| 13 | **Strength Level + percentyl** („stronger than 48%…") | 🔶 | 🔥🔥 | L | H3 | Bez milionów userów → open-source strength standards lub poziom vs własna historia. Mocne dla motywacji, ale nie kopiować „porównań z populacją" 1:1. |
| 14 | **Progressive profile prompt** („0/3 — dodaj wiek/wagę, odblokuj X") | 🔶 | 🔥 | S | S7 | Zamiast pytać o wszystko w onboardingu — dane opcjonalne odblokowują funkcję, gdy potrzebne. |
| 15 | **Explore: filtry Level/Goal/Equipment jako karty w sheet** | 🔶 | 🔥 | S | S7 | Pasuje do presetów PPL/UL + onboarding „doświadczenie → sugestia planu". |
| 16 | **Foldery rutyn** | 🔶 | ➖ | M | H3 | Dopiero gdy programów będzie kilkanaście; teraz 6 kuratorowanych = niepotrzebne. |
| 17 | **Auto-tytuł sesji + notatka na ekranie końcowym** | 🔶 | 🔥 | S | N2/S8 | Na NASZEJ celebracji, nie jako formularz. Zdjęcie sesji → dopiero H5 (check-in do poda). |
| 18 | **Karuzela value-prop w onboardingu** (mockup wykresu) | 🔶 | ➖ | S | S7/H3 | 2–3 slajdy „co daje Arco" przy pierwszym uruchomieniu; niski priorytet do publicznego otwarcia. |
| 19 | **Home = feed social** | ❌ | — | — | — | Cold-start killer; nasz home = „dziś + guidance". Potwierdzone: pusty feed Hevy jest martwy. |
| 20 | **Save Workout = formularz publikacji + Visibility „Everyone"** | ❌ | — | — | — | Anty-wzorzec dla kameralnego klina; koniec treningu ma być momentem, nie postem. |
| 21 | **Leaderboard w detalu ćwiczenia / Compare userów** | ❌ | — | — | — | Vanity/porównywanie globalne — wprost sprzeczne z filozofią podów. |
| 22 | **„Start Empty Workout" jako hero** | ❌ | — | — | — | Logger-first = pasywność Hevy. U nas hero to „Sugerowane dziś" z programu + guidance. Pusta sesja może istnieć, ale nie jako pierwsza opcja. |
| 23 | **Limit historii w free (3 mies.)** | ❌ | — | — | — | Nasz wyróżnik „twoje dane bez limitów" — nie dotykać nawet przy monetyzacji H4. |

## TOP 5 (kolejność wdrażania)

1. **Rep-PRs (#1)** — jedyny pattern Hevy, który bezpośrednio **wzmacnia nasz wyróżnik** (guidance dostaje precyzyjny punkt odniesienia). Reszta to polish; to jest strategia.
2. **Mini-bar in-progress (#2)** — największy pojedynczy zysk UX-owy w loggerze; kandydat do dorzucenia do Sprintu N2.
3. **Pakiet picker: Recent + multi-select + link do progresu (#4/#5/#6)** — trzy tanie rzeczy, razem duży skok jakości pickera.
4. **Pakiet /progress: delta-karty + Muscle Split + tabela setów (#7/#8/#9)** — statystyki z „rejestru" robią się „lustrem postępu"; naturalny Sprint 8.
5. **Zasada rest-timera (#3)** — przerwa nigdy nie blokuje edycji; zweryfikować nasz logger pod tym kątem w N2.

## Czego się trzymać (potwierdzenia z tej analizy)

- **Celebracja po treningu** — Hevy jej nie ma i mieć nie będzie (Finish = publikacja). Nasza przewaga emocjonalna jest realna, pogłębiać (Muscle Split + rep-PR badge na ekranie celebracji).
- **Pre-fill + guidance** — kolumna PREVIOUS u Hevy to kontekst; ⚠️ **korekta w §11** (koszt interakcji): ✓ najpewniej przejmuje placeholder, więc „1 tap na powtórzoną serię" Hevy częściowo MA. Nasz wyróżnik to nie sam 1 tap, tylko **wartości zaproponowane przez reguły, nie skopiowane z przeszłości**.
- **Dark + volt** — Hevy jest jasny, niebieski, generyczny. Estetycznie nie konkurują.
- **Onboarding z sensem** — ich onboarding nie personalizuje nic; nasz S7 (doświadczenie → plan, imię, cel) da lepszy pierwszy dzień.

---

## 11. Analiza funkcjonalna — perspektywa product designera

> Dodane po review właściciela. Metoda: JTBD + koszt interakcji + model stanów + heurystyki (Nielsen, peak-end). Oznaczenia: **[obs]** = widoczne na ekranach Mobbin; **[wiedza]** = znane zachowanie Hevy spoza screenów — do weryfikacji w realnej apce, nie traktować jako pewnik.

### 11.1 Kontekst użycia (JTBD loggera)

Job-to-be-done: *„w 90–180-sekundowej przerwie, jedną ręką, ze spoconymi dłońmi, zanotuj serię i wróć pod sztangę — bez czytania i bez myślenia".* Każdy element loggera oceniam pod tym kątem: liczba tapów, zasięg kciuka, odporność na przerwania, zero decyzji.

### 11.2 Koszt interakcji per seria (mikro-analiza)

- Ścieżka pełna w Hevy: tap KG → wpisz → tap REPS → wpisz → tap ✓ = **5+ akcji z klawiaturą** na serię; przy ~20 seriach to setki interakcji na trening.
- ALE **[wiedza]**: gdy pola są puste, ✓ przejmuje wartości placeholdera z PREVIOUS → typowa powtórzona seria = **1 tap**. Wniosek strategiczny: „frictionless" Hevy częściowo ma. Nasza różnica musi być precyzyjnie nazwana: **Hevy powtarza przeszłość, Arco proponuje następny krok** (pre-fill = wynik reguł progresji, nie kopia zeszłego tygodnia). Tak to komunikować i tak projektować.
- Wpis wartości: Hevy = systemowa klawiatura (precyzyjna, wolna, zasłania pół ekranu). My = steppery ± (S1) — szybsze dla ±2,5 kg, gorsze dla dużych skoków. Hybryda (steppery + tap na liczbę → keypad) to właściwy kierunek; Ladder robi inline keypad **[obs w benchmarku]**.

### 11.3 Ergonomia / thumb zone [obs]

- **„Finish" w prawym górnym rogu** — poza strefą kciuka. Świadomy trade-off (utrudnia przypadkowe zakończenie), ale nasz slide-to-confirm „Zakończ" (S2) rozwiązuje to lepiej: celowo trudny **i** w zasięgu kciuka.
- **Rest-bar na dole** = idealna strefa kciuka dla najczęstszych akcji w przerwie (±15/Skip). Dobre.
- **Gęsta tabela = małe cele dotykowe.** Przy spoconych dłoniach ryzyko missclicków; nasze większe wiersze-karty mają przewagę dotykową — nie zagęszczać loggera „bo Hevy tak ma".

### 11.4 Model stanów sesji (architektura, nie UI)

- **[obs]** Chevron minimalizuje logger do mini-bara → **sesja jest obiektem globalnym aplikacji, nie ekranem**. Przeżywa nawigację, **[wiedza]** także kill/restart apki. To jest właściwa rama myślenia o pozycji #2 z matrycy: nie „pasek", tylko status sesji w architekturze.
- **[obs]** Save Workout pozwala edytować **„When" (datę/czas)** → obsłużony case „logowałem po fakcie / z opóźnieniem".
- **[wiedza]** Hevy pozwala **edytować zapisany trening** (serie po fakcie). Read-only historia podważa zaufanie do danych („mam błąd i nie naprawię") — u nas do sprawdzenia i najpewniej luka. Uwaga techniczna: edycja historii ⇒ recompute PR.
- **[obs]** „Discard" w mini-barze siedzi obok „Resume" — missclick = utrata całej sesji; na screenach nie widać potwierdzenia. U nas zasada: destrukcyjne zawsze z potwierdzeniem/undo (mamy undo-toast, confirm przy Finish) — sprawdzić, czy porzucenie sesji też jest zabezpieczone.

### 11.5 Defaulty (gdzie Hevy decyduje za usera)

| Default Hevy [obs] | Ocena | Nasz odpowiednik |
|---|---|---|
| Rest Timer: **OFF** dla nowych ćwiczeń | ❌ zły — timer to core value, a nowy user go nie odkryje | default 120 s globalnie = lepiej; zostawić |
| Visibility: **Everyone** | ❌ growth-first, prywatność-last | przy podach (H5): default = pod, nigdy public |
| Auto-tytuł sesji („Leg day") | ✅ zdejmuje pracę | przejąć na celebracji (#17) |
| Auto-start przerwy po ✓ | ✅ zero decyzji w przerwie | mamy (✓→rest) |

### 11.6 Pętle feedbacku i emocje (peak-end rule)

- W trakcie: live Duration/Volume/Sets + zielony wiersz = dobra pętla „widzę postęp" ambientowo, bez czytania. Parytet u nas jest (live pasek).
- **Koniec: formularz.** Wg peak-end rule wspomnienie sesji kształtują szczyt i koniec — Hevy **systematycznie marnuje koniec**, a szczytu (pierwszy PR w sesji) w ogóle nie zaznacza w momencie, w którym się dzieje. Dwa wnioski dla Arco:
  1. celebracja (S2) to inwestycja w retencję, nie ozdoba — pogłębiać;
  2. **peak dzieje się przy serii, nie na końcu** → mikro-moment PR w loggerze (badge/haptic/volt-flash na wierszu, 1–2 s, bez przerywania flow) — nowa pozycja #26.

### 11.7 Time-to-value (onboarding funkcjonalnie)

Hevy: signup → jednostki → **pusty hub**. Pierwsza wartość wymaga samodzielnego zbudowania rutyny albo znalezienia Explore → TTV kilkanaście minut + wysiłek decyzyjny na starcie (najgorszy moment na decyzje). Nasz S7 (doświadczenie → gotowy plan → „Sugerowane dziś") może dać **TTV < 2 min z zerem decyzji**. To przewaga funkccyjna pierwszej sesji, nie kosmetyka — trzymać S7 wysoko.

### 11.8 Statystyki: rejestr vs lustro

Hevy ma dużo **danych**, prawie zero **wniosków** — żaden ekran statystyk nie mówi „co z tego wynika / co zrobić". Jedyny zalążek interpretacji: radar current-vs-previous i zielone delty (porównanie = interpretacja). Reguła projektowa dla /progress: **każdy wykres odpowiada na pytanie usera, nie renderuje tabeli** — nagłówek-interpretacja nad wykresem („Wolumen ↑12% — progresja działa", „Pull odstaje od push trzeci tydzień"), liczone przez istniejący silnik guidance. To pozycja #27 — i to jest miejsce, gdzie różnicujemy się od Hevy najgłębiej, bo u nich to sprzeczne z DNA „księgi".

### 11.9 Findability

Statystyki/Measures/Calendar schowane 2 poziomy (Profile → Dashboard) **[obs]** — świadomy koszt prostoty 3 tabów. U nas /progress jest pierwszym poziomem — zostawić; nie chować „lustra" za profilem, skoro to nasz wyróżnik.

### 11.10 Czego Mobbin NIE pokaże (granice tej analizy)

Haptics i dźwięki, gesty (swipe-to-delete serii), zachowanie offline/konflikty synca, edge-case'y klawiatury, Apple Watch, szczegóły paywalla w praktyce. Jeśli chcemy pełny audyt funkcjonalny — trzeba przeklikać realną apkę (Hevy free wystarczy); wnioski **[wiedza]** z tej sekcji zweryfikować wtedy w pierwszej kolejności.

### 11.11 Delta do matrycy (nowe pozycje z analizy funkcjonalnej)

| # | Funkcja/zasada | Werdykt | Wpływ | Koszt | Kiedy | Dlaczego |
|---|---|---|---|---|---|---|
| 24 | **Edycja daty/czasu sesji** (logowanie po fakcie) | ✅ | 🔥🔥 | M | S8 | Real-life: „telefon padł / zalogowałem wieczorem". Hevy ma w Save Workout [obs]. |
| 25 | **Edycja zapisanego treningu** (serie po fakcie) + recompute PR | ✅ | 🔥🔥 | M–L | S8+ | Read-only historia podważa zaufanie do danych; błędy się zdarzają. |
| 26 | **Mikro-celebracja PR w trakcie sesji** (volt-flash/haptic na wierszu) | ✅ | 🔥🔥 | S | S8 | Peak-end: peak jest przy serii, nie na końcu; Hevy tego nie ma wcale. |
| 27 | **Nagłówki-interpretacje nad wykresami /progress** (z silnika guidance) | ✅ | 🔥🔥🔥 | M | S8 | Zamienia rejestr w lustro; najgłębsza różnica vs Hevy, sprzeczna z ich DNA. |
| 28 | **Guard na porzucenie sesji** (confirm/undo na Discard-odpowiedniku) | ✅ | 🔥 | S | N2 | Missclick = utrata treningu; sprawdzić czy już zabezpieczone. |
| 29 | **Hybryda wpisu: steppery ± + tap na liczbę → keypad** | 🔶 | 🔥 | M | S8+ | ± dobre dla ±2,5 kg, złe dla dużych skoków; wzorzec inline-keypad: Ladder. |
| 30 | **Sesja jako obiekt globalny** (przeżywa nawigację i restart) — rama dla #2 | ✅ | 🔥🔥🔥 | M | N2/S8 | To architektura, nie pasek; dopiero ona daje pełne „nie boję się wyjść z loggera". |

**Korekta priorytetów TOP 5:** #27 (interpretacje) wskakuje obok #1 (rep-PRs) na szczyt — oba wzmacniają wyróżnik guidance, a #27 jest widoczny każdego dnia użycia. #30 przejmuje miejsce #2 jako właściwe sformułowanie tej samej pracy.
