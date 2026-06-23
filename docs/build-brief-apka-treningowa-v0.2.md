# Build Brief v0.2: Osobista apka treningowa (web · PWA)

**Dla:** Claude Code  ·  **Wersja:** 0.2  ·  **Zmiany vs 0.1:** naprawione 3 blokery, poprawki schematu, jednostki, konkretny seed FBW.

---

## Changelog 0.1 → 0.2

- **Blocker:** zdefiniowane konkretne programy FBW 2× i 3× (sekcja 5), zamiast „app sobie wymyśli".
- **Blocker:** pełne offline wyjęte z Phase 1 → online-first + optimistic UI + lekka kolejka; full offline jako osobny pass (sekcja 6).
- **Blocker:** dodane `unit_system` i `exercise_type` (weighted / bodyweight / timed) + osobne liczenie progresu per typ (sekcje 3, 8).
- **Fix:** `superset_group`, `rest_seconds`, rozbite `target_reps_min/max` już w schemie.
- **Fix:** PR-y w osobnej tabeli `personal_records` (przeliczane), zamiast kłamliwego boola na secie.
- **Fix:** `movement_pattern` ortogonalny do `mechanic`.
- **Fix:** fallback silnika podmiany przy zero kandydatów; słownik sprzętu 1:1 z free-exercise-db.
- **Fix:** edycja/usuwanie serii i sesji w Phase 1; flow freestyle; spike na rest timer w tle (iOS).

---

## 1. Kontekst i cel

Osobiste, **webowe**, **mobile-first** narzędzie do treningów siłowych (telefon na siłowni). Pamięta dane, liczy progres, ma gotowe programy FBW i bazę ćwiczeń z **podmianą** przy braku sprzętu.

Jeden użytkownik na start, ale schema i auth od początku pod multi-user / white-label (`user_id` wszędzie). **Buduj fazami** (sekcja 6), stop na review po Phase 0 i po Phase 1.

---

## 2. Stack i ograniczenia

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Supabase**: Postgres + Auth + Storage. **Auth przez `@supabase/ssr`** (stare `auth-helpers` zdeprecjonowane). Migracje DB przez **Supabase migrations**, nie ad-hoc SQL.
- Hosting: **Vercel**
- **PWA**: instalowalna. Zweryfikuj aktualny tooling pod App Router (Serwist zamiast porzuconego next-pwa).
- **Design-token-first** (sekcja 7).

---

## 3. Model danych (Postgres)

**`user_settings`**
`user_id`, `unit_system` (kg | lbs), `default_rest_seconds`, `bar_weight` (do plate calc), `available_plates` (numeric[]).

**`exercises`** (seed z free-exercise-db, sekcja 11)
`id`, `name`, `force`, `level`, `mechanic` (compound | isolation), `equipment`, `primary_muscles` (text[]), `secondary_muscles` (text[]), `category`, `instructions` (text[]), `images` (text[]),
`movement_pattern` (enum: **push | pull | squat | hinge | lunge | carry | core** — ortogonalny do `mechanic`, sekcja 11),
`exercise_type` (enum: **weighted | bodyweight | timed** — steruje logiką loggera i progresu).

**`programs`**: `id`, `name`, `description`, `days_per_week` (2 | 3), `is_default` (bool), `user_id` (null = seed systemowy).
**`program_days`**: `id`, `program_id`, `label`, `order`.
**`program_day_slots`**: `id`, `program_day_id`, `default_exercise_id`, `order`, `target_sets`, **`target_reps_min`** (int), **`target_reps_max`** (int), **`rest_seconds`**, **`superset_group`** (nullable), `notes`.

**`user_active_program`**: `user_id`, `program_id`.

**`sessions`**: `id`, `user_id`, `program_day_id` (nullable → freestyle), `date`, `started_at`, `finished_at`, `notes`.
**`session_exercises`**: `id`, `session_id`, `slot_id` (nullable, ref slot), `exercise_id` (faktycznie wykonane), `order`, **`superset_group`** (nullable).
**`session_sets`**: `id`, `session_exercise_id`, `set_index`, `set_type` (warmup | working | drop), `weight` (nullable), `reps` (nullable), `duration_seconds` (nullable), `added_weight` (nullable, do bodyweight+obciążenie), `rpe` (nullable), `completed` (bool).

**`personal_records`**: `id`, `user_id`, `exercise_id`, `record_type` (max_weight | max_e1rm | max_reps | max_duration), `value`, `reps_context` (nullable), `achieved_at`, `session_set_id`.

> **Decyzja 1 (z 0.1, zostaje):** `session_exercises` trzyma `slot_id` + `exercise_id`. Progres slotu liczymy niezależnie od podmiany; historię per ćwiczenie po `exercise_id`.
> **Decyzja 2:** PR-y **nie** są boolem na secie. Przeliczane do `personal_records` przy zapisie/edycji/usunięciu sesji, żeby edycja błędnej serii nie zostawiała fałszywego PR.

RLS po `user_id` na wszystkich tabelach z danymi usera.

---

## 4. Silnik podmiany ćwiczeń

