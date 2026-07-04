/**
 * Arco — seed bazy (brief sekcja 11/12 + seed-prompt-fbw.md).
 * 1. Ingest free-exercise-db → exercises (z wyprowadzeniem exercise_type / movement_pattern).
 * 2. Seed 2 programów FBW (2× i 3×) z dokładnymi slotami i zweryfikowanymi default_exercise_id.
 *
 * Uruchom: npm run seed   (wymaga lokalnego stacku Supabase + service-role w .env.local)
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import rawExercises from "./data/exercises.json";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const IMG_PREFIX =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

if (!SUPABASE_URL || !SERVICE_ROLE) {
  throw new Error("Brak NEXT_PUBLIC_SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY w .env.local");
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

type MovementPattern = "push" | "pull" | "squat" | "hinge" | "lunge" | "carry" | "core";
type ExerciseType = "weighted" | "bodyweight" | "timed";

interface RawExercise {
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
  Hanging_Leg_Raise: "bodyweight",
  Pushups: "bodyweight",
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
};

const TIMED_RE = /\b(plank|hold|wall sit|isometric|l-sit|dead hang|bridge)\b/i;

function deriveExerciseType(ex: RawExercise): ExerciseType {
  if (TYPE_OVERRIDES[ex.id]) return TYPE_OVERRIDES[ex.id];
  if (TIMED_RE.test(ex.name)) return "timed";
  if (ex.equipment === "body only") return "bodyweight";
  return "weighted";
}

// Lekka heurystyka wzorca ruchu — dla silnika podmiany (Phase 2). Kluczowe lifty nadpisane wyżej.
function deriveMovementPattern(ex: RawExercise): MovementPattern | null {
  if (PATTERN_OVERRIDES[ex.id]) return PATTERN_OVERRIDES[ex.id];
  const n = ex.name.toLowerCase();
  if (/squat/.test(n)) return "squat";
  if (/deadlift|hinge|good morning|rdl|hyperextension|romanian/.test(n)) return "hinge";
  if (/lunge|split squat|step-up|step up/.test(n)) return "lunge";
  if (/carry|farmer/.test(n)) return "carry";
  if (/plank|crunch|sit-up|sit up|leg raise|knee raise|russian twist|ab |oblique|core/.test(n))
    return "core";
  if (/row|pull|chin|curl|pulldown|face pull|shrug|reverse fly/.test(n)) return "pull";
  if (/press|push|dip|bench|fly|extension|raise|jerk/.test(n)) return "push";
  if (ex.force === "pull") return "pull";
  if (ex.force === "push") return "push";
  return null;
}

async function seedExercises() {
  const exercises = (rawExercises as RawExercise[]).map((ex) => ({
    id: ex.id,
    name: ex.name,
    force: ex.force,
    level: ex.level,
    mechanic: ex.mechanic, // 'compound' | 'isolation' | null — zgodne z enumem
    equipment: ex.equipment,
    primary_muscles: ex.primaryMuscles ?? [],
    secondary_muscles: ex.secondaryMuscles ?? [],
    category: ex.category,
    instructions: INSTRUCTION_OVERRIDES[ex.id] ?? ex.instructions ?? [],
    images: (ex.images ?? []).map((img) => IMG_PREFIX + img),
    movement_pattern: deriveMovementPattern(ex),
    exercise_type: deriveExerciseType(ex),
  }));

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
interface Slot {
  exercise_id: string;
  sets: number;
  repsMin: number | null;
  repsMax: number | null;
  rest: number;
  notes?: string;
}
interface Day {
  label: string;
  slots: Slot[];
}
interface Program {
  name: string;
  description: string;
  goal: string;
  level: string;
  days_per_week: number;
  days: Day[];
}

const PROGRAMS: Program[] = [
  {
    name: "Beginner · Siłownia · Full Body 3×",
    description: "Nauka wzorców na sztandze, baza siły i masy. Compoundy nisko, pomocnicze wyżej. Double progression, RIR 2–3.",
    goal: "Siłownia · masa i siła",
    level: "początkujący",
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
          { exercise_id: "Seated_Cable_Rows", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Incline_Dumbbell_Press", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Dumbbell_Rear_Lunge", sets: 2, repsMin: 10, repsMax: 12, rest: 90, notes: "na nogę" },
          { exercise_id: "Hanging_Leg_Raise", sets: 3, repsMin: 10, repsMax: 15, rest: 60 },
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
    name: "Beginner · Dom z hantlami · Full Body 3×",
    description: "Wersja domowa flagowca beginnerowego. Zakresy powt., vertical pull (drążek/guma), łydki i pośladki. Double progression, RIR 2–3.",
    goal: "Dom (hantle) · masa i siła",
    level: "początkujący",
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
          { exercise_id: "Straight-Arm_Dumbbell_Pullover", sets: 3, repsMin: 10, repsMax: 15, rest: 90 },
          { exercise_id: "Stiff-Legged_Dumbbell_Deadlift", sets: 3, repsMin: 10, repsMax: 12, rest: 90 },
          { exercise_id: "Side_Lateral_Raise", sets: 3, repsMin: 12, repsMax: 15, rest: 60 },
          { exercise_id: "Calf_Raise_On_A_Dumbbell", sets: 3, repsMin: 12, repsMax: 15, rest: 60 },
        ],
      },
      {
        label: "Dzień C",
        slots: [
          { exercise_id: "Split_Squat_with_Dumbbells", sets: 3, repsMin: 8, repsMax: 10, rest: 120, notes: "na nogę" },
          { exercise_id: "Bent_Over_Two-Dumbbell_Row", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Dumbbell_Bench_Press", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Glute_Kickback", sets: 3, repsMin: 10, repsMax: 15, rest: 90 },
          { exercise_id: "Dumbbell_Bicep_Curl", sets: 2, repsMin: 10, repsMax: 12, rest: 60 },
          { exercise_id: "Standing_Dumbbell_Triceps_Extension", sets: 2, repsMin: 10, repsMax: 12, rest: 60 },
          { exercise_id: "Dead_Bug", sets: 2, repsMin: 10, repsMax: null, rest: 45, notes: "na stronę" },
        ],
      },
    ],
  },
  {
    name: "Beginner · Masa ciała · Full Body 3×",
    description: "Kalistenika z progresją leverage. Default: drążek do podciągania. Swapy bez sprzętu w docs. Double progression (reps → trudniejsza wariacja).",
    goal: "Masa ciała (drążek) · baza",
    level: "początkujący",
    days_per_week: 3,
    days: [
      {
        label: "Dzień A",
        slots: [
          { exercise_id: "Bodyweight_Squat", sets: 3, repsMin: 12, repsMax: 20, rest: 90 },
          { exercise_id: "Pushups", sets: 3, repsMin: 8, repsMax: 15, rest: 90 },
          { exercise_id: "Pullups", sets: 3, repsMin: 5, repsMax: 10, rest: 120 },
          { exercise_id: "Pushups", sets: 2, repsMin: 6, repsMax: 12, rest: 90 },
          { exercise_id: "Plank", sets: 3, repsMin: null, repsMax: null, rest: 60, notes: "na czas (stoper)" },
        ],
      },
      {
        label: "Dzień B",
        slots: [
          { exercise_id: "Bodyweight_Walking_Lunge", sets: 3, repsMin: 10, repsMax: 15, rest: 90, notes: "na nogę" },
          { exercise_id: "Inverted_Row", sets: 3, repsMin: 8, repsMax: 15, rest: 90 },
          { exercise_id: "Decline_Push-Up", sets: 3, repsMin: 8, repsMax: 15, rest: 90 },
          { exercise_id: "Glute_Kickback", sets: 3, repsMin: 8, repsMax: 12, rest: 90, notes: "na nogę" },
          { exercise_id: "Hanging_Leg_Raise", sets: 3, repsMin: 10, repsMax: 15, rest: 60 },
        ],
      },
      {
        label: "Dzień C",
        slots: [
          { exercise_id: "Split_Squat_with_Dumbbells", sets: 3, repsMin: 10, repsMax: 15, rest: 90, notes: "na nogę" },
          { exercise_id: "Chin-Up", sets: 3, repsMin: 5, repsMax: 10, rest: 120 },
          { exercise_id: "Pushups", sets: 3, repsMin: 6, repsMax: 12, rest: 90 },
          { exercise_id: "Calf_Raise_On_A_Dumbbell", sets: 3, repsMin: 12, repsMax: 20, rest: 60, notes: "na nogę" },
          { exercise_id: "Plank", sets: 3, repsMin: null, repsMax: null, rest: 45, notes: "na czas (stoper)" },
          { exercise_id: "Superman", sets: 2, repsMin: 12, repsMax: 15, rest: 45 },
        ],
      },
    ],
  },
  {
    name: "Intermediate · Siłownia · Upper / Lower 4×",
    description: "Workhorse intermediate. Dni A siłowe (niżej), B hipertroficzne (wyżej). 10–15 hard sets/partia/tydz. RIR 1–2.",
    goal: "Siłownia · hipertrofia i siła",
    level: "średniozaawansowany",
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
          { exercise_id: "Split_Squat_with_Dumbbells", sets: 3, repsMin: 8, repsMax: 12, rest: 120, notes: "na nogę" },
          { exercise_id: "Leg_Extensions", sets: 3, repsMin: 12, repsMax: 15, rest: 90 },
          { exercise_id: "Seated_Leg_Curl", sets: 3, repsMin: 10, repsMax: 15, rest: 90 },
          { exercise_id: "Calf_Press", sets: 4, repsMin: 12, repsMax: 15, rest: 60 },
        ],
      },
    ],
  },
  {
    name: "Intermediate · Dom z hantlami · Upper / Lower 4×",
    description: "UL egzekwowany hantlami. Dół unilateral + wyższe zakresy pod load ceiling. Vertical pull drążkiem. RIR 1–2.",
    goal: "Dom (hantle) · hipertrofia",
    level: "średniozaawansowany",
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
          { exercise_id: "Split_Squat_with_Dumbbells", sets: 4, repsMin: 8, repsMax: 12, rest: 150, notes: "na nogę" },
          { exercise_id: "Stiff-Legged_Dumbbell_Deadlift", sets: 4, repsMin: 8, repsMax: 12, rest: 150 },
          { exercise_id: "Goblet_Squat", sets: 3, repsMin: 10, repsMax: 15, rest: 120, notes: "tempo 3-1-1" },
          { exercise_id: "Natural_Glute_Ham_Raise", sets: 3, repsMin: 8, repsMax: 12, rest: 90 },
          { exercise_id: "Calf_Raise_On_A_Dumbbell", sets: 4, repsMin: 12, repsMax: 20, rest: 60, notes: "na nogę" },
          { exercise_id: "Hanging_Leg_Raise", sets: 3, repsMin: 10, repsMax: 15, rest: 60 },
        ],
      },
      {
        label: "Upper B · hipertrofia",
        slots: [
          { exercise_id: "Incline_Dumbbell_Press", sets: 4, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Bent_Over_Two-Dumbbell_Row", sets: 4, repsMin: 10, repsMax: 12, rest: 120 },
          { exercise_id: "Chin-Up", sets: 3, repsMin: 6, repsMax: 10, rest: 120 },
          { exercise_id: "Seated_Dumbbell_Press", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Cable_Seated_Lateral_Raise", sets: 3, repsMin: 15, repsMax: 20, rest: 60 },
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
          { exercise_id: "Glute_Kickback", sets: 3, repsMin: 10, repsMax: 15, rest: 120 },
          { exercise_id: "Natural_Glute_Ham_Raise", sets: 3, repsMin: 12, repsMax: 15, rest: 90 },
          { exercise_id: "Seated_Calf_Raise", sets: 4, repsMin: 15, repsMax: 20, rest: 60 },
        ],
      },
    ],
  },
  {
    name: "Advanced · Siłownia · Push / Pull / Legs 6×",
    description: "PPL 6× dla usera z bazą i tolerancją objętości. Dni A ciężkie, B objętościowe. 14–20 hard sets/partia. Deload co 6–8 tyg.",
    goal: "Siłownia · hipertrofia zaawansowana",
    level: "zaawansowany",
    days_per_week: 6,
    days: [
      {
        label: "Push A · ciężki",
        slots: [
          { exercise_id: "Barbell_Bench_Press_-_Medium_Grip", sets: 4, repsMin: 4, repsMax: 6, rest: 180 },
          { exercise_id: "Standing_Military_Press", sets: 4, repsMin: 6, repsMax: 8, rest: 150 },
          { exercise_id: "Incline_Dumbbell_Press", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Cable_Seated_Lateral_Raise", sets: 4, repsMin: 12, repsMax: 20, rest: 60 },
          { exercise_id: "Standing_Dumbbell_Triceps_Extension", sets: 3, repsMin: 8, repsMax: 12, rest: 60 },
          { exercise_id: "Triceps_Pushdown", sets: 3, repsMin: 12, repsMax: 15, rest: 60 },
        ],
      },
      {
        label: "Pull A · ciężki",
        slots: [
          { exercise_id: "Barbell_Deadlift", sets: 3, repsMin: 3, repsMax: 5, rest: 180 },
          { exercise_id: "Pullups", sets: 4, repsMin: 5, repsMax: 8, rest: 150 },
          { exercise_id: "Bent_Over_Barbell_Row", sets: 4, repsMin: 6, repsMax: 10, rest: 150 },
          { exercise_id: "Seated_Cable_Rows", sets: 3, repsMin: 10, repsMax: 12, rest: 120 },
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
          { exercise_id: "Wide-Grip_Lat_Pulldown", sets: 3, repsMin: 12, repsMax: 15, rest: 90 },
          { exercise_id: "Reverse_Flyes", sets: 3, repsMin: 15, repsMax: 20, rest: 60 },
          { exercise_id: "Hammer_Curls", sets: 3, repsMin: 10, repsMax: 15, rest: 60 },
          { exercise_id: "Standing_Biceps_Cable_Curl", sets: 3, repsMin: 12, repsMax: 15, rest: 60 },
        ],
      },
      {
        label: "Legs B · objętość",
        slots: [
          { exercise_id: "Front_Barbell_Squat", sets: 4, repsMin: 6, repsMax: 10, rest: 150 },
          { exercise_id: "Split_Squat_with_Dumbbells", sets: 3, repsMin: 8, repsMax: 12, rest: 120, notes: "na nogę" },
          { exercise_id: "Leg_Extensions", sets: 4, repsMin: 12, repsMax: 20, rest: 90 },
          { exercise_id: "Seated_Leg_Curl", sets: 4, repsMin: 12, repsMax: 15, rest: 90 },
          { exercise_id: "Barbell_Hip_Thrust", sets: 3, repsMin: 8, repsMax: 12, rest: 120 },
          { exercise_id: "Calf_Press", sets: 4, repsMin: 12, repsMax: 15, rest: 60 },
        ],
      },
    ],
  },
];

async function seedPrograms() {
  // Idempotencja: usuń istniejące seedy systemowe (cascade na days/slots).
  const { error: delErr } = await db.from("programs").delete().is("user_id", null);
  if (delErr) throw new Error(`programs delete: ${delErr.message}`);

  const existingIds = new Set((rawExercises as RawExercise[]).map((e) => e.id));

  for (const prog of PROGRAMS) {
    const { data: pRow, error: pErr } = await db
      .from("programs")
      .insert({
        name: prog.name,
        description: prog.description,
        goal: prog.goal,
        level: prog.level,
        days_per_week: prog.days_per_week,
        is_default: true,
        user_id: null,
      })
      .select("id")
      .single();
    if (pErr || !pRow) throw new Error(`program insert (${prog.name}): ${pErr?.message}`);

    for (let dIdx = 0; dIdx < prog.days.length; dIdx++) {
      const day = prog.days[dIdx];
      const { data: dRow, error: dErr } = await db
        .from("program_days")
        .insert({ program_id: pRow.id, label: day.label, position: dIdx })
        .select("id")
        .single();
      if (dErr || !dRow) throw new Error(`day insert (${day.label}): ${dErr?.message}`);

      const slotRows = day.slots.map((s, sIdx) => {
        if (!existingIds.has(s.exercise_id)) {
          throw new Error(`SANITY: slot wskazuje nieistniejące ćwiczenie '${s.exercise_id}' (${day.label})`);
        }
        return {
          program_day_id: dRow.id,
          default_exercise_id: s.exercise_id,
          position: sIdx,
          target_sets: s.sets,
          target_reps_min: s.repsMin,
          target_reps_max: s.repsMax,
          rest_seconds: s.rest,
          superset_group: null,
          notes: s.notes ?? null,
        };
      });

      const { error: sErr } = await db.from("program_day_slots").insert(slotRows);
      if (sErr) throw new Error(`slots insert (${day.label}): ${sErr.message}`);
    }
    console.log(`✓ program: ${prog.name} (${prog.days.length} dni)`);
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

async function main() {
  console.log("Seeding Arco…");
  await seedExercises();
  await seedPrograms();
  await sanityCheck();
  console.log("✅ Seed zakończony.");
}

main().catch((e) => {
  console.error("❌ Seed failed:", e.message);
  process.exit(1);
});
