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
 * PLAN-05G: miernik nazywa poziom wyłącznie na trzy sposoby — „Początkujący”,
 * „Średniozaawansowany”, „Zaawansowany” (decyzja właściciela 2026-07-31).
 *
 * Plany o zakresie (`level_min < level_max`, dziś dwa plany lower-body) mają w bazie
 * zlepek w stylu „początkujący–średniozaawansowany”. Na mierniku równamy je do nazwy
 * `level_max`, bo tyle segmentów się zapala — etykieta ma opisywać to, co widać.
 * Świadomy koszt: taki plan stoi w grupie wg `level_min`, więc pod nagłówkiem
 * „Początkujący” zobaczysz kartę opisaną „Średniozaawansowany”. Alternatywa
 * (zmiana `level_min` w danych) rusza grupowanie ORAZ macierz rekomendacji, więc
 * zostaje na osobną decyzję produktową.
 */
const LEVEL_MAX_LABEL: Record<number, string> = {
  1: "Początkujący",
  2: "Średniozaawansowany",
  3: "Zaawansowany",
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
    levelMin === levelMax ? label : (LEVEL_MAX_LABEL[levelMax] ?? label);

  return {
    segments,
    label: resolvedLabel,
    ariaLabel: `Poziom ${levelMax} z ${LEVEL_METER_TOTAL}: ${resolvedLabel}`,
  };
}
