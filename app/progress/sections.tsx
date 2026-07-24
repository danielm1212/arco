import Link from "next/link";
import { ReplaceLink } from "@/components/navigation/ReplaceLink";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";
import { Sparkline } from "@/components/Sparkline";
import { MuscleHeatmapLazy } from "@/components/MuscleHeatmapLazy";
import type { UnitSystem } from "@/lib/types";
import { weightToDisplay } from "@/lib/format";
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
        <span className="flex items-center gap-1 text-sm font-medium text-primary">
          <Flame className="size-4 fill-current" aria-hidden /> {streak} {streak === 1 ? "tydzień" : "tyg."} z rzędu
        </span>
      </div>
      <div className="flex gap-px">
        {strip.map((d, i) => (
          <div key={`${d.key}-${i}`} className="flex flex-1 flex-col items-center gap-0.5">
            <div className={`h-6 w-full rounded-sm ${d.on ? "bg-primary" : "bg-muted"}`} />
            <span className="text-xs text-muted-foreground">{d.dow}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Ostatnie 14 dni</p>
    </section>
  );
}

export function PeriodTabs({ activeKey }: { activeKey: string }) {
  return (
    <div className="flex gap-2xs">
      {PERIODS.map((p) => (
        // Filtr okresu przez replace (R3a): zmiana zakresu nie stackuje historii,
        // więc Back z Postępów wychodzi do huba, nie cofa po zakładkach okresu.
        <ReplaceLink
          key={p.key}
          href={p.key === "7" ? "/progress" : `/progress?okres=${p.key}`}
          aria-current={p.key === activeKey ? "page" : undefined}
          className={`flex min-h-11 flex-1 items-center justify-center rounded-md border px-2 text-center text-sm ${
            p.key === activeKey
              ? "border-support bg-support/10 font-medium text-support"
              : "border-input text-muted-foreground"
          }`}
        >
          {p.label}
        </ReplaceLink>
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
  // S13: delta vs poprzedni okres — ↑ support (dane) / ↓ stonowane / → neutralne (±10% = bez zmiany)
  const d = delta == null ? null : delta >= 10 ? "up" : delta <= -10 ? "down" : "flat";
  return (
    <div className="rounded-xl bg-card p-sm text-center shadow-sm">
      {/* Liczba-bohater (wzorzec Withings) — font-display jak na done-screen:
          liczby-momenty mówią Gambarino w całej apce (audyt wizualny 2026-07-11) */}
      <p className="font-display text-2xl tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {d && (
        <p
          className={`mt-0.5 text-xs font-medium tabular-nums ${
            d === "up" ? "text-support" : "text-muted-foreground"
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
              Mapa sylwetki wypełni się po pierwszym treningu.
            </p>
            <Button asChild size="sm">
              <Link href="/">Zacznij trening</Link>
            </Button>
          </div>
        ) : (
          /* S14 #3b: pusty OKRES przy starszych danych — pokaż wyjście */
          <div className="flex items-center justify-between gap-sm rounded-xl bg-card p-md shadow-sm">
            <p className="text-sm text-muted-foreground">
              Brak treningów z ostatnich {periodDays} dni. Starsze dane nadal są dostępne.
            </p>
            <Link
              href="/progress?okres=all"
              className="flex min-h-11 shrink-0 items-center rounded-md border border-support bg-support/10 px-3 text-sm font-medium text-support"
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
                      className="h-full rounded-full bg-chart-primary"
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
      <p className="text-xs text-muted-foreground">
        Liczba serii roboczych na partię pomaga ocenić równowagę treningu.
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
            className="flex items-center gap-sm rounded-md bg-muted p-sm text-card-foreground"
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
          Rekordy pojawią się po zaliczeniu pierwszych serii roboczych.
        </p>
      ) : (
        <ul className="space-y-2xs">
          {prRows.map(([id, r]) => (
            <li key={id}>
              <Link
                href={`/exercise/${encodeURIComponent(id)}`}
                className="flex items-center justify-between rounded-md bg-muted p-sm text-sm"
              >
                <span className="truncate">{r.name}</span>
                <span className="shrink-0 text-muted-foreground">
                  {r.e1rm ? `e1RM ${weightToDisplay(r.e1rm, unit)}${unit}` : ""}
                  {r.maxWeight ? ` · maks. ${weightToDisplay(r.maxWeight, unit)}${unit}` : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
