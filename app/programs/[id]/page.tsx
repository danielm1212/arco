import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { duplicateProgram } from "@/app/actions/program";
import { setActiveProgram } from "@/app/actions/session";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { ExerciseInfoSheet } from "@/components/ExerciseInfoSheet";
import { ProgramEditor, type EditorDay } from "./ProgramEditor";

export const dynamic = "force-dynamic";

export default async function ProgramEditorPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: program } = await supabase
    .from("programs")
    .select(
      "id, name, user_id, description, goal, level, days_per_week, program_days(id, label, position, program_day_slots(id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, notes, exercises(name)))",
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!program) notFound();

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

  // Własny program → edytor; preset → podgląd read-only z akcjami
  if (program.user_id === user?.id) {
    return <ProgramEditor programId={program.id} name={program.name} days={days} />;
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex items-center justify-between border-b px-md py-sm">
        <Link href="/programs" className="text-xs text-muted-foreground">
          ← Biblioteka
        </Link>
        <span className="truncate px-sm font-semibold">{program.name}</span>
        <span className="w-12" />
      </header>

      <main className="flex-1 space-y-md p-md">
        <div className="flex flex-wrap gap-2xs">
          {[program.goal, program.level, `${program.days_per_week}× / tydz.`]
            .filter(Boolean)
            .map((tag) => (
              <span
                key={tag as string}
                className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
        </div>
        {program.description && (
          <p className="text-sm text-muted-foreground">{program.description}</p>
        )}

        <div className="grid grid-cols-2 gap-sm">
          <form action={setActiveProgram.bind(null, program.id)}>
            <Button type="submit" className="w-full">
              Ustaw jako aktywny
            </Button>
          </form>
          <form action={duplicateProgram.bind(null, program.id)}>
            <Button type="submit" variant="outline" className="w-full">
              Duplikuj i edytuj
            </Button>
          </form>
        </div>

        {days.map((day) => (
          <section key={day.id} className="rounded-lg border bg-card p-md text-card-foreground">
            <p className="font-medium">{day.label}</p>
            <ul className="mt-xs space-y-2xs text-sm">
              {day.slots.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-sm">
                  {/* ⓘ podgląd „jak wykonać" (N2#2) — tap na nazwie otwiera sheet */}
                  <ExerciseInfoSheet exerciseId={s.exerciseId}>
                    <button
                      type="button"
                      className="min-w-0 truncate text-left underline-offset-2 hover:underline"
                      title="Jak wykonać"
                    >
                      {s.exerciseName}{" "}
                      <Info className="inline size-3.5 align-[-2px] text-muted-foreground" />
                    </button>
                  </ExerciseInfoSheet>
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    {s.targetSets} ×{" "}
                    {s.repsMin != null
                      ? s.repsMax && s.repsMax !== s.repsMin
                        ? `${s.repsMin}-${s.repsMax}`
                        : s.repsMin
                      : s.notes ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
