/**
 * Arco — seed bazy (brief sekcja 11/12 + seed-prompt-fbw.md).
 * 1. Ingest free-exercise-db → exercises (z wyprowadzeniem exercise_type / movement_pattern).
 * 2. Bezpieczna synchronizacja kuratorowanych programów z zachowaniem ID dni i slotów.
 *
 * Uruchom: npm run seed   (wymaga lokalnego stacku Supabase + service-role w .env.local)
 */
import { config } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { pathToFileURL } from "node:url";
import rawExercises from "./data/exercises.json";
import polishInstructionOverrides from "./data/exercise-instructions-pl.json";
import polishNames from "./data/exercise-names-pl.json";
import { withNormalizedAliases } from "../lib/exerciseSearch";

config({ path: ".env.local" });

const supabaseImageBase = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
const customImageBase = process.env.EXERCISE_IMAGE_BASE_URL?.replace(/\/+$/, "");
const IMG_PREFIX = customImageBase
  ? `${customImageBase}/`
  : supabaseImageBase
    ? `${supabaseImageBase}/storage/v1/object/public/exercise-images/`
    : "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

export const POLISH_INSTRUCTION_OVERRIDES = polishInstructionOverrides as Record<string, string[]>;

// R5a: zatwierdzony słownik nazw PL + aliasów (docs/r5a-slownik-pl-propozycja.md).
// Seed i migracja 20260717* muszą prowadzić do tego samego stanu — źródłem jest ten JSON.
export const POLISH_NAMES = polishNames as Record<
  string,
  { name_pl: string | null; aliases: string[] }
>;

// Seed obejmuje kilka tabel i celowo nie korzysta z wygenerowanego schematu
// aplikacji. Jawny klient bez schematu zachowuje dotychczasową elastyczność,
// a jednocześnie pozwala bezpiecznie importować czyste transformatory w testach.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SeedClient = SupabaseClient<any>;
let db: SeedClient;

export type MovementPattern = "push" | "pull" | "squat" | "hinge" | "lunge" | "carry" | "core";
export type ExerciseType = "weighted" | "bodyweight" | "timed";

export interface RawExercise {
  id: string;
  name: string;
  force: string | null;
  level: string | null;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  category: string | null;
  instructions: string[];
  images: string[];
}

// ── Uzupełnienia instrukcji (S8: 5 ćwiczeń z pustym `instructions` w upstream) ──
const INSTRUCTION_OVERRIDES: Record<string, string[]> = {
  Iron_Cross: [
    "Hold a dumbbell in each hand at your sides.",
    "Squat down, then stand up while raising both arms out to a T at shoulder height.",
    "Lower the arms and repeat.",
  ],
  "One-Arm_Kettlebell_Swings": [
    "Hinge at the hips and swing the kettlebell back between your legs.",
    "Drive the hips forward to swing it up to shoulder height with one arm, back flat.",
  ],
  Push_Press: [
    "Hold the bar at shoulder height, elbows slightly forward.",
    "Dip a few centimeters at the knees, then drive up explosively and press the bar overhead.",
    "Lower under control and repeat.",
  ],
  Side_Bridge: [
    "Lie on your side and prop yourself on your forearm.",
    "Lift the hips so the body forms a straight line; hold the position.",
  ],
  Side_Jackknife: [
    "Lie on your side with legs stacked, top hand behind your head.",
    "Crunch sideways, bringing the top elbow and top leg toward each other; switch sides.",
  ],
};

// ── Nadpisania dla kluczowych liftów (seed-prompt-fbw.md, nadrzędne nad heurystyką) ──
const TYPE_OVERRIDES: Record<string, ExerciseType> = {
  Plank: "timed",
  Pullups: "bodyweight",
  Bodyweight_Walking_Lunge: "bodyweight",
  "Decline_Push-Up": "bodyweight",
  Inverted_Row: "bodyweight",
  "Scapular_Pull-Up": "bodyweight",
  Hanging_Leg_Raise: "bodyweight",
  Pushups: "bodyweight",
  // Audyt trenerski 2026-07-08: nowe ćwiczenia (equipment ≠ body only, a logują się bez ciężaru)
  Ab_Wheel_Rollout: "bodyweight",
  Spanish_Squat: "bodyweight",
  // "bridge" nie oznacza automatycznie izometrii — warianty pośladkowe są na powtórzenia.
  Butt_Lift_Bridge: "bodyweight",
  Pelvic_Tilt_Into_Bridge: "bodyweight",
  Physioball_Hip_Bridge: "bodyweight",
  Single_Leg_Glute_Bridge: "bodyweight",
  Split_Squats: "bodyweight",
  Side_Bridge: "timed",
};

const PATTERN_OVERRIDES: Record<string, MovementPattern> = {
  Barbell_Squat: "squat",
  Front_Barbell_Squat: "squat",
  Goblet_Squat: "squat",
  "Barbell_Bench_Press_-_Medium_Grip": "push",
  Dumbbell_Bench_Press: "push",
  Incline_Dumbbell_Press: "push",
  Dumbbell_Shoulder_Press: "push",
  Pushups: "push",
  "One-Arm_Dumbbell_Row": "pull",
  Seated_Cable_Rows: "pull",
  Face_Pull: "pull",
  Pullups: "pull",
  "Full_Range-Of-Motion_Lat_Pulldown": "pull",
  Reverse_Flyes: "pull",
  Romanian_Deadlift: "hinge",
  Barbell_Deadlift: "hinge",
  Bodyweight_Walking_Lunge: "lunge",
  Split_Squat_with_Dumbbells: "lunge",
  Dumbbell_Lunges: "lunge",
  Plank: "core",
  Hanging_Leg_Raise: "core",
  // Audyt trenerski 2026-07-08: hip hinge zamiast heurystyki "press/raise → push"
  Barbell_Hip_Thrust: "hinge",
  Dumbbell_Hip_Thrust: "hinge",
  "Single-Leg_Hip_Thrust": "hinge",
  Frog_Pump: "hinge",
  "Cable_Pull-Through": "hinge",
  Kettlebell_Swing: "hinge",
  "One-Arm_Kettlebell_Swings": "hinge",
  // nowe ćwiczenia bez trafnej heurystyki
  Wall_Sit: "squat",
  Reverse_Nordic_Curl: "squat",
  Bird_Dog: "core",
  Hollow_Body_Hold: "core",
  "Toes-To-Bar": "core",
  "L-Sit_Hold": "core",
  Prone_Y_Raise: "pull",
  Side_Bridge: "core",
  Single_Leg_Calf_Raise: "squat",
  Band_Lat_Pulldown: "pull",
};

const TIMED_RE = /\b(plank|hold|wall sit|isometric|l-sit|dead hang)\b/i;

export function deriveExerciseType(ex: RawExercise): ExerciseType {
  if (TYPE_OVERRIDES[ex.id]) return TYPE_OVERRIDES[ex.id];
  if (TIMED_RE.test(ex.name)) return "timed";
  if (ex.equipment === "body only") return "bodyweight";
  return "weighted";
}

// Lekka heurystyka wzorca ruchu — dla silnika podmiany (Phase 2). Kluczowe lifty nadpisane wyżej.
export function deriveMovementPattern(ex: RawExercise): MovementPattern | null {
  if (PATTERN_OVERRIDES[ex.id]) return PATTERN_OVERRIDES[ex.id];
  const n = ex.name.toLowerCase();
  if (/squat/.test(n)) return "squat";
  if (/deadlift|hinge|good morning|rdl|hyperextension|romanian/.test(n)) return "hinge";
  if (/lunge|split squat|step-up|step up/.test(n)) return "lunge";
  if (/carry|farmer/.test(n)) return "carry";
  if (/plank|crunch|sit-up|sit up|leg raise|knee raise|russian twist|ab |oblique|core/.test(n))
    return "core";

  // Dolne partie nie mogą wpadać do ogólnego push/pull przez słowa typu
  // "curl", "extension" lub "raise". Enum jest zgrubny, ale grupowanie
  // squat/hinge daje znacznie trafniejsze podmiany niż upper-body push/pull.
  const primary = new Set(ex.primaryMuscles ?? []);
  if (["hamstrings", "glutes"].some((muscle) => primary.has(muscle))) return "hinge";
  if (["quadriceps", "calves", "adductors", "abductors"].some((muscle) => primary.has(muscle)))
    return "squat";

  // Granice słów są istotne: bez nich "chin" dopasowywało się do "machine"
  // i klasyfikowało np. Machine Bench Press jako pull.
  if (/\b(?:rows?|pull-?ups?|pullups|chin-?ups?|chinups|curls?|pulldowns?|shrugs?)\b|face pull|reverse fly/.test(n))
    return "pull";
  if (/\b(?:press(?:es)?|push-?ups?|pushups|dips?|bench|fly(?:es)?|extensions?|raises?|jerks?)\b/.test(n))
    return "push";

  // Ostatni bezpieczny fallback oparty na partii głównej. Dzięki temu rzadkie
  // nazwy własne (np. Superman, Crucifix) nie zostają bez wzorca.
  if (primary.has("abdominals") || primary.has("neck")) return "core";
  if (primary.has("lower back")) return "hinge";
  if (["lats", "middle back", "traps", "biceps", "forearms"].some((muscle) => primary.has(muscle)))
    return "pull";
  if (["chest", "shoulders", "triceps"].some((muscle) => primary.has(muscle))) return "push";
  if (ex.force === "pull") return "pull";
  if (ex.force === "push") return "push";
  return null;
}

