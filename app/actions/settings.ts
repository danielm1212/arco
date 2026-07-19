"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { joinMaybe } from "@/lib/dbJoins";
import { clampWeeklyGoal } from "@/lib/programRecommendation";
import type { ProgramFocus, TrainingPriority, UnitSystem } from "@/lib/types";

export async function updateSettings(values: {
  unit_system?: UnitSystem;
  default_rest_seconds?: number;
  available_equipment?: string[];
  weekly_goal?: number;
  display_name?: string | null;
  training_priority?: TrainingPriority;
  training_focus?: ProgramFocus;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Brak sesji");

  const patch = { ...values };
  if (patch.weekly_goal != null) {
    // F0.1 (audyt 2026-07-18, D1): cel tygodniowy nigdy nie zapisuje się poza
    // zakresem aktywnego planu, nawet gdyby klient wysłał nieaktualną wartość
    // (np. formularz otwarty przed zmianą planu w innej karcie).
    const { data: active } = await supabase
      .from("user_active_program")
      .select("programs(frequency_min, frequency_max)")
      .maybeSingle();
    const program = joinMaybe<{ frequency_min: number | null; frequency_max: number | null }>(
      active?.programs,
    );
    patch.weekly_goal = clampWeeklyGoal(
      patch.weekly_goal,
      program?.frequency_min ?? null,
      program?.frequency_max ?? null,
    );
  }

  const { error } = await supabase
    .from("user_settings")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
  revalidatePath("/");
}
