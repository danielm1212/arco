import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { SettingsForm } from "./SettingsForm";
import { PageHeader } from "@/components/navigation/PageHeader";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: s } = await supabase
    .from("user_settings")
    .select("unit_system, default_rest_seconds, available_equipment, weekly_goal, display_name, training_priority, training_focus")
    .maybeSingle();

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <PageHeader title="Ustawienia" fallback="/" backLabel="Wróć do treningu" sticky />
      <main className="flex-1 p-md">
        <SettingsForm
          unit={s?.unit_system ?? "kg"}
          rest={s?.default_rest_seconds ?? 120}
          equipment={s?.available_equipment ?? []}
          weeklyGoal={s?.weekly_goal ?? 2}
          displayName={s?.display_name ?? ""}
          priority={s?.training_priority ?? "general_fitness"}
          focus={s?.training_focus ?? "balanced"}
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
