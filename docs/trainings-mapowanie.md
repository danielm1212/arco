# Mapowanie ćwiczeń — nowe programy → baza (do akceptacji)

> Faza 1 Sprintu 6. Wszystkie 141 slotów z 6 nowych programów zmapowane na `exercise_id` z bazy. **35 podmian** (brak 1:1 w bazie) — poniżej do akceptacji. Reszta to trafienia dokładne. Po Twoim OK przepisuję `scripts/seed.ts` i re-seeduję.


## ⚠️ Podmiany do akceptacji

| Program | Ćwiczenie z planu | → exercise_id (baza) | Uzasadnienie |
|---|---|---|---|
| Beginner Full Body 3× | Chest-Supported Row | `Seated_Cable_Rows` (Seated Cable Rows) | brak chest-supported row → Seated Cable Row (ten sam wzorzec horizontal pull) |
| Beginner Full Body 3× | DB Walking Lunge | `Dumbbell_Rear_Lunge` (Dumbbell Rear Lunge) | brak DB walking lunge → DB Rear Lunge (ten sam wzorzec lunge) |
| Beginner Full Body 3× | Hanging Knee Raise | `Hanging_Leg_Raise` (Hanging Leg Raise) | brak knee raise → Hanging Leg Raise (ten sam ruch) |
| Beginner Full Body 3× | DB Romanian Deadlift | `Stiff-Legged_Dumbbell_Deadlift` (Stiff-Legged Dumbbell Deadlift) | brak osobnego DB RDL → Stiff-Legged DB Deadlift (hinge z hantlami) |
| Beginner Full Body 3× | Band Lat Pulldown | `Straight-Arm_Dumbbell_Pullover` (Straight-Arm Dumbbell Pullover) | dom bez drążka → Straight-Arm DB Pullover (vertical pull z hantlem; drążek/guma jako swap w docs) |
| Beginner Full Body 3× | DB Bulgarian Split Squat | `Split_Squat_with_Dumbbells` (Split Squat with Dumbbells) | brak Bulgarian → Split Squat with Dumbbells (unilateralny split squat) |
| Beginner Full Body 3× | DB Hip Thrust / Glute Bridge | `Glute_Kickback` (Glute Kickback) | brak DB/sztangi w domu → Glute Kickback (bodyweight, powt.); z obciążeniem: Hip Lift with Band jako alternatywa |
| Beginner Full Body 3× | Pike Push-up | `Pushups` (Pushups) | → zwykłe pompki (decyzja właściciela); dzień A ma teraz 2× pompki — trener może zróżnicować (np. decline) |
| Beginner Full Body 3× | Reverse Lunge | `Bodyweight_Walking_Lunge` (Bodyweight Walking Lunge) | brak BW reverse lunge → Bodyweight Walking Lunge (ten sam wzorzec) |
| Beginner Full Body 3× | Feet-Elevated Push-up | `Decline_Push-Up` (Decline Push-Up) | feet-elevated = Decline Push-Up |
| Beginner Full Body 3× | Single-Leg Glute Bridge | `Glute_Kickback` (Glute Kickback) | Single-Leg Glute Bridge w bazie jest 'timed' → Glute Kickback (bodyweight, powtórzenia) |
| Beginner Full Body 3× | Hanging Knee Raise | `Hanging_Leg_Raise` (Hanging Leg Raise) | brak knee raise → Hanging Leg Raise |
| Beginner Full Body 3× | Bulgarian Split Squat | `Split_Squat_with_Dumbbells` (Split Squat with Dumbbells) | brak BW Bulgarian → Split Squat with Dumbbells (unilateralny; BW wariant = leverage w docs) |
| Beginner Full Body 3× | Archer / Pseudo-Planche Push-up | `Pushups` (Pushups) | progresja leverage → baza Push-up (trudniejsza wariacja to override usera) |
| Beginner Full Body 3× | Single-Leg Calf Raise | `Calf_Raise_On_A_Dumbbell` (Calf Raise On A Dumbbell) | brak BW single-leg calf → Calf Raise On A Dumbbell |
| Beginner Full Body 3× | Hollow Body Hold | `Plank` (Plank) | brak Hollow Body → Plank (anti-extension core na czas) |
| Intermediate Upper / Lower 4× | Cable Lateral Raise | `Cable_Seated_Lateral_Raise` (Cable Seated Lateral Raise) | najbliższy cable lateral |
| Intermediate Upper / Lower 4× | Bulgarian Split Squat | `Split_Squat_with_Dumbbells` (Split Squat with Dumbbells) | brak Bulgarian → Split Squat with Dumbbells |
| Intermediate Upper / Lower 4× | DB Bulgarian Split Squat | `Split_Squat_with_Dumbbells` (Split Squat with Dumbbells) | brak Bulgarian → Split Squat with Dumbbells |
| Intermediate Upper / Lower 4× | DB Romanian Deadlift | `Stiff-Legged_Dumbbell_Deadlift` (Stiff-Legged Dumbbell Deadlift) | brak DB RDL → Stiff-Legged DB Deadlift |
| Intermediate Upper / Lower 4× | DB / Nordic-assisted Ham Curl | `Natural_Glute_Ham_Raise` (Natural Glute Ham Raise) | home ham curl → Natural Glute-Ham Raise (bodyweight nordic — dokładnie ten ruch) |
| Intermediate Upper / Lower 4× | Chest-Supported DB Row | `Bent_Over_Two-Dumbbell_Row` (Bent Over Two-Dumbbell Row) | brak chest-supported → 2-DB Bent-Over Row |
| Intermediate Upper / Lower 4× | Band/Cable Lateral Raise | `Cable_Seated_Lateral_Raise` (Cable Seated Lateral Raise) | → Cable Lateral Raise (guma jako swap w docs) |
| Intermediate Upper / Lower 4× | DB Face Pull / Rear-Delt Fly | `Reverse_Flyes` (Reverse Flyes) | → Reverse Flyes (rear delt) |
| Intermediate Upper / Lower 4× | DB Skull Crusher | `Lying_Dumbbell_Tricep_Extension` (Lying Dumbbell Tricep Extension) | DB skull crusher → Lying DB Tricep Extension |
| Intermediate Upper / Lower 4× | DB Hip Thrust | `Glute_Kickback` (Glute Kickback) | dom bez sztangi → Glute Kickback (bodyweight, powt.); Hip Lift with Band jako alternatywa z obciążeniem |
| Intermediate Upper / Lower 4× | Slider / DB Leg Curl | `Natural_Glute_Ham_Raise` (Natural Glute Ham Raise) | home ham curl → Natural Glute-Ham Raise (bodyweight nordic) |
| Advanced Push / Pull / Legs 6× | Cable Lateral Raise | `Cable_Seated_Lateral_Raise` (Cable Seated Lateral Raise) | najbliższy cable lateral |
| Advanced Push / Pull / Legs 6× | Weighted Pull-up | `Pullups` (Pullups) | brak wariantu obciążonego → Pullups (dokładaj obciążenie) |
| Advanced Push / Pull / Legs 6× | Chest-Supported Row | `Seated_Cable_Rows` (Seated Cable Rows) | brak chest-supported → Seated Cable Row |
| Advanced Push / Pull / Legs 6× | Machine Chest Press / Dips | `Leverage_Chest_Press` (Leverage Chest Press) | → Leverage (Machine) Chest Press |
| Advanced Push / Pull / Legs 6× | Cable Lateral Raise | `Cable_Seated_Lateral_Raise` (Cable Seated Lateral Raise) | najbliższy cable lateral |
| Advanced Push / Pull / Legs 6× | Lat Pulldown (wąski) | `Wide-Grip_Lat_Pulldown` (Wide-Grip Lat Pulldown) | → Lat Pulldown |
| Advanced Push / Pull / Legs 6× | Cable Curl | `Standing_Biceps_Cable_Curl` (Standing Biceps Cable Curl) | najbliższy cable curl |
| Advanced Push / Pull / Legs 6× | Bulgarian Split Squat | `Split_Squat_with_Dumbbells` (Split Squat with Dumbbells) | brak Bulgarian → Split Squat with Dumbbells |

