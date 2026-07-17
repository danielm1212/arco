# R5a: propozycja słownika `name_pl`, aliasów i decyzji placeholderowych

> **Data:** 2026-07-16 · **Status:** ZATWIERDZONE przez [Ty] 2026-07-17 (z poprawkami: decline = „głową w dół", 2 aliasy rozszerzone; zdjęcia placeholderów robi [Ty] w sobotę 2026-07-18). Gotowe do implementacji R5a. · **Podstawa:** `audyt-wyszukiwarki-2026-07.md` (R1–R2), plan sprintów §R5a („przygotowanie treści równolegle").
> **Co to jest:** kompletny materiał treściowy dla R1+R2 audytu — tłumaczenia top ~200 ćwiczeń, ~50 aliasów potocznych i inwentarz 16 placeholderów zdjęć do decyzji. **Zero kodu** — schemat (`name_pl` nullable, `search_aliases text[]`) i query wchodzą przy implementacji R5a.
> **Jak przeglądać:** najszybciej sekcję §1 (konwencje) — jeśli konwencje są dobre, tłumaczenia wystarczy przejrzeć po łebkach; wątpliwe wiersze mają dopisek w kolumnie Uwagi.

## 1. Konwencje tłumaczeń (do zatwierdzenia w pierwszej kolejności)

1. **Terminologia siłowni, nie słownikowa:** „uginanie ramion", „wyciskanie", „wiosłowanie", „rozpiętki", „wznosy", „wspięcia" — zgodnie z audytem („uginanie ramion ze sztangą", nie „loki bicepsowe").
2. **Utrwalone anglicyzmy zostają** tam, gdzie polska nazwa nie istnieje w mowie siłownianej: hip thrust, goblet, nordic curl, face pull, dead bug, hollow body hold, pallof press, mountain climbers, pull through, push press, landmine. Ewentualny polski dopisek w nawiasie.
3. **Wzorzec nazwy:** {ruch} + {sprzęt} + {pozycja/wariant}, np. „Wyciskanie hantli na ławce skośnej".
4. **Pozycje ławki:** skośna (incline) = „na ławce skośnej"; decline = „głową w dół".
5. **one-arm/single-leg** = „jednorącz"/„jednonóż".
6. **Maszyny:** dopisek „(maszyna)" tylko gdy potrzebny do rozróżnienia od wersji z wolnym ciężarem.
7. Nazwy krótkie — to picker mobilny, nie encyklopedia. Szczegół zostaje w instrukcjach (`exercise-instructions-pl.json`).
8. Diakrytyki: nie kombinujemy w nazwach („ławka" zostaje „ławką") — „lawka"→„ławka" załatwia normalizacja R4 z audytu, nie treść.

## 2. Tłumaczenia — sekcja A: 91 ćwiczeń używanych w programach (priorytet 1)

Kolumna „Sloty" = liczba wystąpień w 308 slotach 15 programów (policzone z `scripts/seed.ts`).

### Klatka

| id | EN | Propozycja PL | Sloty | Uwagi |
|---|---|---|---:|---|
| Incline_Dumbbell_Press | Incline Dumbbell Press | Wyciskanie hantli na ławce skośnej | 11 | |
| Dumbbell_Bench_Press | Dumbbell Bench Press | Wyciskanie hantli na ławce płaskiej | 10 | |
| Barbell_Bench_Press_-_Medium_Grip | Barbell Bench Press - Medium Grip | Wyciskanie sztangi na ławce płaskiej | 5 | kanoniczna „ławka" |
| Push-Ups_With_Feet_Elevated | Push-Ups With Feet Elevated | Pompki z nogami na podwyższeniu | 3 | |
| Pushups | Pushups | Pompki | 2 | |
| Decline_Push-Up | Decline Push-Up | Pompki głową w dół | 2 | zgodnie z K4 (decyzja [Ty] 2026-07-17); ⚠️ near-dup z „Pompki z nogami na podwyższeniu" — na razie zostają oba, scalenie ewentualnie przy kuracji bazy |
| Single-Arm_Push-Up | Single-Arm Push-Up | Pompka jednorącz | 1 | |
| Barbell_Incline_Bench_Press_-_Medium_Grip | Barbell Incline Bench Press - Medium Grip | Wyciskanie sztangi na ławce skośnej | 1 | |
| Leverage_Chest_Press | Leverage Chest Press | Wyciskanie na maszynie (chest press) | 1 | |

### Plecy i martwe ciągi

