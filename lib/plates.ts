/** Plate calculator — rozkład talerzy na stronę (brief Phase 2). */

export interface PlateLoad {
  perSide: { plate: number; count: number }[];
  remainder: number; // niedobitek, którego nie da się złożyć z dostępnych talerzy
  loadable: boolean; // czy target >= gryf
}

export function computePlates(
  target: number,
  bar: number,
  plates: number[],
): PlateLoad {
  if (!Number.isFinite(target) || target < bar) {
    return { perSide: [], remainder: 0, loadable: false };
  }
  let perSideWeight = (target - bar) / 2;
  const sorted = [...plates].sort((a, b) => b - a);
  const perSide: { plate: number; count: number }[] = [];
  const EPS = 1e-9;

  for (const p of sorted) {
    let count = 0;
    while (perSideWeight >= p - EPS) {
      perSideWeight -= p;
      count++;
    }
    if (count > 0) perSide.push({ plate: p, count });
  }

  return {
    perSide,
    remainder: perSideWeight > EPS ? Math.round(perSideWeight * 100) / 100 : 0,
    loadable: true,
  };
}

/** Krótki opis: "20·20·10·2.5" (talerze na stronę). */
export function formatPlates(load: PlateLoad): string {
  if (!load.loadable) return "—";
  if (load.perSide.length === 0) return "sam gryf";
  const parts = load.perSide.flatMap(({ plate, count }) =>
    Array<number>(count).fill(plate),
  );
  const s = parts.join("·");
  return load.remainder > 0 ? `${s} (≈ +${load.remainder}/str.)` : s;
}