Cel: brak sprzętu → user wybiera zamiennik, progres mapuje się do slotu (`exercise_id` zmienia się, `slot_id` zostaje).

**Kandydaci dla slotu:**
1. `movement_pattern` zgodny + część wspólna `primary_muscles`.
2. Filtr sprzętu (dostępny sprzęt z profilu / wyboru przy sesji).
3. Ranking: `mechanic` match > pokrycie `secondary_muscles` > `level`.

**Fallback przy zero kandydatów** (obowiązkowy): rozluźnij filtr stopniowo — pattern-only → primary-muscle-only → pokaż wszystko z dostępnym sprzętem i ostrzeżeniem „brak ścisłego dopasowania". Nigdy pusta lista.

**Słownik sprzętu = enum free-exercise-db 1:1:** `barbell, dumbbell, kettlebells, cable, machine, body only, bands, medicine ball, exercise ball, e-z curl bar, foam roll, other`. Profil sprzętu to multi-select z tej listy.

> **Ostrzeżenie (audyt Fitbod):** podmiana to ręczny override „na dziś", nie algorytm narzucający zmiany. Szablon zostaje stały.

---

## 5. Programy na start (seed) — KONKRET

Wspólne zasady: working sets poniżej (bez serii rozgrzewkowych). **RIR 1-2 na compoundach, bez chodzenia do failure** (regeneracja pod kickboxing). Rest: 2-3 min compound, 1-2 min isolation/core. Progresja: dobij górę zakresu powtórzeń we wszystkich seriach → dołóż ciężar. Każdy slot ma domyślne ćwiczenie; reszta wariantów leci przez silnik podmiany.

### Program A — FBW 2×/tydzień (warianty A/B)

**Dzień A (squat / push lean)**
| Slot | Domyślne ćwiczenie | Sety × powt. | movement_pattern |
|---|---|---|---|
| 1 | Back Squat (lub Goblet Squat) | 3 × 8-10 | squat |
| 2 | Barbell / DB Bench Press | 3 × 8-12 | push |
| 3 | One-Arm DB Row | 3 × 10-12 | pull |
| 4 | DB Shoulder Press | 3 × 10-12 | push |
| 5 | Plank | 3 × 30-45 s | core |

**Dzień B (hinge / pull lean)**
| Slot | Domyślne ćwiczenie | Sety × powt. | movement_pattern |
|---|---|---|---|
| 1 | Romanian Deadlift | 3 × 8-10 | hinge |
| 2 | Pull-up (lub Lat Pulldown) | 3 × 6-10 | pull |
| 3 | Incline DB Press (lub Push-up) | 3 × 10-12 | push |
| 4 | Walking Lunge (lub Split Squat) | 3 × 10 / nogę | lunge |
| 5 | Hanging Knee Raise | 3 × max | core |

### Program B — FBW 3×/tydzień (warianty A/B/C)

**Dzień A (push lean)**
| Slot | Domyślne ćwiczenie | Sety × powt. | pattern |
|---|---|---|---|
| 1 | Back Squat | 3 × 6-8 | squat |
| 2 | Barbell Bench Press | 3 × 8-10 | push |
| 3 | One-Arm DB Row | 3 × 10-12 | pull |
| 4 | DB Shoulder Press | 3 × 10-12 | push |
| 5 | Plank | 3 × 40 s | core |

**Dzień B (pull lean)**
| Slot | Domyślne ćwiczenie | Sety × powt. | pattern |
|---|---|---|---|
| 1 | Deadlift (lub RDL 3×8) | 3 × 5 | hinge |
| 2 | Pull-up (lub Lat Pulldown) | 3 × 6-10 | pull |
| 3 | Incline DB Press | 3 × 10-12 | push |
| 4 | Face Pull (lub Rear Delt Raise) | 3 × 12-15 | pull |
| 5 | Hanging Knee Raise | 3 × max | core |

**Dzień C (legs / mixed lean)**
| Slot | Domyślne ćwiczenie | Sety × powt. | pattern |
|---|---|---|---|
| 1 | Front Squat (lub Goblet Squat) | 3 × 8-10 | squat |
| 2 | Romanian Deadlift | 3 × 8-10 | hinge |
| 3 | Bulgarian Split Squat (lub Walking Lunge) | 3 × 10 / nogę | lunge |
| 4 | DB Bench Press (lub OHP) | 3 × 10-12 | push |
| 5 | Cable Row (lub DB Row) | 3 × 10-12 | pull |

User wybiera aktywny program (2× lub 3×). Seed jako `is_default = true`, `user_id = null`.

---

## 6. Funkcje wg priorytetu + roadmapa

**Phase 0 — Fundament** → stop na review
Schema + migracje + RLS · seed bazy + oba programy · Supabase Auth (jedno konto, login bez signup flow) · design tokens + theme · app shell · konfiguracja PWA · **spike: rest timer w tle na iOS PWA** (sekcja 9, ryzyko).

