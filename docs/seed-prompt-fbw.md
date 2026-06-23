# Seed Prompt: Programy FBW → realne free-exercise-db ID

**Dla:** Claude Code (uzupełnienie do `build-brief-apka-treningowa-v0.2.md`, sekcja 5 i 11)
**Cel:** zaseedować 2 programy z dokładnymi slotami. `default_exercise_id` to **zweryfikowane** ID z datasetu (sprawdzone na `dist/exercises.json`, 873 ćwiczenia), więc nie zgaduj dopasowań.

---

## Instrukcja wykonania

1. Najpierw zaseeduj `exercises` z całego `free-exercise-db` (sekcja 11 briefu).
2. Następnie utwórz 2 rekordy `programs`, ich `program_days` i `program_day_slots` wg tabel niżej.
3. Dla każdego slotu ustaw `default_exercise_id` na podane ID. Jeśli Twoja wersja datasetu nie ma danego ID, dopasuj po `name` (kolumna „Ćwiczenie") i zaloguj ostrzeżenie.
4. Na ćwiczeniach użytych jako default ustaw `movement_pattern` i `exercise_type` zgodnie z tabelą (nadpisuje heurystykę z sekcji 11, bo to kluczowe lifty).
5. `target_reps_min/max = null` oznacza AMRAP lub czas. Dla `timed` (Plank) target trzymaj w `notes`.
6. Kolumna „Alt" to tylko podpowiedź dla Ciebie, jak działa silnik podmiany. **Nie** twórz z niej osobnych slotów.

Reps „/nogę" zapisz jako `notes`, wartość w `target_reps_*` to liczba na nogę.

---

## Program 1: „FBW 2× / tydzień"  (`days_per_week = 2`)

### Dzień „FBW 2x · A" (squat / push lean)
| # | default_exercise_id | Ćwiczenie | type | sets | reps_min | reps_max | rest_s | pattern | Alt |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `Barbell_Squat` | Barbell Squat | weighted | 3 | 8 | 10 | 150 | squat | `Goblet_Squat` |
| 2 | `Barbell_Bench_Press_-_Medium_Grip` | Barbell Bench Press | weighted | 3 | 8 | 12 | 150 | push | `Dumbbell_Bench_Press` |
| 3 | `One-Arm_Dumbbell_Row` | One-Arm Dumbbell Row | weighted | 3 | 10 | 12 | 120 | pull | `Seated_Cable_Rows` |
| 4 | `Dumbbell_Shoulder_Press` | Dumbbell Shoulder Press | weighted | 3 | 10 | 12 | 120 | push | — |
| 5 | `Plank` | Plank | timed | 3 | — | — | 60 | core | notes: 30-45 s |

### Dzień „FBW 2x · B" (hinge / pull lean)
| # | default_exercise_id | Ćwiczenie | type | sets | reps_min | reps_max | rest_s | pattern | Alt |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `Romanian_Deadlift` | Romanian Deadlift | weighted | 3 | 8 | 10 | 150 | hinge | `Barbell_Deadlift` |
| 2 | `Pullups` | Pull-up | bodyweight | 3 | 6 | 10 | 150 | pull | `Full_Range-Of-Motion_Lat_Pulldown` |
| 3 | `Incline_Dumbbell_Press` | Incline Dumbbell Press | weighted | 3 | 10 | 12 | 120 | push | `Pushups` |
| 4 | `Bodyweight_Walking_Lunge` | Walking Lunge | bodyweight | 3 | 10 | 10 | 120 | lunge | `Dumbbell_Lunges` · notes: na nogę |
| 5 | `Hanging_Leg_Raise` | Hanging Leg Raise | bodyweight | 3 | — | — | 90 | core | notes: AMRAP |

---

## Program 2: „FBW 3× / tydzień"  (`days_per_week = 3`)

### Dzień „FBW 3x · A" (push lean)
| # | default_exercise_id | Ćwiczenie | type | sets | reps_min | reps_max | rest_s | pattern | Alt |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `Barbell_Squat` | Barbell Squat | weighted | 3 | 6 | 8 | 180 | squat | `Goblet_Squat` |
| 2 | `Barbell_Bench_Press_-_Medium_Grip` | Barbell Bench Press | weighted | 3 | 8 | 10 | 150 | push | `Dumbbell_Bench_Press` |
| 3 | `One-Arm_Dumbbell_Row` | One-Arm Dumbbell Row | weighted | 3 | 10 | 12 | 120 | pull | `Seated_Cable_Rows` |
| 4 | `Dumbbell_Shoulder_Press` | Dumbbell Shoulder Press | weighted | 3 | 10 | 12 | 120 | push | — |
| 5 | `Plank` | Plank | timed | 3 | — | — | 60 | core | notes: 40 s |

### Dzień „FBW 3x · B" (pull lean)
| # | default_exercise_id | Ćwiczenie | type | sets | reps_min | reps_max | rest_s | pattern | Alt |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `Barbell_Deadlift` | Deadlift | weighted | 3 | 5 | 5 | 180 | hinge | `Romanian_Deadlift` |
| 2 | `Pullups` | Pull-up | bodyweight | 3 | 6 | 10 | 150 | pull | `Full_Range-Of-Motion_Lat_Pulldown` |
| 3 | `Incline_Dumbbell_Press` | Incline Dumbbell Press | weighted | 3 | 10 | 12 | 120 | push | `Pushups` |
| 4 | `Face_Pull` | Face Pull | weighted | 3 | 12 | 15 | 90 | pull | `Reverse_Flyes` |
| 5 | `Hanging_Leg_Raise` | Hanging Leg Raise | bodyweight | 3 | — | — | 90 | core | notes: AMRAP |

### Dzień „FBW 3x · C" (legs / mixed lean)
| # | default_exercise_id | Ćwiczenie | type | sets | reps_min | reps_max | rest_s | pattern | Alt |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `Front_Barbell_Squat` | Front Squat | weighted | 3 | 8 | 10 | 150 | squat | `Goblet_Squat` |
| 2 | `Romanian_Deadlift` | Romanian Deadlift | weighted | 3 | 8 | 10 | 150 | hinge | `Barbell_Deadlift` |
| 3 | `Split_Squat_with_Dumbbells` | Split Squat (DB) | weighted | 3 | 10 | 10 | 120 | lunge | `Bodyweight_Walking_Lunge` · notes: na nogę |
| 4 | `Dumbbell_Bench_Press` | Dumbbell Bench Press | weighted | 3 | 10 | 12 | 120 | push | `Dumbbell_Shoulder_Press` |
| 5 | `Seated_Cable_Rows` | Seated Cable Row | weighted | 3 | 10 | 12 | 120 | pull | `One-Arm_Dumbbell_Row` |

---

## Uwagi do mapowania

- Dwa ćwiczenia z sekcji 5 briefu nie istniały w datasecie pod oryginalną nazwą i zostały podmienione na realne odpowiedniki: **Bulgarian Split Squat → `Split_Squat_with_Dumbbells`**, **Hanging Knee Raise → `Hanging_Leg_Raise`**.
- `Pullups`, `Pushups`, `Bodyweight_Walking_Lunge`, `Hanging_Leg_Raise` to `exercise_type = bodyweight`. `Plank` to `timed`. Reszta `weighted`.
- Wszystkie podane ID istnieją w `dist/exercises.json` (zweryfikowane). Po seedzie zrób sanity check: każdy slot ma niepuste `default_exercise_id` wskazujące na istniejące ćwiczenie.
