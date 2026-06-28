/** Mapowanie `primary_muscles` (free-exercise-db) → regiony sylwetki na heatmapie.
 *  Do akceptacji/korekty przez właściciela. */

export type Region =
  | "shoulders"
  | "chest"
  | "biceps"
  | "triceps"
  | "forearms"
  | "core"
  | "upperBack"
  | "lowerBack"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves";

export const MUSCLE_TO_REGION: Record<string, Region> = {
  shoulders: "shoulders",
  chest: "chest",
  biceps: "biceps",
  triceps: "triceps",
  forearms: "forearms",
  abdominals: "core",
  quadriceps: "quads",
  adductors: "quads",
  hamstrings: "hamstrings",
  glutes: "glutes",
  abductors: "glutes",
  calves: "calves",
  lats: "upperBack",
  "middle back": "upperBack",
  traps: "upperBack",
  neck: "upperBack",
  "lower back": "lowerBack",
};

export const REGION_LABEL: Record<Region, string> = {
  shoulders: "Barki",
  chest: "Klatka",
  biceps: "Biceps",
  triceps: "Triceps",
  forearms: "Przedramiona",
  core: "Brzuch",
  upperBack: "Plecy (górne)",
  lowerBack: "Dół pleców",
  quads: "Czworogłowe",
  hamstrings: "Dwugłowe ud",
  glutes: "Pośladki",
  calves: "Łydki",
};

/** Σ serii per region z mapy serii-na-mięsień. */
export function regionsFromMuscles(
  setsPerMuscle: Iterable<[string, number]>,
): Record<Region, number> {
  const out = {} as Record<Region, number>;
  for (const [muscle, n] of setsPerMuscle) {
    const r = MUSCLE_TO_REGION[muscle];
    if (r) out[r] = (out[r] ?? 0) + n;
  }
  return out;
}
