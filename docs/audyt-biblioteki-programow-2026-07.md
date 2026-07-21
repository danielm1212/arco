# Audyt i zatwierdzenie 15 programów Arco

**Data:** 2026-07-21  
**Recenzent programowy:** Codex, rola S&C zgodna z briefem właściciela  
**Zakres zatwierdzenia:** recepta treningowa dla zdrowych dorosłych; nie diagnoza, rehabilitacja
ani indywidualne przeciwwskazania  
**Źródło danych:** `scripts/seed.ts`, 15 programów, 48 dni, 308 slotów, 942 serie  
**Status:** docelowe recepty zatwierdzone do wdrożenia po wykonaniu korekt z tego dokumentu

## 1. Executive summary

Biblioteka ma dobry szkielet: czytelny grid poziom × środowisko, sensowne częstotliwości,
przewagę ćwiczeń wielostawowych i zachowawczy RIR dla początkujących. Obecny seed nie jest
jednak gotowy do publikacyjnego „10/10”: 11 z 15 programów wymaga korekty, a cztery mogą zostać
bez zmian samej recepty. Najpoważniejsze problemy to zbyt trudny P07 bez działających regresji,
ćwiczenia techniczne/mocy wykonywane po zmęczeniu w P11/P12, nadmiar objętości P11–P13 oraz
brak hinge/hamstrings w P14. Wspólną luką wszystkich planów są cele czasowe zapisane tylko
w notatkach i zbiorcze metadane sprzętu, które nie dowodzą wykonalności konkretnego ćwiczenia;
walidator wskazuje też 16 ćwiczeń-placeholderów użytych w 49 slotach, co trafia do Q1 Content.
Pierwszy patch powinien naprawić P11/P12/P14, następnie P07/P08/P13, a potem domknąć mniejsze
korekty i dane strukturalne. Po wdrożeniu dokładnie opisanych zmian zatwierdzam komplet 15/15
do H2 bez dodatkowego review zewnętrznego trenera.

## 2. Kryteria i siła dowodów

