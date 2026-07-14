"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { localDayKey } from "@/lib/week";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

/** Zapisz aktywny program bez wymuszania nawigacji (np. onboarding). */
export async function saveActiveProgram(programId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("user_active_program")
    .upsert({ user_id: user.id, program_id: programId }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

/** Ustaw aktywny program i wróć do ekranu Trening. */
export async function setActiveProgram(programId: string) {
  await saveActiveProgram(programId);
  redirect("/");
}

type NewSessionOptions = {
  startedAt?: string;
  date?: string;
  isHistorical?: boolean;
  recordedDurationSeconds?: number;
};

/** Tworzy sesję i jej ćwiczenia z dnia programu. */
async function createProgramSession(programDayId: string, options: NewSessionOptions = {}) {
  const { supabase, user } = await requireUser();

  const { data: slots, error: slotsErr } = await supabase
    .from("program_day_slots")
    .select("id, default_exercise_id, position, superset_group, target_sets")
    .eq("program_day_id", programDayId)
    .order("position");
  if (slotsErr) throw new Error(slotsErr.message);

  const { data: session, error: sErr } = await supabase
    .from("sessions")
    .insert({
      user_id: user.id,
      program_day_id: programDayId,
      ...(options.startedAt ? { started_at: options.startedAt } : {}),
      ...(options.date ? { date: options.date } : {}),
      ...(options.isHistorical ? { is_historical: true } : {}),
      ...(options.recordedDurationSeconds
        ? { recorded_duration_seconds: options.recordedDurationSeconds }
        : {}),
    })
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
    const { data: createdExercises, error: seErr } = await supabase
      .from("session_exercises")
      .insert(rows)
      .select("id, slot_id");
    if (seErr || !createdExercises) {
      await supabase.from("sessions").delete().eq("id", session.id);
      throw new Error(seErr?.message ?? "Nie udało się przygotować ćwiczeń");
    }

    const sets = createdExercises.flatMap((exercise) => {
      const slot = slots.find((item) => item.id === exercise.slot_id);
      return Array.from({ length: Math.max(1, slot?.target_sets ?? 1) }, (_, setIndex) => ({
        session_exercise_id: exercise.id,
        set_index: setIndex,
        set_type: "working" as const,
      }));
    });
    const { error: setsErr } = await supabase.from("session_sets").insert(sets);
    if (setsErr) {
      await supabase.from("sessions").delete().eq("id", session.id);
      throw new Error(setsErr.message);
    }
  }

  return session.id;
}

/** Start sesji z dnia programu — tworzy session + session_exercises ze slotów. */
export async function startSession(programDayId: string) {
  const sessionId = await createProgramSession(programDayId);
  redirect(`/session/${sessionId}`);
}

async function createFreestyleSession(options: NewSessionOptions = {}) {
  const { supabase, user } = await requireUser();
  const { data: session, error } = await supabase
    .from("sessions")
    .insert({
      user_id: user.id,
      program_day_id: null,
      ...(options.startedAt ? { started_at: options.startedAt } : {}),
      ...(options.date ? { date: options.date } : {}),
      ...(options.isHistorical ? { is_historical: true } : {}),
      ...(options.recordedDurationSeconds
        ? { recorded_duration_seconds: options.recordedDurationSeconds }
        : {}),
    })
    .select("id")
    .single();
  if (error || !session) throw new Error(error?.message ?? "Nie udało się utworzyć sesji");
  return session.id;
}

/** Start sesji freestyle (bez programu). */
export async function startFreestyle() {
  const sessionId = await createFreestyleSession();
  redirect(`/session/${sessionId}`);
}

export type HistoricalSessionState = { error?: string } | null;

/**
 * Rozpocznij wpisywanie treningu po fakcie. Data jest wybierana PRZED loggerem,
 * dzięki czemu historia, PR-y i Ekipa od początku odnoszą się do właściwego dnia.
 */
export async function startHistoricalSession(
  _previousState: HistoricalSessionState,
  formData: FormData,
): Promise<HistoricalSessionState> {
  const occurredAt = String(formData.get("occurredAt") ?? "");
  const occurredOn = String(formData.get("occurredOn") ?? "");
  const programDayId = String(formData.get("programDayId") ?? "freestyle");
  const durationMinutes = Number(formData.get("durationMinutes"));
  const occurred = new Date(occurredAt);

  if (Number.isNaN(+occurred) || !/^\d{4}-\d{2}-\d{2}$/.test(occurredOn)) {
    return { error: "Wybierz poprawną datę i godzinę treningu." };
  }
  if (+occurred > Date.now()) return { error: "Data treningu nie może być w przyszłości." };
  if (+occurred < Date.now() - 366 * 86_400_000) {
    return { error: "Możesz dodać trening maksymalnie sprzed roku." };
  }
  if (!Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 480) {
    return { error: "Podaj czas treningu od 1 do 480 minut." };
  }

  const options: NewSessionOptions = {
    startedAt: occurred.toISOString(),
    date: occurredOn,
    isHistorical: true,
    recordedDurationSeconds: durationMinutes * 60,
  };
  const sessionId =
    programDayId === "freestyle"
      ? await createFreestyleSession(options)
      : await createProgramSession(programDayId, options);
  redirect(`/session/${sessionId}`);
}

/** Zakończ sesję (ustaw finished_at). */
export async function finishSession(sessionId: string) {
  const { supabase } = await requireUser();
  const { data: existing, error: existingError } = await supabase
    .from("sessions")
    .select("started_at, is_historical, recorded_duration_seconds")
    .eq("id", sessionId)
    .maybeSingle();
  if (existingError || !existing) {
    throw new Error(existingError?.message ?? "Nie znaleziono sesji.");
  }
  const finishedAt =
    existing.is_historical && existing.recorded_duration_seconds
      ? new Date(
          +new Date(existing.started_at) + existing.recorded_duration_seconds * 1_000,
        ).toISOString()
      : new Date().toISOString();
  const { data: session, error } = await supabase
    .from("sessions")
    .update({ finished_at: finishedAt })
    .eq("id", sessionId)
    .select("date")
    .single();
  if (error || !session) throw new Error(error?.message ?? "Nie udało się zakończyć treningu.");
  // Jedyny most trening → Ekipa. Funkcja sprawdza członkostwo+zgodę, emituje
  // tylko dzień (nigdy log) i oblicza snapshot passy po stronie serwera.
  const { error: activityError } = await supabase.rpc("emit_workout_activity", {
    p_session_id: sessionId,
  });
  if (activityError) throw new Error(activityError.message);
  // Przelicz PR z zera (Decyzja 2 — PR nigdy nie kłamie)
  await supabase.rpc("recompute_personal_records");
  revalidatePath("/history");
  revalidatePath("/progress");
  revalidatePath("/");
  revalidatePath("/ekipa");
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
    return { error: "Ta data jest starsza niż rok. Sprawdź, czy jest poprawna." };

  const { data: s } = await supabase
    .from("sessions")
    .select("date, started_at, finished_at")
    .eq("id", sessionId)
    .maybeSingle();
  if (!s) return { error: "Nie znaleziono sesji." };

  const delta = +newStart - +new Date(s.started_at);
  const patch: { started_at: string; date: string; finished_at?: string } = {
    started_at: newStart.toISOString(),
    date: localDayKey(newStart),
  };
  if (s.finished_at)
    patch.finished_at = new Date(+new Date(s.finished_at) + delta).toISOString();

  const { error } = await supabase.from("sessions").update(patch).eq("id", sessionId);
  if (error) return { error: error.message };
  if (s.finished_at) {
    const { error: activityError } = await supabase.rpc("sync_workout_activity_day", {
      p_session_id: sessionId,
      p_previous_day: s.date,
    });
    if (activityError) return { error: activityError.message };
  }
  await supabase.rpc("recompute_personal_records"); // achieved_at PR-ów pochodzi z started_at
  revalidatePath("/history");
  revalidatePath(`/history/${sessionId}`);
  revalidatePath("/progress");
  revalidatePath("/");
  return {};
}
