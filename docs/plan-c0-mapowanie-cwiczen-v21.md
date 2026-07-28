# PLAN-C0 — mapowanie biblioteki v2.1 na katalog ćwiczeń

**Data:** 2026-07-28
**Status:** fundament wykonany; mapa flagowca zatwierdzona, reszta biblioteki ma propozycje maszynowe
**Artefakt danych:** `scripts/data/v21-exercise-map.json`
**Źródło treści:** `training_programs_v2/` (biblioteka v2.1 + `Audyt_programow_treningowych_Arco_v2.1.pdf`)
**Katalog docelowy:** `scripts/data/exercises.json` (907 rekordów, 766 widocznych)

## 1. Po co to jest

Biblioteka v2.1 jest Markdownem z nazwami wyświetlanymi, a nasz kontrakt wymaga stabilnego
`exercise_id` na slot i na alternatywę. Bez tej mapy żadna paczka treści nie ruszy, a P0 z audytu
v2.1 („tekst w UI nie jest kluczem danych") pozostaje niespełniony. PLAN-C0 nie zmienia recept ani
bazy — produkuje wyłącznie mapę i listę braków.

## 2. Skala

| Wielkość | v2.1 | Produkcja dziś |
|---|---:|---:|
| Programy | 15 | 15 |
| Dni | 48 | 47 |
| Sloty | 297 | 328 |
| Serie robocze | 801 | — |
| Unikalne nazwy w slotach | 149 | — |
| Unikalne nazwy w kolumnie zamienników | 108 | — |

## 3. Metoda i statusy

Dopasowanie liczone tokenowo (F1) osobno względem nazwy angielskiej, `id`, `name_pl` i każdego
aliasu, z wynikiem = najlepsze z pól. Ukryte ćwiczenia (`stretching`, `cardio`, lista
przestarzałych) wykluczone tak jak w `deriveHidden`. Wynik maszynowy jest propozycją, nie decyzją.

| Status | Znaczenie | Liczba |
|---|---|---:|
| `verified` | sprawdzone ręcznie | 29 |
| `proposed` | kandydat ≥ 0,75, do potwierdzenia w paczce programu | 113 |
| `review` | 0,5–0,75 albo slot złożony — wymaga decyzji człowieka | 65 |
| `missing` | brak wykonalnego odpowiednika w katalogu | 8 |
| **razem** | | **215** |

## 4. Flagowiec `intermediate-gym-fbw2` — mapa zatwierdzona

### Trening A

| # | Nazwa v2.1 | `default_exercise_id` | Alternatywy |
|---|---|---|---|
| 1 | Przysiad ze sztangą / Smith squat | `Barbell_Squat` | `Smith_Machine_Squat`, `Hack_Squat`, `Leg_Press` |
| 2 | Wyciskanie na ławce 30° | `Barbell_Incline_Bench_Press_-_Medium_Grip` | `Incline_Dumbbell_Press`, `Leverage_Incline_Chest_Press` |
| 3 | Ściąganie drążka / podciąganie | `Wide-Grip_Lat_Pulldown` | `Pullups`, `Band_Assisted_Pull-Up`, `V-Bar_Pulldown` |
| 4 | Unoszenie ramion bokiem | `Side_Lateral_Raise` | `Cable_Seated_Lateral_Raise` |
| 5 | Uginanie hantli na ławce skośnej | `Incline_Dumbbell_Curl` | `Standing_Biceps_Cable_Curl`, `Bayesian_Cable_Curl` |
| 6 | Odwrotne spięcia brzucha na podłodze | `Reverse_Crunch` | `Dead_Bug` |

### Trening B

| # | Nazwa v2.1 | `default_exercise_id` | Alternatywy |
|---|---|---|---|
| 1 | Martwy ciąg rumuński | `Romanian_Deadlift` | `Hyperextensions_Back_Extensions`, *(trap-bar RDL — patrz D-1)* |
| 2 | Wyciskanie na ławce płaskiej | `Barbell_Bench_Press_-_Medium_Grip` | `Dumbbell_Bench_Press`, `Leverage_Chest_Press` |
| 3 | Wiosłowanie z podparciem klatki | `Chest-Supported_Dumbbell_Row` | `Seated_Cable_Rows`, `One-Arm_Dumbbell_Row` |
| 4 | Wyciskanie Arnolda | `Arnold_Dumbbell_Press` | `Machine_Shoulder_Military_Press` |
| 5 | Prostowanie ramion na wyciągu | `Triceps_Pushdown` | `Overhead_Cable_Triceps_Extension` |
| 6 | Unoszenie kolan w zwisie | `Hanging_Knee_Raise` | `Dead_Bug` |

Moduł opcjonalny: `Seated_Leg_Curl` (po A), `Bulgarian_Split_Squat` (po B).

Uwagi implementacyjne: kąt 30° jest notą recepty, nie osobnym ćwiczeniem — katalog ma jeden
wariant skosu ze sztangą. Przerwa `2:30–3:00` przy RDL musi zejść do jednej liczby sekund,
bo `rest_seconds` jest liczbą całkowitą.

## 5. Braki w katalogu

### Ćwiczenia do dodania

| Ruch | Użycie | Uwaga |
|---|---|---|
| ~~Sliding / slider leg curl~~ | 5 programów | **Nie brakuje.** Katalog ma `Platform_Hamstring_Slides` (2 zdjęcia, widoczne) — ten sam ruch pod inną nazwą, już używany jako alternatywa Nordica w TRAIN-02A4. Mapować, nie dodawać. |
| Hamstring walkout | 4 programy | Jedyny realny brak. Do rozstrzygnięcia w paczce domowej: nowy rekord czy mapowanie na `Platform_Hamstring_Slides`. |
| ~~Trap-bar RDL~~ | 1 program | **D-1: zamiennik usunięty z recepty.** Jedno użycie, inny profil ryzyka niż klasyczny RDL; nowy rekord nieuzasadniony. |

Wniosek metodyczny: przed dodaniem ćwiczenia szukaj po ruchu, nie po nazwie z biblioteki.
Trzy z czterech „braków” rozpłynęły się przy sprawdzeniu katalogu.

### Braki metadanych w istniejących rekordach

- Brak `name_pl`: `Reverse_Crunch`, `V-Bar_Pulldown`, `Bayesian_Cable_Curl`, `Cable_Pull-Through`,
  `Trap_Bar_Deadlift` — wszystkie trafiają do slotów, więc pokażą się po angielsku.
- `equipment: "other"` przy `Band_Assisted_Pull-Up`, `Hyperextensions_Back_Extensions`,
  `Trap_Bar_Deadlift` — nigdy nie dadzą badge'a pełnej zgodności sprzętowej (TRAIN-05).
- Duplikat semantyczny `Cable_Pull-Through` vs `Pull_Through` — do deduplikacji.

## 6. Znaleziska o samej bibliotece v2.1

1. **Kolumna zamienników nie ma jednolitej semantyki.** W 12 plikach to `Swap` (nazwa ćwiczenia),
   ale w trzech kalistenicznych — `advanced-bodyweight-upper-lower4`,
   `intermediate-bodyweight-fbw3`, `beginner-bodyweight-fbw3` — to `Progresja`/`Regresja`, czyli
   wskazówka tekstowa („Mniej asysty", „Plecak", „Pauza"). **Te trzy plany nie mają zdefiniowanych
   zamienników w ogóle** (44 unikalne wskazówki zamiast nich), mimo że audyt deklaruje swap na każdy
   slot. Alternatywy dla kalisteniki trzeba dopisać od zera.
2. **25 slotów złożonych** typu „Trap-bar / conventional deadlift" w jednej komórce — przy modelu
   jeden slot = jeden `default_exercise_id` wymagają rozbicia na podstawę + alternatywę.
3. **5 superserii w jednej komórce** („Superseria: curl + pushdown") — nasz model to `superset_group`
   na dwóch slotach, a walidator TRAIN-07 wymaga ≥ 2 elementów w grupie.
4. **Mieszanka językowa:** 3 pliki mają nazwy po polsku, 12 po angielsku.
5. **Trzy regresje bezpieczeństwa** względem stanu wdrożonego na produkcji patchem TRAIN-01
   (`20260721223000`): P11 Upper B przesuwa HSPU z pozycji 1 na 4, P12 Upper A z 1 na 3,
   P12 Lower A przesuwa Jump Squat z 1 na 2. Sprzeczne z kryterium „power/skill przed zmęczeniem",
   które sam audyt v2.1 deklaruje, i wywala planowany walidator TRAIN-07. **Nie adoptujemy tych
   trzech zmian** — kolejność zostaje jak na produkcji.

## 7. Decyzje — rozstrzygnięte 2026-07-28

- **D-1 — trap-bar RDL:** usunięty z recepty, bez nowego rekordu.
- **D-2 — braki katalogu:** sliding leg curl okazał się `Platform_Hamstring_Slides`; zostaje
  wyłącznie hamstring walkout, do paczki domowej.
- **D-3 — kanon:** v2.1 źródłem prawdy, stary audyt superseded z trzema wyjątkami kolejności.
  Zapisane jako **D-42** w `decyzje-produktowe.md` (plus D-43 i D-44 dla alternatyw i slotów).
- **D-4 — usuwanie slotów:** zgoda. Zmierzone lokalnie na realnej historii: powiązania
  `session_exercises.slot_id` 14 → 12, wszystkie 51 serii i 16 pozycji ćwiczeń zachowane.

## 8. Znalezione przy wdrożeniu PLAN-C1

- **Seed nie potrafił zapisać dwóch alternatyw na jeden slot.** `scripts/seed.ts` wpisywał
  `position: 0` każdej alternatywie, a tabela ma `unique(program_day_slot_id, position)`.
  Błąd był uśpiony, bo 29 alternatyw z TRAIN-02A4 to przypadkiem jedna na slot. Naprawione:
  pozycja rośnie w obrębie slotu, kolejność wynika z kolejności wpisów w repo.
- **Seed jest sprzężony z migracją przez `SAFE SEED STOP`.** Przy skróceniu dnia z 7 do 6 pozycji
  seed odmawia pracy, dopóki migracja nie usunie nadmiarowego slotu. To działa jak zamierzono
  i wymusza świadomą decyzję — warto o tym pamiętać przy każdej kolejnej paczce.
- **Dwa sloty flagowca mają placeholder zdjęcia:** `Chest-Supported_Dumbbell_Row` i
  `Hanging_Knee_Raise`. Walidator to przepuszcza jako ostrzeżenie, ale audyt v2.1 stawia
  „przegląd trenerski bazy ćwiczeń" jako P0 przed testami. Do CONTENT przed betą tego planu.

## 9. Co dalej

1. **PLAN-C2** — braki mediów flagowca (2 placeholdery) plus `name_pl` dla
   `V-Bar_Pulldown`, `Bayesian_Cable_Curl`, `Cable_Pull-Through`, `Trap_Bar_Deadlift`
   i deduplikacja `Cable_Pull-Through` vs `Pull_Through`.
2. Kolejne paczki per program; przy każdej potwierdzić wiersze `proposed`/`review` z mapy.
3. Alternatywy dla trzech planów kalistenicznych trzeba napisać od zera (§6.1).