| id | EN | Propozycja PL | Sloty | Uwagi |
|---|---|---|---:|---|
| Pullups | Pullups | Podciąganie nachwytem | 11 | |
| Chin-Up | Chin-Up | Podciąganie podchwytem | 5 | |
| Wide-Grip_Lat_Pulldown | Wide-Grip Lat Pulldown | Ściąganie drążka wyciągu szerokim chwytem | 5 | |
| Seated_Cable_Rows | Seated Cable Rows | Wiosłowanie na wyciągu siedząc | 5 | |
| One-Arm_Dumbbell_Row | One-Arm Dumbbell Row | Wiosłowanie hantlem jednorącz | 5 | |
| Bent_Over_Two-Dumbbell_Row | Bent Over Two-Dumbbell Row | Wiosłowanie hantlami w opadzie | 5 | |
| Chest-Supported_Dumbbell_Row | Chest-Supported Dumbbell Row | Wiosłowanie hantlami z klatką opartą o ławkę | 4 | |
| Inverted_Row | Inverted Row | Wiosłowanie w podporze (australijskie) | 4 | |
| Bent_Over_Barbell_Row | Bent Over Barbell Row | Wiosłowanie sztangą w opadzie | 3 | |
| Band_Lat_Pulldown | Band Lat Pulldown | Ściąganie gumy szerokim chwytem | 2 | |
| Scapular_Pull-Up | Scapular Pull-Up | Podciąganie łopatkowe | 2 | |
| Barbell_Deadlift | Barbell Deadlift | Martwy ciąg klasyczny | 2 | |
| Close-Grip_Front_Lat_Pulldown | Close-Grip Front Lat Pulldown | Ściąganie drążka wyciągu wąskim chwytem | 1 | |
| Superman | Superman | Superman (unoszenie rąk i nóg leżąc) | 1 | |
| Alternating_Renegade_Row | Alternating Renegade Row | Wiosłowanie w podporze (renegade row) | 1 | |

### Barki

| id | EN | Propozycja PL | Sloty | Uwagi |
|---|---|---|---:|---|
| Seated_Dumbbell_Press | Seated Dumbbell Press | Wyciskanie hantli siedząc | 7 | |
| Side_Lateral_Raise | Side Lateral Raise | Wznosy hantli bokiem | 6 | |
| Dumbbell_Shoulder_Press | Dumbbell Shoulder Press | Wyciskanie hantli nad głowę | 5 | |
| Standing_Military_Press | Standing Military Press | Wyciskanie żołnierskie (OHP) | 4 | |
| Pike_Push-Up | Pike Push-Up | Pompki pike | 4 | |
| Cable_Seated_Lateral_Raise | Cable Seated Lateral Raise | Wznosy bokiem na wyciągu siedząc | 3 | |
| Face_Pull | Face Pull | Face pull | 3 | anglicyzm utrwalony |
| Reverse_Flyes | Reverse Flyes | Odwrotne rozpiętki | 3 | |
| Handstand_Push-Ups | Handstand Push-Ups | Pompki w staniu na rękach | 2 | |

### Biceps

| id | EN | Propozycja PL | Sloty | Uwagi |
|---|---|---|---:|---|
| Dumbbell_Bicep_Curl | Dumbbell Bicep Curl | Uginanie ramion z hantlami | 4 | |
| Incline_Dumbbell_Curl | Incline Dumbbell Curl | Uginanie ramion z hantlami na ławce skośnej | 4 | |
| Barbell_Curl | Barbell Curl | Uginanie ramion ze sztangą | 3 | |
| Hammer_Curls | Hammer Curls | Uginanie ramion chwytem młotkowym | 3 | |
| Standing_Biceps_Cable_Curl | Standing Biceps Cable Curl | Uginanie ramion na wyciągu | 1 | |

### Triceps

| id | EN | Propozycja PL | Sloty | Uwagi |
|---|---|---|---:|---|
| Standing_Dumbbell_Triceps_Extension | Standing Dumbbell Triceps Extension | Wyciskanie francuskie hantlem stojąc | 4 | |
| Triceps_Pushdown | Triceps Pushdown | Prostowanie ramion na wyciągu | 4 | |
| Dips_-_Triceps_Version | Dips - Triceps Version | Pompki na poręczach (triceps) | 3 | |
| Lying_Dumbbell_Tricep_Extension | Lying Dumbbell Tricep Extension | Wyciskanie francuskie hantlami leżąc | 3 | |
| Push-Ups_-_Close_Triceps_Position | Push-Ups - Close Triceps Position | Pompki wąskie (tricepsowe) | 1 | |
| Body_Tricep_Press | Body Tricep Press | Bodyweight skullcrusher (przy ławce) | 1 | ⚠️ trudna nazwa — do decyzji |
| Overhead_Cable_Triceps_Extension | Overhead Cable Triceps Extension | Prostowanie ramion na wyciągu zza głowy | 1 | |
| EZ-Bar_Skullcrusher | EZ-Bar Skullcrusher | Wyciskanie francuskie sztangą łamaną leżąc | 1 | |

