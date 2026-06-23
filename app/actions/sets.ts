"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SetType } from "@/lib/types";

async function db() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Brak sesji użytkownika");
  return supabase;
}

export interface SetValues {
  set_type?: SetType;
  weight?: number | null;
  reps?: number | null;
  duration_seconds?: number | null;
  added_weight?: number | null;
  rpe?: number | null;
  completed?: boolean;
}

/** Dodaj nową serię do ćwiczenia sesji (set_index = kolejny). */
export async function addSet(
  sessionId: string,
  sessionExerciseId: string,
  values: SetValues = {},
) {
  const supabase = await db();
  const { count } = await supabase
    .from("session_sets")
    .select("*", { count: "exact", head: true })
    .eq("session_exercise_id", sessionExerciseId);

  const { data, error } = await supabase
    .from("session_sets")
    .insert({
      session_exercise_id: sessionExerciseId,
      set_index: count ?? 0,
      set_type: values.set_type ?? "working",
      weight: values.weight ?? null,
      reps: values.reps ?? null,
      duration_seconds: values.duration_seconds ?? null,
      added_weight: values.added_weight ?? null,
      rpe: values.rpe ?? null,
      completed: values.completed ?? false,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath(`/session/${sessionId}`);
  return data.id;
}

/** Zaktualizuj wartości serii. */
export async function updateSet(sessionId: string, setId: string, values: SetValues) {
  const supabase = await db();
  const { error } = await supabase.from("session_sets").update(values).eq("id", setId);
  if (error) throw new Error(error.message);
  revalidatePath(`/session/${sessionId}`);
}

/** Usuń serię. */
export async function deleteSet(sessionId: string, setId: string) {
  const supabase = await db();
  const { error } = await supabase.from("session_sets").delete().eq("id", setId);
  if (error) throw new Error(error.message);
  revalidatePath(`/session/${sessionId}`);
}

/** Freestyle: dodaj ćwiczenie z katalogu do sesji (position = kolejny). */
export async function addSessionExercise(sessionId: string, exerciseId: string) {
  const supabase = await db();
  const { count } = await supabase
    .from("session_exercises")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId);

  const { error } = await supabase.from("session_exercises").insert({
    session_id: sessionId,
    slot_id: null,
    exercise_id: exerciseId,
    position: count ?? 0,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/session/${sessionId}`);
}

/** Usuń ćwiczenie z sesji (kaskadowo serie). */
export async function deleteSessionExercise(sessionId: string, sessionExerciseId: string) {
  const supabase = await db();
  const { error } = await supabase
    .from("session_exercises")
    .delete()
    .eq("id", sessionExerciseId);
  if (error) throw new Error(error.message);
  revalidatePath(`/session/${sessionId}`);
}
