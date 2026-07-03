"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

/** Ustaw aktywny program użytkownika. */
export async function setActiveProgram(programId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("user_active_program")
    .upsert({ user_id: user.id, program_id: programId }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
  revalidatePath("/");
  redirect("/");
}

/** Start sesji z dnia programu — tworzy session + session_exercises ze slotów. */
export async function startSession(programDayId: string) {
  const { supabase, user } = await requireUser();

  const { data: slots, error: slotsErr } = await supabase
    .from("program_day_slots")
    .select("id, default_exercise_id, position, superset_group")
    .eq("program_day_id", programDayId)
    .order("position");
  if (slotsErr) throw new Error(slotsErr.message);

  const { data: session, error: sErr } = await supabase
    .from("sessions")
    .insert({ user_id: user.id, program_day_id: programDayId })
    .select("id")
    .single();
  if (sErr || !session) throw new Error(sErr?.message ?? "Nie udało się utworzyć sesji");

  if (slots?.length) {
    // slot_id wiąże session_exercise ze slotem (progres slotu niezależny od podmiany — brief Decyzja 1)
    const rows = slots.map((s) => ({
      session_id: session.id,
      slot_id: s.id,
      exercise_id: s.default_exercise_id,
      position: s.position,
      superset_group: s.superset_group,
    }));
    const { error: seErr } = await supabase.from("session_exercises").insert(rows);
    if (seErr) throw new Error(seErr.message);
  }

  redirect(`/session/${session.id}`);
}

/** Start sesji freestyle (bez programu). */
export async function startFreestyle() {
  const { supabase, user } = await requireUser();
  const { data: session, error } = await supabase
    .from("sessions")
    .insert({ user_id: user.id, program_day_id: null })
    .select("id")
    .single();
  if (error || !session) throw new Error(error?.message ?? "Nie udało się utworzyć sesji");
  redirect(`/session/${session.id}`);
}

/** Zakończ sesję (ustaw finished_at). */
export async function finishSession(sessionId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("sessions")
    .update({ finished_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (error) throw new Error(error.message);
  // Przelicz PR z zera (Decyzja 2 — PR nigdy nie kłamie)
  await supabase.rpc("recompute_personal_records");
  revalidatePath("/history");
  revalidatePath("/progress");
  redirect(`/session/${sessionId}/done`); // ekran celebracji
}

/** Usuń całą sesję. */
export async function deleteSession(sessionId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("sessions").delete().eq("id", sessionId);
  if (error) throw new Error(error.message);
  await supabase.rpc("recompute_personal_records");
  revalidatePath("/history");
  revalidatePath("/progress");
  redirect("/history");
}

/** S12: edycja daty/czasu sesji (logowanie po fakcie). Zachowuje czas trwania. */
export async function updateSessionDate(
  sessionId: string,
  newStartIso: string,
): Promise<{ error?: string }> {
  const { supabase } = await requireUser();
  const newStart = new Date(newStartIso);
  if (Number.isNaN(+newStart)) return { error: "Nieprawidłowa data." };
  if (+newStart > Date.now()) return { error: "Data nie może być w przyszłości." };
  if (+newStart < Date.now() - 366 * 86_400_000)
    return { error: "Data starsza niż rok — sprawdź, czy się nie pomyliłeś." };

  const { data: s } = await supabase
    .from("sessions")
    .select("started_at, finished_at")
    .eq("id", sessionId)
    .maybeSingle();
  if (!s) return { error: "Nie znaleziono sesji." };

  const delta = +newStart - +new Date(s.started_at);
  const patch: { started_at: string; date: string; finished_at?: string } = {
    started_at: newStart.toISOString(),
    date: newStart.toISOString().slice(0, 10),
  };
  if (s.finished_at)
    patch.finished_at = new Date(+new Date(s.finished_at) + delta).toISOString();

  const { error } = await supabase.from("sessions").update(patch).eq("id", sessionId);
  if (error) return { error: error.message };
  await supabase.rpc("recompute_personal_records"); // achieved_at PR-ów pochodzi z started_at
  revalidatePath("/history");
  revalidatePath(`/history/${sessionId}`);
  revalidatePath("/progress");
  revalidatePath("/");
  return {};
}
