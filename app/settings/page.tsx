import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { SettingsForm } from "./SettingsForm";
import { PageHeader } from "@/components/navigation/PageHeader";
import { joinMaybe } from "@/lib/dbJoins";
import { clampWeeklyGoal, goalRangeForProgram } from "@/lib/programRecommendation";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const [{ data: s }, { data: auth }, { data: active }] = await Promise.all([
    supabase
      .from("user_settings")
      .select("unit_system, default_rest_seconds, available_equipment, weekly_goal, display_name, training_priority, training_focus")
      .maybeSingle(),
    supabase.auth.getUser(),
    // F0.1: cel tygodniowy jest ograniczony do zakresu aktywnego planu — patrz D1.
    supabase.from("user_active_program").select("programs(frequency_min, frequency_max)").maybeSingle(),
  ]);
  const activeProgram = joinMaybe<{ frequency_min: number | null; frequency_max: number | null }>(
    active?.programs,
  );
  const goalRange = goalRangeForProgram(
    activeProgram?.frequency_min ?? null,
    activeProgram?.frequency_max ?? null,
  );

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <PageHeader title="Ustawienia" fallback="/" backLabel="Wróć do treningu" sticky />
      <main className="flex-1 p-md">
        <SettingsForm
          unit={s?.unit_system ?? "kg"}
          rest={s?.default_rest_seconds ?? 120}
          equipment={s?.available_equipment ?? []}
          weeklyGoal={clampWeeklyGoal(
            s?.weekly_goal,
            activeProgram?.frequency_min ?? null,
            activeProgram?.frequency_max ?? null,
          )}
          goalMin={goalRange.min}
          goalMax={goalRange.max}
          goalConstrainedByPlan={goalRange.constrained}
          displayName={s?.display_name ?? ""}
          priority={s?.training_priority ?? "general_fitness"}
          focus={s?.training_focus ?? "balanced"}
          userId={auth.user?.id ?? "anonymous"}
        />
        {/* F1 (redesign-home.md §3.4): przeniesione z home — jedna ikona
            wylogowania w apce, tu gdzie się jej realnie szuka */}
        <form action={logout} className="mt-lg">
          <Button variant="outline" type="submit" className="w-full text-danger">
            Wyloguj
          </Button>
        </form>
      </main>
    </div>
  );
}
