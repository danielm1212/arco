# Audyt programów FBW — analiza z danych (Sprint 6, część [Claude])

> Data: 2026-06-30. Materiał wejściowy do Twojej decyzji jako trenera — **programów nie zmieniam sam** (sloty/powt. to Twój call). Liczone z `program_day_slots` + `exercises`, kategoryzacja przez `MUSCLE_CATEGORY` (`lib/guidance.ts`) — to samo mapowanie, którego używa guidance/heatmapa, więc audyt mierzy to, co widzi apka.
>
> Metryka „objętości" = **liczba serii roboczych na partię/tydzień** (set-volume — standard hipertroficzny; tonaż w kg zależy od ciężaru usera, więc nie z programu). Założenie: każdy dzień wykonywany 1×/tydz.

## TL;DR (3 wnioski)
1. **Systematyczny przechył push > pull** we wszystkich FBW (1,43–1,67×). Najmocniej w „domowym" (20 push vs 14 pull/tydz.).
2. **Dziury w pokryciu:** brak bezpośrednich **łydek** w żadnym FBW; **lats** (pion pull) zerowy w „domowym"; **glutes** tylko wtórnie.
3. **Mapowanie partii ma ślepe plamy** (Face Pull, martwy ciąg, ćwiczenia wieloczłonowe) — psuje i ten audyt, i live guidance. Rekomendacja: tabela korekt kategorii per ćwiczenie (patrz §4, ryzyko architektoniczne).

---

## 1. FBW domowy (hantle) — AKTYWNY, 2 dni
Serie robocze/tydzień (A+B):

| Kategoria | Serie/tydz. | Uwagi |
|---|---|---|
| **push** | **20** | chest 8 · shoulders 6 · triceps 6 |
| **pull** | **14** | middle back 8 · biceps 6 · **lats 0** |
| **legs** | **15** | quadriceps 8 · hamstrings 7 · **glutes 0 bezpośrednio · calves 0** |
| **core** | **6** | abdominals 6 |

- **push:pull = 1,43:1** — przechył w stronę push. Oba wiosła to poziom (middle back); **brak pionowego ciągnięcia** (pulldown/podciąganie) → lats nietrenowane.
- **Łydki i pośladki** bez bezpośredniej pracy.
- **Progresja: stałe powtórzenia** (10×10, 8×8, 12×12) — `target_reps_min = max`. Skutek: hint „poniżej zakresu" z guidance **nie ma jak zadziałać** (nie ma zakresu), działa tylko „pełny zakres → +ciężar". Rekomendacja: wprowadzić zakresy (np. 8–12), lepsza autoregulacja + synergia z guidance.

## 2. FBW 2× / tydzień — 2 dni
| Kategoria | Serie/tydz. |
|---|---|
| push | 9 (chest 6 · shoulders 3) |
| pull | 6 (middle back 3 · lats 3) |
| legs | 9 (quadriceps 6 · hamstrings 3) |
| core | 6 |

- **push:pull = 1,5:1.** Pull niski (6 serii: 1 wiosło + 1 podciąganie). Brak bezpośrednich: biceps, triceps, łydki, pośladki.
- **Plus:** ma zakresy powt. (8–12) i pion pull (Pullups) — lepiej niż „domowy".

## 3. FBW 3× / tydzień — 3 dni
| Kategoria | Serie/tydz. (skorygowane*) |
|---|---|
| push | 15 |
| pull | 9 |
| legs | 15 |
| core | 6 |

- **push:pull ≈ 1,67:1** (najmocniejszy przechył; po korekcie Face Pull jako pull — patrz niżej — trochę łagodniej).
- \* **Korekta ręczna:** Barbell Deadlift ma `primary_muscles = "lower back"` → mapuje się na **core**, choć to ruch nóg/hinge. W surowych danych dzień B pokazuje legs=0. Powyżej policzone „po ludzku" (deadlift = legs).
- Brak bezpośrednich łydek; biceps tylko wtórnie (brak curli).

## 4. ⚠️ Ryzyko architektoniczne — ślepe plamy mapowania partii
> Zgłaszam proaktywnie (`proactive-architecture-review`): ten sam problem dotyczy **live guidance (balans/staleness) i heatmapy**, nie tylko audytu.

Kategoryzacja po `primary_muscles` (jedna partia/ćwiczenie) myli się przy:
- **Face Pull / rear delt** → `shoulders` → liczone jako **push**, a to realnie **pull** (tylne aktony). Zaniża pull, zawyża push w audycie i w balansie na home.
- **Barbell Deadlift** → `lower back` → **core**, a to **legs/hinge**.
- **Ćwiczenia wieloczłonowe** (Renegade Row, Dead Bug, Goblet Squat) — liczone po 1 partii, gubią wtórne (np. Goblet nie zalicza pośladków).
- `movement_pattern` **nie jest ratunkiem** — też ma błędy w seedzie (Leg Press = „push", Lying Leg Curl = „pull").

**✅ ZROBIONE (`e3887ee`):** tabela `EXERCISE_CATEGORY_OVERRIDE` w `lib/guidance.ts` (23 wyjątki: 13 rear delt/face pull → pull, 10 deadlift/good morning/rack pull → legs). `categoriesForExercise(id, muscles)` używane przez balans/staleness na home. Zweryfikowane: Face Pull liczony jako pull (flaga odwróciła kierunek w Preview). **Uwaga:** override działa na poziomie kategorii (push/pull/legs/core); heatmapa per-mięsień (`/progress`) zostaje bez zmian (tam „shoulders" jest anatomicznie OK).

---

## 5. Rekomendacje do FBW (do Twojej akceptacji jako trenera)
Kolejność wg wpływu:
1. **Dorównać pull do push** — zwłaszcza w „domowym": dodać pion pull (np. podciąganie/rozpiętki gumą) i/lub 4. serię wioseł; rozważyć Face Pull / rear-delt fly (i tak skoryguje balans).
2. **Dodać łydki** (1–2 ćwiczenia) i **bezpośrednie pośladki** (hip thrust/glute bridge) — dziś zero bezpośrednich w FBW.
3. **„Domowy": zakresy powt. zamiast stałych** (8–12 zamiast 10×10) — autoregulacja + uruchamia pełen guidance.
4. (architektura) wdrożyć korekty kategorii (§4), żeby balans/heatmapa nie kłamały.

## 6. Pozostałe programy (krótko — nie-FBW)
- **PPL / Upper-Lower / StrongLifts**: lepiej zbalansowane push/pull z natury splitu; UL i PPL mają bezpośrednie ramiona/łydki. Te same ślepe plamy mapowania dotyczą ich tak samo (Face Pull, deadlift).
- **Full Body dla początkujących**: minimalny (5 ćwiczeń), świadomie — OK jako wejście.
