# Prompty: zdjęcia 16 ćwiczeń z placeholderem (2×16 = 32 ujęcia)

> **Data:** 2026-07-18 · **Baza stylu:** `prompt-fotografia-warm.md` (grade Arco Warm) — **zaadaptowana pod DEMONSTRACJĘ ćwiczenia**, nie pod okładkę editorial. · **Cel:** domknąć 16 ćwiczeń używających placeholdera (45 slotów programów) przed H2 — Z3 (podmiana) i podgląd ćwiczenia nie mogą trafiać na pustkę.
> **Konwencja (jak reszta biblioteki, free-exercise-db):** każde ćwiczenie = **2 zdjęcia**: `0.jpg` = pozycja startowa, `1.jpg` = faza końcowa/napięcie. Nazwy plików = **folder = dokładny klucz ćwiczenia** (poniżej), np. `Ab_Wheel_Rollout/0.jpg`, `Ab_Wheel_Rollout/1.jpg`.
> **⚠️ Wiring wymaga zmiany danych, nie tylko uploadu.** Te 16 ma dziś w `scripts/data/exercises.json` pole `images: ['/exercise-placeholder.svg']` (jeden placeholder). Żeby zadziałały realne zdjęcia, trzeba: (a) wgrać 2 pliki do bucketa, (b) **przepiąć `exercises.json`** dla każdego z 16 na `['<Klucz>/0.jpg','<Klucz>/1.jpg']`, (c) re-seed/sync, żeby DB dostała nowe URL-e. Szczegóły w sekcji „Po wygenerowaniu". Zostaw placeholder do czasu, aż zdjęcia będą gotowe (lepszy niż złamany link).

## ⚠️ Decyzja stylistyczna (przeczytaj przed generacją)

Reszta biblioteki (~890 zdjęć z free-exercise-db) to **czyste zdjęcia demonstracyjne** na jednolitym, neutralnym tle — forma czytelna, obie pozycje widoczne. Editorial-okładki z `prompt-fotografia-warm.md` (candid, wzrok w bok, motion blur) **NIE nadają się do ćwiczeń** — utrudniają odczyt formy i będą się gryzły z tymi 890.

**Wybrany kierunek (prompty niżej):** demonstracja na **ciepłym-neutralnym tle** — czysto i instruktażowo jak biblioteka, ale w palecie Arco Warm (krem/ciepła czerń/ślad terakoty) + delikatne, ledwo widoczne ziarno. To sweet spot: czyta się jak instrukcja, „pachnie" marką, nie kłóci się drastycznie z resztą.
- Jeśli wolisz pełny retro-editorial (jak okładki) — odradzam dla ćwiczeń (spójność + czytelność formy). To osobna decyzja [Ty].
- **Spójność serii najważniejsza:** wygeneruj 1 ujęcie jako **style anchor** (ten sam model, to samo tło/światło) i resztę z `--sref`/`--seed`. 16 ćwiczeń ma wyglądać jak jedna sesja, nie 16 różnych.

## Master prompt (EN — wklej + dopisz linię pozycji z każdego ćwiczenia)

```
clean studio exercise-demonstration photograph, one athletic person shown full body performing the exercise with correct textbook form,
plain seamless warm-cream background (soft #F6F2ED), soft even frontal lighting, gentle warm color grade, very subtle fine film grain,
plain athletic wear in cream or warm grey, no logos no bright colors, realistic healthy trained physique, calm neutral face,
camera angle (side or three-quarter) chosen so the working joints and the whole movement are clearly visible, sharp focus, full body and equipment in frame,
identical framing, distance and lighting across the whole set, muted warm palette — cream, warm black, faint terracotta accent,
no text, no watermark, no logo, no motion blur, no dramatic shadows, no busy background, no visible weight numbers or labels on plates or dumbbells
--ar 4:5 --style raw
```

**Negative / unikać:** `text, watermark, logo, neon, HDR, oversharpened, studio flash glare, bodybuilder posing, influencer posing, busy gym background, mirrors, motion blur, blue/cold tones, duotone, visible weight numbers or unit labels`

**Format/eksport/nazwy:** generuj 4:5, eksport ≤200 KB WebP/AVIF (wzorzec z landingu); folder = klucz ćwiczenia, pliki `0.jpg` (start) i `1.jpg` (koniec).

