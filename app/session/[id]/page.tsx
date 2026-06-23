import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logger, type LoggerExercise } from "./Logger";

export default async function SessionPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const sessionId = params.id;

  const { data: session } = await supabase
    .from("sessions")
    .select(
      "id, program_day_id, started_at, finished_at, program_days(label, programs(name))",
    )
    .eq("id", sessionId)
    .maybeSingle();
  if (!session) notFound();

  const [{ data: settings }, { data: exercises }] = await Promise.all([
    supabase
      .from("user_settings")
      .select("unit_system, default_rest_seconds, bar_weight, available_plates")
      .maybeSingle(),
    supabase
      .from("session_exercises")
      .select(
        "id, exercise_id, position, slot_id, superset_group, exercises(name, exercise_type, equipment), slot:program_day_slots(target_sets, target_reps_min, target_reps_max, rest_seconds, notes)",
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

  // "Poprzedni wynik" per ćwiczenie (RPC, RLS-aware)
  const previous: Record<string, LoggerExercise["previous"]> = {};
  await Promise.all(
    (exercises ?? []).map(async (e) => {
      const { data } = await supabase.rpc("previous_working_set", {
        p_slot: e.slot_id,
        p_exercise: e.exercise_id,
        p_session: sessionId,
      } as unknown as { p_slot: string; p_exercise: string; p_session: string });
      previous[e.id] = data?.[0] ?? null;
    }),
  );

  const model: LoggerExercise[] = (exercises ?? []).map((e) => {
    const ex = e.exercises as unknown as {
      name: string;
      exercise_type: LoggerExercise["type"];
      equipment: string | null;
    };
    const slot = e.slot as unknown as LoggerExercise["slot"];
    return {
      sessionExerciseId: e.id,
      exerciseId: e.exercise_id,
      name: ex.name,
      type: ex.exercise_type,
      equipment: ex.equipment,
      slot: slot ?? null,
      supersetGroup: e.superset_group ?? null,
      sets: (sets ?? []).filter((s) => s.session_exercise_id === e.id),
      previous: previous[e.id] ?? null,
    };
  });

  const dayMeta = session.program_days as unknown as
    | { label: string; programs: { name: string } | null }
    | null;

  return (
    <Logger
      sessionId={session.id}
      title={dayMeta ? `${dayMeta.programs?.name ?? ""} · ${dayMeta.label}` : "Freestyle"}
      isFinished={!!session.finished_at}
      unit={settings?.unit_system ?? "kg"}
      defaultRest={settings?.default_rest_seconds ?? 120}
      barWeight={Number(settings?.bar_weight ?? 20)}
      plates={(settings?.available_plates ?? []).map(Number)}
      initialExercises={model}
    />
  );
}
