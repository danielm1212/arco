"use client";

import { useState } from "react";
import { muscleLabelPl } from "@/lib/exerciseFilters";
import { BottomSheet } from "@/components/ui/bottom-sheet";

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
      label: muscleLabelPl(m),
      count: n,
      pct: Math.round((n / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

function Bar({ row }: { row: ReturnType<typeof muscleSplit>[number] }) {
  return (
    <li className="flex items-center gap-sm text-sm">
      <span className="w-28 shrink-0 truncate">{row.label}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.max(6, row.pct)}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
        {row.pct}%
      </span>
    </li>
  );
}

/**
 * S13: Muscle Split % — poziome bary per partia (wzorzec Hevy „Workout Detail").
 *
 * Obcięcie do `max` było od początku świadome (karta, nie tabela), ale
 * „+ pozostałe X%" był martwym tekstem — nie dawał sposobu, żeby zobaczyć,
 * co się w tej reszcie kryje, ani dotykiem, ani czytnikiem ekranu (zgłoszenie
 * właściciela, 2026-08-08). Teraz to przycisk otwierający `BottomSheet` z
 * PEŁNĄ, nieobciętą listą — ten sam komponent `Bar`, żeby wiersze wyglądały
 * identycznie w obu miejscach.
 */
export function MuscleSplitBars({
  rows,
  max = 5,
}: {
  rows: ReturnType<typeof muscleSplit>;
  max?: number;
}) {
  const [open, setOpen] = useState(false);
  if (rows.length === 0) return null;
  const top = rows.slice(0, max);
  const rest = rows.slice(max);
  const restPct = rest.reduce((s, r) => s + r.pct, 0);

  return (
    <ul className="space-y-xs">
      {top.map((r) => (
        <Bar key={r.muscle} row={r} />
      ))}
      {restPct > 0 && (
        <li>
          <BottomSheet
            open={open}
            onOpenChange={setOpen}
            title="Pracujące partie"
            description="Pełny rozkład serii roboczych na partie mięśniowe w tym treningu"
            trigger={
              <button
                type="button"
                aria-label={`Zobacz pozostałe partie mięśniowe — jeszcze ${restPct}%`}
                className="rounded text-xs font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                + pozostałe {restPct}%
              </button>
            }
          >
            <ul className="space-y-xs">
              {rows.map((r) => (
                <Bar key={r.muscle} row={r} />
              ))}
            </ul>
          </BottomSheet>
        </li>
      )}
    </ul>
  );
}
