import type { IExerciseData, Muscle } from "react-body-highlighter";

/** Mapowanie `primary_muscles` (free-exercise-db) → mięśnie biblioteki react-body-highlighter.
 *  Do korekty przez właściciela. */
export const DB_MUSCLE_TO_SLUGS: Record<string, Muscle[]> = {
  chest: ["chest"],
  shoulders: ["front-deltoids", "back-deltoids"],
  biceps: ["biceps"],
  triceps: ["triceps"],
  forearms: ["forearm"],
  abdominals: ["abs"],
  quadriceps: ["quadriceps"],
  adductors: ["adductor"],
  hamstrings: ["hamstring"],
  glutes: ["gluteal"],
  abductors: ["abductors"],
  calves: ["calves"],
  lats: ["upper-back"],
  "middle back": ["upper-back"],
  traps: ["trapezius"],
  neck: ["neck"],
  "lower back": ["lower-back"],
};

/** Σ serii per slug z `primary_muscles` → count. */
export function musclesToSlugCounts(
  setsPerMuscle: Iterable<[string, number]>,
): Partial<Record<Muscle, number>> {
  const out: Partial<Record<Muscle, number>> = {};
  for (const [muscle, n] of setsPerMuscle) {
    for (const slug of DB_MUSCLE_TO_SLUGS[muscle] ?? []) {
      out[slug] = (out[slug] ?? 0) + n;
    }
  }
  return out;
}

/** Buduje `data` dla <Model> — frequency = poziom intensywności 1–3 (kubełki wg max). */
export function heatmapData(
  slugCounts: Partial<Record<Muscle, number>>,
): IExerciseData[] {
  const vals = Object.values(slugCounts) as number[];
  const max = Math.max(1, ...vals);
  return (Object.entries(slugCounts) as [Muscle, number][]).map(([slug, n]) => ({
    name: slug,
    muscles: [slug],
    frequency: Math.min(3, Math.max(1, Math.ceil((3 * n) / max))),
  }));
}