// ── Kuracja bazy (audyt trenerski 2026-07-08 = Stopień 1 z docs/audyt-bazy-cwiczen.md + przestarzałe) ──
// hidden = ukryte w browse/chipach pickera i w swap engine; search po nazwie NADAL znajduje wszystko.
const HIDDEN_CATEGORIES = new Set(["stretching", "cardio"]);
// Przestarzałe/kontuzjogenne (behind-the-neck, guillotine, ładowana rotacja kręgosłupa).
const OUTDATED_HIDDEN_IDS = new Set([
  "Barbell_Guillotine_Bench_Press",
  "Neck_Press",
  "Standing_Barbell_Press_Behind_Neck",
  "Push_Press_-_Behind_the_Neck",
  "Wide-Grip_Pulldown_Behind_The_Neck",
  "Rocky_Pull-Ups_Pulldowns",
  "Bradford_Rocky_Presses",
  "Seated_Barbell_Twist",
]);
// Błędna kategoria upstream (stretching), a realnie logowalne — zostają widoczne.
const MISCATEGORIZED_VISIBLE = new Set([
  "Superman",
  "Crossover_Reverse_Lunge",
  "Split_Squats",
  "Pelvic_Tilt_Into_Bridge",
  "Scissor_Kick",
]);

export function deriveHidden(ex: RawExercise): boolean {
  if (MISCATEGORIZED_VISIBLE.has(ex.id)) return false;
  if (OUTDATED_HIDDEN_IDS.has(ex.id)) return true;
  return HIDDEN_CATEGORIES.has(ex.category ?? "");
}

/** Jedno źródło transformacji raw datasetu → rekord zapisywany do `exercises`. */
export function toSeedExercise(ex: RawExercise) {
  return {
    id: ex.id,
    name: ex.name,
    force: ex.force,
    level: ex.level,
    mechanic: ex.mechanic,
    equipment: ex.equipment,
    primary_muscles: ex.primaryMuscles ?? [],
    secondary_muscles: ex.secondaryMuscles ?? [],
    category: ex.category,
    instructions:
      POLISH_INSTRUCTION_OVERRIDES[ex.id] ?? INSTRUCTION_OVERRIDES[ex.id] ?? ex.instructions ?? [],
    images: (ex.images ?? []).map((img) =>
      img.startsWith("http") || img.startsWith("/") ? img : IMG_PREFIX + img,
    ),
    movement_pattern: deriveMovementPattern(ex),
    exercise_type: deriveExerciseType(ex),
    hidden: deriveHidden(ex),
    name_pl: POLISH_NAMES[ex.id]?.name_pl ?? null,
    // Warianty bez diakrytyk obok oryginałów — zgodnie z migracją 20260717163900.
    search_aliases: withNormalizedAliases(POLISH_NAMES[ex.id]?.aliases ?? []),
  };
}

async function seedExercises() {
  const exercises = (rawExercises as RawExercise[]).map(toSeedExercise);

  // Upsert w paczkach
  const CHUNK = 500;
  for (let i = 0; i < exercises.length; i += CHUNK) {
    const batch = exercises.slice(i, i + CHUNK);
    const { error } = await db.from("exercises").upsert(batch, { onConflict: "id" });
    if (error) throw new Error(`exercises upsert: ${error.message}`);
  }
  console.log(`✓ exercises: ${exercises.length} (upsert)`);
}

// ── Definicje programów (seed-prompt-fbw.md) ─────────────────────────────────
export interface Slot {
  exercise_id: string;
  sets: number;
  repsMin: number | null;
  repsMax: number | null;
  rest: number;
  notes?: string;
}
export interface Day {
  label: string;
  slots: Slot[];
}
export interface Program {
  slug: string;
  name: string;
  description: string;
  goal: string;
  goal_key: "strength_hypertrophy" | "hypertrophy" | "foundation";
  focus_key?: "balanced" | "lower_body";
  level: string;
  environment: "gym" | "home" | "bodyweight";
  level_min: 1 | 2 | 3;
  level_max: 1 | 2 | 3;
  frequency_min: number;
  frequency_max: number;
  estimated_minutes_min: number;
  estimated_minutes_max: number;
  required_equipment: string[];
  optional_equipment: string[];
  content_version: number;
  /** Legacy compatibility field. The actual number of days in the cycle is `days.length`. */
  days_per_week: number;
  days: Day[];
}

