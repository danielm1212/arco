import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { UnitSystem } from "@/lib/types";
import {
  PERIODS,
  getActivity,
  getPeriodOverview,
  getPersonalRecords,
  getStrengthTrends,
} from "./stats";
import {
  ActivitySection,
  BalanceSection,
  PeriodTabs,
  RecordsSection,
  Stat,
  StrengthSection,
} from "./sections";

export const dynamic = "force-dynamic";

/**
 * /progress — S9-cz.2 paczka 4: orkiestracja po splicie (dane → ./stats.ts,
 * sekcje → ./sections.tsx, heatmapa vendor przez next/dynamic poza initial JS).
 */
export default async function ProgressPage({
  searchParams,
}: {
  searchParams: { okres?: string };
}) {
  const supabase = createClient();
  const period = PERIODS.find((p) => p.key === searchParams.okres) ?? PERIODS[0];

  const [{ data: settings }, { count: totalSessions }] = await Promise.all([
    supabase.from("user_settings").select("unit_system").maybeSingle(),
    supabase.from("sessions").select("id", { count: "exact", head: true }),
  ]);
  const fresh = (totalSessions ?? 0) === 0; // świeże konto — inny stan niż pusty okres
  const unit: UnitSystem = settings?.unit_system ?? "kg";

  const [{ cur, volInsight, balanceInsight, deltas }, prRows, { strip, streak }, strength] =
    await Promise.all([
      getPeriodOverview(supabase, period),
      getPersonalRecords(supabase),
      getActivity(supabase),
      getStrengthTrends(supabase, unit),
    ]);
  const muscleRows = [...cur.setsPerMuscle.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex items-center justify-between border-b px-md py-sm">
        <Link href="/" className="text-xs text-muted-foreground">
          ← Trening
        </Link>
        <span className="font-semibold">Postępy</span>
        <span className="w-12" />
      </header>

      <main className="flex-1 space-y-lg p-md">
        <ActivitySection strip={strip} streak={streak} />

        <PeriodTabs activeKey={period.key} />

        {volInsight && <p className="text-sm font-medium">{volInsight}</p>}
        <section className="grid grid-cols-3 gap-sm">
          <Stat
            label={`Sesje · ${period.label}`}
            value={String(cur.sessionCount)}
            delta={deltas.sessions}
          />
          <Stat label="Serie" value={String(cur.setCount)} delta={deltas.sets} />
          <Stat
            label={`Objętość ${unit}`}
            value={Math.round(cur.volume).toLocaleString("pl-PL")}
            delta={deltas.volume}
          />
        </section>

        <BalanceSection
          periodLabel={period.label}
          periodDays={period.days}
          balanceInsight={balanceInsight}
          muscleRows={muscleRows}
          fresh={fresh}
        />

        <StrengthSection strength={strength} />

        <RecordsSection prRows={prRows} unit={unit} />
      </main>
    </div>
  );
}