**Phase 1 — Rdzeń (usable MVP)** → stop na review
Wybór programu → start sesji → **logger**:
- wiersze serii: `set# | poprzedni wynik | kg/lbs | powt. (lub czas) | ✓`, pola zależne od `exercise_type`
- **inline „poprzedni wynik"** (ostatni working set tego slotu/ćwiczenia)
- rest timer auto po ✓ (z `rest_seconds` slotu, override per user)
- typy serii (warmup/working)
- **edycja i usuwanie serii oraz całych sesji** (mistype na siłowni to norma)
- zapis sesji + historia
- **freestyle session**: start bez programu (`program_day_id = null`), dodajesz ćwiczenia z bazy ad hoc
- dane: online-first + optimistic UI + lekka kolejka retry (BEZ pełnego offline mirror)

**Phase 2 — Głębia**
Silnik podmiany + filtr sprzętu · dashboard progresu (sekcja 8) · widok exercise-first · plate calculator (z `bar_weight` + `available_plates`) · supersety (`superset_group`) · RPE · **hint progresji** („ostatnio 60 kg w pełnym zakresie → spróbuj 62.5").

**Phase 2.5 — Offline hardening** (osobno, bo trudne)
Local store (IndexedDB) + sync queue + reconcyliacja. Dopiero gdy rdzeń stabilny.

**Phase 3 — Docelowo**
Builder własnych treningów (własne `programs` / `days` / `slots`) · więcej domyślnych programów (PPL, Upper/Lower) · metryki ciała.

---

## 7. UI/UX i design tokens

- **Mobile-first PWA.** Duże tap-targety, log/✓/timer w zasięgu kciuka.
- **Logger w stylu BEASTLY/Strong**, ikona podmiany w nagłówku ćwiczenia, banner rest timera.
- **Inline poprzedni wynik** zawsze przy serii.

**Warstwowanie tokenów (do dopięcia przed pierwszym komponentem):**
`primitive` (raw: paleta, skala spacingu) → `semantic` (np. `--color-surface`, `--color-accent`, `--space-md`) → **zmienne shadcn (HSL) czytają z warstwy semantycznej**, nie żyją obok → Tailwind config mapuje na te zmienne.
Jedno źródło prawdy, white-label = podmiana warstwy semantic. Komponenty czytają wyłącznie semantic, zero magic numbers. (Tę warstwę pewnie wolisz rozpisać sam — to Twój teren.)

---

## 8. Progres (per `exercise_type`)

- **weighted:** e1RM (Epley `weight × (1 + reps/30)`), objętość = Σ(`weight × reps`), PR = max ciężaru @ powt. oraz max e1RM.
- **bodyweight:** progres po `reps` (i `added_weight` jeśli jest), PR = max powt. lub max dodanego obciążenia.
- **timed:** progres po `duration_seconds`, PR = max czas.
- **Tygodniowy bilans serii na partię** (po `primary_muscles`) — kontrola pokrycia FBW.

---

## 9. Ryzyka i spike'i

- **Rest timer w tle (iOS PWA) jest zawodny.** To główny scenariusz (iPhone w kieszeni). Zweryfikuj w Phase 0 zanim zbudujesz wokół tego UX. Fallback: alarm in-app + dźwięk + wibracja gdy app aktywna; nie polegaj na background push.
- **e1RM bez sensu dla bodyweight/timed** — dlatego rozgałęzienie po `exercise_type`.

---

## 10. Acceptance criteria

**Phase 0:** migracje przechodzą · seed ładuje ćwiczenia + oba programy · login działa · spike rest-timer ma werdykt (działa / fallback).
**Phase 1:** przełączanie 2×/3× · start sesji tworzy `session_exercises` ze slotów · widoczny poprzedni wynik · rest timer startuje po ✓ · edycja/usuwanie serii i sesji działa · freestyle działa · sesja w historii · brak hardkodów stylów.
**Phase 2:** podmiana zwraca trafnych kandydatów i ma fallback · dashboard pokazuje e1RM/objętość/PR/serie-na-partię · plate calc liczy z konfiguracji · widok exercise-first agreguje po `exercise_id`.

---

## 11. Out of scope

Social feed · AI auto-programming · macro/nutrition · wearables/HRV · apki natywne · monetyzacja.

---

## 12. Notatki techniczne (seed)

**Baza:** `free-exercise-db` (yuhonas, public domain, ~800 ćwiczeń, JSON). Pola mapują się na schema. Obrazki: prefiks `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/`.
- Skrypt seedujący: ingest JSON → `exercises`.
- **`exercise_type`**: wyprowadź z `equipment` (`body only` → bodyweight; plank/hold → timed; reszta → weighted) + mapa nadpisań dla wyjątków.
- **`movement_pattern`**: heurystyka z `force` + `category`, a dla głównych compoundów (squat/hinge/press/row/pull/lunge) ręczna mapa nadpisań. Od tego zależy jakość podmiany.
- Dopasuj nazwy ćwiczeń z seedu FBW (sekcja 5) do realnych `id` z datasetu przy seedowaniu slotów.

---

*Buduj fazami. Stop po Phase 0 i po Phase 1 przed dalszym dokładaniem.*
