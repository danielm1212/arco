import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRepPRs } from "@/lib/repPRs";
import { Logger, type LoggerExercise } from "./Logger";

export const dynamic = "force-dynamic";

export default async function SessionPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const sessionId = params.id;

  const { data: session } = await supabase
    .from("sessions")
    .select(
      "id, program_day_id, started_at, finished_at, is_historical, recorded_duration_seconds, program_days(label, programs(name))",
    )
    .eq("id", sessionId)
    .maybeSingle();
  if (!session) notFound();

  const [{ data: settings }, { data: exercises }] = await Promise.all([
    supabase
      .from("user_settings")
      .select("unit_system, default_rest_seconds, training_priority")
      .maybeSingle(),
    supabase
      .from("session_exercises")
      .select(
        "id, exercise_id, position, slot_id, superset_group, notes, skipped, exercises(name, exercise_type, equipment), slot:program_day_slots(default_exercise_id, target_sets, target_reps_min, target_reps_max, rest_seconds, notes)",
      )
      .eq("session_id", sessionId)
      .order("position"),
  ]);

  const exIds = (exercises ?? []).map((e) => e.id);
  const { data: sets } = exIds.length
    ? await supabase
        .from("session_sets")
        .select("*")
        .in("session_exercise_id", exIds)
        .order("set_index")
    : { data: [] };

  // Serie z poprzedniej sesji per ćwiczenie (inline "last set", RLS-aware).
  // S9-cz.2 paczka 1: jedno batchowe RPC dla całej sesji zamiast N wywołań per ćwiczenie.
  const prevSets: Record<string, LoggerExercise["previousSets"]> = {};
  const [repPRs, { data: prevRows }] = await Promise.all([
    // Rep-PRs (S12) — rekordy per liczba powtórzeń, bez bieżącej sesji
    getRepPRs(supabase, [...new Set((exercises ?? []).map((e) => e.exercise_id))], sessionId),
    supabase.rpc("previous_session_sets_batch", { p_session: sessionId }),
  ]);
  for (const row of prevRows ?? []) {
    (prevSets[row.session_exercise_id] ??= []).push({
      set_index: row.set_index,
      weight: row.weight,
      reps: row.reps,
      duration_seconds: row.duration_seconds,
      added_weight: row.added_weight,
    });
  }

  const model: LoggerExercise[] = (exercises ?? []).map((e) => {
    const ex = e.exercises as unknown as {
      name: string;
      exercise_type: LoggerExercise["type"];
      equipment: string | null;
    };
    const slot = e.slot as unknown as LoggerExercise["slot"];
    const ps = prevSets[e.id] ?? [];
    return {
      sessionExerciseId: e.id,
      exerciseId: e.exercise_id,
      name: ex.name,
      type: ex.exercise_type,
      equipment: ex.equipment,
      slot: slot ?? null,
      supersetGroup: e.superset_group ?? null,
      notes: e.notes ?? null,
      skipped: e.skipped ?? false,
      sets: (sets ?? []).filter((s) => s.session_exercise_id === e.id),
      previousSets: ps,
      previous: ps.length ? ps[ps.length - 1] : null, // ostatnia seria — do hintu progresji
      repPRs: repPRs[e.exercise_id] ?? {},
    };
  });

  const dayMeta = session.program_days as unknown as
    | { label: string; programs: { name: string } | null }
    | null;

  // „Arco Warm": logger podąża za motywem apki (forced-dark ZAWIESZONY decyzją
  // 2026-07-04 — właściciel oceni jasną wersję na telefonie; ew. powrót jako opcja).
  // Przy zmianach struktury po router.refresh() remountujemy logger. Dzięki temu
  // lokalny stan nigdy nie synchronizuje się w efekcie podczas renderowania.
  const loggerKey = model
    .map((exercise) => `${exercise.sessionExerciseId}:${exercise.exerciseId}:${exercise.supersetGroup ?? ""}:${exercise.skipped}`)
    .join("|");
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Logger
        key={loggerKey}
        sessionId={session.id}
        title={dayMeta?.label ?? "Bez planu"}
        programName={dayMeta?.programs?.name ?? null}
        isFinished={!!session.finished_at}
        startedAt={session.started_at}
        isHistorical={session.is_historical}
        recordedDurationSeconds={session.recorded_duration_seconds}
        unit={settings?.unit_system ?? "kg"}
        defaultRest={settings?.default_rest_seconds ?? 120}
        trainingPriority={settings?.training_priority ?? "general_fitness"}
        initialExercises={model}
      />
    </div>
  );
}
