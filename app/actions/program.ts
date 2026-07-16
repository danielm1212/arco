"use server";

import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function ctx() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

async function syncCycleDays(programId: string) {
  const { supabase } = await ctx();
  const { count } = await supabase
    .from("program_days")
    .select("*", { count: "exact", head: true })
    .eq("program_id", programId);
  await supabase
    .from("programs")
    .update({
      cycle_days: Math.min(7, Math.max(1, count ?? 1)),
      // Legacy mirror until all old consumers stop reading this field.
      days_per_week: Math.min(7, Math.max(1, count ?? 1)),
    })
    .eq("id", programId);
}

/** Nowy własny program z jednym dniem → redirect do edytora. */
export async function createProgram() {
  const { supabase, user } = await ctx();
  const { data: prog, error } = await supabase
    .from("programs")
    .insert({ name: "Mój program", cycle_days: 1, days_per_week: 1, is_default: false, user_id: user.id })
    .select("id")
    .single();
  if (error || !prog) throw new Error(error?.message ?? "Nie udało się utworzyć programu");
  await supabase
    .from("program_days")
    .insert({ program_id: prog.id, label: "Dzień 1", position: 0 });
  redirect(`/programs/${prog.id}`);
}

/** Duplikuj program (seed lub własny) jako własny — punkt startu do edycji. */
export async function duplicateProgram(sourceId: string) {
  const { supabase, user } = await ctx();

  const { data: src } = await supabase
    .from("programs")
    .select("name, cycle_days, days_per_week, program_days(id, label, position)")
    .eq("id", sourceId)
    .single();
  if (!src) throw new Error("Nie znaleziono programu źródłowego");

  const { data: prog, error } = await supabase
    .from("programs")
    .insert({
      name: `${src.name} (kopia)`,
      cycle_days: src.cycle_days,
      days_per_week: src.days_per_week,
      is_default: false,
      user_id: user.id,
    })
    .select("id")
    .single();
  if (error || !prog) throw new Error(error?.message ?? "Kopiowanie nie powiodło się");

  const days = (src.program_days as { id: string; label: string; position: number }[]) ?? [];
  for (const d of days) {
    const { data: newDay } = await supabase
      .from("program_days")
      .insert({ program_id: prog.id, label: d.label, position: d.position })
      .select("id")
      .single();
    const { data: slots } = await supabase
      .from("program_day_slots")
      .select("default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes")
      .eq("program_day_id", d.id);
    if (newDay && slots?.length) {
      await supabase
        .from("program_day_slots")
        .insert(slots.map((s) => ({ ...s, program_day_id: newDay.id })));
    }
  }
  redirect(`/programs/${prog.id}`);
}

export async function updateProgramName(programId: string, name: string) {
  const { supabase } = await ctx();
  const { error } = await supabase.from("programs").update({ name }).eq("id", programId);
  if (error) throw new Error(error.message);
  revalidatePath(`/programs/${programId}`);
}

export async function deleteProgram(programId: string) {
  const { supabase } = await ctx();
  const { error } = await supabase.from("programs").delete().eq("id", programId);
  if (error) throw new Error(error.message);
  revalidatePath("/programs");
  redirect("/programs", RedirectType.replace);
}

export async function addDay(programId: string) {
  const { supabase } = await ctx();
  const { count } = await supabase
    .from("program_days")
    .select("*", { count: "exact", head: true })
    .eq("program_id", programId);
  const { error } = await supabase
    .from("program_days")
    .insert({ program_id: programId, label: `Dzień ${(count ?? 0) + 1}`, position: count ?? 0 });
  if (error) throw new Error(error.message);
  await syncCycleDays(programId);
  revalidatePath(`/programs/${programId}`);
}

export async function updateDayLabel(programId: string, dayId: string, label: string) {
  const { supabase } = await ctx();
  const { error } = await supabase.from("program_days").update({ label }).eq("id", dayId);
  if (error) throw new Error(error.message);
  revalidatePath(`/programs/${programId}`);
}

export async function deleteDay(programId: string, dayId: string) {
  const { supabase } = await ctx();
  const { error } = await supabase.from("program_days").delete().eq("id", dayId);
  if (error) throw new Error(error.message);
  await syncCycleDays(programId);
  revalidatePath(`/programs/${programId}`);
}

/** Przesuń dzień w górę/dół (zamiana position z sąsiadem). */
export async function moveDay(programId: string, dayId: string, dir: "up" | "down") {
  const { supabase } = await ctx();
  const { data: days } = await supabase
    .from("program_days")
    .select("id, position")
    .eq("program_id", programId)
    .order("position");
  if (!days) return;
  const i = days.findIndex((d) => d.id === dayId);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= days.length) return;
  await supabase.from("program_days").update({ position: days[j].position }).eq("id", days[i].id);
  await supabase.from("program_days").update({ position: days[i].position }).eq("id", days[j].id);
  revalidatePath(`/programs/${programId}`);
}

/** Przesuń slot w górę/dół w obrębie dnia. */
export async function moveSlot(programId: string, slotId: string, dir: "up" | "down") {
  const { supabase } = await ctx();
  const { data: slot } = await supabase
    .from("program_day_slots")
    .select("program_day_id")
    .eq("id", slotId)
    .single();
  if (!slot) return;
  const { data: slots } = await supabase
    .from("program_day_slots")
    .select("id, position")
    .eq("program_day_id", slot.program_day_id)
    .order("position");
  if (!slots) return;
  const i = slots.findIndex((s) => s.id === slotId);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= slots.length) return;
  await supabase.from("program_day_slots").update({ position: slots[j].position }).eq("id", slots[i].id);
  await supabase.from("program_day_slots").update({ position: slots[i].position }).eq("id", slots[j].id);
  revalidatePath(`/programs/${programId}`);
}

export async function addSlot(programId: string, dayId: string, exerciseId: string) {
  const { supabase } = await ctx();
  const { count } = await supabase
    .from("program_day_slots")
    .select("*", { count: "exact", head: true })
    .eq("program_day_id", dayId);
  const { error } = await supabase.from("program_day_slots").insert({
    program_day_id: dayId,
    default_exercise_id: exerciseId,
    position: count ?? 0,
    target_sets: 3,
    target_reps_min: 8,
    target_reps_max: 12,
    rest_seconds: 120,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/programs/${programId}`);
}

export async function updateSlot(
  programId: string,
  slotId: string,
  values: {
    target_sets?: number;
    target_reps_min?: number | null;
    target_reps_max?: number | null;
    rest_seconds?: number;
    notes?: string | null;
  },
) {
  const { supabase } = await ctx();
  const { error } = await supabase.from("program_day_slots").update(values).eq("id", slotId);
  if (error) throw new Error(error.message);
  revalidatePath(`/programs/${programId}`);
}

export async function deleteSlot(programId: string, slotId: string) {
  const { supabase } = await ctx();
  const { error } = await supabase.from("program_day_slots").delete().eq("id", slotId);
  if (error) throw new Error(error.message);
  revalidatePath(`/programs/${programId}`);
}
