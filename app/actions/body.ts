"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function uid() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Brak sesji");
  return { supabase, userId: user.id };
}

export async function logBodyMetric(values: {
  weight: number | null;
  body_fat: number | null;
  notes: string | null;
  date?: string;
}) {
  const { supabase, userId } = await uid();
  const { error } = await supabase.from("body_metrics").insert({
    user_id: userId,
    weight: values.weight,
    body_fat: values.body_fat,
    notes: values.notes,
    ...(values.date ? { date: values.date } : {}),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/body");
}

export async function deleteBodyMetric(id: string) {
  const { supabase } = await uid();
  const { error } = await supabase.from("body_metrics").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/body");
}