## Pełne programy (spec do seedu)


### Beginner · Siłownia · Full Body 3×

*level: beginner · Siłownia · masa i siła*


**Dzień A**

| # | Plan | exercise_id | Serie × powt. | Przerwa | Uwaga |
|---|---|---|---|---|---|
| 1 | Barbell Back Squat | `Barbell_Squat` | 3 × 5–8 | 2:30 |  |
| 2 | Barbell Bench Press | `Barbell_Bench_Press_-_Medium_Grip` | 3 × 5–8 | 2:30 |  |
| 3 | Lat Pulldown | `Wide-Grip_Lat_Pulldown` | 3 × 8–12 | 2:00 |  |
| 4 | Seated DB Shoulder Press | `Seated_Dumbbell_Press` | 2 × 8–12 | 1:30 |  |
| 5 | Plank | `Plank` | 3 × na czas | 1:00 | na czas (stoper) |

**Dzień B**

| # | Plan | exercise_id | Serie × powt. | Przerwa | Uwaga |
|---|---|---|---|---|---|
| 1 | Romanian Deadlift | `Romanian_Deadlift` | 3 × 6–10 | 2:30 |  |
| 2 | 🔁 Chest-Supported Row | `Seated_Cable_Rows` | 3 × 8–12 | 2:00 |  |
| 3 | Incline DB Press | `Incline_Dumbbell_Press` | 3 × 8–12 | 2:00 |  |
| 4 | 🔁 DB Walking Lunge | `Dumbbell_Rear_Lunge` | 2 × 10–12 | 1:30 | na nogę |
| 5 | 🔁 Hanging Knee Raise | `Hanging_Leg_Raise` | 3 × 10–15 | 1:00 |  |