### Nogi — przód i pośladki

| id | EN | Propozycja PL | Sloty | Uwagi |
|---|---|---|---:|---|
| Dumbbell_Rear_Lunge | Dumbbell Rear Lunge | Zakroki z hantlami | 8 | |
| Bulgarian_Split_Squat | Bulgarian Split Squat | Przysiad bułgarski | 7 | |
| Barbell_Squat | Barbell Squat | Przysiad ze sztangą | 6 | |
| Goblet_Squat | Goblet Squat | Przysiad goblet | 6 | |
| Dumbbell_Hip_Thrust | Dumbbell Hip Thrust | Hip thrust z hantlem | 5 | |
| Leg_Press | Leg Press | Wyciskanie nogami (leg press) | 4 | |
| Front_Barbell_Squat | Front Barbell Squat | Przysiad przedni ze sztangą | 3 | |
| Bodyweight_Walking_Lunge | Bodyweight Walking Lunge | Wykroki chodzone bez obciążenia | 3 | |
| Split_Squats | Split Squats | Przysiad rozdzielny (split squat) | 3 | |
| Barbell_Hip_Thrust | Barbell Hip Thrust | Hip thrust ze sztangą | 3 | |
| Single_Leg_Glute_Bridge | Single Leg Glute Bridge | Mostek biodrowy jednonóż | 3 | |
| Single-Leg_Hip_Thrust | Single-Leg Hip Thrust | Hip thrust jednonóż | 3 | |
| Leg_Extensions | Leg Extensions | Prostowanie nóg siedząc (maszyna) | 2 | |
| Dumbbell_Step_Ups | Dumbbell Step Ups | Wejścia na skrzynię z hantlami | 2 | |
| Reverse_Nordic_Curl | Reverse Nordic Curl | Odwrotny nordic curl | 2 | |
| Bodyweight_Squat | Bodyweight Squat | Przysiad bez obciążenia | 2 | |
| Freehand_Jump_Squat | Freehand Jump Squat | Przysiad z wyskokiem | 1 | |
| Barbell_Walking_Lunge | Barbell Walking Lunge | Wykroki chodzone ze sztangą | 1 | |
| Step-up_with_Knee_Raise | Step-up with Knee Raise | Wejście na skrzynię z unoszeniem kolana | 1 | |
| Thigh_Abductor | Thigh Abductor | Odwodzenie nóg na maszynie | 1 | |
| One-Legged_Cable_Kickback | One-Legged Cable Kickback | Odmachy nogi na wyciągu | 1 | |
| Glute_Kickback | Glute Kickback | Odmachy nogi w klęku | 1 | |

### Nogi — tył, łydki i przywodziciele

| id | EN | Propozycja PL | Sloty | Uwagi |
|---|---|---|---:|---|
| Stiff-Legged_Dumbbell_Deadlift | Stiff-Legged Dumbbell Deadlift | Martwy ciąg na prostych nogach z hantlami | 10 | |
| Calf_Raise_On_A_Dumbbell | Calf Raise On A Dumbbell | Wspięcia na palce na hantlu | 6 | |
| Romanian_Deadlift | Romanian Deadlift | Martwy ciąg rumuński | 5 | |
| Standing_Calf_Raises | Standing Calf Raises | Wspięcia na palce stojąc (maszyna) | 5 | |
| Nordic_Hamstring_Curl | Nordic Hamstring Curl | Nordic curl | 4 | |
| Lying_Leg_Curls | Lying Leg Curls | Uginanie nóg leżąc (maszyna) | 3 | |
| Single_Leg_Calf_Raise | Single-Leg Calf Raise | Wspięcia na palce jednonóż | 3 | |
| Natural_Glute_Ham_Raise | Natural Glute Ham Raise | Glute ham raise bez maszyny | 3 | |
| Copenhagen_Plank | Copenhagen Plank | Deska kopenhaska | 3 | |
| Seated_Leg_Curl | Seated Leg Curl | Uginanie nóg siedząc (maszyna) | 2 | |
| Calf_Press | Calf Press | Wspięcia na palce na maszynie (calf press) | 2 | |
| Dumbbell_Seated_One-Leg_Calf_Raise | Dumbbell Seated One-Leg Calf Raise | Wspięcia siedząc jednonóż z hantlem | 2 | |
| Kettlebell_One-Legged_Deadlift | Kettlebell One-Legged Deadlift | Martwy ciąg jednonóż z kettlebell | 1 | |
| Seated_Calf_Raise | Seated Calf Raise | Wspięcia na palce siedząc (maszyna) | 1 | |
| Tibialis_Raise | Tibialis Raise | Unoszenie palców stóp (tibialis) | 1 | |

