"use server";

import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
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
  redirect("/", RedirectType.replace);
}

type SessionStartOptions = {
  programDayId?: string;
  startedAt?: string;
  date?: string;
  isHistorical?: boolean;
  recordedDurationSeconds?: number;
};

type SessionStartResult = { sessionId: string; created: boolean };

/**
 * Atomowo wznawia jedyną otwartą sesję albo tworzy kompletny szkic loggera.
 * Całość odbywa się w jednej transakcji bazy, więc dwa kliknięcia/karty PWA
 * nie zostawią połowicznej ani podwójnej sesji.
 */
async function startOrResumeSession(
  options: SessionStartOptions = {},
): Promise<SessionStartResult> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc("start_or_resume_session", {
    p_program_day_id: options.programDayId ?? null,
    p_started_at: options.startedAt ?? null,
    p_date: options.date ?? null,
    p_is_historical: options.isHistorical ?? false,
    p_recorded_duration_seconds: options.recordedDurationSeconds ?? null,
  });
  const result = data?.[0];
  if (error || !result) {
    throw new Error(error?.message ?? "Nie udało się przygotować treningu.");
  }
  return { sessionId: result.session_id, created: result.created };
}

/** Start dnia programu; ponowna próba wznawia sesję w toku. */
export async function startSession(programDayId: string) {
  const { sessionId } = await startOrResumeSession({ programDayId });
  redirect(`/session/${sessionId}`, RedirectType.replace);
}

/** Start sesji freestyle (bez programu). */
export async function startFreestyle() {
  const { sessionId } = await startOrResumeSession();
  redirect(`/session/${sessionId}`, RedirectType.replace);
}

export type HistoricalSessionState =
  | { error?: string; activeSessionId?: string; sessionId?: string }
  | null;

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

  const result = await startOrResumeSession({
    programDayId: programDayId === "freestyle" ? undefined : programDayId,
    startedAt: occurred.toISOString(),
    date: occurredOn,
    isHistorical: true,
    recordedDurationSeconds: durationMinutes * 60,
  });
  if (!result.created) {
    return {
      error: "Masz już trening w toku. Zakończ go albo porzuć, zanim dodasz trening z przeszłości.",
      activeSessionId: result.sessionId,
    };
  }
  return { sessionId: result.sessionId };
}

/** Zakończ sesję (ustaw finished_at). */
export async function finishSession(sessionId: string) {
  const { supabase } = await requireUser();
  const { data: existing, error: existingError } = await supabase
    .from("sessions")
    .select("started_at, finished_at, is_historical, recorded_duration_seconds")
    .eq("id", sessionId)
    .maybeSingle();
  if (existingError || !existing) {
    throw new Error(existingError?.message ?? "Nie znaleziono sesji.");
  }
  if (!existing.finished_at) {
    const finishedAt =
      existing.is_historical && existing.recorded_duration_seconds
        ? new Date(
            +new Date(existing.started_at) + existing.recorded_duration_seconds * 1_000,
          ).toISOString()
        : new Date().toISOString();
    const { error } = await supabase
      .from("sessions")
      .update({ finished_at: finishedAt })
      .eq("id", sessionId)
      .is("finished_at", null);
    if (error) throw new Error(error.message);
  }

  if (!existing.is_historical) {
    // Jedyny most trening → Ekipa. RPC jest idempotentne, więc ponowienie po
    // przerwanym redirectcie naprawi brakujący efekt bez drugiego check-inu.
    const { error: activityError } = await supabase.rpc("emit_workout_activity", {
      p_session_id: sessionId,
    });
    if (activityError) throw new Error(activityError.message);
  }
  // Przelicz PR z zera (Decyzja 2 — PR nigdy nie kłamie)
  await supabase.rpc("recompute_personal_records");
  revalidatePath("/history");
  revalidatePath("/progress");
  revalidatePath("/");
  revalidatePath("/ekipa");
  if (existing.is_historical) {
    redirect(`/history/${sessionId}?added=1`, RedirectType.replace);
  }
  redirect(`/session/${sessionId}/done`, RedirectType.replace); // ekran celebracji
}

/** Usuń całą sesję. */
export async function deleteSession(sessionId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("sessions").delete().eq("id", sessionId);
  if (error) throw new Error(error.message);
  await supabase.rpc("recompute_personal_records");
  revalidatePath("/history");
  revalidatePath("/progress");
  revalidatePath("/");
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
