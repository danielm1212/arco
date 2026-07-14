"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SetType } from "@/lib/types";

async function db() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Brak sesji użytkownika");
  return supabase;
}

/**
 * Zakończony trening jest edytowalnym zapisem, nie zamrożonym dokumentem.
 * Po korekcie danych, które wpływają na wynik, odświeżamy wszystkie pochodne:
 * rekordy, postęp, historię i wskazówki na ekranie głównym.
 */
async function refreshFinishedSessionDerivedData(
  supabase: Awaited<ReturnType<typeof db>>,
  sessionId: string,
) {
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("finished_at")
    .eq("id", sessionId)
    .maybeSingle();
  if (sessionError) throw new Error(sessionError.message);
  if (!session?.finished_at) return;

  const { error: recordsError } = await supabase.rpc("recompute_personal_records");
  if (recordsError) throw new Error(recordsError.message);
  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath(`/history/${sessionId}`);
  revalidatePath("/progress");
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
  await refreshFinishedSessionDerivedData(supabase, sessionId);
  return data.id;
}

/** Idempotentny zapis całej serii (insert lub update po id) — pod synchronizację offline. */
export async function upsertSet(
  _sessionId: string,
  row: {
    id: string;
    session_exercise_id: string;
    set_index: number;
    set_type: SetType;
    weight: number | null;
    reps: number | null;
    duration_seconds: number | null;
    added_weight: number | null;
    rpe: number | null;
    completed: boolean;
  },
) {
  const supabase = await db();
  const { error } = await supabase.from("session_sets").upsert(row, { onConflict: "id" });
  if (error) throw new Error(error.message);
  await refreshFinishedSessionDerivedData(supabase, _sessionId);
}

/** Zaktualizuj wartości serii. */
export async function updateSet(sessionId: string, setId: string, values: SetValues) {
  const supabase = await db();
  const { error } = await supabase.from("session_sets").update(values).eq("id", setId);
  if (error) throw new Error(error.message);
  revalidatePath(`/session/${sessionId}`);
  await refreshFinishedSessionDerivedData(supabase, sessionId);
}

/** Usuń serię. */
export async function deleteSet(sessionId: string, setId: string) {
  const supabase = await db();
  const { error } = await supabase.from("session_sets").delete().eq("id", setId);
  if (error) throw new Error(error.message);
  revalidatePath(`/session/${sessionId}`);
  await refreshFinishedSessionDerivedData(supabase, sessionId);
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

/** Zapis notatki przy ćwiczeniu w sesji. */
export async function updateSessionExerciseNotes(
  sessionId: string,
  sessionExerciseId: string,
  notes: string,
) {
  const supabase = await db();
  const { error } = await supabase
    .from("session_exercises")
    .update({ notes: notes || null })
    .eq("id", sessionExerciseId);
  if (error) throw new Error(error.message);
  revalidatePath(`/session/${sessionId}`);
}

/** Ustaw grupę supersetu dla wielu ćwiczeń naraz (group = null → rozłącz). */
export async function setSupersetGroups(
  sessionId: string,
  updates: { id: string; group: number | null }[],
) {
  const supabase = await db();
  for (const u of updates) {
    const { error } = await supabase
      .from("session_exercises")
      .update({ superset_group: u.group })
      .eq("id", u.id);
    if (error) throw new Error(error.message);
  }
  revalidatePath(`/session/${sessionId}`);
}

/** „Pomiń" / „Przywróć" ćwiczenie z programu — zostaje slot, nie usuwamy wiersza. */
export async function setSessionExerciseSkipped(
  sessionId: string,
  sessionExerciseId: string,
  skipped: boolean,
) {
  const supabase = await db();
  const { error } = await supabase
    .from("session_exercises")
    .update({ skipped })
    .eq("id", sessionExerciseId);
  if (error) throw new Error(error.message);
  revalidatePath(`/session/${sessionId}`);
}

/**
 * R7 (audyt-loggera.md §6): przenieś ćwiczenie o jedną pozycję w górę/dół.
 * Jednostka przesunięcia = ćwiczenie LUB cała grupa supersetu (zgrupowane
 * sąsiednie wiersze przesuwają się razem — reorder nie może rozrywać pary,
 * spójne z R6). Bez dnd-liba: `position` już w schemacie, przenumerowanie
 * całej (małej) listy sesji jest tanie.
 */
export async function reorderExercise(
  sessionId: string,
  sessionExerciseId: string,
  direction: "up" | "down",
) {
  const supabase = await db();
  const { data: rows, error } = await supabase
    .from("session_exercises")
    .select("id, position, superset_group")
    .eq("session_id", sessionId)
    .order("position");
  if (error) throw new Error(error.message);
  const list = rows ?? [];

  // Bloki = maksymalne przebiegi SĄSIEDNICH wierszy tej samej niepustej grupy.
  // Singletony i (rzadki przypadek) niesąsiadująca grupa zostają osobnymi blokami.
  const blocks: typeof list[] = [];
  for (const row of list) {
    const last = blocks[blocks.length - 1];
    if (last && row.superset_group != null && last[0].superset_group === row.superset_group) {
      last.push(row);
    } else {
      blocks.push([row]);
    }
  }

  const blockIndex = blocks.findIndex((b) => b.some((r) => r.id === sessionExerciseId));
  if (blockIndex === -1) return;
  const targetIndex = direction === "up" ? blockIndex - 1 : blockIndex + 1;
  if (targetIndex < 0 || targetIndex >= blocks.length) return; // już na skraju — no-op

  [blocks[blockIndex], blocks[targetIndex]] = [blocks[targetIndex], blocks[blockIndex]];

  const flat = blocks.flat();
  for (let i = 0; i < flat.length; i++) {
    if (flat[i].position === i) continue;
    const { error: updErr } = await supabase
      .from("session_exercises")
      .update({ position: i })
      .eq("id", flat[i].id);
    if (updErr) throw new Error(updErr.message);
  }
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
  await refreshFinishedSessionDerivedData(supabase, sessionId);
}