### Brzuch i core

| id | EN | Propozycja PL | Sloty | Uwagi |
|---|---|---|---:|---|
| Plank | Plank | Deska (plank) | 6 | |
| Dead_Bug | Dead Bug | Dead bug | 5 | anglicyzm utrwalony |
| Hanging_Leg_Raise | Hanging Leg Raise | Unoszenie nóg w zwisie | 5 | |
| Hollow_Body_Hold | Hollow Body Hold | Hollow body hold | 4 | |
| Hanging_Knee_Raise | Hanging Knee Raise | Unoszenie kolan w zwisie | 3 | |
| Ab_Wheel_Rollout | Ab Wheel Rollout | Rozwijanie kółka (ab wheel) | 2 | |
| Pallof_Press | Pallof Press | Pallof press | 1 | |
| L-Sit_Hold | L-Sit Hold | L-sit | 1 | |

## 3. Tłumaczenia — sekcja B: dopełnienie do ~200 (klasyka spoza programów)

Kuracja ręczna z 676 widocznych ćwiczeń spoza slotów: kanoniczne ruchy, które realnie padają w polskiej siłowni jako pierwsza fraza wyszukiwania. Pominięte: egzotyczne warianty (bands/chains, board press itd.) — dostaną `name_pl` w dalszych falach.

### Klatka

| id | EN | Propozycja PL |
|---|---|---|
| Dumbbell_Flyes | Dumbbell Flyes | Rozpiętki z hantlami |
| Incline_Dumbbell_Flyes | Incline Dumbbell Flyes | Rozpiętki z hantlami na ławce skośnej |
| Decline_Dumbbell_Flyes | Decline Dumbbell Flyes | Rozpiętki z hantlami głową w dół |
| Cable_Crossover | Cable Crossover | Krzyżowanie linek wyciągu (brama) |
| Low_Cable_Crossover | Low Cable Crossover | Krzyżowanie linek z dołu (brama) |
| Butterfly | Butterfly | Maszyna motylkowa (pec deck) |
| Machine_Bench_Press | Machine Bench Press | Wyciskanie na maszynie leżąc |
| Cable_Chest_Press | Cable Chest Press | Wyciskanie na wyciągu (klatka) |
| Decline_Barbell_Bench_Press | Decline Barbell Bench Press | Wyciskanie sztangi głową w dół |
| Decline_Dumbbell_Bench_Press | Decline Dumbbell Bench Press | Wyciskanie hantli głową w dół |
| Smith_Machine_Bench_Press | Smith Machine Bench Press | Wyciskanie na suwnicy Smitha |
| Smith_Machine_Incline_Bench_Press | Smith Machine Incline Bench Press | Wyciskanie na suwnicy Smitha na ławce skośnej |
| Dips_-_Chest_Version | Dips - Chest Version | Pompki na poręczach (klatka) |
| Straight-Arm_Dumbbell_Pullover | Straight-Arm Dumbbell Pullover | Przenoszenie hantla za głowę (pullover) |
| Hammer_Grip_Incline_DB_Bench_Press | Hammer Grip Incline DB Bench Press | Wyciskanie hantli chwytem neutralnym na skosie |
| Dumbbell_Bench_Press_with_Neutral_Grip | Dumbbell Bench Press with Neutral Grip | Wyciskanie hantli chwytem neutralnym |
| Leverage_Incline_Chest_Press | Leverage Incline Chest Press | Wyciskanie na maszynie w skosie |

### Plecy i martwe ciągi