---

## 16 ćwiczeń — po dwie pozycje

Do każdej pozycji: **master prompt + poniższa linia**. Widok (side/¾/front) dobrany pod czytelność mięśnia docelowego.

### 1. Ab Wheel Rollout — `Ab_Wheel_Rollout` *(brzuch)*
- **`0.jpg` start:** `side view, kneeling on a pad, holding an ab wheel under the shoulders, back neutral, upright starting position`
- **`1.jpg` koniec:** `side view, rolled fully forward, arms and torso extended low and near parallel to the floor, hips tucked and NOT sagging, deep core brace`

### 2. Band Lat Pulldown — `Band_Lat_Pulldown` *(plecy / lats)*
- **`0.jpg` start:** `three-quarter front view, kneeling and facing a resistance band anchored above head height, arms extended straight up gripping the band slightly wider than shoulders, ribs down`
- **`1.jpg` koniec:** `three-quarter front view, band pulled down to the upper chest, elbows driven down and back, lats contracted, torso upright`

### 3. Bulgarian Split Squat — `Bulgarian_Split_Squat` *(uda / czworogłowy, hantle)*
- **`0.jpg` start:** `side view, split stance with rear foot resting on a bench, a dumbbell in each hand at the sides, torso upright, standing start`
- **`1.jpg` koniec:** `side view, lowered into the split squat, front thigh roughly parallel to the floor, rear knee near the ground, torso upright, dumbbells hanging`

### 4. Chest-Supported Dumbbell Row — `Chest-Supported_Dumbbell_Row` *(środkowe plecy, hantle)*
- **`0.jpg` start:** `three-quarter rear view, lying chest-down on a 30-45 degree incline bench, both arms hanging straight down holding dumbbells, palms facing each other`
- **`1.jpg` koniec:** `three-quarter rear view, dumbbells rowed up, elbows pulled back and up, shoulder blades squeezed together, chest still supported on the bench`

### 5. Copenhagen Plank — `Copenhagen_Plank` *(przywodziciele, masa ciała, izometria)*
- **`0.jpg` start:** `side view, lying on one side, forearm on the floor, the top foot resting on a bench, hips still low, setup position`
- **`1.jpg` koniec:** `side view, hips and bottom leg lifted so the whole body forms a straight line, supported only by the forearm and the top leg on the bench, strong plank`

### 6. Dumbbell Hip Thrust — `Dumbbell_Hip_Thrust` *(pośladki, hantel)*
- **`0.jpg` start:** `side view, upper back against a bench, feet planted hip-width, a single dumbbell resting across the hips, hips low, seated start`
- **`1.jpg` koniec:** `side view, hips driven up until torso and thighs are level (tabletop), glutes squeezed, chin slightly tucked, dumbbell across the hips`

### 7. Hanging Knee Raise — `Hanging_Knee_Raise` *(brzuch, masa ciała)*
- **`0.jpg` start:** `front view, hanging from a pull-up bar with an overhand grip, body straight and still, dead hang start`
- **`1.jpg` koniec:** `front view, knees raised up toward the chest, pelvis tilted at the top, core braced, hanging from the bar`

### 8. Hollow Body Hold — `Hollow_Body_Hold` *(brzuch, izometria)*
- **`0.jpg` start:** `side view, lying flat on the back on a mat, arms overhead, legs down, lower back pressed into the floor, setup`
- **`1.jpg` koniec:** `side view, shoulder blades and straight legs lifted off the floor, arms extended overhead, body in a shallow banana/hollow shape, lower back still pressed down`

### 9. L-Sit Hold — `L-Sit_Hold` *(brzuch, izometria)*
- **`0.jpg` start:** `side view, supporting body weight on two low parallettes with arms locked straight, legs still tucked/bent under, setup`
- **`1.jpg` koniec:** `side view, both legs extended straight forward and held parallel to the floor forming an L, arms locked, shoulders depressed`

