/** PLAN-05C: dane paska poziomu, wydzielone z komponentu żeby dało się
 *  przetestować bez renderowania (wzorzec jak `lib/streakCopy.ts`).
 *  3 poziomy = domena `TrainingLevel`/`LEVEL_RANK` w `lib/programRecommendation.ts`
 *  (beginner=1, intermediate=2, advanced=3) — programy deklarują `level_min`/
 *  `level_max` w tym samym zakresie 1–3. */
export const LEVEL_METER_TOTAL = 3;

export type LevelMeterData = {
  /** `LEVEL_METER_TOTAL` wpisów — true = poziom w zakresie [levelMin, levelMax]. */
  segments: boolean[];
  label: string;
  ariaLabel: string;
};

/** `null` gdy brakuje danych do sensownego renderu — komponent wtedy nie istnieje,
 *  nie pokazuje pasków bez etykiety ani zakresu bez granic. */
export function buildLevelMeter(
  levelMin: number | null,
  levelMax: number | null,
  label: string | null,
): LevelMeterData | null {
  if (levelMin === null || levelMax === null || !label) return null;

  const segments = Array.from({ length: LEVEL_METER_TOTAL }, (_, i) => {
    const n = i + 1;
    return n >= levelMin && n <= levelMax;
  });

  // levelMin === levelMax (typowy przypadek): pojedynczy poziom, nie zakres.
  const range = levelMin === levelMax ? `${levelMin}` : `od ${levelMin} do ${levelMax}`;

  return {
    segments,
    label,
    ariaLabel: `Poziom ${range} z ${LEVEL_METER_TOTAL}: ${label}`,
  };
}
