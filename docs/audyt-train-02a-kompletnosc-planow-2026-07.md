# TRAIN-02A — audyt brakujących planów i kompletności sesji

**Data:** 2026-07-22  
**Status:** TRAIN-02A1/A2 gotowe technicznie; bez zmian produkcji

**Źródła prawdy:** `scripts/seed.ts`, `audyt-biblioteki-programow-2026-07.md`,
`spec-plan-q-biblioteka-treningow.md` i odczyt produkcji z release'u Q1  
**Cel:** nie opublikować brakujących planów tylko dlatego, że istnieją lokalnie, oraz jawnie
oddzielić pełną receptę siłową od rozgrzewki, zakończenia i krótkiego planu domowego.

## 1. Werdykt

Obecnych 15 presetów nie można jeszcze nazywać kompletnymi planami 10/10. Audyt zatwierdził
docelowe recepty po wdrożeniu korekt, ale:

- produkcja ma 10/15 planów systemowych;
- pięć brakujących planów nie jest gotowych do prostego point syncu;
- aplikacja obsługuje serie oznaczone jako `warmup`, lecz preset nie prowadzi przez rozgrzewkę;
- plan nie zawiera rekomendacji zakończenia/mobilności;
- nie istnieje osobny plan ani bezpieczny wariant treningu domowego 20–30 minut.

TRAIN-02A jest zatem kontrolą i domknięciem pięciu planów przed publikacją, a nie operacyjnym
„dosianiem” wszystkich rekordów z seeda.

## 2. Pięć planów nieobecnych na produkcji

| ID | Slug | Stan lokalny | Co musi wejść przed publikacją |
|---|---|---|---|
| P01 | `beginner-gym-fbw2` | recepta v2 gotowa: 19 serii i ok. 46 min w B | czeka tylko na wspólny release A4 |
| P03 | `beginner-home-fbw2` | recepta bez zmian; 3 alternatywy zmapowane i testowane | zapis relacji oraz prawda ławki/gumy w TRAIN-03/05 |
| P08 | `intermediate-bodyweight-fbw3` | recepta v2 gotowa: dzień C ma 18 serii i ok. 42 min | czeka tylko na wspólny release A4 |
| P11 | `advanced-home-upper-lower4` | TRAIN-01 naprawił Upper B; reszta niepełna | Upper A 21 serii; Lower B 18 serii; alternatywy dla podpór/kotwic; czasy 55–65/50–60/45–55/45–55 |
| P12 | `advanced-bodyweight-upper-lower4` | TRAIN-01 naprawił kolejność Upper A i Jump Squat | Upper B 21 serii; Lower B 19 serii; jawne wymagania podpór, niskiego drążka i kotwicy |

P11/P12 nie mogą zostać uznane za zamknięte tylko dlatego, że pilny TRAIN-01 usunął ich
najpoważniejszy błąd kolejności. Pozostała objętość i prawda sprzętowa należą do tego samego
kontraktu jakości przed ich pierwszą publikacją na produkcji.

## 3. Podział wykonawczy TRAIN-02A

### TRAIN-02A1 — macierz i kontrakt point syncu

- zamrozić listę pięciu slugów oraz stabilne ID wynikające z seeda;
- porównać seed, dokumentację i stan produkcji;
- opisać kontrakt przyszłego point syncu z guardami otwartych sesji, aktywnych planów i kolizji
  slug/ID;
- migracja nie może wykonywać pełnego seeda ani zmieniać planów własnych i historii;
- brak uruchomienia na produkcji przed SEC-03 i zamknięciem A2/A3.

Implementacja: `npm run audit:program-catalog` wykonuje wyłącznie odczyt, porównuje bazę z
`PROGRAMS`, raportuje brakujące/nieznane/zdublowane slugi i rozjazdy `content_version` oraz
zwraca blocker per brakujący plan. Plik SQL point syncu celowo nie powstaje przed A2/A3 i
kontraktem TRAIN-03/05 — obecność w `supabase/migrations` umożliwiałaby przypadkowy release.

### TRAIN-02A2 — P01/P03/P08

- **gotowe technicznie:** korekty recept P01/P08 i mapowanie trzech alternatyw P03;
- relacje P03 korzystają z addytywnego kontraktu TRAIN-03/05; plan pozostaje nieopublikowany
  do czasu gotowego kontraktu;
- regresje potwierdzają kolejność, liczbę serii, czas dnia, istnienie ćwiczeń i jawny kompromis
  niepełnego zamiennika pionowego przyciągania;
- idempotencja, aktywny plan i otwarta sesja należą do przyszłego point syncu A4, nie do
  źródłowej korekty bez SQL.

### TRAIN-02A3 — P11/P12

- wdrożyć wszystkie pozostałe korekty audytu, nie tylko TRAIN-01;
- policzyć serie i czasy każdego dnia po zmianie;
- przygotować mapowanie ścieżek sprzętowych; brak publikacji przed TRAIN-03/05.

### TRAIN-02A4 — release w PLAN-Q

- po TRAIN-03/05 i SEC-03: świeży backup, audyt otwartych sesji i dry-run;
- point sync wyłącznie pięciu zatwierdzonych planów;
- smoke potwierdza 15 programów, stabilne ID, brak zmiany aktywnego planu, sesji i historii;
- rollback treści używa poprzedniego `content_version`, nie kasuje danych użytkownika.

## 4. Minimalna rekomendacja rozgrzewki przed H2

