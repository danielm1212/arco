# ARCO — Starter Programs

Kuratorowany zestaw programów na start dla ARCO. Filozofia: **curated-premium**, nie sprawl. Sześć flagowych, sprawdzonych struktur pokrywających realne segmenty userów (poziom × środowisko), zamiast 26 pozycji do przewijania. Każdy program jest gotowy do wrzucenia do content-systemu apki.

Wszystkie parametry oparte na meta-analizach objętości/częstotliwości (Schoenfeld i in.) i na kanonie sprawdzonych programów (Starting Strength / StrongLifts / GZCLP dla base, Upper/Lower i PPL wyżej).

---

## Grid pokrycia

| | 🏋️ Siłownia | 🏠 Dom z hantlami | 🤸 Masa ciała |
|---|---|---|---|
| **Beginner** | `beginner-gym-fbw3` | `beginner-dumbbell-fbw3` | `beginner-bodyweight-fbw3` |
| **Intermediate** | `intermediate-gym-upper-lower` | `intermediate-dumbbell-upper-lower` | → variant (patrz niżej) |
| **Advanced** | `advanced-gym-ppl` | → stretch (patrz niżej) | → defer |

**6 flagowych bespoke.** Reszta gridu obsłużona świadomie, nie zaniedbana:

- **Intermediate · masa ciała** → uruchom `beginner-bodyweight-fbw3` z twardszą progresją leverage (pistol, archer push-up, weighted plecak). Load ceiling robi z tego wariant, nie osobny byt.
- **Advanced · hantle** → uruchom `advanced-gym-ppl` ze swapami DB. Uczciwie: obciążenie kończy się szybko na dolnych partiach — kompensuj unilateralem, tempem i wyższymi zakresami. To sufit, nie pełnoprawna klatka.
- **Advanced · masa ciała** → **deferred na start.** Zaawansowany bodyweight to kalistenika/skill (planche, front lever), inna dyscyplina niż progressive overload. Osobny scope, jeśli w ogóle.

---

## Środowiska (definicje)

- **🏋️ Siłownia** — pełny sprzęt: barbell, hantle, maszyny, wyciągi.
- **🏠 Dom z hantlami** — regulowane hantle + ławka. Opcjonalnie kettlebell, guma, drążek. Vertical pull rozwiązany przez drążek lub gumę (swap w programie).
- **🤸 Masa ciała** — **default: drążek do podciągania.** Każde ćwiczenie na drążku ma inline swap dla usera **bez żadnego sprzętu** (towel row, backpack row, prone Y-T-W). Jeden program, dwa poziomy dostępu.

---

## Model progresji (house rule ARCO — jeden silnik dla całego gridu)

**Double progression.** Wszystkie serie robocze na **RIR 1–2** (bez failure). Gdy trafisz **górę zakresu powtórzeń na wszystkich seriach roboczych** danego ćwiczenia → następna sesja: dołóż ciężar.

- **Przyrost:** góra ciała ~2.5 kg (najmniejszy dostępny krok), dół ciała ~5 kg. Bodyweight: przejdź do trudniejszej wariacji leverage.
- **Reset przy stallu:** dwie sesje z rzędu bez trafienia dolnej granicy zakresu → zejdź ~10% ciężaru i wejdź z powrotem.
- **Beginner:** RIR 2–3, technika przed ciężarem. Wczesne przyrosty są prawie liniowe (co sesja) — to normalne przy tym poziomie.
- **Intermediate / Advanced:** RIR 1–2 na compoundach, ostatnia seria izolacji może iść RIR 0–1. Advanced: deload co ~6–8 tyg. (–40% objętości lub –10% ciężaru na tydzień).

**Substytucja = manual override „na dziś".** Szablon zostaje stały — progressive overload wymaga stałości ćwiczeń. Swap-listy poniżej to zamienniki na brak sprzętu / kontuzję / preferencję, nie algorytm zmieniający plan.

---

## Taksonomia `movement_pattern`

Każde ćwiczenie zmapowane na wzorzec (do heatmapy / balansu partii w apce):

`squat` · `hinge` · `lunge` · `horizontal_push` · `vertical_push` · `horizontal_pull` · `vertical_pull` · `calf` · `core` (sub: `anti_extension` / `anti_rotation` / `flexion`) · `isolation` (sub: `biceps` / `triceps` / `side_delt` / `rear_delt` / `quad` / `hamstring` / `glute`)

---

## Domyślne przerwy

Compound ciężki 2:30–3:00 · compound pomocniczy 2:00 · izolacja 1:00–1:30 · core 0:45–1:00. Wartości per ćwiczenie w tabelach.

---

## Cele evidence-based per poziom (dla weryfikacji, że programy trafiają w normy)

| Parametr | Beginner | Intermediate | Advanced |
|---|---|---|---|
| Sesje / tydz. | 3 | 4 | 6 |
| Częstotliwość / partia | 3× | 2× | 2× |
| Hard sets / partia / tydz. | 6–10 | 10–15 | 14–20 |
| Główny zakres powt. | 5–8 (compound) | 6–12 | 4–15 (falami) |
| RIR | 2–3 | 1–2 | 0–2 |