| id | EN | Propozycja PL |
|---|---|---|
| Sumo_Deadlift | Sumo Deadlift | Martwy ciąg sumo |
| Pendlay_Row | Pendlay Row | Wiosłowanie Pendlaya |
| T-Bar_Row_with_Handle | T-Bar Row with Handle | Wiosłowanie sztangą T (T-bar) |
| Lying_T-Bar_Row | Lying T-Bar Row | Wiosłowanie T-bar z klatką opartą |
| Straight-Arm_Pulldown | Straight-Arm Pulldown | Ściąganie wyciągu prostymi ramionami |
| Underhand_Cable_Pulldowns | Underhand Cable Pulldowns | Ściąganie drążka podchwytem |
| One_Arm_Lat_Pulldown | One Arm Lat Pulldown | Ściąganie wyciągu jednorącz |
| Full_Range-Of-Motion_Lat_Pulldown | Full Range-Of-Motion Lat Pulldown | Ściąganie drążka pełnym zakresem |
| V-Bar_Pullup | V-Bar Pullup | Podciąganie chwytem neutralnym (V-bar) |
| Leverage_Iso_Row | Leverage Iso Row | Wiosłowanie na maszynie |
| Leverage_High_Row | Leverage High Row | Wiosłowanie na maszynie z góry (high row) |
| Smith_Machine_Bent_Over_Row | Smith Machine Bent Over Row | Wiosłowanie na suwnicy Smitha |
| Kneeling_High_Pulley_Row | Kneeling High Pulley Row | Wiosłowanie górnego wyciągu w klęku |
| Good_Morning | Good Morning | Skłony dzień dobry (good morning) |
| Seated_Good_Mornings | Seated Good Mornings | Skłony dzień dobry siedząc |
| Hyperextensions_Back_Extensions | Hyperextensions (Back Extensions) | Skłony rzymskie (hyperextensions) |
| Reverse_Hyperextension | Reverse Hyperextension | Odwrotne skłony rzymskie |
| Barbell_Shrug | Barbell Shrug | Unoszenie barków ze sztangą (szrugsy) |
| Dumbbell_Shrug | Dumbbell Shrug | Unoszenie barków z hantlami (szrugsy) |
| Cable_Shrugs | Cable Shrugs | Unoszenie barków na wyciągu |

### Barki

| id | EN | Propozycja PL |
|---|---|---|
| Arnold_Dumbbell_Press | Arnold Dumbbell Press | Wyciskanie Arnolda |
| Barbell_Shoulder_Press | Barbell Shoulder Press | Wyciskanie sztangi nad głowę siedząc |
| Push_Press | Push Press | Push press |
| Standing_Dumbbell_Press | Standing Dumbbell Press | Wyciskanie hantli nad głowę stojąc |
| Dumbbell_One-Arm_Shoulder_Press | Dumbbell One-Arm Shoulder Press | Wyciskanie hantla nad głowę jednorącz |
| Machine_Shoulder_Military_Press | Machine Shoulder (Military) Press | Wyciskanie nad głowę na maszynie |
| Landmine_Press | Landmine Press | Wyciskanie landmine |
| Front_Dumbbell_Raise | Front Dumbbell Raise | Wznosy hantli przodem |
| Front_Incline_Dumbbell_Raise | Front Incline Dumbbell Raise | Wznosy przodem na ławce skośnej |
| Front_Two-Dumbbell_Raise | Front Two-Dumbbell Raise | Wznosy przodem oburącz |
| Front_Cable_Raise | Front Cable Raise | Wznosy przodem na wyciągu |
| Reverse_Machine_Flyes | Reverse Machine Flyes | Odwrotne rozpiętki na maszynie |
| Cable_Rear_Delt_Fly | Cable Rear Delt Fly | Odwrotne rozpiętki na wyciągu |
| Upright_Barbell_Row | Upright Barbell Row | Podciąganie sztangi wzdłuż tułowia |
| Upright_Cable_Row | Upright Cable Row | Podciąganie linki wzdłuż tułowia |
| Standing_Dumbbell_Upright_Row | Standing Dumbbell Upright Row | Podciąganie hantli wzdłuż tułowia |

### Biceps

| id | EN | Propozycja PL |
|---|---|---|
| EZ-Bar_Curl | EZ-Bar Curl | Uginanie ramion sztangą łamaną |
| Close-Grip_EZ_Bar_Curl | Close-Grip EZ Bar Curl | Uginanie sztangą łamaną wąskim chwytem |
| Preacher_Curl | Preacher Curl | Uginanie ramion na modlitewniku |
| Machine_Preacher_Curls | Machine Preacher Curls | Uginanie ramion na maszynie (modlitewnik) |
| One_Arm_Dumbbell_Preacher_Curl | One Arm Dumbbell Preacher Curl | Uginanie na modlitewniku jednorącz |
| Cable_Preacher_Curl | Cable Preacher Curl | Uginanie na modlitewniku na wyciągu |
| Concentration_Curls | Concentration Curls | Uginanie koncentracyjne hantlem |
| Dumbbell_Alternate_Bicep_Curl | Dumbbell Alternate Bicep Curl | Uginanie ramion z hantlami naprzemiennie |
| Alternate_Hammer_Curl | Alternate Hammer Curl | Uginanie młotkowe naprzemiennie |
| Incline_Hammer_Curls | Incline Hammer Curls | Uginanie młotkowe na ławce skośnej |
| Cross_Body_Hammer_Curl | Cross Body Hammer Curl | Uginanie młotkowe skośne (cross body) |
| Cable_Hammer_Curls_-_Rope_Attachment | Cable Hammer Curls - Rope Attachment | Uginanie młotkowe na wyciągu (lina) |
| High_Cable_Curls | High Cable Curls | Uginanie ramion na górnym wyciągu |
| Drag_Curl | Drag Curl | Uginanie ze sztangą wzdłuż tułowia (drag curl) |