**Dzień C**

| # | Plan | exercise_id | Serie × powt. | Przerwa | Uwaga |
|---|---|---|---|---|---|
| 1 | Front Barbell Squat | `Front_Barbell_Squat` | 3 × 6–10 | 2:30 |  |
| 2 | Overhead Press (barbell) | `Standing_Military_Press` | 3 × 6–8 | 2:00 |  |
| 3 | Pull-up | `Pullups` | 3 × 5–10 | 2:00 |  |
| 4 | Seated Cable Row | `Seated_Cable_Rows` | 2 × 10–12 | 1:30 |  |
| 5 | Standing Calf Raise | `Standing_Calf_Raises` | 3 × 10–15 | 1:00 |  |
| 6 | Pallof Press | `Pallof_Press` | 2 × 10–12 | 45s | na stronę |

### Beginner · Dom z hantlami · Full Body 3×

*level: beginner · Dom (hantle) · masa i siła*


**Dzień A**

| # | Plan | exercise_id | Serie × powt. | Przerwa | Uwaga |
|---|---|---|---|---|---|
| 1 | Goblet Squat | `Goblet_Squat` | 3 × 8–12 | 2:00 |  |
| 2 | DB Bench Press | `Dumbbell_Bench_Press` | 3 × 8–12 | 2:00 |  |
| 3 | 1-Arm DB Row | `One-Arm_Dumbbell_Row` | 3 × 8–12 | 2:00 | na rękę |
| 4 | 🔁 DB Romanian Deadlift | `Stiff-Legged_Dumbbell_Deadlift` | 3 × 8–12 | 2:00 |  |
| 5 | Seated DB Shoulder Press | `Seated_Dumbbell_Press` | 2 × 8–12 | 1:30 |  |
| 6 | Plank | `Plank` | 3 × na czas | 1:00 | na czas (stoper) |

**Dzień B**

| # | Plan | exercise_id | Serie × powt. | Przerwa | Uwaga |
|---|---|---|---|---|---|
| 1 | DB Reverse Lunge | `Dumbbell_Rear_Lunge` | 3 × 8–10 | 1:30 | na nogę |
| 2 | Incline DB Press | `Incline_Dumbbell_Press` | 3 × 8–12 | 2:00 |  |
| 3 | 🔁 Band Lat Pulldown | `Straight-Arm_Dumbbell_Pullover` | 3 × 10–15 | 1:30 |  |
| 4 | DB Stiff-Leg Deadlift | `Stiff-Legged_Dumbbell_Deadlift` | 3 × 10–12 | 1:30 |  |
| 5 | DB Lateral Raise | `Side_Lateral_Raise` | 3 × 12–15 | 1:00 |  |
| 6 | DB Standing Calf Raise | `Calf_Raise_On_A_Dumbbell` | 3 × 12–15 | 1:00 |  |

**Dzień C**

