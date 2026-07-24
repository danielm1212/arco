import { createClient } from "@/lib/supabase/server";
import { startFreestyle } from "@/app/actions/session";
import { Button } from "@/components/ui/button";
import { MomentIcon3D } from "@/components/MomentIcon3D";
import { ProgressSubnav } from "@/components/navigation/ProgressSubnav";
import type { UnitSystem } from "@/lib/types";
import { weightToDisplay } from "@/lib/format";
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
export default async function ProgressPage(props: { searchParams: Promise<{ okres?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const period = PERIODS.find((p) => p.key === searchParams.okres) ?? PERIODS[0];

  const [{ data: settings }, { count: totalSessions }] = await Promise.all([
    supabase.from("user_settings").select("unit_system, weekly_goal").maybeSingle(),
    supabase.from("sessions").select("id", { count: "exact", head: true }),
  ]);
  const fresh = (totalSessions ?? 0) === 0; // świeże konto — inny stan niż pusty okres
  const unit: UnitSystem = settings?.unit_system ?? "kg";
  // F0.6: passa w pasku aktywności liczy tygodnie spełniające cel planu (D4).
  const weeklyGoal = settings?.weekly_goal ?? 2;

  const [{ cur, volInsight, balanceInsight, deltas }, prRows, { strip, streak }, strength] =
    await Promise.all([
      getPeriodOverview(supabase, period),
      getPersonalRecords(supabase),
      getActivity(supabase, weeklyGoal),
      getStrengthTrends(supabase, unit),
    ]);
  const muscleRows = [...cur.setsPerMuscle.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="border-b px-md py-md text-center">
        <h1 className="font-semibold">Postępy</h1>
      </header>
      <ProgressSubnav active="training" />

      <main className="flex-1 space-y-lg p-md">
        {fresh ? (
          <section className="flex min-h-[60dvh] flex-col items-center justify-center text-center">
            <MomentIcon3D name="progress" className="size-32" priority />
            <h2 className="mt-sm text-xl font-semibold">Twój postęp zaczyna się od pierwszego treningu</h2>
            <p className="mt-xs max-w-xs text-sm leading-relaxed text-muted-foreground">Po dwóch sesjach pokażemy trend siły, regularność i bilans trenowanych partii.</p>
            <form action={startFreestyle} className="mt-md">
              <Button type="submit" size="lg">Rozpocznij trening</Button>
            </form>
          </section>
        ) : (
        <>
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
            value={Math.round(weightToDisplay(cur.volume, unit)).toLocaleString("pl-PL")}
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
        </>
        )}
      </main>
    </div>
  );
}
