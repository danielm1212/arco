# Audyt bazy ćwiczeń (S8) — wynik skanu + propozycja kuracji

> Data: 2026-07-04. Skan `scripts/data/exercises.json` (873 wpisy z free-exercise-db) + weryfikacja obrazków + użycie w apce. Kuracja = **propozycja do akceptacji [Ty]** (§3); nic nie ukrywam bez zgody.

## 1. Wynik skanu — baza zdrowsza, niż zakładał plan

| Sprawdzenie | Wynik |
|---|---|
| Duplikaty nazw (po normalizacji) | **0** |
| Wpisy bez obrazków / bez partii głównej | **0 / 0** |
| Obrazki z JSON vs lokalny backup (`../free-exercise-db`, 2619 jpg) | **komplet — 0 braków** |
| Hotlinki HTTP (spot-check 12, w tym wszystkie z programów) | **12/12 → 200 OK** |
| Wpisy bez instrukcji | było 5 → **naprawione** (Iron Cross, One-Arm KB Swings, Push Press, Side Bridge, Side Jackknife — SQL + trwały `INSTRUCTION_OVERRIDES` w `seed.ts`) |
| Krótkie instrukcje (<80 znaków) | 2 (kosmetyka, zostawione) |

**Wniosek:** punktu „martwe obrazki / duplikaty / śmieci" z planu w praktyce **nie ma** — upstream jest porządny. Realny temat to **szum kategorii** w pickerze (§2) i docelowo self-host obrazków (S11, bez zmian).

## 2. Rozkład kategorii (co siedzi w 873)

| Kategoria | Ile | Ocena przydatności w loggerze serii |
|---|---|---|
| strength | 581 | ✅ rdzeń |
| stretching | 123 | ⚠️ rozciąganie + SMR/foam-roll (11) — nie loguje się jako serie×powt.; **szum** w wynikach |
| plyometrics | 61 | 🤔 box jumps itp. — logowalne (powt.), niszowe |
| powerlifting | 38 | ✅ (m.in. Barbell Hip Thrust — w programach!) |
| olympic weightlifting | 35 | ✅ realny lifting |
| strongman | 21 | 🤔 atlas stones, yoke… nisza, ale nie przeszkadza |
| cardio | 14 | ⚠️ bieganie/rower — nie pasuje do modelu serii; **szum** |

**Pułapka wykryta:** kategorie upstream bywają błędne — np. **Superman** (w naszym programie bodyweight!) ma `stretching`. Każde filtrowanie po kategorii **musi mieć whitelistę wyjątków** (min. wszystko, co używane w programach — dziś 59 ćwiczeń — i historia usera).

## 3. Propozycja kuracji — do akceptacji [Ty]

Plan mówił „podzbiór ~150–250". Po skanie rekomenduję **łagodniejszą, dwustopniową** wersję (baza nie jest śmietnikiem; twarde cięcie do 200 zabiłoby long-tail searcha, który właśnie chwaliłeś):

- **Stopień 1 (rekomendowany do wdrożenia):** picker/swap **domyślnie ukrywa** `stretching` i `cardio` (−137 wpisów szumu), z whitelistą: ćwiczenia użyte w programach + w historii usera + custom. Search po nazwie **nadal znajduje wszystko** (ukrycie działa tylko na browse/chipy).
- **Stopień 2 (później, opcjonalnie):** flaga `featured` dla ~200 najsensowniejszych — sortowanie „featured first" w wynikach (nie ukrywanie). Dopiero gdyby po Stopniu 1 wyniki nadal szumiały.
- **Nie ruszamy:** plyometrics/strongman/olympic — logowalne i nie zaśmiecają typowych zapytań (dumbbell/barbell chipy i tak je odfiltrowują).

**Decyzja [Ty]:** wchodzimy w Stopień 1? (odwracalne — to filtr w query, nie zmiana danych).

## 4. Status „Done" S8
- Baza zweryfikowana ✓ · zero martwych obrazków w użyciu ✓ (sample + komplet w backupie) · braki instrukcji załatane ✓ · kuracja: propozycja czeka na [Ty].

---

## 5. Audyt trenerski + kuracja WYKONANA (2026-07-08, decyzja [Ty])

> Uzupełnienie audytu S8 o warstwę **treściową** (co powinno być w bazie, a czego nie ma / co jest przestarzałe). Zaakceptowane: flaga hidden, ~30–40 nowych, seed+SQL, Stopień 1 wdrożony.

### 5.1 Dodane: 34 ćwiczenia (współczesny kanon, brakowały w upstream)

`scripts/data/exercises.json` (873 → **907**), pełny schemat + instrukcje EN, `images = ["/exercise-placeholder.svg"]` (lokalny placeholder w palecie Warm — docelowe zdjęcia to osobny tor assetów [Ty]).