### Triceps

| id | EN | Propozycja PL |
|---|---|---|
| Close-Grip_Barbell_Bench_Press | Close-Grip Barbell Bench Press | Wyciskanie sztangi wąskim chwytem |
| Smith_Machine_Close-Grip_Bench_Press | Smith Machine Close-Grip Bench Press | Wyciskanie wąsko na suwnicy Smitha |
| Close-Grip_Dumbbell_Press | Close-Grip Dumbbell Press | Wyciskanie hantli wąsko (chwyt neutralny) |
| Bench_Dips | Bench Dips | Pompki tricepsowe tyłem na ławce |
| Dip_Machine | Dip Machine | Dipy na maszynie |
| Cable_Rope_Overhead_Triceps_Extension | Cable Rope Overhead Triceps Extension | Prostowanie ramion zza głowy na wyciągu (lina) |
| Cable_One_Arm_Tricep_Extension | Cable One Arm Tricep Extension | Prostowanie ramienia na wyciągu jednorącz |
| Cable_Lying_Triceps_Extension | Cable Lying Triceps Extension | Wyciskanie francuskie na wyciągu leżąc |
| Cable_Incline_Triceps_Extension | Cable Incline Triceps Extension | Prostowanie ramion na wyciągu w skosie |
| Decline_Dumbbell_Triceps_Extension | Decline Dumbbell Triceps Extension | Wyciskanie francuskie hantlami głową w dół |
| Dumbbell_Floor_Press | Dumbbell Floor Press | Wyciskanie hantli leżąc na podłodze |
| Floor_Press | Floor Press | Wyciskanie sztangi leżąc na podłodze |

### Nogi — przód i pośladki

| id | EN | Propozycja PL |
|---|---|---|
| Dumbbell_Lunges | Dumbbell Lunges | Wykroki z hantlami |
| Barbell_Lunge | Barbell Lunge | Wykroki ze sztangą |
| Curtsy_Lunge | Curtsy Lunge | Zakroki skrzyżne (curtsy) |
| Elevated_Back_Lunge | Elevated Back Lunge | Zakroki z podwyższenia |
| Split_Squat_with_Dumbbells | Split Squat with Dumbbells | Przysiad rozdzielny z hantlami |
| Dumbbell_Squat | Dumbbell Squat | Przysiad z hantlami |
| Plie_Dumbbell_Squat | Plie Dumbbell Squat | Przysiad sumo z hantlem |
| Dumbbell_Squat_To_A_Bench | Dumbbell Squat To A Bench | Przysiad z hantlami na ławkę |
| Hack_Squat | Hack Squat | Przysiad na suwnicy hack |
| Barbell_Hack_Squat | Barbell Hack Squat | Przysiad hack ze sztangą |
| Narrow_Stance_Hack_Squats | Narrow Stance Hack Squats | Przysiad hack wąsko |
| Smith_Machine_Squat | Smith Machine Squat | Przysiad na suwnicy Smitha |
| Box_Squat | Box Squat | Przysiad na skrzynię |
| Barbell_Full_Squat | Barbell Full Squat | Przysiad pełny ze sztangą |
| Barbell_Glute_Bridge | Barbell Glute Bridge | Mostek biodrowy ze sztangą |
| Pull_Through | Pull Through | Pull through (przyciąganie liny między nogami) |
| Machine_Hip_Abduction | Machine Hip Abduction | Odwodzenie bioder na maszynie |
| Thigh_Adductor | Thigh Adductor | Przywodzenie nóg na maszynie |
| Cable_Hip_Adduction | Cable Hip Adduction | Przywodzenie nogi na wyciągu |
| Kettlebell_Swing | Kettlebell Swing | Wymachy kettlebell (swing) |
| One-Arm_Kettlebell_Swings | One-Arm Kettlebell Swings | Wymachy kettlebell jednorącz |
| Farmers_Walk | Farmer's Walk | Spacer farmera |

### Nogi — tył i łydki

