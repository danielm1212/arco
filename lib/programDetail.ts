import { trainingWord } from "@/lib/streakCopy";

/**
 * PLAN-05D: krótkie formaty do hero szczegółu planu. W tym miejscu nie używamy
 * pełnych zdań z rekomendacji, bo trzy fakty muszą pozostać czytelne na 320 px.
 */
export function formatProgramTrainingCount(count: number): string {
  return `${count} ${trainingWord(count)}`;
}

export function formatProgramFrequency(
  min: number | null,
  max: number | null,
): string | null {
  if (min === null || max === null) return null;
  return min === max ? `${min} dni/tydz.` : `${min}–${max} dni/tydz.`;
}

export function formatProgramDuration(
  min: number | null,
  max: number | null,
): string | null {
  if (min === null || max === null) return null;
  return min === max ? `${min} min` : `${min}–${max} min`;
}

export function formatProgramLevelLabel(level: string | null): string | null {
  if (!level) return null;
  return `${level.charAt(0).toLocaleUpperCase("pl-PL")}${level.slice(1)}`;
}
