"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { UnitSystem } from "@/lib/types";

export async function updateSettings(values: {
  unit_system?: UnitSystem;
  default_rest_seconds?: number;
  available_equipment?: string[];
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Brak sesji");

  const { error } = await supabase
    .from("user_settings")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}
