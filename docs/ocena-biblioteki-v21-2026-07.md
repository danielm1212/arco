# Ocena merytoryczna biblioteki v2.1 — weryfikacja źródeł i programowania

**Data:** 2026-07-29
**Przedmiot:** `training_programs_v2` (15 planów + `AUDYT_KONCOWY_V2_1.md` + PDF audytu)
**Metoda:** weryfikacja wszystkich siedmiu cytowanych prac w PubMed/PMC, konfrontacja decyzji
programowych z ACSM 2026 Position Stand, policzona objętość na mięsień w naszej bibliotece
**Werdykt jednym zdaniem:** kontrakt recepty jest bardzo dobry i wart adopcji, warstwa dowodowa
jest miejscami naciągnięta, a księgowanie objętości jest prowadzone w złej jednostce.

## 1. Weryfikacja cytowań

Sprawdzone bezpośrednio w PubMed/PMC. **Żadne cytowanie nie jest zmyślone — wszystkie siedem
identyfikatorów prowadzi do realnych prac.** To istotne, bo przy dokumentach generatywnych to
nie jest domyślny wynik.

| Cytowanie | Status | Faktyczne dane |
|---|---|---|
| Currier 2023, PMID 37414459 | potwierdzone | Currier, McLeod, … Phillips. BJSM 2023. 178 badań siły / 119 hipertrofii |
| Refalo 2023, PMC9935748 | potwierdzone | Sports Med 2023;53(3):649–665, **PMID 36334240**. Failure vs non-failure ES 0,12 (p = 0,343) |
| Schoenfeld 2017, PMID 27433992 | potwierdzone | J Sports Sci. **+0,37% masy na każdą dodatkową serię tygodniowo** |
| Gentil 2013, PMID 23537028 | potwierdzone | Appl Physiol Nutr Metab. 10 tygodni, **osoby nietrenujące** |
| Mannarino 2021, PMID 31268995 | potwierdzone | JSCR 2021;35(10):2677–2681. Zginacze łokcia: **curl 11,06% vs wiosłowanie 5,16%** |
| Pelland 2026, PMID 41343037 | potwierdzone | Sports Med 2026;56(2):481–505. 67 badań, 2058 uczestników |
| ACSM 2026 Position Stand | potwierdzone | Currier, D'Souza, … Phillips. MSSE 2026;58(4):851–872, PMID 41843416. Pierwsza aktualizacja od 2009 r. |

### Nieścisłości w interpretacji

1. **Gentil 2013 i Mannarino 2021 stoją po przeciwnych stronach.** Gentil: dodanie izolacji nic
   nie wnosi. Mannarino: izolacja daje **dwukrotnie większy** przyrost zginaczy łokcia niż ruch
   wielostawowy. Audyt cytuje oba na jednej liście źródeł, a etykieta „curl vs row" ukrywa
   kierunek efektu. Prawdziwy obraz jest warunkowy: u nietrenujących, w krótkim okresie i przy
   pomiarach globalnych — bez różnicy; dla konkretnej małej grupy mierzonej bezpośrednio —
   izolacja wygrywa. **To nie jest akademickie:** flagowy plan v2.1 dawał 3 serie bezpośrednie
   na ramię tygodniowo, czyli projekt dokładnie sprzeczny z Mannarino, przy jednoczesnym
   cytowaniu tej pracy.
2. **Pelland 2026 użyty odwrotnie do własnego wniosku.** Audyt powołuje się na malejące zwroty,
   żeby uzasadnić sufity objętości. Praca pokazuje, że malejące zwroty są **wyraźnie silniejsze
   dla siły niż dla hipertrofii**, a dla hipertrofii krzywa wciąż rośnie. Dla planu sylwetkowego
   to argument przeciw sufitowi, nie za nim.
3. **Nadinterpretacja ACSM w sprawie RIR.** Position stand stwierdza, że trening do chwilowego
   zmęczenia mięśniowego **nie wpływał konsekwentnie na wyniki**. To zdanie negatywne. Nie ma
   tam rekomendacji „zatrzymaj się na 2–3 RIR" — taka wersja krąży w streszczeniach wtórnych.
4. **Currier 2023 i ACSM 2026 to nie są niezależne dowody.** Currier jest pierwszym autorem
   obu, Phillips ostatnim autorem obu, a position stand jest overview of reviews obejmującym
   m.in. metaanalizę z pozycji pierwszej. Cytowanie ich jako dwóch potwierdzeń to podwójne
   liczenie tego samego zespołu.
5. **Zalecenie kolejności ćwiczeń jest węższe, niż sugeruje audyt.** ACSM wiąże „kluczowe boje
   na początku sesji" z **siłą**, nie z hipertrofią.
6. **Gentil 2013 bez zastrzeżenia o populacji.** Osoby nietrenujące, 10 tygodni — najsłabsza
   metodologicznie pozycja listy, a bywa używana do twierdzeń o programowaniu zaawansowanych.
7. Drobiazg formalny: Refalo podany jako PMC, reszta jako PMID.

## 2. Główny problem programowania: zła jednostka objętości

