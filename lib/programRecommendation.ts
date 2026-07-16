export type TrainingLevel = "beginner" | "intermediate" | "advanced";
export type TrainingEnvironment = "gym" | "home" | "bodyweight";
export type ProgramFocus = "balanced" | "lower_body";

export const PROGRAM_FOCUSES: { id: ProgramFocus; label: string; hint: string }[] = [
  {
    id: "balanced",
    label: "Całe ciało równomiernie",
    hint: "Podobna ilość pracy dla góry i dołu ciała.",
  },
  {
    id: "lower_body",
    label: "Więcej pośladków i nóg",
    hint: "Większa część planu rozwija dolne ciało, ale góra nadal jest trenowana.",
  },
];

export function formatProgramFocus(focus: ProgramFocus | null) {
  return PROGRAM_FOCUSES.find((item) => item.id === focus)?.label ?? PROGRAM_FOCUSES[0].label;
}

export type ProgramCandidate = {
  id: string;
  slug: string | null;
  name: string;
  cycle_days: number;
  environment: TrainingEnvironment | null;
  level_min: number | null;
  level_max: number | null;
  frequency_min: number | null;
  frequency_max: number | null;
  estimated_minutes_min: number | null;
  estimated_minutes_max: number | null;
  required_equipment: string[];
  optional_equipment: string[];
  focus_key: ProgramFocus | null;
};

export type ProgramRecommendation = {
  program: ProgramCandidate;
  exact: boolean;
  score: number;
  note: string | null;
};

const LEVEL_RANK: Record<TrainingLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

export const EQUIPMENT_BY_ENVIRONMENT: Record<TrainingEnvironment, string[]> = {
  gym: [
    "barbell",
    "dumbbell",
    "kettlebells",
    "cable",
    "machine",
    "body only",
    "bands",
    "medicine ball",
    "exercise ball",
    "e-z curl bar",
    "foam roll",
    "other",
  ],
  home: ["dumbbell", "body only"],
  bodyweight: ["body only", "pull-up bar"],
};

function distanceFromRange(value: number, min: number, max: number) {
  if (value < min) return min - value;
  if (value > max) return value - max;
  return 0;
}

/**
 * Deterministic recommendation policy:
 * - environment is a hard boundary (never recommend a gym plan at home),
 * - exceeding the user's realistic weekly goal is penalised more heavily than
 *   recommending a slightly shorter plan,
 * - missing required equipment makes a plan a last resort.
 */
export function recommendProgram({
  programs,
  level,
  environment,
  weeklyGoal,
  availableEquipment,
  focus = "balanced",
}: {
  programs: ProgramCandidate[];
  level: TrainingLevel;
  environment: TrainingEnvironment;
  weeklyGoal: number;
  availableEquipment: string[];
  focus?: ProgramFocus;
}): ProgramRecommendation | null {
  const rank = LEVEL_RANK[level];
  const equipment = new Set(availableEquipment);
  const eligible = programs.filter(
    (program) =>
      program.environment === environment &&
      program.level_min !== null &&
      program.level_max !== null &&
      program.frequency_min !== null &&
      program.frequency_max !== null,
  );

  const scored = eligible.map((program) => {
    const levelDistance = distanceFromRange(rank, program.level_min!, program.level_max!);
    const missingEquipment = program.required_equipment.filter((item) => !equipment.has(item));
    const belowPlan = Math.max(0, program.frequency_min! - weeklyGoal);
    const abovePlan = Math.max(0, weeklyGoal - program.frequency_max!);
    const frequencyDistance = belowPlan + abovePlan;
    const focusMismatch = (program.focus_key ?? "balanced") !== focus;

    // A plan demanding more days than the user chose is the most likely to be abandoned.
    const score =
      levelDistance * 30 +
      belowPlan * 80 +
      abovePlan * 12 +
      Number(focusMismatch) * 45 +
      missingEquipment.length * 100 +
      Math.abs(program.cycle_days - weeklyGoal) * 0.01;

    return {
      program,
      score,
      exact:
        levelDistance === 0 &&
        frequencyDistance === 0 &&
        missingEquipment.length === 0 &&
        !focusMismatch,
      levelDistance,
      belowPlan,
      abovePlan,
      missingEquipment,
      focusMismatch,
    };
  });

  scored.sort((a, b) => a.score - b.score || a.program.name.localeCompare(b.program.name, "pl"));
  const best = scored[0];
  if (!best) return null;

  const notes: string[] = [];
  if (best.levelDistance > 0) {
    notes.push("To najbliższy poziom dostępny dziś w bibliotece.");
  }
  if (best.abovePlan > 0) {
    notes.push(
      `Plan najlepiej działa ${formatFrequency(best.program.frequency_min!, best.program.frequency_max!)}; dodatkowy dzień zostaw na lekki trening freestyle lub regenerację.`,
    );
  }
  if (best.belowPlan > 0) {
    notes.push(
      `Ten plan wymaga ${formatFrequency(best.program.frequency_min!, best.program.frequency_max!)}. To mniej niż wybrany cel, ale na dziś będzie bezpieczniejszym wyborem.`,
    );
  }
  if (best.missingEquipment.length > 0) {
    notes.push("Plan może wymagać sprzętu, którego nie zaznaczono w profilu.");
  }
  if (best.focusMismatch) {
    notes.push(
      focus === "lower_body"
        ? "Nie ma jeszcze planu z naciskiem na dolne ciało dla tego miejsca lub rytmu, dlatego pokazujemy najbliższy plan równomierny."
        : "To plan z większym naciskiem na dolne ciało; wybierz go tylko, jeśli odpowiada Ci taki kierunek.",
    );
  }

  return {
    program: best.program,
    exact: best.exact,
    score: best.score,
    note: notes.length > 0 ? notes.join(" ") : null,
  };
}

export function formatFrequency(min: number, max: number) {
  return min === max ? `${min} dni/tydz.` : `od ${min} do ${max} dni/tydz.`;
}

export function formatEstimatedMinutes(min: number | null, max: number | null) {
  if (min === null || max === null) return null;
  return min === max ? `${min} min` : `od ${min} do ${max} min`;
}

const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: "sztanga",
  bands: "guma",
  "body only": "masa ciała",
  cable: "wyciągi",
  dumbbell: "hantle",
  "e-z curl bar": "gryf łamany",
  "exercise ball": "piłka",
  "foam roll": "roller",
  kettlebells: "kettlebell",
  machine: "maszyny",
  "medicine ball": "piłka lekarska",
  other: "dodatkowy sprzęt",
  "pull-up bar": "drążek",
};

/** Krótka, zrozumiała nazwa rytmu cyklu — do kart planów i onboardingu. */
export function formatCycleStructure(days: number) {
  if (days === 2) return "A → B";
  if (days === 3) return "A → B → C";
  return `${days} treningi w cyklu`;
}

export function formatEquipment(items: string[], limit = 4) {
  const labels = items.map((item) => EQUIPMENT_LABELS[item] ?? item).filter(Boolean);
  if (labels.length <= limit) return labels.join(" · ");
  return `${labels.slice(0, limit).join(" · ")} +${labels.length - limit}`;
}
