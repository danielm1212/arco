import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkline } from "@/components/Sparkline";
import { MuscleHeatmapLazy } from "@/components/MuscleHeatmapLazy";
import type { UnitSystem } from "@/lib/types";
import { PERIODS, type PrEntry, type StrengthRow } from "./stats";

/**
 * Sekcje trasy /progress — S9-cz.2 paczka 4: JSX przeniesiony 1:1 z page.tsx.
 * Czyste komponenty prezentacyjne (server) — dane przychodzą z ./stats.ts.
 */

export function ActivitySection({
  strip,
  streak,
}: {
  strip: { key: string; on: boolean; dow: string }[];
  streak: number;
}) {
  return (
    <section className="space-y-sm rounded-xl bg-card p-md shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Aktywność</h2>
        <span className="text-sm font-medium text-primary">
          🔥 {streak} {streak === 1 ? "tydzień" : "tyg."} z rzędu
        </span>
      </div>
      <div className="flex gap-px">
        {strip.map((d, i) => (
          <div key={`${d.key}-${i}`} className="flex flex-1 flex-col items-center gap-0.5">
            <div className={`h-6 w-full rounded-sm ${d.on ? "bg-primary" : "bg-muted"}`} />
            <span className="text-[9px] text-muted-foreground">{d.dow}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground">Ostatnie 14 dni</p>
    </section>
  );
}

export function PeriodTabs({ activeKey }: { activeKey: string }) {
  return (
    <div className="flex gap-2xs">
      {PERIODS.map((p) => (
        <Link
          key={p.key}
          href={p.key === "7" ? "/progress" : `/progress?okres=${p.key}`}
          className={`flex-1 rounded-md border px-2 py-1 text-center text-xs ${
            p.key === activeKey
              ? "border-primary bg-primary/10 font-medium text-primary"
              : "border-input text-muted-foreground"
          }`}
        >
          {p.label}
        </Link>
      ))}
    </div>
  );
}

export function Stat({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: number | null;
}) {
  // S13: delta vs poprzedni okres — ↑ volt / ↓ stonowane / → neutralne (±10% = bez zmiany)
  const d = delta == null ? null : delta >= 10 ? "up" : delta <= -10 ? "down" : "flat";
  return (
    <div className="rounded-xl bg-card p-sm text-center shadow-sm">
      <p className="text-xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {d && (
        <p
          className={`mt-0.5 text-[11px] font-medium tabular-nums ${
            d === "up" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {d === "up" ? "↑" : d === "down" ? "↓" : "→"} {delta! > 0 ? "+" : ""}
          {delta}%
        </p>
      )}
    </div>
  );
}

export function BalanceSection({
  periodLabel,
  periodDays,
  balanceInsight,
  muscleRows,
  fresh,
}: {
  periodLabel: string;
  periodDays: number | null;
  balanceInsight: string | null;
  muscleRows: [string, number][];
  fresh: boolean;
}) {
  return (
    <section className="space-y-sm">
      <h2 className="text-base font-semibold">Bilans partii · {periodLabel}</h2>
      {balanceInsight && <p className="text-sm text-muted-foreground">{balanceInsight}</p>}
      {muscleRows.length === 0 ? (
        fresh ? (
          /* S14 #3a: świeże konto — ghost zamiast „brak danych" */
          <div className="space-y-sm rounded-xl bg-card p-md text-center shadow-sm">
            <div className="pointer-events-none opacity-40" aria-hidden>
              <Sparkline values={[2, 3, 3, 4, 5, 5, 6]} className="h-16 w-full" />
            </div>
            <p className="text-sm font-medium">
              Po 2 treningach zobaczysz tu trend siły i bilans partii.
            </p>
            <p className="text-xs text-muted-foreground">
              Heatmapa sylwetki zapali się po pierwszym treningu.
            </p>
            <Button asChild size="sm">
              <Link href="/">Zacznij trening</Link>
            </Button>
          </div>
        ) : (
          /* S14 #3b: pusty OKRES przy starszych danych — pokaż wyjście */
          <div className="flex items-center justify-between gap-sm rounded-xl bg-card p-md shadow-sm">
            <p className="text-sm text-muted-foreground">
              W tych {periodDays} dniach pusto — Twoje dane są w szerszym zakresie.
            </p>
            <Link
              href="/progress?okres=all"
              className="shrink-0 rounded-md border border-primary bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
            >
              Pokaż wszystko
            </Link>
          </div>
        )
      ) : (
        <>
          <div className="rounded-xl bg-card p-md shadow-sm">
            <MuscleHeatmapLazy setsPerMuscle={muscleRows} />
          </div>
          <ul className="space-y-xs">
            {muscleRows.map(([m, n]) => {
              const max = muscleRows[0][1] || 1;
              return (
                <li key={m} className="flex items-center gap-sm text-sm">
                  <span className="w-24 shrink-0 truncate capitalize">{m}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.max(8, (n / max) * 100)}%` }}
                    />
                  </div>
                  <span className="w-5 shrink-0 text-right font-medium tabular-nums">{n}</span>
                </li>
              );
            })}
          </ul>
        </>
      )}
      <p className="text-[10px] text-muted-foreground">
        Liczba serii roboczych na partię — pilnuj równowagi (np. push vs pull).
      </p>
    </section>
  );
}

export function StrengthSection({ strength }: { strength: StrengthRow[] }) {
  if (strength.length === 0) return null;
  return (
    <section className="space-y-sm">
      <h2 className="text-base font-semibold">Postęp siły</h2>
      <ul className="space-y-2xs">
        {strength.map((s) => (
          <li
            key={s.id}
            className="flex items-center gap-sm rounded-lg bg-muted p-sm text-card-foreground"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.series.length} sesji</p>
            </div>
            <div className="w-20 shrink-0">
              <Sparkline values={s.series} className="h-9 w-full" />
            </div>
            <div className="w-16 shrink-0 text-right">
              <p className="text-sm font-medium tabular-nums">
                {s.last}
                {s.suffix}
              </p>
              <p
                className={`text-xs tabular-nums ${
                  s.delta > 0
                    ? "text-success"
                    : s.delta < 0
                      ? "text-warning"
                      : "text-muted-foreground"
                }`}
              >
                {s.delta > 0 ? "+" : ""}
                {s.delta}
                {s.suffix}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RecordsSection({
  prRows,
  unit,
}: {
  prRows: [string, PrEntry][];
  unit: UnitSystem;
}) {
  return (
    <section className="space-y-sm">
      <h2 className="text-base font-semibold">Rekordy</h2>
      {prRows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Rekordy wpadną same — wystarczy zaliczać serie ✓. Pierwszy PR to zawsze
          najlepszy dzień na siłowni.
        </p>
      ) : (
        <ul className="space-y-2xs">
          {prRows.map(([id, r]) => (
            <li key={id}>
              <Link
                href={`/exercise/${encodeURIComponent(id)}`}
                className="flex items-center justify-between rounded-lg bg-muted p-sm text-sm"
              >
                <span className="truncate">{r.name}</span>
                <span className="shrink-0 text-muted-foreground">
                  {r.e1rm ? `e1RM ${r.e1rm}${unit}` : ""}
                  {r.maxWeight ? ` · max ${r.maxWeight}${unit}` : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
