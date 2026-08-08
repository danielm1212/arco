import { muscleLabelPl } from "@/lib/exerciseFilters";

/**
 * Serie robocze per partia → posortowane wiersze z udziałem %.
 *
 * Świadomie NIE w `components/MuscleSplitBars.tsx` — ten plik ma `"use client"`
 * (arkusz z pełną listą wymaga stanu), a strony wywołujące tę funkcję
 * (`app/history/[id]/page.tsx`, `app/session/[id]/done/page.tsx`) są Server
 * Components liczącymi `split` PRZED renderem. Eksport funkcji z pliku
 * klienckiego zamienia ją w nieprzywoływalną referencję dla RSC — produkcyjny
 * rzut: „Attempted to call muscleSplit() from the server but muscleSplit is
 * on the client" (digest 3184562723, 2026-08-08). Ta funkcja zostaje w module
 * bez dyrektywy, więc obie strony mogą ją wywołać normalnie.
 */
export function muscleSplit(
  perMuscle: Iterable<[string, number]>,
): { muscle: string; label: string; count: number; pct: number }[] {
  const rows = [...perMuscle].filter(([, n]) => n > 0);
  const total = rows.reduce((s, [, n]) => s + n, 0);
  if (total === 0) return [];
  return rows
    .map(([m, n]) => ({
      muscle: m,
      label: muscleLabelPl(m),
      count: n,
      pct: Math.round((n / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}