| # | Plan | exercise_id | Serie × powt. | Przerwa | Uwaga |
|---|---|---|---|---|---|
| 1 | 🔁 DB Bulgarian Split Squat | `Split_Squat_with_Dumbbells` | 3 × 8–10 | 2:00 | na nogę |
| 2 | 2-DB Bent-Over Row | `Bent_Over_Two-Dumbbell_Row` | 3 × 8–12 | 2:00 |  |
| 3 | DB Bench Press | `Dumbbell_Bench_Press` | 3 × 8–12 | 2:00 |  |
| 4 | 🔁 DB Hip Thrust / Glute Bridge | `Glute_Kickback` | 3 × 10–15 | 1:30 |  |
| 5 | DB Curl | `Dumbbell_Bicep_Curl` | 2 × 10–12 | 1:00 |  |
| 6 | DB Overhead Triceps Ext | `Standing_Dumbbell_Triceps_Extension` | 2 × 10–12 | 1:00 |  |
| 7 | Dead Bug | `Dead_Bug` | 2 × 10–None | 45s | na stronę |

### Beginner · Masa ciała · Full Body 3×

*level: beginner · Masa ciała (drążek) · baza*


**Dzień A**

| # | Plan | exercise_id | Serie × powt. | Przerwa | Uwaga |
|---|---|---|---|---|---|
| 1 | Bodyweight Squat | `Bodyweight_Squat` | 3 × 12–20 | 1:30 |  |
| 2 | Push-up | `Pushups` | 3 × 8–15 | 1:30 |  |
| 3 | Pull-up (drążek) | `Pullups` | 3 × 5–10 | 2:00 |  |
| 4 | 🔁 Pike Push-up | `Pushups` | 2 × 6–12 | 1:30 |  |
| 5 | Plank | `Plank` | 3 × na czas | 1:00 | na czas (stoper) |

**Dzień B**

| # | Plan | exercise_id | Serie × powt. | Przerwa | Uwaga |
|---|---|---|---|---|---|
| 1 | 🔁 Reverse Lunge | `Bodyweight_Walking_Lunge` | 3 × 10–15 | 1:30 | na nogę |
| 2 | Inverted Row | `Inverted_Row` | 3 × 8–15 | 1:30 |  |
| 3 | 🔁 Feet-Elevated Push-up | `Decline_Push-Up` | 3 × 8–15 | 1:30 |  |
| 4 | 🔁 Single-Leg Glute Bridge | `Glute_Kickback` | 3 × 8–12 | 1:30 | na nogę |
| 5 | 🔁 Hanging Knee Raise | `Hanging_Leg_Raise` | 3 × 10–15 | 1:00 |  |

**Dzień C**

| # | Plan | exercise_id | Serie × powt. | Przerwa | Uwaga |
|---|---|---|---|---|---|
| 1 | 🔁 Bulgarian Split Squat | `Split_Squat_with_Dumbbells` | 3 × 10–15 | 1:30 | na nogę |
| 2 | Chin-up (drążek) | `Chin-Up` | 3 × 5–10 | 2:00 |  |
| 3 | 🔁 Archer / Pseudo-Planche Push-up | `Pushups` | 3 × 6–12 | 1:30 |  |
| 4 | 🔁 Single-Leg Calf Raise | `Calf_Raise_On_A_Dumbbell` | 3 × 12–20 | 1:00 | na nogę |
| 5 | 🔁 Hollow Body Hold | `Plank` | 3 × na czas | 45s | na czas (stoper) |
| 6 | Superman | `Superman` | 2 × 12–15 | 45s |  |

### Intermediate · Siłownia · Upper / Lower 4×

*level: intermediate · Siłownia · hipertrofia i siła*


**Upper A · siła**

| # | Plan | exercise_id | Serie × powt. | Przerwa | Uwaga |
|---|---|---|---|---|---|
| 1 | Barbell Bench Press | `Barbell_Bench_Press_-_Medium_Grip` | 4 × 5–8 | 2:30 |  |
| 2 | Bent-Over Barbell Row | `Bent_Over_Barbell_Row` | 4 × 6–10 | 2:30 |  |
| 3 | Overhead Press | `Standing_Military_Press` | 3 × 6–10 | 2:00 |  |
| 4 | Pull-up / Lat Pulldown | `Wide-Grip_Lat_Pulldown` | 3 × 8–12 | 2:00 |  |
| 5 | DB Lateral Raise | `Side_Lateral_Raise` | 3 × 12–20 | 1:00 |  |
| 6 | Triceps Pushdown | `Triceps_Pushdown` | 3 × 10–15 | 1:00 |  |
| 7 | Barbell Curl | `Barbell_Curl` | 3 × 8–12 | 1:00 |  |