| id | EN | Propozycja PL |
|---|---|---|
| Glute_Ham_Raise | Glute Ham Raise | Glute ham raise (GHD) |
| Smith_Machine_Stiff-Legged_Deadlift | Smith Machine Stiff-Legged Deadlift | Martwy ciąg na prostych nogach na suwnicy Smitha |
| Barbell_Seated_Calf_Raise | Barbell Seated Calf Raise | Wspięcia siedząc ze sztangą |
| Calf_Press_On_The_Leg_Press_Machine | Calf Press On The Leg Press Machine | Wspięcia na suwnicy (leg press) |

### Brzuch i core

| id | EN | Propozycja PL |
|---|---|---|
| Crunches | Crunches | Brzuszki (spięcia) |
| Oblique_Crunches | Oblique Crunches | Brzuszki skośne |
| Weighted_Crunches | Weighted Crunches | Brzuszki z obciążeniem |
| Sit-Up | Sit-Up | Brzuszki pełne (sit-up) |
| Russian_Twist | Russian Twist | Skręty rosyjskie |
| Cable_Russian_Twists | Cable Russian Twists | Skręty rosyjskie na wyciągu |
| Cable_Crunch | Cable Crunch | Spięcia brzucha na wyciągu w klęku |
| Rope_Crunch | Rope Crunch | Spięcia brzucha z liną wyciągu |
| Cable_Seated_Crunch | Cable Seated Crunch | Spięcia brzucha na wyciągu siedząc |
| Cable_Reverse_Crunch | Cable Reverse Crunch | Odwrotne spięcia na wyciągu |
| Cross-Body_Crunch | Cross-Body Crunch | Brzuszki skrętne (łokieć do kolana) |
| Flat_Bench_Lying_Leg_Raise | Flat Bench Lying Leg Raise | Unoszenie nóg leżąc na ławce |
| Mountain_Climbers | Mountain Climbers | Mountain climbers |
| Jackknife_Sit-Up | Jackknife Sit-Up | Scyzoryki |

### Przedramiona

| id | EN | Propozycja PL |
|---|---|---|
| Palms-Up_Barbell_Wrist_Curl_Over_A_Bench | Palms-Up Barbell Wrist Curl Over A Bench | Uginanie nadgarstków podchwytem na ławce |
| Palms-Down_Wrist_Curl_Over_A_Bench | Palms-Down Wrist Curl Over A Bench | Uginanie nadgarstków nachwytem na ławce |
| Cable_Wrist_Curl | Cable Wrist Curl | Uginanie nadgarstków na wyciągu |

**Razem A+B: ~205 ćwiczeń.**

## 4. Aliasy potoczne (~50) — do kolumny `search_aliases`

Zasada z audytu R2: alias łapie pierwszą frazę, którą bywalec realnie wpisuje. Aliasy wersjonowane jawnie — poniżej v1. Jeden alias może wskazywać kilka ćwiczeń (search zwraca wszystkie).

| Alias | Cel (id) |
|---|---|
| martwy, martwy ciąg | Barbell_Deadlift |
| rumuński, rumun, rdl | Romanian_Deadlift |
| sumo | Sumo_Deadlift |
| ohp, military, żołnierskie | Standing_Military_Press |
| ławka, wyciskanie leżąc, bench | Barbell_Bench_Press_-_Medium_Grip |
| skos, ławka skośna | Incline_Dumbbell_Press, Barbell_Incline_Bench_Press_-_Medium_Grip |
| rozpiętki | Dumbbell_Flyes |
| brama, krzyżowanie | Cable_Crossover |
| motylek, pec deck | Butterfly |
| wiosłowanie | Bent_Over_Barbell_Row |
| wiosło hantlem | One-Arm_Dumbbell_Row |
| podciąganie, drążek | Pullups |
| australijskie | Inverted_Row |
| ściąganie drążka, lat pulldown | Wide-Grip_Lat_Pulldown |
| t-bar | T-Bar_Row_with_Handle |
| przysiad, przysiady, squat | Barbell_Squat |
| bułgar, bułgary | Bulgarian_Split_Squat |
| goblet | Goblet_Squat |
| hack, hacki | Hack_Squat |
| suwnica smitha, smith | Smith_Machine_Squat |
| leg press, nogi maszyna | Leg_Press |
| hip thrust, biodra | Barbell_Hip_Thrust, Dumbbell_Hip_Thrust |
| mostek | Barbell_Glute_Bridge, Single_Leg_Glute_Bridge |
| wykroki | Dumbbell_Lunges |
| zakroki | Dumbbell_Rear_Lunge |
| łydki, wspięcia | Standing_Calf_Raises, Calf_Raise_On_A_Dumbbell |
| uginanie nóg | Lying_Leg_Curls |
| prostowanie nóg | Leg_Extensions |
| odwodzenie | Thigh_Abductor |
| przywodzenie | Thigh_Adductor |
| biceps, uginanie | Dumbbell_Bicep_Curl |
| młotki | Hammer_Curls |
| modlitewnik | Preacher_Curl |
| francuskie, francuz | EZ-Bar_Skullcrusher, Lying_Dumbbell_Tricep_Extension |
| triceps linka, pushdown | Triceps_Pushdown |
| pompki | Pushups |
| dipy, poręcze | Dips_-_Triceps_Version |
| deska, plank | Plank |
| kopenhaga | Copenhagen_Plank |
| brzuszki | Crunches |
| allahy | Cable_Crunch |
| kółko | Ab_Wheel_Rollout |
| unoszenie nóg | Hanging_Leg_Raise |
| wznosy | Side_Lateral_Raise |
| arnoldki | Arnold_Dumbbell_Press |
| facepull | Face_Pull |
| szrugsy | Barbell_Shrug, Dumbbell_Shrug |
| dzień dobry | Good_Morning |
| rzymka, skłony rzymskie | Hyperextensions_Back_Extensions |
| swing | Kettlebell_Swing |
| farmerki, spacer farmera | Farmers_Walk |
| nordiki, nordic | Nordic_Hamstring_Curl |
| deadbug | Dead_Bug |
| hollow | Hollow_Body_Hold |
| ghr | Natural_Glute_Ham_Raise, Glute_Ham_Raise |