Rozgrzewka ma pomagać przygotować konkretny ruch, a nie być długą listą przypadkowych
ćwiczeń. Meta-analizy wskazują korzyść adekwatnej rozgrzewki dla wykonania, szczególnie dla
dynamicznej pracy zależnej od szybkości; nie uzasadniają jednego identycznego protokołu dla
każdej osoby i każdego planu.

Wprowadzamy `SESSION-01A` jako małą warstwę zaufania po R4A i przed H2:

1. opcjonalne 3–5 minut lekkiego ruchu, zwłaszcza po długim bezruchu;
2. przed pierwszym ciężkim/power/skill ruchem 2–4 narastające serie specyficzne;
3. przed kolejnym nowym ciężkim wzorcem 1–2 krótsze serie wprowadzające;
4. seria rozgrzewkowa nie liczy się do objętości roboczej, progresji ani ukończenia dnia;
5. mobilność tylko wtedy, gdy pomaga osiągnąć wymaganą pozycję; bez obowiązkowego długiego
   statycznego rozciągania przed pracą siłową/mocą;
6. użytkownik może pominąć rekomendację, a start sesji pozostaje szybki.

V1 może być krótkim, kontekstowym blokiem tekstowym i gotowymi seriami `warmup`; nie wymaga
nowego katalogu ćwiczeń rozgrzewkowych ani rozbudowanego kreatora.

## 5. Zakończenie i rozciąganie

Nie obiecujemy, że statyczne rozciąganie po treningu zmniejsza ból mięśni, przyspiesza
regenerację lub zapobiega urazom. Meta-analizy nie pokazują istotnej przewagi nad odpoczynkiem,
a pewność dowodu jest ograniczona.

`SESSION-01A` może po finishu zaoferować opcjonalnie:

- 2–5 minut spokojnego marszu/oddechu i stopniowego uspokojenia;
- jedną lub dwie pozycje mobilności/rozciągania dla komfortu albo osobistego celu zakresu;
- komunikat „opcjonalne — nie wpływa na zaliczenie treningu”.

Nie zapisujemy tego jako obowiązkowych serii programu i nie dokładamy ekranu blokującego
podsumowanie. Interaktywny protokół `SESSION-01B` pozostaje eksperymentem po H2.

## 6. Trening 20–30 minut w domu

Krótki trening domowy może być skutecznym, łatwiejszym do wykonania programem, ale nie jest
„dodatkowym dniem” dopisywanym automatycznie do każdego planu. Dodatkowa sesja zmienia
objętość, regenerację i interpretację progresji.

`PROGRAM-01A` pozostaje osobnym eksperymentem po pierwszym pomiarze obecnych 15 planów:

- docelowo 2–3 sesje FBW po 20–30 minut, a nie bonus ponad aktywny plan;
- minimalny sprzęt: masa ciała i opcjonalnie hantle/guma;
- 4–6 ruchów pokrywających push, pull, knee-dominant, hinge i core przez pełny cykl;
- jawna progresja i alternatywy, ten sam gate TRAIN-07 co pozostałe presety;
- wejście do implementacji dopiero, gdy H2 lub dane ukończeń pokażą problem czasu/dostępu.

Jeżeli potrzeba dotyczy awaryjnego skrócenia bieżącej sesji, właściwym rozwiązaniem jest
`SESSION-02` Minimum/Standard/Plus po zebraniu danych, nie drugi równoległy plan.

## 7. Dowody i granice

- [ACSM 2026 — resistance training position stand](https://pubmed.ncbi.nlm.nih.gov/41843416/):
  regularny trening całego ciała co najmniej dwa razy tygodniowo i wysiłek są ważniejsze od
  rozbudowanych metod; prostszy plan może być skuteczny.
- [Fradkin i in. 2010](https://pubmed.ncbi.nlm.nih.gov/19996770/): adekwatna rozgrzewka
  poprawiała większość analizowanych kryteriów wykonania, przy ograniczonej liczbie mocnych RCT.
- [Wilson i in. 2025](https://pubmed.ncbi.nlm.nih.gov/39864808/): wzrost temperatury mięśnia
  wspiera głównie szybkie/dynamiczne parametry, nie maksymalną siłę; nie ustalono jednej
  najlepszej modalności rozgrzewki.
- [Afonso i in. 2021](https://pubmed.ncbi.nlm.nih.gov/34025459/) i
  [Zhang i in. 2025](https://pubmed.ncbi.nlm.nih.gov/41103301/): rozciąganie po treningu nie
  poprawia istotnie DOMS, siły, wykonania ani regeneracji względem braku rozciągania.
- [Ramos-Campo i in. 2024](https://pubmed.ncbi.nlm.nih.gov/38595233/): split i full-body dają
  podobne wyniki przy wyrównanej objętości, więc krótki plan należy projektować przez dobór
  objętości i częstotliwości, nie przez marketingową etykietę.

Dokument dotyczy zdrowych dorosłych. Ból, zawroty głowy, choroba, uraz lub ograniczenia
medyczne wymagają przerwania serii i indywidualnej konsultacji; Arco nie diagnozuje.

## 8. Definition of Done

- pięć brakujących planów przechodzi pełny audyt, nie tylko migrację liczności, a ich release
  czeka na kontrakt alternatyw TRAIN-03/05;
- SESSION-01A jest opcjonalne, kontekstowe i nie zmienia semantyki ukończenia;
- rozciąganie nie ma nieprawdziwych obietnic regeneracji lub prewencji urazu;
- PROGRAM-01A ma osobną hipotezę i nie zwiększa automatycznie tygodniowej objętości;
- żaden z powyższych zakresów nie dotyka produkcji przed SEC-03, backupem i dry-runem.