**Lower A · siła**

| # | Plan | exercise_id | Serie × powt. | Przerwa | Uwaga |
|---|---|---|---|---|---|
| 1 | Barbell Back Squat | `Barbell_Squat` | 4 × 5–8 | 3:00 |  |
| 2 | Romanian Deadlift | `Romanian_Deadlift` | 3 × 6–10 | 2:30 |  |
| 3 | Leg Press | `Leg_Press` | 3 × 10–15 | 2:00 |  |
| 4 | Lying Leg Curl | `Lying_Leg_Curls` | 3 × 10–15 | 1:30 |  |
| 5 | Standing Calf Raise | `Standing_Calf_Raises` | 4 × 10–15 | 1:00 |  |
| 6 | Hanging Leg Raise | `Hanging_Leg_Raise` | 3 × 10–15 | 1:00 |  |

**Upper B · hipertrofia**

| # | Plan | exercise_id | Serie × powt. | Przerwa | Uwaga |
|---|---|---|---|---|---|
| 1 | Incline DB Press | `Incline_Dumbbell_Press` | 4 × 8–12 | 2:00 |  |
| 2 | Seated Cable Row | `Seated_Cable_Rows` | 4 × 8–12 | 2:00 |  |
| 3 | Pull-up | `Pullups` | 3 × 6–10 | 2:00 |  |
| 4 | DB Shoulder Press | `Dumbbell_Shoulder_Press` | 3 × 8–12 | 2:00 |  |
| 5 | 🔁 Cable Lateral Raise | `Cable_Seated_Lateral_Raise` | 3 × 12–20 | 1:00 |  |
| 6 | Face Pull | `Face_Pull` | 3 × 15–20 | 1:00 |  |
| 7 | Dips (triceps) | `Dips_-_Triceps_Version` | 3 × 8–12 | 1:00 |  |
| 8 | Incline DB Curl | `Incline_Dumbbell_Curl` | 3 × 10–12 | 1:00 |  |

**Lower B · hipertrofia**

| # | Plan | exercise_id | Serie × powt. | Przerwa | Uwaga |
|---|---|---|---|---|---|
| 1 | Deadlift (conventional) | `Barbell_Deadlift` | 3 × 3–5 | 3:00 |  |
| 2 | Front Squat | `Front_Barbell_Squat` | 3 × 8–10 | 2:30 |  |
| 3 | 🔁 Bulgarian Split Squat | `Split_Squat_with_Dumbbells` | 3 × 8–12 | 2:00 | na nogę |
| 4 | Leg Extension | `Leg_Extensions` | 3 × 12–15 | 1:30 |  |
| 5 | Seated Leg Curl | `Seated_Leg_Curl` | 3 × 10–15 | 1:30 |  |
| 6 | Calf Press | `Calf_Press` | 4 × 12–15 | 1:00 |  |

### Intermediate · Dom z hantlami · Upper / Lower 4×

*level: intermediate · Dom (hantle) · hipertrofia*


**Upper A · siła**

| # | Plan | exercise_id | Serie × powt. | Przerwa | Uwaga |
|---|---|---|---|---|---|
| 1 | DB Bench Press | `Dumbbell_Bench_Press` | 4 × 6–10 | 2:30 |  |
| 2 | 2-DB Bent-Over Row | `Bent_Over_Two-Dumbbell_Row` | 4 × 8–10 | 2:30 |  |
| 3 | Standing DB Shoulder Press | `Dumbbell_Shoulder_Press` | 3 × 6–10 | 2:00 |  |
| 4 | Pull-up (drążek) | `Pullups` | 3 × 6–10 | 2:00 |  |
| 5 | DB Lateral Raise | `Side_Lateral_Raise` | 3 × 12–20 | 1:00 |  |
| 6 | DB Overhead Triceps Ext | `Standing_Dumbbell_Triceps_Extension` | 3 × 10–15 | 1:00 |  |
| 7 | DB Curl | `Dumbbell_Bicep_Curl` | 3 × 8–12 | 1:00 |  |

**Lower A · siła**