### 10. Nordic Hamstring Curl — `Nordic_Hamstring_Curl` *(dwugłowe uda, masa ciała)*
- **`0.jpg` start:** `side view, kneeling upright on a pad with ankles anchored under a bar, hips extended, straight line from knees to head, tall start`
- **`1.jpg` koniec:** `side view, torso lowered forward toward the floor under control, straight rigid line from knees to head, hamstrings resisting, hands ready to catch`

### 11. Overhead Cable Triceps Extension — `Overhead_Cable_Triceps_Extension` *(triceps, wyciąg)*
- **`0.jpg` start:** `three-quarter view, facing away from a cable stack holding a rope overhead, elbows bent and pointing forward, staggered stance, torso leaning slightly forward, stretched start`
- **`1.jpg` koniec:** `three-quarter view, arms extended fully overhead and forward, triceps contracted, elbows staying high and close, staggered stance`

### 12. Pike Push-Up — `Pike_Push-Up` *(barki, masa ciała)*
- **`0.jpg` start:** `side view, inverted-V pike position, hips high, hands and feet on the floor, arms straight, head between the arms, top position`
- **`1.jpg` koniec:** `side view, elbows bent, top of the head lowered toward the floor between the hands, hips still high, bottom of the pike push-up`

### 13. Reverse Nordic Curl — `Reverse_Nordic_Curl` *(czworogłowy uda, masa ciała)*
- **`0.jpg` start:** `side view, kneeling upright on a pad, knees hip-width, torso vertical, arms extended in front, tall start`
- **`1.jpg` koniec:** `side view, leaning back slowly with a straight rigid line from knees to head, glutes squeezed, quadriceps stretched, controlled end range`

### 14. Single-Leg Hip Thrust — `Single-Leg_Hip_Thrust` *(pośladki, masa ciała)*
- **`0.jpg` start:** `side view, upper back on a bench, one foot planted, the other leg extended out, hips low, single-leg seated start`
- **`1.jpg` koniec:** `side view, hips driven up on the single planted leg until torso and thigh form a straight line, the free leg still extended in line with the body, glutes squeezed`

### 15. Single-Leg Calf Raise — `Single_Leg_Calf_Raise` *(łydki, masa ciała)*
- **`0.jpg` start:** `side view, standing on one leg near a wall with a fingertip on it for balance, working knee straight, heel lowered below the step for a calf stretch, bottom position`
- **`1.jpg` koniec:** `side view, risen high onto the ball of the foot, heel lifted as far as possible, calf fully contracted, one leg, fingertip balance`

### 16. Tibialis Raise — `Tibialis_Raise` *(przednia goleń / piszczel)*
- **`0.jpg` start:** `side view, standing with back and hips against a wall, feet about a foot forward, toes and forefeet down on the floor, relaxed start`
- **`1.jpg` koniec:** `side view, heels staying on the floor, toes and forefeet lifted as high as possible toward the shins, tibialis (front of shin) contracted, back against the wall`

---

## Po wygenerowaniu (workflow)

1. Wygeneruj **style anchor** (np. Bulgarian Split Squat `1.jpg` — czytelny, reprezentatywny), zatwierdź grade.
2. Z anchora (`--sref`/seed) → reszta 31 ujęć, batchem, ten sam model/tło/światło.
3. Nazwij i ułóż jak w backupie źródłowym: `../free-exercise-db/exercises/<Klucz>/0.jpg` i `.../1.jpg` (klucze dokładnie jak nagłówki — z podkreśleniami i myślnikami).
4. **Przepnij dane:** w `scripts/data/exercises.json` zmień dla każdego z 16 `images: ['/exercise-placeholder.svg']` → `['<Klucz>/0.jpg', '<Klucz>/1.jpg']`. *(To mogę zrobić ja hurtem, gdy zdjęcia będą gotowe — mechaniczna zmiana danych, mam listę kluczy.)*
5. **Upload + sync:** `CONFIRM_REMOTE_UPLOAD=exercise-images npm run upload:exercise-images` (wgra nowe pliki do bucketa) + `sync-exercise-content` albo re-seed, żeby DB dostała nowe URL-e. **Prod push/sync robi [Ty]** (klasyfikator blokuje agentom prod).
6. Weryfikacja: `npm run validate:training` → **0 placeholderów** (dziś 16/45) + rzut oka w pickerze/detalu, że obie pozycje się ładują.
