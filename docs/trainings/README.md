# ARCO — Starter Programs

Kuratorowany zestaw programów na start dla ARCO. Filozofia: **curated-premium**, nie sprawl. Dziewięć flagowych struktur pokrywa grid poziom × środowisko bez mnożenia kosmetycznych wariantów. Razem z czterema celowymi planami FBW 2-dniowymi i dwoma planami z naciskiem na dolne ciało biblioteka aplikacji zawiera 15 presetów.

Wszystkie parametry oparte na meta-analizach objętości/częstotliwości (Schoenfeld i in.) i na kanonie sprawdzonych programów (Starting Strength / StrongLifts / GZCLP dla base, Upper/Lower i PPL wyżej).

---

## Grid pokrycia

| | 🏋️ Siłownia | 🏠 Dom z hantlami | 🤸 Masa ciała |
|---|---|---|---|
| **Beginner** | `beginner-gym-fbw2` · `beginner-gym-fbw3` | `beginner-home-fbw2` · `beginner-home-fbw3` | `beginner-bodyweight-fbw3` |
| **Intermediate** | `intermediate-gym-fbw2` · `intermediate-gym-upper-lower4` | `intermediate-home-fbw2` · `intermediate-home-upper-lower4` | `intermediate-bodyweight-fbw3` |
| **Advanced** | `advanced-gym-ppl6` | `advanced-home-upper-lower4` | `advanced-bodyweight-upper-lower4` |

Plany z naciskiem na dolne ciało (poziom początkujący–średniozaawansowany):

- `lower-body-gym3` — siłownia, cykl A → B → C, 2–3 treningi tygodniowo,
- `lower-body-home3` — dom z hantlami, cykl A → B → C, 2–3 treningi tygodniowo.

## Rytm tygodnia a rotacja treningów

Liczba treningów w tygodniu i liczba dni w planie to dwie różne rzeczy. Plan prowadzi przez kolejne treningi w stałej kolejności, a nowy tydzień jej nie resetuje. Na przykład przy rotacji A → B → C i dwóch treningach tygodniowo: tydzień 1 to A, B, a tydzień 2 to C, A. Dzięki temu każdy trening z planu wraca regularnie, bez pomijania dnia C.

**9 flagowych programów.** P3 zamknął trzy luki, których nie dało się już uczciwie obsłużyć samą notą fallbacku:

- **Intermediate · masa ciała:** trzydniowe FBW z drążkiem, progresją leverage i opcjonalnym czwartym dniem jako kontynuacją cyklu.
- **Advanced · hantle:** Upper/Lower 4-dniowy, który obchodzi load ceiling unilateralem, tempem i trudniejszymi wariantami.
- **Advanced · masa ciała:** Upper/Lower 4-dniowy skupiony na sile i hipertrofii. Skille statyczne typu planche/front lever nadal pozostają poza zakresem.

Dwa dodatkowe presety beginner (`beginner-gym-fbw2` i `beginner-home-fbw2`) obsługują dokładnie profil 2 dni. Nie są skrótem 3-dniowych cykli: każda sesja jest pełnym treningiem całego ciała, a tygodniowy bilans push/pull wynosi około 1:1.

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
| Sesje / tydz. | 2–3 | 2–4 | 3–6 zależnie od środowiska |
| Częstotliwość / partia | 3× | 2× | 2× |
| Hard sets / partia / tydz. | 6–10 | 10–15 | 14–20 |
| Główny zakres powt. | 5–8 (compound) | 6–12 | 4–15 (falami) |
| RIR | 2–3 | 1–2 | 0–2 |