| # | Plan | exercise_id | Serie × powt. | Przerwa | Uwaga |
|---|---|---|---|---|---|
| 1 | 🔁 DB Bulgarian Split Squat | `Split_Squat_with_Dumbbells` | 4 × 8–12 | 2:30 | na nogę |
| 2 | 🔁 DB Romanian Deadlift | `Stiff-Legged_Dumbbell_Deadlift` | 4 × 8–12 | 2:30 |  |
| 3 | Goblet Squat (tempo 3-1-1) | `Goblet_Squat` | 3 × 10–15 | 2:00 | tempo 3-1-1 |
| 4 | 🔁 DB / Nordic-assisted Ham Curl | `Natural_Glute_Ham_Raise` | 3 × 8–12 | 1:30 |  |
| 5 | Single-Leg Calf Raise (DB) | `Calf_Raise_On_A_Dumbbell` | 4 × 12–20 | 1:00 | na nogę |
| 6 | Hanging Leg Raise | `Hanging_Leg_Raise` | 3 × 10–15 | 1:00 |  |

**Upper B · hipertrofia**

| # | Plan | exercise_id | Serie × powt. | Przerwa | Uwaga |
|---|---|---|---|---|---|
| 1 | Incline DB Press | `Incline_Dumbbell_Press` | 4 × 8–12 | 2:00 |  |
| 2 | 🔁 Chest-Supported DB Row | `Bent_Over_Two-Dumbbell_Row` | 4 × 10–12 | 2:00 |  |
| 3 | Chin-up (drążek) | `Chin-Up` | 3 × 6–10 | 2:00 |  |
| 4 | Seated DB Shoulder Press | `Seated_Dumbbell_Press` | 3 × 8–12 | 2:00 |  |
| 5 | 🔁 Band/Cable Lateral Raise | `Cable_Seated_Lateral_Raise` | 3 × 15–20 | 1:00 |  |
| 6 | 🔁 DB Face Pull / Rear-Delt Fly | `Reverse_Flyes` | 3 × 15–20 | 1:00 |  |
| 7 | 🔁 DB Skull Crusher | `Lying_Dumbbell_Tricep_Extension` | 3 × 10–12 | 1:00 |  |
| 8 | Incline DB Curl | `Incline_Dumbbell_Curl` | 3 × 10–12 | 1:00 |  |

**Lower B · hipertrofia**

| # | Plan | exercise_id | Serie × powt. | Przerwa | Uwaga |
|---|---|---|---|---|---|
| 1 | DB Step-Up (wysoka skrzynia) | `Dumbbell_Step_Ups` | 4 × 8–12 | 2:30 | na nogę |
| 2 | DB Stiff-Leg Deadlift | `Stiff-Legged_Dumbbell_Deadlift` | 4 × 10–12 | 2:30 |  |
| 3 | Goblet Squat | `Goblet_Squat` | 3 × 12–15 | 2:00 |  |
| 4 | 🔁 DB Hip Thrust | `Glute_Kickback` | 3 × 10–15 | 2:00 |  |
| 5 | 🔁 Slider / DB Leg Curl | `Natural_Glute_Ham_Raise` | 3 × 12–15 | 1:30 |  |
| 6 | Seated Calf Raise (DB) | `Seated_Calf_Raise` | 4 × 15–20 | 1:00 |  |

### Advanced · Siłownia · Push / Pull / Legs 6×

*level: advanced · Siłownia · hipertrofia zaawansowana*


**Push A · ciężki**

| # | Plan | exercise_id | Serie × powt. | Przerwa | Uwaga |
|---|---|---|---|---|---|
| 1 | Barbell Bench Press | `Barbell_Bench_Press_-_Medium_Grip` | 4 × 4–6 | 3:00 |  |
| 2 | Overhead Press | `Standing_Military_Press` | 4 × 6–8 | 2:30 |  |
| 3 | Incline DB Press | `Incline_Dumbbell_Press` | 3 × 8–12 | 2:00 |  |
| 4 | 🔁 Cable Lateral Raise | `Cable_Seated_Lateral_Raise` | 4 × 12–20 | 1:00 |  |
| 5 | Overhead Triceps Ext | `Standing_Dumbbell_Triceps_Extension` | 3 × 8–12 | 1:00 |  |
| 6 | Triceps Pushdown | `Triceps_Pushdown` | 3 × 12–15 | 1:00 |  |

**Pull A · ciężki**