export const PROGRAMS: Program[] = [
  {
    slug: "beginner-gym-fbw2",
    name: "Początkujący · Siłownia · Całe ciało · 2× w tygodniu",
    description: "Dwa naprzemienne treningi całego ciała dla osób, które realnie mogą ćwiczyć dwa razy w tygodniu. Ucz się techniki, zostaw 2 lub 3 powtórzenia w zapasie i zwiększaj ciężar dopiero po osiągnięciu górnego zakresu.",
    goal: "Siłownia · baza siły i masy",
    goal_key: "foundation",
    level: "początkujący",
    environment: "gym",
    level_min: 1,
    level_max: 1,
    frequency_min: 2,
    frequency_max: 2,
    estimated_minutes_min: 45,
    estimated_minutes_max: 55,
    required_equipment: ["barbell", "dumbbell", "cable", "machine"],
    optional_equipment: ["body only"],
    content_version: 1,
    days_per_week: 2,
    days: [
      {
        label: "Trening A",
        slots: [
          { exercise_id: "Barbell_Squat", sets: 3, repsMin: 5, repsMax: 8, rest: 150 },
          { exercise_id: "Barbell_Bench_Press_-_Medium_Grip", sets: 3, repsMin: 5, repsMax: 8, rest: 150 },
          { exercise_id: "Wide-Grip_Lat_Pulldown", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Romanian_Deadlift", sets: 3, repsMin: 8, repsMax: 10, rest: 150 },
          { exercise_id: "Seated_Dumbbell_Press", sets: 2, repsMin: 8, repsMax: 12, rest: 90 },
          { exercise_id: "Plank", sets: 3, repsMin: null, repsMax: null, rest: 60, notes: "na czas (stoper)" },
        ],
      },
      {
        label: "Trening B",
        slots: [
          { exercise_id: "Leg_Press", sets: 3, repsMin: 8, repsMax: 12, rest: 150 },
          { exercise_id: "Incline_Dumbbell_Press", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Seated_Cable_Rows", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Dumbbell_Rear_Lunge", sets: 2, repsMin: 8, repsMax: 10, rest: 90, notes: "na nogę" },
          { exercise_id: "Pullups", sets: 2, repsMin: 5, repsMax: 10, rest: 120, notes: "z asystą, jeśli trzeba" },
          { exercise_id: "Standing_Calf_Raises", sets: 3, repsMin: 10, repsMax: 15, rest: 60 },
          { exercise_id: "Dead_Bug", sets: 2, repsMin: 8, repsMax: 12, rest: 45, notes: "na stronę" },
        ],
      },
    ],
  },
  {
    slug: "beginner-gym-fbw3",
    name: "Początkujący · Siłownia · Całe ciało · 2–3× w tygodniu",
    description: "Plan całego ciała do nauki podstawowych ruchów ze sztangą. Gdy wykonasz górny zakres powtórzeń, zwiększ ciężar. Zostaw 2 lub 3 powtórzenia w zapasie.",
    goal: "Siłownia · masa i siła",
    goal_key: "strength_hypertrophy",
    level: "początkujący",
    environment: "gym",
    level_min: 1,
    level_max: 1,
    frequency_min: 2,
    frequency_max: 3,
    estimated_minutes_min: 45,
    estimated_minutes_max: 60,
    required_equipment: ["barbell", "dumbbell", "cable", "machine"],
    optional_equipment: ["body only"],
    content_version: 2,
    days_per_week: 3,
    days: [
      {
        label: "Dzień A",
        slots: [
          { exercise_id: "Barbell_Squat", sets: 3, repsMin: 5, repsMax: 8, rest: 150 },
          { exercise_id: "Barbell_Bench_Press_-_Medium_Grip", sets: 3, repsMin: 5, repsMax: 8, rest: 150 },
          { exercise_id: "Wide-Grip_Lat_Pulldown", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Seated_Dumbbell_Press", sets: 2, repsMin: 8, repsMax: 12, rest: 90 },
          { exercise_id: "Plank", sets: 3, repsMin: null, repsMax: null, rest: 60, notes: "na czas (stoper)" },
        ],
      },
      {
        label: "Dzień B",
        slots: [
          { exercise_id: "Romanian_Deadlift", sets: 3, repsMin: 6, repsMax: 10, rest: 150 },
          { exercise_id: "Chest-Supported_Dumbbell_Row", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Incline_Dumbbell_Press", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Dumbbell_Rear_Lunge", sets: 2, repsMin: 10, repsMax: 12, rest: 90, notes: "na nogę" },
          { exercise_id: "Hanging_Knee_Raise", sets: 3, repsMin: 10, repsMax: 15, rest: 60 },
        ],
      },
      {
        label: "Dzień C",
        slots: [
          { exercise_id: "Front_Barbell_Squat", sets: 3, repsMin: 6, repsMax: 10, rest: 150 },
          { exercise_id: "Standing_Military_Press", sets: 3, repsMin: 6, repsMax: 8, rest: 120 },
          { exercise_id: "Pullups", sets: 3, repsMin: 5, repsMax: 10, rest: 120 },
          { exercise_id: "Seated_Cable_Rows", sets: 2, repsMin: 10, repsMax: 12, rest: 90 },
          { exercise_id: "Standing_Calf_Raises", sets: 3, repsMin: 10, repsMax: 15, rest: 60 },
          { exercise_id: "Pallof_Press", sets: 2, repsMin: 10, repsMax: 12, rest: 45, notes: "na stronę" },
        ],
      },
    ],
  },
  {
    slug: "beginner-home-fbw2",
    name: "Początkujący · Dom z hantlami · Całe ciało · 2× w tygodniu",
    description: "Dwa naprzemienne treningi całego ciała z hantlami. Ławka i guma pomagają, ale każde ćwiczenie ma prosty wariant możliwy do wykonania w domu bez rozbudowanego sprzętu.",
    goal: "Dom (hantle) · baza siły i masy",
    goal_key: "foundation",
    level: "początkujący",
    environment: "home",
    level_min: 1,
    level_max: 1,
    frequency_min: 2,
    frequency_max: 2,
    estimated_minutes_min: 40,
    estimated_minutes_max: 55,
    required_equipment: ["dumbbell"],
    optional_equipment: ["bands", "body only", "other"],
    content_version: 1,
    days_per_week: 2,
    days: [
      {
        label: "Trening A",
        slots: [
          { exercise_id: "Goblet_Squat", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Dumbbell_Bench_Press", sets: 3, repsMin: 8, repsMax: 12, rest: 120, notes: "bez ławki: wyciskanie hantli na podłodze" },
          { exercise_id: "One-Arm_Dumbbell_Row", sets: 3, repsMin: 8, repsMax: 12, rest: 120, notes: "na rękę" },
          { exercise_id: "Stiff-Legged_Dumbbell_Deadlift", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Seated_Dumbbell_Press", sets: 2, repsMin: 8, repsMax: 12, rest: 90 },
          { exercise_id: "Plank", sets: 3, repsMin: null, repsMax: null, rest: 60, notes: "na czas (stoper)" },
        ],
      },
      {
        label: "Trening B",
        slots: [
          { exercise_id: "Dumbbell_Rear_Lunge", sets: 3, repsMin: 8, repsMax: 10, rest: 90, notes: "na nogę" },
          { exercise_id: "Incline_Dumbbell_Press", sets: 3, repsMin: 8, repsMax: 12, rest: 120, notes: "bez ławki: wyciskanie hantli na podłodze" },
          { exercise_id: "Band_Lat_Pulldown", sets: 3, repsMin: 10, repsMax: 15, rest: 90, notes: "bez gumy: przenoszenie hantla za głowę" },
          { exercise_id: "Dumbbell_Hip_Thrust", sets: 3, repsMin: 10, repsMax: 15, rest: 90, notes: "bez ławki: glute bridge z hantlem" },
          { exercise_id: "Bent_Over_Two-Dumbbell_Row", sets: 2, repsMin: 10, repsMax: 12, rest: 90 },
          { exercise_id: "Calf_Raise_On_A_Dumbbell", sets: 3, repsMin: 12, repsMax: 15, rest: 60 },
          { exercise_id: "Dead_Bug", sets: 2, repsMin: 8, repsMax: 12, rest: 45, notes: "na stronę" },
        ],
      },
    ],
  },
  {
    slug: "beginner-home-fbw3",
    name: "Początkujący · Dom z hantlami · Całe ciało · 2–3× w tygodniu",
    description: "Domowy plan całego ciała z hantlami i ławką. Przyda się też guma albo drążek. Gdy wykonasz górny zakres powtórzeń, zwiększ ciężar.",
    goal: "Dom (hantle) · masa i siła",
    goal_key: "strength_hypertrophy",
    level: "początkujący",
    environment: "home",
    level_min: 1,
    level_max: 1,
    frequency_min: 2,
    frequency_max: 3,
    estimated_minutes_min: 40,
    estimated_minutes_max: 55,
    required_equipment: ["dumbbell"],
    optional_equipment: ["bands", "body only", "pull-up bar", "other"],
    content_version: 2,
    days_per_week: 3,
    days: [
      {
        label: "Dzień A",
        slots: [
          { exercise_id: "Goblet_Squat", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Dumbbell_Bench_Press", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "One-Arm_Dumbbell_Row", sets: 3, repsMin: 8, repsMax: 12, rest: 120, notes: "na rękę" },
          { exercise_id: "Stiff-Legged_Dumbbell_Deadlift", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Seated_Dumbbell_Press", sets: 2, repsMin: 8, repsMax: 12, rest: 90 },
          { exercise_id: "Plank", sets: 3, repsMin: null, repsMax: null, rest: 60, notes: "na czas (stoper)" },
        ],
      },
      {
        label: "Dzień B",
        slots: [
          { exercise_id: "Dumbbell_Rear_Lunge", sets: 3, repsMin: 8, repsMax: 10, rest: 90, notes: "na nogę" },
          { exercise_id: "Incline_Dumbbell_Press", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Band_Lat_Pulldown", sets: 3, repsMin: 10, repsMax: 15, rest: 90, notes: "Bez gumy wybierz podciąganie na drążku lub przenoszenie hantla za głowę." },
          { exercise_id: "Stiff-Legged_Dumbbell_Deadlift", sets: 3, repsMin: 10, repsMax: 12, rest: 90 },
          { exercise_id: "Side_Lateral_Raise", sets: 3, repsMin: 12, repsMax: 15, rest: 60 },
          { exercise_id: "Calf_Raise_On_A_Dumbbell", sets: 3, repsMin: 12, repsMax: 15, rest: 60 },
        ],
      },
      {
        label: "Dzień C",
        slots: [
          { exercise_id: "Bulgarian_Split_Squat", sets: 3, repsMin: 8, repsMax: 10, rest: 120, notes: "na nogę" },
          { exercise_id: "Bent_Over_Two-Dumbbell_Row", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Dumbbell_Bench_Press", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Dumbbell_Hip_Thrust", sets: 3, repsMin: 10, repsMax: 15, rest: 90 },
          { exercise_id: "Dumbbell_Bicep_Curl", sets: 2, repsMin: 10, repsMax: 12, rest: 60 },
          { exercise_id: "Standing_Dumbbell_Triceps_Extension", sets: 2, repsMin: 10, repsMax: 12, rest: 60 },
          { exercise_id: "Dead_Bug", sets: 2, repsMin: 8, repsMax: 12, rest: 45, notes: "na stronę" },
        ],
      },
    ],
  },
  {
    slug: "lower-body-gym3",
    name: "Początkujący–średniozaawansowany · Siłownia · Pośladki i nogi",
    description: "Trzy różne treningi z większym naciskiem na pośladki, uda i tył nóg. Góra ciała nadal dostaje regularny bodziec, dzięki czemu plan pozostaje kompletny. Wykonuj rotację A → B → C dwa lub trzy razy w tygodniu.",
    goal: "Nacisk: pośladki i nogi",
    goal_key: "hypertrophy",
    focus_key: "lower_body",
    level: "początkujący–średniozaawansowany",
    environment: "gym",
    level_min: 1,
    level_max: 2,
    frequency_min: 2,
    frequency_max: 3,
    estimated_minutes_min: 45,
    estimated_minutes_max: 60,
    required_equipment: ["barbell", "dumbbell", "cable", "machine"],
    optional_equipment: ["body only"],
    content_version: 1,
    days_per_week: 3,
    days: [
      {
        label: "Dół A · siła",
        slots: [
          { exercise_id: "Barbell_Hip_Thrust", sets: 3, repsMin: 6, repsMax: 10, rest: 150 },
          { exercise_id: "Barbell_Squat", sets: 3, repsMin: 6, repsMax: 10, rest: 150 },
          { exercise_id: "Romanian_Deadlift", sets: 2, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Wide-Grip_Lat_Pulldown", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Dumbbell_Bench_Press", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Standing_Calf_Raises", sets: 2, repsMin: 12, repsMax: 20, rest: 60 },
        ],
      },
      {
        label: "Góra + pośladki",
        slots: [
          { exercise_id: "Dumbbell_Rear_Lunge", sets: 3, repsMin: 8, repsMax: 12, rest: 120, notes: "na nogę" },
          { exercise_id: "Thigh_Abductor", sets: 2, repsMin: 12, repsMax: 20, rest: 75 },
          { exercise_id: "Seated_Cable_Rows", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Incline_Dumbbell_Press", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Seated_Dumbbell_Press", sets: 2, repsMin: 8, repsMax: 12, rest: 90 },
          { exercise_id: "One-Legged_Cable_Kickback", sets: 2, repsMin: 12, repsMax: 20, rest: 75, notes: "na nogę; zatrzymaj ruch na górze" },
        ],
      },
      {
        label: "Dół B · objętość",
        slots: [
          { exercise_id: "Leg_Press", sets: 3, repsMin: 10, repsMax: 15, rest: 120 },
          { exercise_id: "Barbell_Hip_Thrust", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Lying_Leg_Curls", sets: 3, repsMin: 10, repsMax: 15, rest: 90 },
          { exercise_id: "Bulgarian_Split_Squat", sets: 2, repsMin: 8, repsMax: 12, rest: 120, notes: "na nogę" },
          { exercise_id: "Wide-Grip_Lat_Pulldown", sets: 2, repsMin: 10, repsMax: 15, rest: 90 },
          { exercise_id: "Dumbbell_Bench_Press", sets: 2, repsMin: 10, repsMax: 15, rest: 90 },
        ],
      },
    ],
  },
  {
    slug: "lower-body-home3",
    name: "Początkujący–średniozaawansowany · Dom z hantlami · Pośladki i nogi",
    description: "Domowy plan z większym naciskiem na pośladki i nogi, oparty na hantlach oraz ćwiczeniach jednostronnych. Góra ciała pozostaje w planie w mniejszej dawce. Wykonuj rotację A → B → C dwa lub trzy razy w tygodniu.",
    goal: "Nacisk: pośladki i nogi",
    goal_key: "hypertrophy",
    focus_key: "lower_body",
    level: "początkujący–średniozaawansowany",
    environment: "home",
    level_min: 1,
    level_max: 2,
    frequency_min: 2,
    frequency_max: 3,
    estimated_minutes_min: 40,
    estimated_minutes_max: 55,
    required_equipment: ["dumbbell"],
    optional_equipment: ["kettlebells", "body only", "other"],
    content_version: 1,
    days_per_week: 3,
    days: [
      {
        label: "Dół A · siła",
        slots: [
          { exercise_id: "Dumbbell_Hip_Thrust", sets: 3, repsMin: 8, repsMax: 12, rest: 120, notes: "bez ławki: glute bridge z hantlem" },
          { exercise_id: "Goblet_Squat", sets: 3, repsMin: 8, repsMax: 12, rest: 120, notes: "możesz trzymać jeden hantel przy klatce" },
          { exercise_id: "Stiff-Legged_Dumbbell_Deadlift", sets: 2, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "One-Arm_Dumbbell_Row", sets: 3, repsMin: 8, repsMax: 12, rest: 120, notes: "na rękę" },
          { exercise_id: "Dumbbell_Bench_Press", sets: 3, repsMin: 8, repsMax: 12, rest: 120, notes: "bez ławki: wyciskanie hantli na podłodze" },
          { exercise_id: "Calf_Raise_On_A_Dumbbell", sets: 2, repsMin: 12, repsMax: 20, rest: 60 },
        ],
      },
      {
        label: "Góra + pośladki",
        slots: [
          { exercise_id: "Bulgarian_Split_Squat", sets: 3, repsMin: 8, repsMax: 12, rest: 120, notes: "na nogę" },
          { exercise_id: "Glute_Kickback", sets: 2, repsMin: 12, repsMax: 20, rest: 60, notes: "na nogę; zatrzymaj ruch na górze" },
          { exercise_id: "Bent_Over_Two-Dumbbell_Row", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Incline_Dumbbell_Press", sets: 2, repsMin: 8, repsMax: 12, rest: 90, notes: "bez ławki: wyciskanie hantli na podłodze" },
          { exercise_id: "Seated_Dumbbell_Press", sets: 2, repsMin: 8, repsMax: 12, rest: 90 },
          { exercise_id: "Dead_Bug", sets: 2, repsMin: 8, repsMax: 12, rest: 45, notes: "na stronę" },
        ],
      },
      {
        label: "Dół B · objętość",
        slots: [
          { exercise_id: "Dumbbell_Rear_Lunge", sets: 3, repsMin: 8, repsMax: 12, rest: 120, notes: "na nogę" },
          { exercise_id: "Dumbbell_Hip_Thrust", sets: 3, repsMin: 10, repsMax: 15, rest: 120, notes: "bez ławki: glute bridge z hantlem" },
          { exercise_id: "Stiff-Legged_Dumbbell_Deadlift", sets: 3, repsMin: 10, repsMax: 15, rest: 120 },
          { exercise_id: "One-Arm_Dumbbell_Row", sets: 3, repsMin: 10, repsMax: 15, rest: 90, notes: "na rękę" },
          { exercise_id: "Dumbbell_Bench_Press", sets: 2, repsMin: 10, repsMax: 15, rest: 90, notes: "bez ławki: wyciskanie hantli na podłodze" },
          { exercise_id: "Calf_Raise_On_A_Dumbbell", sets: 2, repsMin: 15, repsMax: 20, rest: 60 },
        ],
      },
    ],
  },
  {
    slug: "beginner-bodyweight-fbw3",
    name: "Początkujący · Masa ciała · Całe ciało",
    description: "Plan całego ciała z masą własnego ciała i drążkiem. Najpierw zwiększaj liczbę powtórzeń, a potem wybierz trudniejszy wariant ćwiczenia.",
    goal: "Masa ciała (drążek) · baza",
    goal_key: "foundation",
    level: "początkujący",
    environment: "bodyweight",
    level_min: 1,
    level_max: 1,
    frequency_min: 2,
    frequency_max: 3,
    estimated_minutes_min: 35,
    estimated_minutes_max: 50,
    required_equipment: ["body only", "pull-up bar"],
    optional_equipment: ["other"],
    content_version: 2,
    days_per_week: 3,
    days: [
      {
        label: "Dzień A",
        slots: [
          { exercise_id: "Bodyweight_Squat", sets: 3, repsMin: 12, repsMax: 20, rest: 90 },
          { exercise_id: "Pushups", sets: 3, repsMin: 8, repsMax: 15, rest: 90 },
          { exercise_id: "Pullups", sets: 3, repsMin: 5, repsMax: 10, rest: 120 },
          { exercise_id: "Pike_Push-Up", sets: 2, repsMin: 6, repsMax: 12, rest: 90 },
          { exercise_id: "Plank", sets: 3, repsMin: null, repsMax: null, rest: 60, notes: "na czas (stoper)" },
        ],
      },
      {
        label: "Dzień B",
        slots: [
          { exercise_id: "Bodyweight_Walking_Lunge", sets: 3, repsMin: 10, repsMax: 15, rest: 90, notes: "na nogę" },
          { exercise_id: "Inverted_Row", sets: 3, repsMin: 8, repsMax: 15, rest: 90 },
          { exercise_id: "Decline_Push-Up", sets: 3, repsMin: 8, repsMax: 15, rest: 90 },
          { exercise_id: "Single_Leg_Glute_Bridge", sets: 3, repsMin: 8, repsMax: 12, rest: 90, notes: "na nogę" },
          { exercise_id: "Hanging_Knee_Raise", sets: 3, repsMin: 10, repsMax: 15, rest: 60 },
        ],
      },
      {
        label: "Dzień C",
        slots: [
          { exercise_id: "Split_Squats", sets: 3, repsMin: 10, repsMax: 15, rest: 90, notes: "na nogę · progres: plecak lub wolne tempo" },
          { exercise_id: "Chin-Up", sets: 3, repsMin: 5, repsMax: 10, rest: 120 },
          { exercise_id: "Pushups", sets: 3, repsMin: 6, repsMax: 12, rest: 90, notes: "Następny krok to pompki archer albo pseudo planche." },
          { exercise_id: "Single_Leg_Calf_Raise", sets: 3, repsMin: 12, repsMax: 20, rest: 60, notes: "na nogę" },
          { exercise_id: "Hollow_Body_Hold", sets: 3, repsMin: null, repsMax: null, rest: 45, notes: "na czas (stoper)" },
          { exercise_id: "Superman", sets: 2, repsMin: 12, repsMax: 15, rest: 45 },
        ],
      },
    ],
  },
  {
    slug: "intermediate-bodyweight-fbw3",
    name: "Średniozaawansowany · Masa ciała · Całe ciało",
    description: "Trzy treningi kalisteniczne z drążkiem dla osób, które opanowały podstawowe warianty. Progresuj powtórzeniami, tempem i trudnością dźwigni, zostawiając 1 lub 2 powtórzenia w zapasie.",
    goal: "Masa ciała (drążek) · siła i sprawność",
    goal_key: "strength_hypertrophy",
    level: "średniozaawansowany",
    environment: "bodyweight",
    level_min: 2,
    level_max: 2,
    frequency_min: 3,
    frequency_max: 4,
    estimated_minutes_min: 40,
    estimated_minutes_max: 55,
    required_equipment: ["body only", "pull-up bar"],
    optional_equipment: ["other"],
    content_version: 1,
    days_per_week: 3,
    days: [
      {
        label: "Trening A · siła",
        slots: [
          { exercise_id: "Split_Squats", sets: 4, repsMin: 8, repsMax: 15, rest: 120, notes: "na nogę; tempo 3 sekundy w dół" },
          { exercise_id: "Pullups", sets: 4, repsMin: 5, repsMax: 10, rest: 150 },
          { exercise_id: "Decline_Push-Up", sets: 4, repsMin: 8, repsMax: 15, rest: 120 },
          { exercise_id: "Single-Leg_Hip_Thrust", sets: 3, repsMin: 10, repsMax: 15, rest: 90, notes: "na nogę" },
          { exercise_id: "Pike_Push-Up", sets: 3, repsMin: 8, repsMax: 12, rest: 90 },
          { exercise_id: "Hanging_Knee_Raise", sets: 3, repsMin: 10, repsMax: 15, rest: 60 },
        ],
      },
      {
        label: "Trening B · kontrola",
        slots: [
          { exercise_id: "Bodyweight_Squat", sets: 4, repsMin: 12, repsMax: 20, rest: 90, notes: "pauza 2 sekundy na dole" },
          { exercise_id: "Inverted_Row", sets: 4, repsMin: 8, repsMax: 15, rest: 120, notes: "unieś stopy, gdy górny zakres jest łatwy" },
          { exercise_id: "Dips_-_Triceps_Version", sets: 4, repsMin: 6, repsMax: 12, rest: 120 },
          { exercise_id: "Nordic_Hamstring_Curl", sets: 3, repsMin: 5, repsMax: 10, rest: 120, notes: "z asystą dłoni, jeśli trzeba" },
          { exercise_id: "Single_Leg_Calf_Raise", sets: 4, repsMin: 12, repsMax: 20, rest: 60, notes: "na nogę" },
          { exercise_id: "Hollow_Body_Hold", sets: 3, repsMin: null, repsMax: null, rest: 45, notes: "na czas (stoper)" },
        ],
      },
      {
        label: "Trening C · objętość",
        slots: [
          { exercise_id: "Bodyweight_Walking_Lunge", sets: 4, repsMin: 12, repsMax: 20, rest: 90, notes: "na nogę" },
          { exercise_id: "Chin-Up", sets: 4, repsMin: 5, repsMax: 10, rest: 150 },
          { exercise_id: "Push-Ups_With_Feet_Elevated", sets: 4, repsMin: 8, repsMax: 15, rest: 120 },
          { exercise_id: "Single_Leg_Glute_Bridge", sets: 3, repsMin: 12, repsMax: 20, rest: 90, notes: "na nogę" },
          { exercise_id: "Pike_Push-Up", sets: 3, repsMin: 10, repsMax: 15, rest: 90 },
          { exercise_id: "Scapular_Pull-Up", sets: 3, repsMin: 10, repsMax: 15, rest: 60 },
          { exercise_id: "Copenhagen_Plank", sets: 3, repsMin: null, repsMax: null, rest: 60, notes: "na czas, na stronę" },
        ],
      },
    ],
  },
  {
    slug: "intermediate-gym-upper-lower4",
    name: "Średniozaawansowany · Siłownia · Góra / dół ciała",
    description: "Cztery treningi: dwa na górę i dwa na dół ciała. Dni A skupiają się na sile, a dni B na większej liczbie powtórzeń. Zostaw 1 lub 2 powtórzenia w zapasie.",
    goal: "Siłownia · hipertrofia i siła",
    goal_key: "strength_hypertrophy",
    level: "średniozaawansowany",
    environment: "gym",
    level_min: 2,
    level_max: 2,
    frequency_min: 4,
    frequency_max: 4,
    estimated_minutes_min: 50,
    estimated_minutes_max: 70,
    required_equipment: ["barbell", "dumbbell", "cable", "machine"],
    optional_equipment: ["body only"],
    content_version: 2,
    days_per_week: 4,
    days: [
      {
        label: "Upper A · siła",
        slots: [
          { exercise_id: "Barbell_Bench_Press_-_Medium_Grip", sets: 4, repsMin: 5, repsMax: 8, rest: 150 },
          { exercise_id: "Bent_Over_Barbell_Row", sets: 4, repsMin: 6, repsMax: 10, rest: 150 },
          { exercise_id: "Standing_Military_Press", sets: 3, repsMin: 6, repsMax: 10, rest: 120 },
          { exercise_id: "Wide-Grip_Lat_Pulldown", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Side_Lateral_Raise", sets: 3, repsMin: 12, repsMax: 20, rest: 60 },
          { exercise_id: "Triceps_Pushdown", sets: 3, repsMin: 10, repsMax: 15, rest: 60 },
          { exercise_id: "Barbell_Curl", sets: 3, repsMin: 8, repsMax: 12, rest: 60 },
        ],
      },
      {
        label: "Lower A · siła",
        slots: [
          { exercise_id: "Barbell_Squat", sets: 4, repsMin: 5, repsMax: 8, rest: 180 },
          { exercise_id: "Romanian_Deadlift", sets: 3, repsMin: 6, repsMax: 10, rest: 150 },
          { exercise_id: "Leg_Press", sets: 3, repsMin: 10, repsMax: 15, rest: 120 },
          { exercise_id: "Lying_Leg_Curls", sets: 3, repsMin: 10, repsMax: 15, rest: 90 },
          { exercise_id: "Standing_Calf_Raises", sets: 4, repsMin: 10, repsMax: 15, rest: 60 },
          { exercise_id: "Hanging_Leg_Raise", sets: 3, repsMin: 10, repsMax: 15, rest: 60 },
        ],
      },
      {
        label: "Upper B · hipertrofia",
        slots: [
          { exercise_id: "Incline_Dumbbell_Press", sets: 4, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Seated_Cable_Rows", sets: 4, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Pullups", sets: 3, repsMin: 6, repsMax: 10, rest: 120 },
          { exercise_id: "Dumbbell_Shoulder_Press", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Cable_Seated_Lateral_Raise", sets: 3, repsMin: 12, repsMax: 20, rest: 60 },
          { exercise_id: "Face_Pull", sets: 3, repsMin: 15, repsMax: 20, rest: 60 },
          { exercise_id: "Dips_-_Triceps_Version", sets: 3, repsMin: 8, repsMax: 12, rest: 60 },
          { exercise_id: "Incline_Dumbbell_Curl", sets: 3, repsMin: 10, repsMax: 12, rest: 60 },
        ],
      },
      {
        label: "Lower B · hipertrofia",
        slots: [
          { exercise_id: "Barbell_Deadlift", sets: 3, repsMin: 3, repsMax: 5, rest: 180 },
          { exercise_id: "Front_Barbell_Squat", sets: 3, repsMin: 8, repsMax: 10, rest: 150 },
          { exercise_id: "Bulgarian_Split_Squat", sets: 3, repsMin: 8, repsMax: 12, rest: 120, notes: "na nogę" },
          { exercise_id: "Leg_Extensions", sets: 3, repsMin: 12, repsMax: 15, rest: 90 },
          { exercise_id: "Seated_Leg_Curl", sets: 3, repsMin: 10, repsMax: 15, rest: 90 },
          { exercise_id: "Calf_Press", sets: 4, repsMin: 12, repsMax: 15, rest: 60 },
        ],
      },
    ],
  },
  {
    slug: "intermediate-home-upper-lower4",
    name: "Średniozaawansowany · Dom z hantlami · Góra / dół ciała",
    description: "Cztery treningi z hantlami i drążkiem. Ćwiczenia jednostronne oraz większe zakresy powtórzeń pozwalają trenować mocno bez bardzo dużych ciężarów.",
    goal: "Dom (hantle) · hipertrofia",
    goal_key: "hypertrophy",
    level: "średniozaawansowany",
    environment: "home",
    level_min: 2,
    level_max: 2,
    frequency_min: 4,
    frequency_max: 4,
    estimated_minutes_min: 45,
    estimated_minutes_max: 65,
    required_equipment: ["dumbbell"],
    optional_equipment: ["body only", "pull-up bar", "other"],
    content_version: 2,
    days_per_week: 4,
    days: [
      {
        label: "Upper A · siła",
        slots: [
          { exercise_id: "Dumbbell_Bench_Press", sets: 4, repsMin: 6, repsMax: 10, rest: 150 },
          { exercise_id: "Bent_Over_Two-Dumbbell_Row", sets: 4, repsMin: 8, repsMax: 10, rest: 150 },
          { exercise_id: "Dumbbell_Shoulder_Press", sets: 3, repsMin: 6, repsMax: 10, rest: 120 },
          { exercise_id: "Pullups", sets: 3, repsMin: 6, repsMax: 10, rest: 120 },
          { exercise_id: "Side_Lateral_Raise", sets: 3, repsMin: 12, repsMax: 20, rest: 60 },
          { exercise_id: "Standing_Dumbbell_Triceps_Extension", sets: 3, repsMin: 10, repsMax: 15, rest: 60 },
          { exercise_id: "Dumbbell_Bicep_Curl", sets: 3, repsMin: 8, repsMax: 12, rest: 60 },
        ],
      },
      {
        label: "Lower A · siła",
        slots: [
          { exercise_id: "Bulgarian_Split_Squat", sets: 4, repsMin: 8, repsMax: 12, rest: 150, notes: "na nogę" },
          { exercise_id: "Stiff-Legged_Dumbbell_Deadlift", sets: 4, repsMin: 8, repsMax: 12, rest: 150 },
          { exercise_id: "Goblet_Squat", sets: 3, repsMin: 10, repsMax: 15, rest: 120, notes: "tempo 3-1-1" },
          { exercise_id: "Nordic_Hamstring_Curl", sets: 3, repsMin: 8, repsMax: 12, rest: 90, notes: "z asystą, jeśli pełny za trudny" },
          { exercise_id: "Calf_Raise_On_A_Dumbbell", sets: 4, repsMin: 12, repsMax: 20, rest: 60, notes: "na nogę" },
          { exercise_id: "Hanging_Leg_Raise", sets: 3, repsMin: 10, repsMax: 15, rest: 60 },
        ],
      },
      {
        label: "Upper B · hipertrofia",
        slots: [
          { exercise_id: "Incline_Dumbbell_Press", sets: 4, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Chest-Supported_Dumbbell_Row", sets: 4, repsMin: 10, repsMax: 12, rest: 120 },
          { exercise_id: "Chin-Up", sets: 3, repsMin: 6, repsMax: 10, rest: 120 },
          { exercise_id: "Seated_Dumbbell_Press", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Side_Lateral_Raise", sets: 3, repsMin: 15, repsMax: 20, rest: 60 },
          { exercise_id: "Reverse_Flyes", sets: 3, repsMin: 15, repsMax: 20, rest: 60 },
          { exercise_id: "Lying_Dumbbell_Tricep_Extension", sets: 3, repsMin: 10, repsMax: 12, rest: 60 },
          { exercise_id: "Incline_Dumbbell_Curl", sets: 3, repsMin: 10, repsMax: 12, rest: 60 },
        ],
      },
      {
        label: "Lower B · hipertrofia",
        slots: [
          { exercise_id: "Dumbbell_Step_Ups", sets: 4, repsMin: 8, repsMax: 12, rest: 150, notes: "na nogę" },
          { exercise_id: "Stiff-Legged_Dumbbell_Deadlift", sets: 4, repsMin: 10, repsMax: 12, rest: 150 },
          { exercise_id: "Goblet_Squat", sets: 3, repsMin: 12, repsMax: 15, rest: 120 },
          { exercise_id: "Dumbbell_Hip_Thrust", sets: 3, repsMin: 10, repsMax: 15, rest: 120 },
          { exercise_id: "Natural_Glute_Ham_Raise", sets: 3, repsMin: 12, repsMax: 15, rest: 90, notes: "z asystą; alternatywnie leg curl na ślizgach" },
          { exercise_id: "Dumbbell_Seated_One-Leg_Calf_Raise", sets: 4, repsMin: 15, repsMax: 20, rest: 60, notes: "na nogę" },
        ],
      },
    ],
  },
  {
    slug: "advanced-home-upper-lower4",
    name: "Zaawansowany · Dom z hantlami · Góra / dół ciała",
    description: "Czterodniowy plan dla osób z regulowanymi hantlami, ławką i drążkiem. Wykorzystuje ćwiczenia jednostronne, wolne tempo i trudniejsze warianty, żeby obejść ograniczony ciężar domowy.",
    goal: "Dom (hantle) · hipertrofia zaawansowana",
    goal_key: "hypertrophy",
    level: "zaawansowany",
    environment: "home",
    level_min: 3,
    level_max: 3,
    frequency_min: 4,
    frequency_max: 5,
    estimated_minutes_min: 50,
    estimated_minutes_max: 70,
    required_equipment: ["dumbbell"],
    optional_equipment: ["body only", "pull-up bar", "other"],
    content_version: 1,
    days_per_week: 4,
    days: [
      {
        label: "Upper A · siła",
        slots: [
          { exercise_id: "Dumbbell_Bench_Press", sets: 4, repsMin: 6, repsMax: 10, rest: 150 },
          { exercise_id: "One-Arm_Dumbbell_Row", sets: 4, repsMin: 8, repsMax: 12, rest: 150, notes: "na rękę" },
          { exercise_id: "Pullups", sets: 4, repsMin: 5, repsMax: 8, rest: 150, notes: "tempo 3 sekundy w dół lub plecak, gdy zakres jest łatwy" },
          { exercise_id: "Dumbbell_Shoulder_Press", sets: 3, repsMin: 6, repsMax: 10, rest: 120 },
          { exercise_id: "Side_Lateral_Raise", sets: 3, repsMin: 12, repsMax: 20, rest: 60 },
          { exercise_id: "Standing_Dumbbell_Triceps_Extension", sets: 3, repsMin: 10, repsMax: 15, rest: 60 },
          { exercise_id: "Dumbbell_Bicep_Curl", sets: 3, repsMin: 8, repsMax: 12, rest: 60 },
        ],
      },
      {
        label: "Lower A · siła",
        slots: [
          { exercise_id: "Bulgarian_Split_Squat", sets: 4, repsMin: 6, repsMax: 10, rest: 150, notes: "na nogę" },
          { exercise_id: "Stiff-Legged_Dumbbell_Deadlift", sets: 4, repsMin: 8, repsMax: 12, rest: 150 },
          { exercise_id: "Dumbbell_Rear_Lunge", sets: 3, repsMin: 8, repsMax: 12, rest: 120, notes: "na nogę" },
          { exercise_id: "Nordic_Hamstring_Curl", sets: 3, repsMin: 5, repsMax: 10, rest: 120, notes: "z asystą dłoni, jeśli trzeba" },
          { exercise_id: "Calf_Raise_On_A_Dumbbell", sets: 4, repsMin: 12, repsMax: 20, rest: 60 },
          { exercise_id: "Hanging_Leg_Raise", sets: 3, repsMin: 10, repsMax: 15, rest: 60 },
        ],
      },
      {
        label: "Upper B · objętość",
        slots: [
          { exercise_id: "Incline_Dumbbell_Press", sets: 4, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Chest-Supported_Dumbbell_Row", sets: 4, repsMin: 10, repsMax: 15, rest: 120 },
          { exercise_id: "Chin-Up", sets: 4, repsMin: 6, repsMax: 10, rest: 120, notes: "dodaj pauzę u góry lub plecak po dojściu do 10" },
          { exercise_id: "Handstand_Push-Ups", sets: 3, repsMin: 4, repsMax: 10, rest: 150, notes: "przy ścianie; zamiennie trudny Pike Push-Up" },
          { exercise_id: "Reverse_Flyes", sets: 3, repsMin: 15, repsMax: 20, rest: 60 },
          { exercise_id: "Lying_Dumbbell_Tricep_Extension", sets: 3, repsMin: 10, repsMax: 15, rest: 60 },
          { exercise_id: "Incline_Dumbbell_Curl", sets: 3, repsMin: 10, repsMax: 15, rest: 60 },
          { exercise_id: "Push-Ups_-_Close_Triceps_Position", sets: 3, repsMin: 10, repsMax: 20, rest: 60 },
        ],
      },
      {
        label: "Lower B · objętość",
        slots: [
          { exercise_id: "Dumbbell_Step_Ups", sets: 4, repsMin: 8, repsMax: 12, rest: 150, notes: "na nogę" },
          { exercise_id: "Stiff-Legged_Dumbbell_Deadlift", sets: 4, repsMin: 10, repsMax: 15, rest: 150 },
          { exercise_id: "Single-Leg_Hip_Thrust", sets: 4, repsMin: 10, repsMax: 15, rest: 120, notes: "na nogę; hantel na biodrze" },
          { exercise_id: "Reverse_Nordic_Curl", sets: 3, repsMin: 8, repsMax: 15, rest: 90 },
          { exercise_id: "Natural_Glute_Ham_Raise", sets: 3, repsMin: 8, repsMax: 15, rest: 90, notes: "z asystą, jeśli trzeba" },
          { exercise_id: "Dumbbell_Seated_One-Leg_Calf_Raise", sets: 4, repsMin: 15, repsMax: 25, rest: 60, notes: "na nogę" },
          { exercise_id: "Copenhagen_Plank", sets: 3, repsMin: null, repsMax: null, rest: 60, notes: "na czas, na stronę" },
        ],
      },
    ],
  },
  {
    slug: "advanced-bodyweight-upper-lower4",
    name: "Zaawansowany · Masa ciała · Góra / dół ciała",
    description: "Czterodniowy plan kalisteniczny z drążkiem i stabilnymi podporami. Progresja opiera się na trudniejszej dźwigni, tempie, pauzach i kontrolowanym zakresie, bez dokładania przypadkowej objętości.",
    goal: "Masa ciała (drążek) · siła zaawansowana",
    goal_key: "strength_hypertrophy",
    level: "zaawansowany",
    environment: "bodyweight",
    level_min: 3,
    level_max: 3,
    frequency_min: 3,
    frequency_max: 4,
    estimated_minutes_min: 45,
    estimated_minutes_max: 65,
    required_equipment: ["body only", "pull-up bar"],
    optional_equipment: ["other"],
    content_version: 1,
    days_per_week: 4,
    days: [
      {
        label: "Upper A · siła",
        slots: [
          { exercise_id: "Pullups", sets: 4, repsMin: 5, repsMax: 8, rest: 180, notes: "tempo 3 sekundy w dół lub plecak" },
          { exercise_id: "Single-Arm_Push-Up", sets: 4, repsMin: 4, repsMax: 8, rest: 150, notes: "na stronę; użyj podwyższenia, jeśli trzeba" },
          { exercise_id: "Handstand_Push-Ups", sets: 4, repsMin: 4, repsMax: 8, rest: 180, notes: "przy ścianie" },
          { exercise_id: "Inverted_Row", sets: 4, repsMin: 8, repsMax: 12, rest: 120, notes: "stopy na podwyższeniu" },
          { exercise_id: "Dips_-_Triceps_Version", sets: 3, repsMin: 6, repsMax: 12, rest: 120 },
          { exercise_id: "L-Sit_Hold", sets: 3, repsMin: null, repsMax: null, rest: 60, notes: "na czas (stoper)" },
        ],
      },
      {
        label: "Lower A · siła",
        slots: [
          { exercise_id: "Split_Squats", sets: 4, repsMin: 8, repsMax: 12, rest: 150, notes: "na nogę; wariant z pauzą lub progresja do pistoletu" },
          { exercise_id: "Freehand_Jump_Squat", sets: 4, repsMin: 8, repsMax: 15, rest: 120, notes: "każde powtórzenie dynamiczne, lądowanie ciche" },
          { exercise_id: "Nordic_Hamstring_Curl", sets: 4, repsMin: 5, repsMax: 10, rest: 150 },
          { exercise_id: "Single-Leg_Hip_Thrust", sets: 4, repsMin: 10, repsMax: 15, rest: 120, notes: "na nogę" },
          { exercise_id: "Single_Leg_Calf_Raise", sets: 4, repsMin: 15, repsMax: 25, rest: 60, notes: "na nogę; pauza na górze" },
          { exercise_id: "Copenhagen_Plank", sets: 3, repsMin: null, repsMax: null, rest: 60, notes: "na czas, na stronę" },
        ],
      },
      {
        label: "Upper B · objętość",
        slots: [
          { exercise_id: "Chin-Up", sets: 4, repsMin: 6, repsMax: 10, rest: 150 },
          { exercise_id: "Push-Ups_With_Feet_Elevated", sets: 4, repsMin: 10, repsMax: 20, rest: 120 },
          { exercise_id: "Inverted_Row", sets: 4, repsMin: 10, repsMax: 15, rest: 120, notes: "stopy na podwyższeniu" },
          { exercise_id: "Pike_Push-Up", sets: 3, repsMin: 10, repsMax: 15, rest: 120, notes: "stopy na podwyższeniu" },
          { exercise_id: "Scapular_Pull-Up", sets: 3, repsMin: 10, repsMax: 15, rest: 60 },
          { exercise_id: "Body_Tricep_Press", sets: 3, repsMin: 10, repsMax: 20, rest: 60 },
          { exercise_id: "Hanging_Leg_Raise", sets: 3, repsMin: 10, repsMax: 15, rest: 60 },
        ],
      },
      {
        label: "Lower B · objętość",
        slots: [
          { exercise_id: "Bodyweight_Walking_Lunge", sets: 4, repsMin: 12, repsMax: 20, rest: 90, notes: "na nogę" },
          { exercise_id: "Step-up_with_Knee_Raise", sets: 4, repsMin: 10, repsMax: 15, rest: 120, notes: "na nogę" },
          { exercise_id: "Reverse_Nordic_Curl", sets: 4, repsMin: 8, repsMax: 15, rest: 120 },
          { exercise_id: "Natural_Glute_Ham_Raise", sets: 3, repsMin: 8, repsMax: 15, rest: 120 },
          { exercise_id: "Single_Leg_Glute_Bridge", sets: 4, repsMin: 12, repsMax: 20, rest: 90, notes: "na nogę" },
          { exercise_id: "Tibialis_Raise", sets: 3, repsMin: 15, repsMax: 25, rest: 60 },
          { exercise_id: "Hollow_Body_Hold", sets: 3, repsMin: null, repsMax: null, rest: 45, notes: "na czas (stoper)" },
        ],
      },
    ],
  },
  {
    slug: "advanced-gym-ppl6",
    name: "Zaawansowany · Siłownia · Push / Pull / Legs",
    description: "Sześć treningów dla osób przyzwyczajonych do dużej objętości. Dni A są cięższe, a dni B mają więcej powtórzeń. Zaplanuj lżejszy tydzień co 6 do 8 tygodni.",
    goal: "Siłownia · hipertrofia zaawansowana",
    goal_key: "hypertrophy",
    level: "zaawansowany",
    environment: "gym",
    level_min: 3,
    level_max: 3,
    frequency_min: 6,
    frequency_max: 6,
    estimated_minutes_min: 55,
    estimated_minutes_max: 75,
    required_equipment: ["barbell", "dumbbell", "cable", "machine"],
    optional_equipment: ["body only"],
    content_version: 2,
    days_per_week: 6,
    days: [
      {
        label: "Push A · ciężki",
        slots: [
          { exercise_id: "Barbell_Bench_Press_-_Medium_Grip", sets: 4, repsMin: 4, repsMax: 6, rest: 180 },
          { exercise_id: "Standing_Military_Press", sets: 4, repsMin: 6, repsMax: 8, rest: 150 },
          { exercise_id: "Incline_Dumbbell_Press", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Cable_Seated_Lateral_Raise", sets: 4, repsMin: 12, repsMax: 20, rest: 60 },
          { exercise_id: "Overhead_Cable_Triceps_Extension", sets: 3, repsMin: 8, repsMax: 12, rest: 60 },
          { exercise_id: "Triceps_Pushdown", sets: 3, repsMin: 12, repsMax: 15, rest: 60 },
        ],
      },
      {
        label: "Pull A · ciężki",
        slots: [
          { exercise_id: "Barbell_Deadlift", sets: 3, repsMin: 3, repsMax: 5, rest: 180 },
          { exercise_id: "Pullups", sets: 4, repsMin: 5, repsMax: 8, rest: 150 },
          { exercise_id: "Bent_Over_Barbell_Row", sets: 4, repsMin: 6, repsMax: 10, rest: 150 },
          { exercise_id: "Chest-Supported_Dumbbell_Row", sets: 3, repsMin: 10, repsMax: 12, rest: 120 },
          { exercise_id: "Face_Pull", sets: 3, repsMin: 15, repsMax: 20, rest: 60 },
          { exercise_id: "Barbell_Curl", sets: 3, repsMin: 8, repsMax: 12, rest: 60 },
          { exercise_id: "Incline_Dumbbell_Curl", sets: 3, repsMin: 10, repsMax: 15, rest: 60 },
        ],
      },
      {
        label: "Legs A · ciężki",
        slots: [
          { exercise_id: "Barbell_Squat", sets: 4, repsMin: 4, repsMax: 6, rest: 180 },
          { exercise_id: "Romanian_Deadlift", sets: 4, repsMin: 6, repsMax: 8, rest: 150 },
          { exercise_id: "Leg_Press", sets: 3, repsMin: 10, repsMax: 15, rest: 120 },
          { exercise_id: "Lying_Leg_Curls", sets: 4, repsMin: 10, repsMax: 15, rest: 90 },
          { exercise_id: "Standing_Calf_Raises", sets: 4, repsMin: 8, repsMax: 12, rest: 60 },
          { exercise_id: "Seated_Calf_Raise", sets: 3, repsMin: 15, repsMax: 20, rest: 60 },
          { exercise_id: "Ab_Wheel_Rollout", sets: 3, repsMin: 8, repsMax: 12, rest: 60, notes: "z kolan; zatrzymaj zakres przed utratą pozycji miednicy" },
        ],
      },
      {
        label: "Push B · objętość",
        slots: [
          { exercise_id: "Barbell_Incline_Bench_Press_-_Medium_Grip", sets: 4, repsMin: 8, repsMax: 10, rest: 150 },
          { exercise_id: "Dumbbell_Shoulder_Press", sets: 4, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Leverage_Chest_Press", sets: 3, repsMin: 10, repsMax: 15, rest: 120 },
          { exercise_id: "Cable_Seated_Lateral_Raise", sets: 4, repsMin: 15, repsMax: 20, rest: 60 },
          { exercise_id: "Triceps_Pushdown", sets: 3, repsMin: 12, repsMax: 15, rest: 60, notes: "superset" },
        ],
      },
      {
        label: "Pull B · objętość",
        slots: [
          { exercise_id: "Pullups", sets: 4, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Seated_Cable_Rows", sets: 4, repsMin: 10, repsMax: 12, rest: 120 },
          { exercise_id: "Close-Grip_Front_Lat_Pulldown", sets: 3, repsMin: 12, repsMax: 15, rest: 90, notes: "wąski chwyt" },
          { exercise_id: "Reverse_Flyes", sets: 3, repsMin: 15, repsMax: 20, rest: 60 },
          { exercise_id: "Hammer_Curls", sets: 3, repsMin: 10, repsMax: 15, rest: 60 },
          { exercise_id: "Standing_Biceps_Cable_Curl", sets: 3, repsMin: 12, repsMax: 15, rest: 60 },
        ],
      },
      {
        label: "Legs B · objętość",
        slots: [
          { exercise_id: "Front_Barbell_Squat", sets: 4, repsMin: 6, repsMax: 10, rest: 150 },
          { exercise_id: "Bulgarian_Split_Squat", sets: 3, repsMin: 8, repsMax: 12, rest: 120, notes: "na nogę" },
          { exercise_id: "Leg_Extensions", sets: 4, repsMin: 12, repsMax: 20, rest: 90 },
          { exercise_id: "Seated_Leg_Curl", sets: 4, repsMin: 12, repsMax: 15, rest: 90 },
          { exercise_id: "Barbell_Hip_Thrust", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Calf_Press", sets: 4, repsMin: 12, repsMax: 15, rest: 60 },
          { exercise_id: "Hanging_Leg_Raise", sets: 3, repsMin: 10, repsMax: 15, rest: 60 },
        ],
      },
    ],
  },
  // ── FBW 2× (Daniel), dodane 2026-07-05 · content/personal-*.md ──
  // 2026-07-08: po kuracji bazy przywrócone oryginalne ćwiczenia autora
  // (Ab Wheel Rollout, Hollow Body Hold — wcześniej swapowane z braku w bazie).
  // Nazwy bez „Autorski" — spójny schemat „Poziom · Miejsce · Typ".
  {
    slug: "intermediate-gym-fbw2",
    name: "Średniozaawansowany · Siłownia · Całe ciało",
    description: "Dwa treningi całego ciała na pełnym sprzęcie. Dobry wybór, gdy masz mało czasu, ale chcesz rozwijać siłę i masę. Zostaw 1 lub 2 powtórzenia w zapasie.",
    goal: "Siłownia · masa i siła",
    goal_key: "strength_hypertrophy",
    level: "średniozaawansowany",
    environment: "gym",
    level_min: 2,
    level_max: 2,
    frequency_min: 2,
    frequency_max: 3,
    estimated_minutes_min: 50,
    estimated_minutes_max: 65,
    required_equipment: ["barbell", "dumbbell", "cable", "machine"],
    optional_equipment: ["body only"],
    content_version: 2,
    days_per_week: 2,
    days: [
      {
        label: "Trening A",
        slots: [
          { exercise_id: "Barbell_Squat", sets: 4, repsMin: 6, repsMax: 8, rest: 150 },
          { exercise_id: "Barbell_Bench_Press_-_Medium_Grip", sets: 4, repsMin: 6, repsMax: 8, rest: 150 },
          { exercise_id: "Bent_Over_Barbell_Row", sets: 4, repsMin: 8, repsMax: 10, rest: 120 },
          { exercise_id: "Standing_Military_Press", sets: 3, repsMin: 8, repsMax: 10, rest: 120 },
          { exercise_id: "Barbell_Curl", sets: 3, repsMin: 10, repsMax: 12, rest: 60 },
          { exercise_id: "EZ-Bar_Skullcrusher", sets: 3, repsMin: 10, repsMax: 12, rest: 60 },
          { exercise_id: "Plank", sets: 3, repsMin: null, repsMax: null, rest: 60, notes: "Na czas, od 30 do 60 sekund." },
        ],
      },
      {
        label: "Trening B",
        slots: [
          { exercise_id: "Barbell_Walking_Lunge", sets: 3, repsMin: 8, repsMax: 12, rest: 120, notes: "na nogę" },
          { exercise_id: "Pullups", sets: 4, repsMin: null, repsMax: null, rest: 120, notes: "Zrób prawie maksymalną liczbę poprawnych powtórzeń. Zostaw 1 lub 2 w zapasie. Nachwyt." },
          { exercise_id: "Incline_Dumbbell_Press", sets: 3, repsMin: 8, repsMax: 10, rest: 120 },
          { exercise_id: "Face_Pull", sets: 3, repsMin: 12, repsMax: 15, rest: 60 },
          { exercise_id: "Hammer_Curls", sets: 3, repsMin: 10, repsMax: 12, rest: 60 },
          { exercise_id: "Triceps_Pushdown", sets: 3, repsMin: 10, repsMax: 12, rest: 60 },
          { exercise_id: "Ab_Wheel_Rollout", sets: 3, repsMin: 8, repsMax: 12, rest: 60, notes: "Z kolan. Bez kółka wybierz spięcia na wyciągu." },
        ],
      },
    ],
  },
  {
    slug: "intermediate-home-fbw2",
    name: "Średniozaawansowany · Dom z hantlami · Całe ciało",
    description: "Dwa domowe treningi całego ciała z hantlami i kettlem. Jedna sesja zajmuje około 45 do 60 minut. Zostaw 1 lub 2 powtórzenia w zapasie.",
    goal: "Dom (hantle+kettlebell) · masa i siła",
    goal_key: "strength_hypertrophy",
    level: "średniozaawansowany",
    environment: "home",
    level_min: 2,
    level_max: 2,
    frequency_min: 2,
    frequency_max: 3,
    estimated_minutes_min: 45,
    estimated_minutes_max: 60,
    required_equipment: ["dumbbell"],
    optional_equipment: ["kettlebells", "body only", "pull-up bar"],
    content_version: 2,
    days_per_week: 2,
    days: [
      {
        label: "Trening A",
        slots: [
          { exercise_id: "Goblet_Squat", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Stiff-Legged_Dumbbell_Deadlift", sets: 3, repsMin: 8, repsMax: 12, rest: 120, notes: "Rumuński martwy ciąg z hantlami." },
          { exercise_id: "Bent_Over_Two-Dumbbell_Row", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Dumbbell_Bench_Press", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Dumbbell_Shoulder_Press", sets: 2, repsMin: 8, repsMax: 12, rest: 90 },
          { exercise_id: "Dumbbell_Bicep_Curl", sets: 2, repsMin: 10, repsMax: 15, rest: 60 },
          { exercise_id: "Lying_Dumbbell_Tricep_Extension", sets: 2, repsMin: 10, repsMax: 15, rest: 60, notes: "Francuskie wyciskanie hantli leżąc." },
          { exercise_id: "Dead_Bug", sets: 2, repsMin: 8, repsMax: 12, rest: 45, notes: "na stronę" },
        ],
      },
      {
        label: "Trening B",
        slots: [
          { exercise_id: "Dumbbell_Rear_Lunge", sets: 3, repsMin: 8, repsMax: 12, rest: 90, notes: "na nogę" },
          { exercise_id: "Kettlebell_One-Legged_Deadlift", sets: 3, repsMin: 8, repsMax: 12, rest: 90, notes: "Martwy ciąg na jednej nodze." },
          { exercise_id: "Alternating_Renegade_Row", sets: 3, repsMin: 8, repsMax: 12, rest: 90, notes: "na stronę" },
          { exercise_id: "Push-Ups_With_Feet_Elevated", sets: 3, repsMin: 8, repsMax: 15, rest: 75 },
          { exercise_id: "Side_Lateral_Raise", sets: 2, repsMin: 12, repsMax: 20, rest: 60 },
          { exercise_id: "Hammer_Curls", sets: 2, repsMin: 10, repsMax: 15, rest: 60 },
          { exercise_id: "Standing_Dumbbell_Triceps_Extension", sets: 2, repsMin: 10, repsMax: 15, rest: 60 },
          { exercise_id: "Hollow_Body_Hold", sets: 2, repsMin: null, repsMax: null, rest: 45, notes: "na czas (stoper), ~30 s; regres: kolana ugięte" },
        ],
      },
    ],
  },
];

async function seedPrograms() {
  const existingIds = new Set((rawExercises as RawExercise[]).map((e) => e.id));
  const { data: existingPrograms, error: existingProgramsError } = await db
    .from("programs")
    .select("id, name, slug")
    .is("user_id", null);
  if (existingProgramsError) {
    throw new Error(`programs select: ${existingProgramsError.message}`);
  }
  const programsByName = new Map<string, { id: string; name: string; slug: string | null }>();
  const programsBySlug = new Map<string, { id: string; name: string; slug: string | null }>();
  for (const row of existingPrograms ?? []) {
    if (programsByName.has(row.name)) {
      throw new Error(`SANITY: więcej niż jeden systemowy program o nazwie '${row.name}'`);
    }
    programsByName.set(row.name, row);
    if (row.slug) {
      if (programsBySlug.has(row.slug)) {
        throw new Error(`SANITY: więcej niż jeden systemowy program o slugu '${row.slug}'`);
      }
      programsBySlug.set(row.slug, row);
    }
  }

  for (const prog of PROGRAMS) {
    const programValues = {
      slug: prog.slug,
      name: prog.name,
      description: prog.description,
      goal: prog.goal,
      goal_key: prog.goal_key,
      focus_key: prog.focus_key ?? "balanced",
      level: prog.level,
      environment: prog.environment,
      level_min: prog.level_min,
      level_max: prog.level_max,
      frequency_min: prog.frequency_min,
      frequency_max: prog.frequency_max,
      cycle_days: prog.days.length,
      estimated_minutes_min: prog.estimated_minutes_min,
      estimated_minutes_max: prog.estimated_minutes_max,
      required_equipment: prog.required_equipment,
      optional_equipment: prog.optional_equipment,
      content_version: prog.content_version,
      days_per_week: prog.days_per_week,
      is_default: true,
      user_id: null,
    };
    let programId = (programsBySlug.get(prog.slug) ?? programsByName.get(prog.name))?.id;
    if (programId) {
      const { error } = await db.from("programs").update(programValues).eq("id", programId);
      if (error) throw new Error(`program update (${prog.name}): ${error.message}`);
    } else {
      const { data, error } = await db.from("programs").insert(programValues).select("id").single();
      if (error || !data) throw new Error(`program insert (${prog.name}): ${error?.message}`);
      programId = data.id;
    }

    const { data: existingDays, error: existingDaysError } = await db
      .from("program_days")
      .select("id, position")
      .eq("program_id", programId);
    if (existingDaysError) throw new Error(`days select (${prog.name}): ${existingDaysError.message}`);
    const daysByPosition = new Map((existingDays ?? []).map((day) => [day.position, day]));
    const extraDays = (existingDays ?? []).filter((day) => day.position >= prog.days.length);
    if (extraDays.length > 0) {
      throw new Error(
        `SAFE SEED STOP: ${prog.name} ma ${extraDays.length} nadmiarowych dni. Usuń je osobną, świadomą migracją.`,
      );
    }

    for (let dIdx = 0; dIdx < prog.days.length; dIdx++) {
      const day = prog.days[dIdx];
      let dayId = daysByPosition.get(dIdx)?.id;
      if (dayId) {
        const { error } = await db
          .from("program_days")
          .update({ label: day.label, position: dIdx })
          .eq("id", dayId);
        if (error) throw new Error(`day update (${day.label}): ${error.message}`);
      } else {
        const { data, error } = await db
          .from("program_days")
          .insert({ program_id: programId, label: day.label, position: dIdx })
          .select("id")
          .single();
        if (error || !data) throw new Error(`day insert (${day.label}): ${error?.message}`);
        dayId = data.id;
      }

      const { data: existingSlots, error: existingSlotsError } = await db
        .from("program_day_slots")
        .select("id, position")
        .eq("program_day_id", dayId);
      if (existingSlotsError) throw new Error(`slots select (${day.label}): ${existingSlotsError.message}`);
      const slotsByPosition = new Map((existingSlots ?? []).map((slot) => [slot.position, slot]));
      const extraSlots = (existingSlots ?? []).filter((slot) => slot.position >= day.slots.length);
      if (extraSlots.length > 0) {
        throw new Error(
          `SAFE SEED STOP: ${prog.name} / ${day.label} ma ${extraSlots.length} nadmiarowych slotów. Usuń je osobną, świadomą migracją.`,
        );
      }

      for (let sIdx = 0; sIdx < day.slots.length; sIdx++) {
        const s = day.slots[sIdx];
        if (!existingIds.has(s.exercise_id)) {
          throw new Error(`SANITY: slot wskazuje nieistniejące ćwiczenie '${s.exercise_id}' (${day.label})`);
        }
        const slotValues = {
          program_day_id: dayId,
          default_exercise_id: s.exercise_id,
          position: sIdx,
          target_sets: s.sets,
          target_reps_min: s.repsMin,
          target_reps_max: s.repsMax,
          rest_seconds: s.rest,
          superset_group: null,
          notes: s.notes ?? null,
        };
        const slotId = slotsByPosition.get(sIdx)?.id;
        const { error } = slotId
          ? await db.from("program_day_slots").update(slotValues).eq("id", slotId)
          : await db.from("program_day_slots").insert(slotValues);
        if (error) throw new Error(`slot sync (${prog.name} / ${day.label} / ${sIdx}): ${error.message}`);
      }
    }
    console.log(`✓ program: ${prog.name} (${prog.days.length} dni, zachowane ID)`);
  }

  const expectedNames = new Set(PROGRAMS.map((program) => program.name));
  const stalePrograms = (existingPrograms ?? []).filter((program) => !expectedNames.has(program.name));
  if (stalePrograms.length > 0) {
    console.warn(
      `⚠ pominięto ${stalePrograms.length} starych programów systemowych — safe seed nigdy nie usuwa danych automatycznie`,
    );
  }
}

async function sanityCheck() {
  const { data, error } = await db
    .from("program_day_slots")
    .select("id, default_exercise_id, exercises:default_exercise_id (id)");
  if (error) throw new Error(`sanity check: ${error.message}`);
  const orphans = (data ?? []).filter((row) => !row.default_exercise_id || !row.exercises);
  if (orphans.length) {
    throw new Error(`SANITY FAIL: ${orphans.length} slotów bez poprawnego default_exercise_id`);
  }
  console.log(`✓ sanity: ${data?.length ?? 0} slotów, każdy ma istniejące default_exercise_id`);
}

async function getActiveProgramSnapshot() {
  const { data, error } = await db
    .from("user_active_program")
    .select("user_id, program_id")
    .order("user_id");
  if (error) throw new Error(`active program snapshot: ${error.message}`);
  return JSON.stringify(data ?? []);
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRole) {
    throw new Error("Brak NEXT_PUBLIC_SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY w .env.local");
  }
  db = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false },
  });
  const activeProgramsBefore = await getActiveProgramSnapshot();
  console.log("Seeding Arco…");
  await seedExercises();
  await seedPrograms();
  await sanityCheck();
  const activeProgramsAfter = await getActiveProgramSnapshot();
  if (activeProgramsAfter !== activeProgramsBefore) {
    throw new Error("SANITY FAIL: seed zmienił user_active_program");
  }
  console.log("✓ sanity: aktywne programy użytkowników bez zmian");
  console.log("✅ Seed zakończony.");
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : null;
if (invokedPath === import.meta.url) {
  main().catch((e) => {
    console.error("❌ Seed failed:", e.message);
    process.exit(1);
  });
}
