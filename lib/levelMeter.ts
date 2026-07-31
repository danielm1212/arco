/** PLAN-05C: dane paska poziomu, wydzielone z komponentu żeby dało się
 *  przetestować bez renderowania (wzorzec jak `lib/streakCopy.ts`).
 *  3 poziomy = domena `TrainingLevel`/`LEVEL_RANK` w `lib/programRecommendation.ts`
 *  (beginner=1, intermediate=2, advanced=3) — programy deklarują `level_min`/
 *  `level_max` w tym samym zakresie 1–3. */
export const LEVEL_METER_TOTAL = 3;

export type LevelMeterData = {
  /** `LEVEL_METER_TOTAL` wpisów — true = segment zapalony. */
  segments: boolean[];
  label: string;
  ariaLabel: string;
};

/**
 * PLAN-05G: plany o zakresie poziomów (`level_min < level_max`) dostają etykietę
 * „do ...", nie zlepek obu poziomów. Zakres opisuje sufit trudności, a nie dwa
 * równorzędne poziomy — „Do średniozaawansowanego" mówi to wprost i jest o 10
 * znaków krótsze niż „Początkujący–średniozaawansowany”. Klucz to `level_max`,
 * bo tyle segmentów zapala się na mierniku.
 */
const RANGE_LABEL: Record<number, string> = {
  2: "Do średniozaawansowanego",
  3: "Do zaawansowanego",
};

/** `null` gdy brakuje danych do sensownego renderu — komponent wtedy nie istnieje,
 *  nie pokazuje pasków bez etykiety ani zakresu bez granic. */
export function buildLevelMeter(
  levelMin: number | null,
  levelMax: number | null,
  label: string | null,
): LevelMeterData | null {
  if (levelMin === null || levelMax === null || !label) return null;

  /* PLAN-05G: skala NARASTAJĄCA, nie zakres. Początkujący = 1 segment,
     średniozaawansowany = 2, zaawansowany = 3 — tak czyta się miernik trudności
     i tak robią to Tempo oraz Gymshark. Poprzedni model zapalał wyłącznie segment
     odpowiadający poziomowi, więc poziom 2 wyglądał jak `○●○` — samotna kropka
     w środku nie czytała się jako „trudniejszy”, tylko jako „inny”.
     Zakres 1–2 i pojedynczy poziom 2 dają ten sam obraz (2 zapalone), bo w obu
     przypadkach `level_max` opisuje sufit trudności planu. */
  const segments = Array.from({ length: LEVEL_METER_TOTAL }, (_, i) => i + 1 <= levelMax);

  const resolvedLabel =
    levelMin === levelMax ? label : (RANGE_LABEL[levelMax] ?? label);

  return {
    segments,
    label: resolvedLabel,
    ariaLabel: `Poziom ${levelMax} z ${LEVEL_METER_TOTAL}: ${resolvedLabel}`,
  };
}