ACSM 2026 podaje dla hipertrofii próg **≥ 10 serii na mięsień tygodniowo** i **≥ 2 sesje
tygodniowo** na każdą dużą grupę. v2.1 księguje objętość **na sesję** („beginner 12–17,
intermediate 15–20, advanced 18–20 serii") i **nigdzie w całym dokumencie nie liczy serii na
mięsień na tydzień**. To nie jest ta sama wielkość i nie przelicza się jedna na drugą bez
znajomości częstotliwości.

Skutek policzony na naszej bibliotece, metodą frakcyjną zgodną z Pelland 2026
(seria bezpośrednia 1,0 + pośrednia 0,5), przy minimalnej deklarowanej częstotliwości:

| Program | dni/tydz. | mięśni ≥ 10 serii |
|---|---:|---|
| `advanced-gym-ppl6` | 6 | **10/10** |
| `advanced-home-upper-lower4` | 4 | 9/10 |
| `intermediate-gym-upper-lower4` | 4 | 8/10 |
| `intermediate-home-upper-lower4` | 4 | 8/10 |
| `intermediate-bodyweight-fbw3` | 3 | 7/10 |
| `advanced-bodyweight-upper-lower4` | 3 | 5/10 |
| `intermediate-gym-fbw2` | 2 | 2/10 |
| `lower-body-gym3` · `lower-body-home3` · `intermediate-home-fbw2` | 2 | 1/10 |
| cztery plany `beginner-*` | 2 | 0/10 |

Wniosek nie brzmi „plany dwudniowe są źle napisane". Brzmi: **przy dwóch dniach w tygodniu próg
hipertroficzny ACSM jest matematycznie nieosiągalny** — wymagałby ponad 40 serii na sesję. To
ograniczenie kalendarza, nie doboru ćwiczeń, i żadna korekta recepty tego nie zmieni.

Znaczenie dla produktu jest za to konkretne: plan dwudniowy nie powinien być sprzedawany tą samą
obietnicą sylwetkową co czterodniowy, a najtańszą realną poprawą dla użytkownika jest **trzeci
dzień**, nie dokładanie serii do istniejących dwóch. To już zapisaliśmy dla flagowca w **D-45**.

### Adopcja v2.1 pogorszyłaby te liczby, nie poprawiła

Biblioteka v2.1 ma łącznie **801 serii wobec 904 w naszym seedzie** (−11%). Największa różnica:
`advanced-gym-ppl6` **126 → 90 serii (−29%)** — a to jedyny nasz plan spełniający próg ACSM dla
wszystkich dziesięciu grup. Konwersja tego planu na v2.1 najprawdopodobniej zrzuci część mięśni
poniżej progu. Do policzenia, gdy ta paczka wejdzie; mapowanie nazw dla niego jest na razie
maszynowe.

## 3. Co v2.1 robi dobrze

Ta część jest mocna i to ona uzasadnia adopcję:

- **Kontrakt recepty.** RIR, przerwa, zakres, zamiennik, wersja minimum, kryteria wejścia,
  reguła progresji i guardy — na każdy slot. Nasz seed nie miał tego przed PLAN-C1.
- **Upadek mięśniowy nieobowiązkowy.** Zgodne z Refalo 2023 (ES 0,12, p = 0,343) i z ACSM.
- **Deload na podstawie danych, nie kalendarza.** Brak mocnych dowodów na obowiązkowy deload
  kalendarzowy; reguła „dwie słabsze ekspozycje uruchamiają review" jest lepsza niż sztywny cykl.
- **Serie rozgrzewkowe nie liczą się jako robocze.** Podstawowa higiena, której brakuje wielu
  publikowanym planom.
- **Prawda sprzętowa i regresje.** „Masa ciała ≠ zero sprzętu", zakaz wiosłowania na drzwiach,
  drabinki wejścia do ruchów technicznych — to realnie podnosi bezpieczeństwo.
- **Zamiana ćwiczenia nie przenosi ciężaru ani e1RM.** Trafna reguła danych, nie tylko treningu.

## 4. Czego v2.1 nie robi, a deklaruje

- **Brak zamienników w trzech planach kalistenicznych** — szósta kolumna zawiera tam wskazówki
  progresji, nie nazwy ćwiczeń, mimo deklaracji „swap na każdy slot".
- **Łamie własne kryterium kolejności** — HSPU i jump squat po zmęczeniu w P11 i P12, wbrew
  własnemu powołaniu na ACSM. Nie adoptowaliśmy tego (D-42).
- **Ocenia plany, których nie widziała w obecnej wersji** — `intermediate-gym-fbw2` i
  `intermediate-home-fbw2` dostały w scorecardzie „brak" jako ocenę v1, choć są na produkcji
  z `content_version` 3. Audyt czytał `docs/trainings/`, nie seed.
- **Zero łydek w całej bibliotece** — a ocena starego planu Daniela wytykała dokładnie to samo.
- **Precyzja ocen 0,1 punktu** przy 15 planach sugeruje rozdzielczość, której metoda nie ma.
  Audyt sam to zastrzega, ale i tak buduje na tym ranking.

## 5. Werdykt

**Adoptować dalej, ale jako kontrakt recepty, nie jako źródło objętości.**

Konkretnie, dla kolejnych paczek:

1. Każda konwersja przechodzi przez `npm run audit:muscle-coverage` przed i po (**D-46**), z
   liczeniem frakcyjnym, i porównanie ląduje w opisie PR-a.
2. Gdy v2.1 obniża objętość poniżej obecnej — to jest decyzja do zapisania, nie automat.
   Domyślnie **zostawiamy naszą objętość**, bo jest bliżej ACSM 2026.
3. Progi „12–17 / 15–20 / 18–20 serii na sesję" z v2.1 traktujemy jako guard długości sesji,
   nie jako cel treningowy. Celem jest objętość tygodniowa na mięsień.
4. Plany dwudniowe dostają uczciwy opis oczekiwań i wyraźną ścieżkę do trzeciego dnia.
5. Przy `advanced-gym-ppl6` konwersja wymaga osobnej decyzji — to jedyny plan spełniający dziś
   próg ACSM w komplecie, a v2.1 tnie mu 29% objętości.