## 5. Placeholdery zdjęć: 16 ćwiczeń w 49 slotach — rekomendacja do decyzji [Ty]

Policzono z seeda (zgodne z walidatorem: 16 unikalnych / 49 slotów). Wszystkie to nowoczesna klasyka rdzenna dla programów hantlowych/domowych — **ukrycie któregokolwiek wypatroszyłoby programy dumbbell-first**, a podmiana oznacza edycję kuratorowanych planów.

**Rekomendacja: zdjęcie dla wszystkich 16** (spójna fala generowania, ten sam tor co AI-assety), podmiana/ukrycie tylko jako fallback, jeśli dla danego ruchu nie wyjdzie czytelna klatka.

**Decyzja [Ty] 2026-07-17:** placeholdery na razie zostają; generowanie zdjęć dla wszystkich 16
wykonuje [Ty] w sobotę 2026-07-18 jako priorytet (prompty: `docs/prompt-fotografia-warm.md`).
To jest świadoma decyzja wymagana bramką H2 — implementacja słownika R5a nie czeka na zdjęcia.

| Ćwiczenie | Sloty | Uwaga |
|---|---:|---|
| Bulgarian_Split_Squat | 7 | najwyższy priorytet |
| Dumbbell_Hip_Thrust | 5 | |
| Chest-Supported_Dumbbell_Row | 4 | |
| Pike_Push-Up | 4 | |
| Hollow_Body_Hold | 4 | |
| Nordic_Hamstring_Curl | 4 | |
| Hanging_Knee_Raise | 3 | |
| Single_Leg_Calf_Raise | 3 | ⚠️ w prod brakuje też rekordu (drift — sync w R1b) |
| Single-Leg_Hip_Thrust | 3 | |
| Copenhagen_Plank | 3 | |
| Band_Lat_Pulldown | 2 | ⚠️ jw. — drift prod |
| Reverse_Nordic_Curl | 2 | |
| Ab_Wheel_Rollout | 2 | |
| L-Sit_Hold | 1 | kandydat na fallback-podmianę (np. Hanging_Knee_Raise), jeśli zdjęcie nie wyjdzie |
| Tibialis_Raise | 1 | jw. |
| Overhead_Cable_Triceps_Extension | 1 | |

## 6. Co dalej (poza tym dokumentem)

1. ~~[Ty] zatwierdza §1 (konwencje) → przegląd §2–§4 → poprawki w tym pliku.~~ ZROBIONE 2026-07-17: 8 konwencji zatwierdzonych bez wyjątków; sporne nazwy z przeglądu przyjęte wg propozycji (decline wg K4).
2. Wykonawca R5a implementuje R1+R2+R3 audytu jedną paczką: migracja `name_pl` + `search_aliases`, query po obu kolumnach i aliasach, ranking kliencki; zatwierdzony słownik wchodzi do seeda z tego pliku.
3. Stały zestaw zapytań krytycznych do testu regresji — naturalny kandydat: wszystkie aliasy z §4 + 20 najczęstszych nazw z §2.
4. Decyzja placeholderowa (§5) odblokowuje bramkę H2 („placeholdery w widocznych planach mają świadomą decyzję").
