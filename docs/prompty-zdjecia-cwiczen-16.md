# Prompty: zdjęcia instruktażowe — 16 ćwiczeń z placeholderem

> **Data:** 2026-07-17 · **Status po rebaseline:** materiał roboczy. Prompt ani estetyczny
> przegląd nie zatwierdzają techniki. Każda para przed użyciem wymaga zgodności z wariantem,
> źródła/licencji i wersjonowanego review Codex zgodnie z D-37 oraz CONTENT-01–04 w backlogu.
> **Źródło listy:** skan `scripts/data/exercises.json` + presety w `seed.ts`.
> **Styl:** rozszerzenie systemu z `prompt-fotografia-warm.md`, ale to warstwa instruktażowa,
> nie editorial. Pełna wymiana biblioteki nie jest aktywnym sprintem; kolejność ustala
> CONTENT-01–04, a technikę zatwierdza człowiek.
> **Konwencja:** każde ćwiczenie = **2 zdjęcia**: `0` (pozycja startowa) i `1` (pozycja końcowa) — jak w free-exercise-db. Nazewnictwo: `{Exercise_Id}/0.jpg`, `{Exercise_Id}/1.jpg`.

---

## 1. Zasady serii (krytyczne dla spójności)

- **Format `--ar 3:2` poziomo** — istniejąca baza to 850×567 (3:2). Nie 4:3.
- **Dyptyk jako metoda pierwsza:** generuj OBIE fazy w jednym obrazie („two-panel instructional diptych, left panel start position, right panel end position, identical person, outfit, environment and camera in both panels") i tnij na `0`/`1`. To jedyna metoda, która gwarantuje tę samą osobę, światło i grade w parze. `--sref + --seed` / image-to-image traktuj jako fallback, gdy dyptyk psuje anatomię.
- **Stała kamera w całej serii:** `shot from a fixed tripod at hip height, 50mm lens, camera 3 meters from subject` — do base promptu. Bez tego 16 par rozjedzie się perspektywą.
- **Kompozycja pod kwadratowy crop:** miniatura w loggerze to kwadrat 44 px z object-cover (środek kadru). Sylwetka ZAWSZE wycentrowana, z marginesem po bokach; przy pozach poziomych (hip thrust, hollow, copenhagen, ab wheel) ciało ma się mieścić w środkowej ⅔ szerokości kadru. Czytelność techniki projektujemy pod info sheet (pełny kadr), miniatura ma być tylko rozpoznawalna.
- **Widok z boku (side profile)** — wszystkie 16 ruchów jest sagittalnych, bok pokazuje technikę. Dopuszczalny łagodny ¾ gdy bok chowa kluczowy detal (nr 8 — ściągnięcie łopatek).
- **Światło i grade Warm, ekspozycja instruktażowa:** ciepłe światło okienne/wieczorne, delikatne ziarno 35 mm, highlights `#F6F2ED`, cienie `#1E1C1A`, ale równo doświetlona cała sylwetka — bez cieni zjadających technikę.
- **Zero tekstu, logo, liczb na talerzach/hantlach.** Stroje proste (szara/kremowa bawełna).
- **3 scenerie wg sprzętu:** GYM (wolne ciężary/wyciąg), HOME (mieszkanie przy oknie), PARK (street workout). Tła proste i głębokie — bez sprzętowego śmietnika za plecami (kontrast z obecną bazą to zaleta).
- **Persony:** rotuj Kasię i Pawła **między ćwiczeniami, nigdy w obrębie pary**. Praktyczna rada: jedna persona na całą scenerię (np. Kasia HOME, Paweł GYM/PARK) — mniej driftu tożsamości między generacjami.

## 2. Base prompt (EN — doklejaj motyw z §3)

```
analog film photograph, 35mm film, subtle fine grain, warm natural window light,
full-body side view of an athletic adult demonstrating an exercise with precise clean technique,
clear instructional demonstration pose, entire body visible and centered in frame with margin on both sides,
shot from a fixed tripod at hip height, 50mm lens, camera 3 meters from subject,
no motion blur, realistic skin texture, plain grey or cream cotton training clothes, no logos,
muted warm palette — terracotta, cream, warm black — gently desaturated tones,
simple uncluttered background with soft depth,
all equipment plain and unmarked: no weight numbers, units, labels, engravings, logos or readable symbols,
no text, no watermark, no neon, no LED lighting, no influencer posing, no beauty retouching
--ar 3:2 --style raw
```

**Wariant dyptyk:** przed listą cech dodaj `two-panel instructional diptych, left panel: {prompt fazy 0}, right panel: {prompt fazy 1}, identical person, outfit, environment, camera angle and framing in both panels` i generuj w `--ar 3:1`, potem tnij na dwa 3:2.

**Negative (`--no` w MJ / negative prompt w Flux):** `neon, HDR, oversharpened, studio flash, motion blur, cropped limbs, bodybuilder posing, duotone, blue tones, watermark, text, logo, visible weight numbers, mirror selfie, second person, extra fingers, distorted anatomy` (przy dyptyku usuń `second person`).

## 3. Motywy — 16 ćwiczeń × 2 fazy

Sceneria: **GYM** = `in the free-weights area of a clean contemporary gym, matte-black steel equipment, fresh rubber flooring` · **HOME** = `in a bright apartment corner near a large window, wooden floor, simple exercise mat` · **PARK** = `at an outdoor street workout park, plain steel bars, golden hour light`.

### Nogi / pośladki

**1. Bulgarian_Split_Squat** (hantle, GYM)
- `0`: `standing lunge stance with rear foot laces-down on a flat bench behind, holding a dumbbell in each hand at sides, torso upright, front leg nearly straight, top position of a Bulgarian split squat`
- `1`: `deep bottom position of a Bulgarian split squat, rear foot on bench behind, front thigh parallel to floor, rear knee just above floor, dumbbells hanging at sides, torso upright with slight forward lean`

**2. Dumbbell_Hip_Thrust** (hantle, GYM)
- `0`: `upper back resting on a flat bench, feet flat on floor hip-width apart, hips lowered near the floor, both hands steadying a single dumbbell resting horizontally across the hips, bottom position of a hip thrust`
- `1`: `upper back on bench, hips fully extended so torso and thighs form one straight horizontal line, chin tucked, hands steadying the dumbbell on hips, glutes contracted, top position of a hip thrust`

**3. Single-Leg_Hip_Thrust** (bodyweight, HOME)
- `0`: `upper back resting on a low bench, one foot flat on floor, other leg extended straight and raised, hips lowered near floor, arms resting on the bench, bottom position of a single-leg hip thrust`
- `1`: `upper back on bench, hips fully extended on one supporting leg, other leg held straight in line with the torso, chin tucked, top position of a single-leg hip thrust`

**4. Nordic_Hamstring_Curl** (bodyweight, HOME)
- `0`: `kneeling upright on a folded mat, ankles secured under a padded barbell resting low behind the heels, torso vertical, arms crossed on chest, start of a nordic hamstring curl`
- `1`: `same kneeling setup, body leaning far forward as one straight line from knees to head at a low angle, arms reaching toward the floor ready to catch, controlled descent of a nordic hamstring curl`

**5. Reverse_Nordic_Curl** (bodyweight, HOME)
- `0`: `kneeling upright on a mat, shins flat on floor, torso vertical, arms extended forward at shoulder height, start of a reverse nordic curl`
- `1`: `kneeling on mat, entire body leaning backward as one rigid straight line from knees to head at roughly forty-five degrees, arms still extended forward, deep position of a reverse nordic curl`

**6. Single_Leg_Calf_Raise** (bodyweight, HOME)
- `0`: `standing on one foot on the edge of a low sturdy step, heel dropped below the step edge, other foot hooked behind the standing ankle, fingertips lightly touching the wall for balance, stretched bottom position of a single-leg calf raise`
- `1`: `same stance on the step edge, heel raised high onto the ball of the foot, calf fully contracted, fingertips on wall, top position of a single-leg calf raise`

**7. Tibialis_Raise** (bodyweight, HOME)
- `0`: `standing with back and hips leaning against a wall, feet about thirty centimeters in front of the wall, both feet flat on floor, arms relaxed, start of a tibialis raise`
- `1`: `same wall-lean stance, toes and forefeet lifted high toward the shins while heels stay planted, start of a tibialis raise`

### Plecy / barki / ramiona

**8. Chest-Supported_Dumbbell_Row** (hantle, GYM — dopuszczalny ¾ od tyłu w fazie `1`, żeby pokazać łopatki)
- `0`: `lying prone chest-down on an incline bench, arms hanging straight down holding two dumbbells, shoulders relaxed toward the floor, stretched start of a chest-supported dumbbell row`
- `1`: `prone on incline bench, elbows drawn up and back, dumbbells pulled to the sides of the ribcage, shoulder blades squeezed together, top of a chest-supported dumbbell row`

**9. Band_Lat_Pulldown** (guma, HOME)
- `0`: `tall kneeling on a mat facing a resistance band anchored at the top of a closed door, arms fully extended overhead gripping the band, torso upright, start of a band lat pulldown`
- `1`: `tall kneeling, elbows pulled down and back so hands reach upper-chest level, band visibly stretched, shoulder blades pulled down, bottom of a band lat pulldown`

**10. Pike_Push-Up** (bodyweight, HOME)
- `0`: `inverted V pike position on a mat, hips high, legs and arms straight, head between arms looking at the floor, start of a pike push-up`
- `1`: `pike position with elbows bent, top of the head lowered just above the floor between the hands, hips still high, bottom of a pike push-up`

**11. Overhead_Cable_Triceps_Extension** (wyciąg, GYM)
- `0`: `standing facing away from a cable station in a split stance, leaning slightly forward, holding a rope attachment behind the head with elbows bent and pointing forward, stretched start of an overhead cable triceps extension`
- `1`: `same split stance, arms fully extended forward-overhead, rope ends pulled apart, elbows locked, finish of an overhead cable triceps extension`

### Core / zwisy

**12. Hollow_Body_Hold** (bodyweight, HOME)
- `0`: `lying flat on back on a mat, arms extended overhead resting on the floor, legs straight on the floor, relaxed position before a hollow body hold`
- `1`: `hollow body hold on a mat: lower back pressed into the floor, shoulder blades and straight legs lifted off the floor, arms extended overhead, body in a shallow banana curve`

**13. Copenhagen_Plank** (bodyweight, HOME)
- `0`: `lying on one side on a mat next to a flat bench, forearm on floor under the shoulder, top foot resting on the bench, hips resting on the floor, setup for a copenhagen plank`
- `1`: `copenhagen side plank: body in one straight line supported on one forearm, top leg on the bench, bottom leg and hips lifted off the floor`

**14. Ab_Wheel_Rollout** (kółko, HOME)
- `0`: `kneeling on a mat gripping an ab wheel on the floor directly under the shoulders, arms straight, hips over knees, start of an ab wheel rollout`
- `1`: `kneeling ab wheel rollout extended far forward, body in a long straight line from knees to hands, wheel far in front of the head, torso braced just above the floor`

**15. Hanging_Knee_Raise** (drążek, PARK)
- `0`: `dead hang from a plain steel pull-up bar, arms and body fully extended straight down, legs together, start of a hanging knee raise`
- `1`: `hanging from the bar with knees raised to hip height, hips slightly curled under, controlled top of a hanging knee raise`

**16. L-Sit_Hold** (bodyweight, PARK — niskie poręcze / parallettes)
- `0`: `seated on the ground between two low parallettes, hands gripping the bars beside the hips, arms straight, legs extended on the ground, setup for an L-sit`
- `1`: `L-sit hold on low parallettes: arms locked straight, shoulders depressed, hips lifted, legs extended horizontally parallel to the ground, toes pointed`

## 4. Checklist akceptacji pary (przed zapisaniem plików)

1. Anatomia: dłonie/chwyt, kolana, stopy — bez zniekształceń (najczęstsza porażka generatorów w pozach instruktażowych; odrzucaj bez litości).
2. Kluczowa wskazówka techniczna fazy jest WIDOCZNA (np. `2/1`: linia barki–kolano; `4/1`: prosta linia kolana–głowa; `12/1`: lędźwie przy macie).
3. Obie fazy: ta sama osoba, strój, sceneria, kadr (dyptyk to załatwia z definicji).
4. Sprzęt bez cyfr/logo/tekstu.
5. Sylwetka przeżywa kwadratowy center-crop (podgląd: wytnij środkowy kwadrat — czy widać, co to za ćwiczenie?).

## 5. Workflow

1. Para nr 1 (Bulgarian Split Squat) = **style anchor** serii instruktażowej (osobny anchor niż okładki).
2. Batchuj scenerią: GYM (5 par) → HOME (9 par) → PARK (2 pary).
3. Po wygenerowaniu: pliki `{Exercise_Id}/0.jpg`, `/1.jpg` → `npm run upload:exercise-images` (bucket), potem `npm run sync:exercise-content` — **w tej kolejności** (twarda reguła z 2026-07-13). ŻADNEGO re-seeda dla treści; sync jest punktowy.
4. Aktualizacja `images` w `scripts/data/exercises.json` w tej samej paczce, żeby lokalny seed pozostał zgodny z prod.

## 6. Pozostały dług (poza tym zadaniem)

W bazie placeholder mają **34** ćwiczenia; pozostałe 18 (m.in. Pendlay Row, Seal Row, Meadows Row, Z Press, Landmine Press, Kettlebell Swing, Wall Sit, Bird Dog, Toes-To-Bar…) nie występuje w presetach programów — do ogarnięcia później tym samym systemem, gdy pojawią się w wynikach wyszukiwania z realnym ruchem.
