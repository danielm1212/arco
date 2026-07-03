import { MUSCLE_OPTIONS } from "@/lib/exerciseFilters";

const LABEL_PL = Object.fromEntries(MUSCLE_OPTIONS.map((m) => [m.id, m.label]));

/** Serie robocze per partia → posortowane wiersze z udziałem %. */
export function muscleSplit(
  perMuscle: Iterable<[string, number]>,
): { muscle: string; label: string; count: number; pct: number }[] {
  const rows = [...perMuscle].filter(([, n]) => n > 0);
  const total = rows.reduce((s, [, n]) => s + n, 0);
  if (total === 0) return [];
  return rows
    .map(([m, n]) => ({
      muscle: m,
      label: LABEL_PL[m] ?? m,
      count: n,
      pct: Math.round((n / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

/** S13: Muscle Split % — poziome bary per partia (wzorzec Hevy „Workout Detail"). */
export function MuscleSplitBars({
  rows,
  max = 6,
}: {
  rows: ReturnType<typeof muscleSplit>;
  max?: number;
}) {
  if (rows.length === 0) return null;
  const top = rows.slice(0, max);
  const rest = rows.slice(max).reduce((s, r) => s + r.pct, 0);
  return (
    <ul className="space-y-xs">
      {top.map((r) => (
        <li key={r.muscle} className="flex items-center gap-sm text-sm">
          <span className="w-28 shrink-0 truncate">{r.label}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max(6, r.pct)}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
            {r.pct}%
          </span>
        </li>
      ))}
      {rest > 0 && (
        <li className="text-xs text-muted-foreground">+ pozostałe {rest}%</li>
      )}
    </ul>
  );
}