| # | Plan | exercise_id | Serie × powt. | Przerwa | Uwaga |
|---|---|---|---|---|---|
| 1 | Deadlift | `Barbell_Deadlift` | 3 × 3–5 | 3:00 |  |
| 2 | 🔁 Weighted Pull-up | `Pullups` | 4 × 5–8 | 2:30 |  |
| 3 | Bent-Over Barbell Row | `Bent_Over_Barbell_Row` | 4 × 6–10 | 2:30 |  |
| 4 | 🔁 Chest-Supported Row | `Seated_Cable_Rows` | 3 × 10–12 | 2:00 |  |
| 5 | Face Pull | `Face_Pull` | 3 × 15–20 | 1:00 |  |
| 6 | Barbell Curl | `Barbell_Curl` | 3 × 8–12 | 1:00 |  |
| 7 | Incline DB Curl | `Incline_Dumbbell_Curl` | 3 × 10–15 | 1:00 |  |

**Legs A · ciężki**

| # | Plan | exercise_id | Serie × powt. | Przerwa | Uwaga |
|---|---|---|---|---|---|
| 1 | Barbell Back Squat | `Barbell_Squat` | 4 × 4–6 | 3:00 |  |
| 2 | Romanian Deadlift | `Romanian_Deadlift` | 4 × 6–8 | 2:30 |  |
| 3 | Leg Press | `Leg_Press` | 3 × 10–15 | 2:00 |  |
| 4 | Lying Leg Curl | `Lying_Leg_Curls` | 4 × 10–15 | 1:30 |  |
| 5 | Standing Calf Raise | `Standing_Calf_Raises` | 4 × 8–12 | 1:00 |  |
| 6 | Seated Calf Raise | `Seated_Calf_Raise` | 3 × 15–20 | 1:00 |  |

**Push B · objętość**

| # | Plan | exercise_id | Serie × powt. | Przerwa | Uwaga |
|---|---|---|---|---|---|
| 1 | Incline Barbell Press | `Barbell_Incline_Bench_Press_-_Medium_Grip` | 4 × 8–10 | 2:30 |  |
| 2 | DB Shoulder Press | `Dumbbell_Shoulder_Press` | 4 × 8–12 | 2:00 |  |
| 3 | 🔁 Machine Chest Press / Dips | `Leverage_Chest_Press` | 3 × 10–15 | 2:00 |  |
| 4 | 🔁 Cable Lateral Raise | `Cable_Seated_Lateral_Raise` | 4 × 15–20 | 1:00 |  |
| 5 | Overhead + Pushdown superset | `Triceps_Pushdown` | 3 × 12–15 | 1:00 | superset |

**Pull B · objętość**

| # | Plan | exercise_id | Serie × powt. | Przerwa | Uwaga |
|---|---|---|---|---|---|
| 1 | Pull-up | `Pullups` | 4 × 8–12 | 2:00 |  |
| 2 | Seated Cable Row | `Seated_Cable_Rows` | 4 × 10–12 | 2:00 |  |
| 3 | 🔁 Lat Pulldown (wąski) | `Wide-Grip_Lat_Pulldown` | 3 × 12–15 | 1:30 |  |
| 4 | Rear-Delt Fly | `Reverse_Flyes` | 3 × 15–20 | 1:00 |  |
| 5 | Hammer Curl | `Hammer_Curls` | 3 × 10–15 | 1:00 |  |
| 6 | 🔁 Cable Curl | `Standing_Biceps_Cable_Curl` | 3 × 12–15 | 1:00 |  |

**Legs B · objętość**

| # | Plan | exercise_id | Serie × powt. | Przerwa | Uwaga |
|---|---|---|---|---|---|
| 1 | Front Squat | `Front_Barbell_Squat` | 4 × 6–10 | 2:30 |  |
| 2 | 🔁 Bulgarian Split Squat | `Split_Squat_with_Dumbbells` | 3 × 8–12 | 2:00 | na nogę |
| 3 | Leg Extension | `Leg_Extensions` | 4 × 12–20 | 1:30 |  |
| 4 | Seated Leg Curl | `Seated_Leg_Curl` | 4 × 12–15 | 1:30 |  |
| 5 | Hip Thrust | `Barbell_Hip_Thrust` | 3 × 8–12 | 2:00 |  |
| 6 | Calf Press | `Calf_Press` | 4 × 12–15 | 1:00 |  |
