/**
 * Audyt pokrycia mięśni w programach systemowych.
 *
 * Powstał po PLAN-C1, gdzie adopcja biblioteki v2.1 po cichu zabrała trzy serie czworogłowych
 * i dwie dwugłowych względem recepty produkcyjnej. Nazwy ćwiczeń w tabeli wyglądały sensownie;
 * dopiero policzone serie na mięsień pokazały ubytek. Czytanie recepty okiem tego nie łapie.
 *
 * Skrypt nic nie blokuje — progi objętości są decyzją programową, nie regułą techniczną.
 * Ma dawać liczby do świadomej decyzji przed każdą zmianą treści planu.
 *
 *   npx tsx scripts/audit-muscle-coverage.ts                      # wszystkie programy
 *   npx tsx scripts/audit-muscle-coverage.ts intermediate-gym-fbw2
 */
import { PROGRAMS } from "./seed";
import rawExercises from "./data/exercises.json";

type RawExercise = {
  id: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
};

const byId = new Map((rawExercises as RawExercise[]).map((item) => [item.id, item]));

/** Mięśnie, których brak bezpośredniej pracy jest wart odnotowania w planie ogólnym. */
const OCZEKIWANE = [
  "quadriceps",
  "hamstrings",
  "glutes",
  "chest",
  "lats",
  "middle back",
  "shoulders",
  "biceps",
  "triceps",
  "abdominals",
  "calves",
];

function pokrycie(slug: string) {
  const program = PROGRAMS.find((item) => item.slug === slug);
  if (!program) throw new Error(`Brak programu ${slug}`);

  const bezposrednie = new Map<string, number>();
  const posrednie = new Map<string, number>();
  let serie = 0;

  for (const day of program.days) {
    for (const slot of day.slots) {
      const exercise = byId.get(slot.exercise_id);
      if (!exercise) throw new Error(`${slug}: brak ćwiczenia ${slot.exercise_id} w katalogu`);
      serie += slot.sets;
      for (const muscle of exercise.primaryMuscles ?? []) {
        bezposrednie.set(muscle, (bezposrednie.get(muscle) ?? 0) + slot.sets);
      }
      for (const muscle of exercise.secondaryMuscles ?? []) {
        posrednie.set(muscle, (posrednie.get(muscle) ?? 0) + slot.sets);
      }
    }
  }

  return { program, bezposrednie, posrednie, serie };
}

const wybrany = process.argv[2];
const slugi = wybrany ? [wybrany] : PROGRAMS.map((item) => item.slug);

for (const slug of slugi) {
  const { program, bezposrednie, posrednie, serie } = pokrycie(slug);
  const dni = program.days.length;
  const naTydzien = (wartosc: number) => (wartosc / dni) * program.frequency_min;

  console.log(`\n── ${slug} · ${dni} dni w cyklu · ${serie} serii · ${program.frequency_min}–${program.frequency_max}× w tygodniu`);
  console.log("mięsień          bezp.  pośr.   ~bezp./tydz. przy min. częstotliwości");

  for (const muscle of OCZEKIWANE) {
    const bezp = bezposrednie.get(muscle) ?? 0;
    const posr = posrednie.get(muscle) ?? 0;
    const flaga = bezp === 0 ? (posr === 0 ? "  ← ZERO pracy" : "  ← zero bezpośredniej") : "";
    console.log(
      `${muscle.padEnd(16)}${String(bezp).padStart(5)}${String(posr).padStart(7)}${naTydzien(bezp).toFixed(1).padStart(13)}${flaga}`,
    );
  }

  const nieoczekiwane = [...bezposrednie.keys()].filter((item) => !OCZEKIWANE.includes(item));
  if (nieoczekiwane.length > 0) {
    console.log(`pozostałe bezpośrednio: ${nieoczekiwane.map((m) => `${m} ${bezposrednie.get(m)}`).join(", ")}`);
  }
}

console.log(
  "\nLiczby opisują serie robocze w pełnym cyklu. Praca pośrednia pochodzi z secondaryMuscles",
  "\nw katalogu i nie zastępuje bezpośredniej — służy tylko do oceny, czy zero jest groźne.",
);
