import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProgramEditor, type EditorDay } from "./ProgramEditor";

export default async function ProgramEditorPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: program } = await supabase
    .from("programs")
    .select(
      "id, name, user_id, program_days(id, label, position, program_day_slots(id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, notes, exercises(name)))",
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!program) notFound();
  // Edytować można tylko własne programy (seed → duplikuj na liście)
  if (program.user_id !== user?.id) redirect("/programs");

  const days: EditorDay[] = (
    (program.program_days as unknown as {
      id: string;
      label: string;
      position: number;
      program_day_slots: {
        id: string;
        default_exercise_id: string;
        position: number;
        target_sets: number;
        target_reps_min: number | null;
        target_reps_max: number | null;
        rest_seconds: number;
        notes: string | null;
        exercises: { name: string } | null;
      }[];
    }[]) ?? []
  )
    .map((d) => ({
      id: d.id,
      label: d.label,
      position: d.position,
      slots: d.program_day_slots
        .map((s) => ({
          id: s.id,
          exerciseId: s.default_exercise_id,
          exerciseName: s.exercises?.name ?? s.default_exercise_id,
          position: s.position,
          targetSets: s.target_sets,
          repsMin: s.target_reps_min,
          repsMax: s.target_reps_max,
          rest: s.rest_seconds,
          notes: s.notes,
        }))
        .sort((a, b) => a.position - b.position),
    }))
    .sort((a, b) => a.position - b.position);

  return <ProgramEditor programId={program.id} name={program.name} days={days} />;
}