- **[MOCNE] Kolejność:** priorytetowe, ciężkie i wielostawowe ruchy wykonujemy przed izolacją
  i zmęczeniem. Aktualne stanowisko ACSM wskazuje również korzyść wykonywania pracy siłowej
  na początku sesji. Źródła: [ACSM 2026](https://pubmed.ncbi.nlm.nih.gov/41843416/),
  [ACSM 2002](https://pubmed.ncbi.nlm.nih.gov/11828249/).
- **[MOCNE] Objętość:** większa liczba serii może pomagać, ale zwrot maleje; nie każda dodatkowa
  seria jest warta kosztu zmęczenia. Liczymy zestawy bezpośrednie i pośrednie, nie tylko nazwy
  ćwiczeń. Źródło: [Pelland i in. 2026](https://pubmed.ncbi.nlm.nih.gov/41343037/).
- **[MOCNE] Moc:** ruch dynamiczny ma niski lub umiarkowany wolumen i pełną jakość; Jump Squat
  `4×8–15` po Split Squat nie spełnia tego celu. ACSM 2026 wskazuje dla mocy szybkie wykonanie
  i niski–umiarkowany wolumen.
- **[UMIARKOWANE] Zakres sesji:** dla Arco przyjmujemy zwykle 14–20 serii dla początkującego,
  16–22 dla intermediate/advanced i przekroczenie tylko z jawnym powodem. To guard produktowy,
  nie uniwersalna granica biologiczna.
- **[UMIARKOWANE] RIR:** beginner 2–3, intermediate/advanced zwykle 1–2; brak obowiązku upadku.
- **[KONWENCJA] Czas:** estymacja audytowa = około 40 s pracy/serię + podana przerwa między
  seriami + około 60 s przejścia na ćwiczenie. UI dopuszcza ±20% względem deklaracji.

## 3. Ocena obecnego seeda

| ID | Program | Ocena | Główny problem | Priorytet | Werdykt recepty |
|---|---|---:|---|---|---|
| P01 | Beginner Gym FBW2 | 4/5 | Tylna taśma tylko w A | P1 | po małym patchu |
| P02 | Beginner Gym FBW3 | 3,5/5 | Brak hinge w A/C | P1 | po patchu |
| P03 | Beginner Home FBW2 | 4,5/5 | Sprzęt i swapy są tylko w notatkach | P1 | zatwierdzona |
| P04 | Beginner Home FBW3 | 4/5 | Sprzęt/alternatywy nie są strukturalne | P1 | zatwierdzona |
| P05 | Lower Body Gym3 | 4/5 | Brak bezpośredniej pracy core | P2 | po małym patchu |
| P06 | Lower Body Home3 | 4,5/5 | Tylko dane timed/sprzętowe | P1 | zatwierdzona |
| P07 | Beginner Bodyweight FBW3 | 2,5/5 | Za trudny start bez realnych regresji | P0 | po dużym patchu |
| P08 | Intermediate Bodyweight FBW3 | 3/5 | Dzień C: 24 serie i duplikacja push/pull | P1 | po patchu |
| P09 | Intermediate Gym U/L4 | 4/5 | Upper A: 23 serie, krótkie ciężkie przerwy | P1 | po małym patchu |
| P10 | Intermediate Home U/L4 | 3,5/5 | Nadmiar hamstrings i ukryte wymagania sprzętu | P1 | po patchu |
| P11 | Advanced Home U/L4 | 2,5/5 | HSPU po 12 seriach; dni po 25–27 serii | P0 | po dużym patchu |
| P12 | Advanced Bodyweight U/L4 | 2,5/5 | HSPU/jump po zmęczeniu; dolne dni po 23–25 serii | P0 | po dużym patchu |
| P13 | Advanced Gym PPL6 | 2,5/5 | Nadmiar barków/ramion, kumulacja fatigue, fałszywa superseria | P0 | po dużym patchu |
| P14 | Intermediate Gym FBW2 | 2/5 | Zero hinge i hamstrings-primary | P0 | po dużym patchu |
| P15 | Intermediate Home FBW2 | 4,5/5 | Kettlebell/ławka bez prawdy sprzętowej | P1 | zatwierdzona |

„Zatwierdzona” oznacza brak wymaganej zmiany ćwiczeń/serii. Nadal obowiązuje wspólne domknięcie
sekund, sprzętu i alternatyw w PLAN-Q.

## 4. Zatwierdzone korekty per program

### P01 — Beginner Gym FBW2

- W B dodać `Lying Leg Curl 2×10–15` po wykrokach; łydki zmniejszyć z 3 do 2 serii.
- Resztę zostawić. Dwa dni pozostają proste, zbalansowane i wykonalne dla początkującego.

### P02 — Beginner Gym FBW3

- A: `Seated Dumbbell Press 2×8–12` zastąpić `Cable Pull-Through 2×10–15` po lat pulldown.
- C: łydki zastąpić `Romanian Deadlift 2×8–10`, wykonanym po Front Squat.
- RIR 2–3; progres ciężaru dopiero po pełnym zakresie wszystkich serii.

### P03 — Beginner Home FBW2

- Receptę zostawić.
- Bench Press → Floor Press i Band Lat Pulldown → Dumbbell Pullover zapisać jako jawne
  alternatywy, nie notatki. Ławka i guma nie mogą być ukrytym wymaganiem.

### P04 — Beginner Home FBW3

- Receptę zostawić.
- Zapisać alternatywy bez ławki i bez gumy/drążka. Dzień B nie wymaga dokładania kolejnego
  ruchu pull, ponieważ pełna rotacja A/B/C zachowuje wystarczający balans.

### P05 — Lower Body Gym3

- W dniu „Góra + pośladki” dodać `Pallof Press 2×10–12/strona`, przerwa 45–60 s, na końcu.
- Resztę zostawić. Hip Thrust przed Squat jest uzasadniony jawnym priorytetem pośladków.

### P06 — Lower Body Home3

- Receptę zostawić.
- Ławka dla Hip Thrust/Bench Press ma alternatywy Glute Bridge/Floor Press; zapisać je
  strukturalnie. Dead Bug zapewnia wystarczającą pracę core dla tego celu.

### P07 — Beginner Bodyweight FBW3

- Każdy trudny ruch otrzymuje obowiązkową drabinkę startową:
  Pull/Chin-Up → podciąganie z podparciem lub ekscentryczne → pełne;
  Push-Up → incline → floor → decline;
  Pike Push-Up → wysoki incline pike → pike;
  Inverted Row → bardziej pionowy kąt → niższa podpora;
  Hanging Knee Raise → Dead Bug/Lying Knee Raise → wisząca wersja;
  Split Squat → wersja z podporą → bez podpory.
- Domyślny wariant na karcie początkującego musi być najłatwiejszą wykonalną wersją, nie
  Pull-Up/Chin-Up bez kwalifikacji.
- Objętość zostawić; problemem jest próg wejścia, nie liczba serii.

### P08 — Intermediate Bodyweight FBW3

- Dzień C zmniejszyć z 24 do 18 serii:
  Lunge/Chin-Up/Feet-Elevated Push-Up/Glute Bridge po 3 serie,
  Pike Push-Up/Scapular Pull-Up/Copenhagen po 2 serie.
- Dla Dips i Nordic zachować łatwiejsze warianty; nie obniża to poziomu programu.

### P09 — Intermediate Gym Upper/Lower4

- Upper A: lateral raise, triceps pushdown i curl zmniejszyć z 3 do 2 serii; razem 20.
- Bench i ciężki row: przerwa 180 s w dolnym końcu zakresu; pozostałe compound 120–150 s.
- Pozostałe dni zostawić. Upper B został już rozsądnie ścięty do 20 serii.

### P10 — Intermediate Home Upper/Lower4

- Upper A: lateral raise, triceps i biceps po 2 zamiast 3 serii; razem 20.
- Lower A: Nordic 2 zamiast 3 serii; jawna regresja `Sliding Leg Curl`.
- Lower B: Natural GHR 2 zamiast 3 serii; `Sliding Leg Curl` jako łatwiejsza wersja.
- Jeżeli `Sliding Leg Curl` nie istnieje w katalogu, dodać go jako wersjonowane ćwiczenie
  z ręcznikiem/sliderami na gładkiej podłodze, instrukcją i dwoma statycznymi kadrami.
- Ławka, drążek, podwyższenie i kotwica Nordic muszą wejść do prawdy sprzętowej.

### P11 — Advanced Home Upper/Lower4

- Upper A: lateral raise, triceps i biceps po 2 serie; razem 21.
- Upper B: HSPU `3×4–10` jako pierwsze; Incline Press/Row/Chin-Up po 3; Reverse Fly,
  Triceps i Curl po 2; usunąć Close-Grip Push-Up. Razem 18 zamiast 27.
- Lower B: Step-Up/RDL/Hip Thrust po 3; Reverse Nordic/Natural GHR po 2; Calf 3;
  Copenhagen 2. Razem 18 zamiast 25.
- Lower A zostawić. Wszystkie ruchy z kotwicą/podporą dostają alternatywę sprzętową.

### P12 — Advanced Bodyweight Upper/Lower4

- Upper A: HSPU pierwsze, następnie Pull-Up, One-Arm Push-Up, Inverted Row, Dips, L-Sit.
- Lower A: Jump Squat pierwsze, `3×3–5`, przerwa 120–150 s; nie wykonywać serii do spadku
  wysokości/skrócenia lądowania.
- Upper B: Scapular Pull-Up, Body Tricep Press i Hanging Leg Raise po 2 serie; razem 21.
- Lower B: Lunge/Step-Up/Reverse Nordic/Glute Bridge po 3, Natural GHR 3, Tibialis/Hollow po 2;
  razem 19.
- Stabilne podpory, niski drążek i kotwica hamstring są wymaganiami, nie `body only`.

### P13 — Advanced Gym PPL6

- Rytm: `Push A → Pull A → odpoczynek → Legs A → Push B → Pull B → Legs B`, potem odpoczynek.
  Dzięki temu Deadlift nie stoi bezpośrednio przed Squat/RDL bez regeneracji.
- Push A: Bench 4; OHP/Incline/Lateral po 3; oba tricepsy po 2. Razem 17.
- Pull A: Deadlift 3, Pull-Up 4, Row 3, Chest-Supported Row/Face Pull/Curl/Curl po 2. Razem 17.
- Legs A: Squat 4, RDL 2, Leg Press 3, Leg Curl 2, Standing Calf 3, Ab Wheel 3; usunąć
  drugi calf. Razem 17.
- Push B: Incline 4; Shoulder/Chest/Lateral/Triceps po 3. Razem 16. Usunąć osieroconą notatkę
  `superset`.
- Pull B: Pull-Up/Row/Pulldown/Reverse Fly po 3; oba curls po 2. Razem 16.
- Legs B: Front Squat 4; Bulgarian/Extension/Curl/Hip Thrust/Calf/Core po 3. Razem 22.
- Deload nie jest automatycznym kalendarzem; po 6–8 tygodniach aplikacja może zasugerować
  lżejszy tydzień, ale decyzja zależy od trendu wykonania i samopoczucia.
- Zaktualizować zakres czasu programu z 55–75 na 40–60 minut; dłuższa sesja nie jest celem.

### P14 — Intermediate Gym FBW2

- A: Barbell Curl zastąpić `Romanian Deadlift 3×6–10`; kolejność Squat → Bench → RDL → Row
  → OHP → Skullcrusher → Plank.
- B: Hammer Curl zastąpić `Lying Leg Curl 3×10–15`; resztę zostawić.
- Pull-Up otrzymuje jawny zakres/regresję zamiast nieustrukturyzowanego „prawie max”.

### P15 — Intermediate Home FBW2

- Receptę zostawić.
- Kettlebell One-Leg Deadlift ma Dumbbell Single-Leg RDL jako równoważny wariant; ławka/
  podwyższenie dla Feet-Elevated Push-Up jest jawne. Ćwiczenia timed dostają sekundy.

## 5. Zatwierdzone zakresy czasu dni

Zakres obejmuje serie robocze, typowe przejścia i 5–8 minut przygotowania/ramp sets. Opcjonalny
ekran rozgrzewki SESSION-01 nie jest doliczany drugi raz.

| Program | Zatwierdzone czasy dni po korektach |
|---|---|
| P01 | A 45–55 · B 45–55 min |
| P02 | A/B/C po 40–50 min |
| P03 | A/B po 40–50 min |
| P04 | A/B/C po 40–50 min |
| P05 | A 45–55 · góra+pośladki 40–50 · B 40–50 min |
| P06 | A 40–50 · góra+pośladki 35–45 · B 40–50 min |
| P07 | A/B/C po 35–45 min |
| P08 | A/B 45–55 · C 40–50 min |
| P09 | Upper A 55–65 · Lower A 50–60 · Upper B 45–55 · Lower B 50–60 min |
| P10 | Upper A 50–60 · Lower A 50–60 · Upper B 45–55 · Lower B 50–60 min |
| P11 | Upper A 55–65 · Lower A 50–60 · Upper B/Lower B 45–55 min |
| P12 | Upper A 55–65 · pozostałe dni 45–55 min |
| P13 | Push/Pull/Legs A 45–55 · Push/Pull B 40–50 · Legs B 50–60 min |
| P14 | A 50–60 · B 45–55 min |
| P15 | A/B po 40–50 min |

## 6. Wspólne warunki zatwierdzenia 15/15

1. Każdy timed slot ma `target_duration_min_seconds` i `target_duration_max_seconds`.
2. Beginner technical slot ma łatwiejszy wariant możliwy do pokazania jednym tapnięciem.
3. Sprzęt podstawowego ćwiczenia lub alternatywy pokrywa każdy obowiązkowy slot.
4. Power/skill jest przed fatigue; Jump Squat ma maksymalnie 15 jakościowych powtórzeń w sesji.
5. `superset_group` ma co najmniej dwa elementy albo nie istnieje.
6. Czas wyliczony z serii/przerw mieści się w deklaracji ±20%.
7. RIR pozostaje wskazówką recepty i nie jest obowiązkowym polem loggera.
8. Ból, zawroty głowy lub utrata kontroli ruchu kończą serię; aplikacja nie diagnozuje przyczyny.
9. Walidator, seed, aktywne plany, otwarte sesje i historia przechodzą TRAIN-07.

## 7. Formalny werdykt

Zatwierdzam do implementacji docelowe recepty P01–P15 opisane w sekcji 4. Po wdrożeniu korekt
i przejściu wspólnych warunków z sekcji 6 status wynosi **15/15 approved** i zewnętrzny trener
nie jest bramką Q1, PLAN-Q ani H2. Obecny seed przed zmianami nie może być oznaczony jako
15/15 approved.

Zatwierdzenie dotyczy programowania dla zdrowych dorosłych. Osobna kontrola zgodności obrazu,
nazwy i instrukcji ćwiczenia pozostaje w CONTENT-01–03 i może być wykonana przez Codex na
podstawie dowodu wizualnego; konsultacja zewnętrznego trenera może wrócić po monetyzacji jako
audyt jakości, nie blokada obecnego wdrożenia.