- **Nogi/pośladki:** Bulgarian Split Squat, Nordic Hamstring Curl, Reverse Nordic Curl, Spanish Squat, Curtsy Lunge, Dumbbell Hip Thrust, Single-Leg Hip Thrust, Frog Pump, Cable Pull-Through, Machine Hip Abduction, Tibialis Raise, Wall Sit, **Single-Leg Calf Raise**
- **Plecy:** Pendlay Row, Seal Row, Chest-Supported Dumbbell Row, Meadows Row, **Band Lat Pulldown**
- **Barki/ramiona:** Z Press, Landmine Press, Machine Lateral Raise, Prone Y Raise, Bayesian Cable Curl, Overhead Cable Triceps Extension
- **Core/carry/balistyka:** Copenhagen Plank, Bird Dog, Hollow Body Hold, Toes-To-Bar, L-Sit Hold, Hanging Knee Raise, Ab Wheel Rollout, Suitcase Carry, **Kettlebell Swing** (dwuręczny — upstream miał tylko jednoręczny!)

Nowe wpisy mają nadpisania w `seed.ts` tam, gdzie heurystyka by się myliła (`TYPE_OVERRIDES`: Ab Wheel/Spanish Squat → bodyweight; `PATTERN_OVERRIDES`: Wall Sit/Reverse Nordic → squat, holdy → core, Prone Y/Band Lat Pulldown → pull).

### 5.2 Ukryte: flaga `exercises.hidden` (140 wpisów)

- Migracja `20260708100000_exercise_curation_hidden.sql` (kolumna + backfill z whitelistą FK: programy, historia, PR-y, custom). **Źródło prawdy = `deriveHidden()` w `seed.ts`** (idempotentne przy re-seedzie).
- `stretching` (123) + `cardio` (14) minus 5 błędnie skategoryzowanych logowalnych (Superman, Crossover Reverse Lunge, Split Squats, Pelvic Tilt Into Bridge, Scissor Kick) = 132.
- **+8 przestarzałych/kontuzjogennych (ocena trenerska):** Barbell Guillotine Bench Press, Neck Press, Standing Barbell Press Behind Neck, Push Press Behind the Neck, Wide-Grip Pulldown Behind The Neck, Rocky Pull-Ups/Pulldowns, Bradford/Rocky Presses (behind-the-neck = impingement barku bez przewagi nad wariantami przednimi), Seated Barbell Twist (balistyczna ładowana rotacja kręgosłupa).
- **Świadomie NIE ukryte:** good mornings, upright rows (legalne przy poprawnej technice — współczesny konsensus), plyo/strongman/olympic (bez zmian względem §3).

### 5.3 Stopień 1 — semantyka „hidden"

- `ExerciseBrowser` (picker add+swap): browse po chipach filtruje `hidden=false`; **search po nazwie (≥2 znaki) znajduje wszystko** — zgodnie z §3.
- `substitute.ts` (swap engine): kandydaci zawsze `hidden=false`.
- `ProgramEditor` (search po nazwie): bez filtra — celowo.
- Custom ćwiczenia usera: nigdy nie ukrywane (`user_id is null` w SQL, seed nie dotyka).

### 5.4 Bonus: poprawki `movement_pattern`

Hip thrusty (Barbell/Dumbbell/Single-Leg), Frog Pump, Cable Pull-Through, KB Swings (jedno- i dwuręczny) → **hinge** (heurystyka `press/raise → push` dawała bez sensu np. wyciskania jako swap dla hip thrustu).

### 5.5 Status po Sprincie P1 (2026-07-13)

1. ✅ Lokalny `npm run seed`: 907 ćwiczeń + 8 programów / 173 sloty; bezpieczny sync zachował ID i aktywny program.
2. ✅ `npm run validate:training`: 0 błędów typów, wzorców, sprzętu i integralności presetów.
3. ⏳ [Ty] QA na telefonie: zmienione presety + podmiany bridge/machine.
4. ⏳ Docelowe zdjęcia dla 34 nowych (placeholder → asset pipeline; self-host obrazków = S11 bez zmian).

### 5.6 Status po Sprincie P3 (2026-07-13)

1. ✅ 11 programów / 246 slotów / 88 unikalnych ćwiczeń w presetach; nowe plany: Intermediate Bodyweight, Advanced Home i Advanced Bodyweight.
2. ✅ Walidator sprawdza również unikalność/stabilność slugów oraz zakresy poziomu, częstotliwości i czasu.
3. ✅ Ruchy bez ciężaru użyte w nowych planach (`Decline_Push-Up`, `Inverted_Row`, `Scapular_Pull-Up`) mają poprawny typ `bodyweight`.
4. ⚠️ 43 użycia placeholdera dotyczą 16 unikalnych ćwiczeń; to dług assetowy, nie błąd integralności programu.
