import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logger, type LoggerExercise } from "./Logger";

export const dynamic = "force-dynamic";

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
      .select("unit_system, default_rest_seconds")
      .maybeSingle(),
    supabase
      .from("session_exercises")
      .select(
        "id, exercise_id, position, slot_id, superset_group, notes, skipped, exercises(name, exercise_type, equipment), slot:program_day_slots(target_sets, target_reps_min, target_reps_max, rest_seconds, notes)",
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

  // Serie z poprzedniej sesji per ćwiczenie (inline "last set", RLS-aware)
  const prevSets: Record<string, LoggerExercise["previousSets"]> = {};
  await Promise.all(
    (exercises ?? []).map(async (e) => {
      const { data } = await supabase.rpc("previous_session_sets", {
        p_slot: e.slot_id,
        p_exercise: e.exercise_id,
        p_session: sessionId,
      } as unknown as { p_slot: string; p_exercise: string; p_session: string });
      prevSets[e.id] = data ?? [];
    }),
  );

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
    };
  });

  const dayMeta = session.program_days as unknown as
    | { label: string; programs: { name: string } | null }
    | null;

  // Logger = dark focus mode: wymuszamy ciemny motyw na całym ekranie sesji
  // (niezależnie od motywu reszty apki) — mniej glare na siłowni, większy kontrast.
  return (
    <div className="dark min-h-dvh bg-background text-foreground">
      <Logger
        sessionId={session.id}
        title={dayMeta ? `${dayMeta.programs?.name ?? ""} · ${dayMeta.label}` : "Freestyle"}
        isFinished={!!session.finished_at}
        startedAt={session.started_at}
        unit={settings?.unit_system ?? "kg"}
        defaultRest={settings?.default_rest_seconds ?? 120}
        initialExercises={model}
      />
    </div>
  );
}
