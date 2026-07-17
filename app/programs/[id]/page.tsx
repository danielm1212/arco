import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { exerciseDisplayName } from "@/lib/exerciseSearch";
import { duplicateProgram } from "@/app/actions/program";
import { setActiveProgram } from "@/app/actions/session";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { ExerciseInfoSheet } from "@/components/ExerciseInfoSheet";
import { ProgramEditor, type EditorDay } from "./ProgramEditor";
import { PageHeader } from "@/components/navigation/PageHeader";
import {
  formatCycleStructure,
  formatEquipment,
  formatEstimatedMinutes,
  formatFrequency,
  formatProgramFocus,
  formatRotationGuidance,
  formatWeeklyRotationExample,
} from "@/lib/programRecommendation";

export const dynamic = "force-dynamic";

export default async function ProgramEditorPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: program }, { data: settings }] = await Promise.all([
    supabase
      .from("programs")
      .select(
        "id, name, user_id, description, goal, level, focus_key, cycle_days, frequency_min, frequency_max, estimated_minutes_min, estimated_minutes_max, required_equipment, optional_equipment, program_days(id, label, position, program_day_slots(id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, notes, exercises(name, name_pl)))",
      )
      .eq("id", params.id)
      .maybeSingle(),
    supabase.from("user_settings").select("weekly_goal").maybeSingle(),
  ]);

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
          exerciseName: s.exercises ? exerciseDisplayName(s.exercises) : s.default_exercise_id,
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
      <PageHeader
        title={program.name}
        fallback="/programs"
        backLabel="Wróć do biblioteki programów"
        sticky
      />

      <main className="flex-1 space-y-md p-md">
        <div className="flex flex-wrap gap-2xs">
          {[
            program.goal,
            program.level,
            program.focus_key === "lower_body" ? `Kierunek: ${formatProgramFocus(program.focus_key)}` : null,
            `rotacja: ${formatCycleStructure(program.cycle_days)}`,
            program.frequency_min !== null && program.frequency_max !== null
              ? formatFrequency(program.frequency_min, program.frequency_max)
              : null,
          ]
            .filter(Boolean)
            .map((tag) => (
              <span
                key={tag as string}
                className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
        </div>
        {program.description && (
          <p className="text-sm text-muted-foreground">{program.description}</p>
        )}

        <section className="rounded-xl border border-primary/20 bg-primary/5 p-md">
          <h2 className="text-sm font-semibold">Jak działa rotacja?</h2>
          <p className="mt-2xs text-sm leading-relaxed text-muted-foreground">
            {formatRotationGuidance(program.cycle_days)}
          </p>
          {settings?.weekly_goal && (
            <p className="mt-xs text-sm font-medium text-primary">
              Przy Twoim celu ({settings.weekly_goal} treningi w tygodniu): {formatWeeklyRotationExample(program.cycle_days, settings.weekly_goal)}.
            </p>
          )}
        </section>

        <section className="grid grid-cols-2 gap-xs rounded-xl bg-card p-md text-card-foreground shadow-sm">
          <div>
            <p className="text-xs text-muted-foreground">Czas treningu</p>
            <p className="mt-2xs text-sm font-medium">
              {formatEstimatedMinutes(program.estimated_minutes_min, program.estimated_minutes_max) ?? "Według tempa"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Wymagany sprzęt</p>
            <p className="mt-2xs text-sm font-medium">
              {formatEquipment(program.required_equipment ?? [], 3) || "Bez dodatkowego sprzętu"}
            </p>
          </div>
          {program.optional_equipment?.length > 0 && (
            <div className="col-span-2 border-t pt-sm">
              <p className="text-xs text-muted-foreground">Opcjonalnie</p>
              <p className="mt-2xs text-sm">{formatEquipment(program.optional_equipment, 4)}</p>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-primary/20 bg-primary/5 p-md">
          <h2 className="text-sm font-semibold">Jak robić postęp</h2>
          <p className="mt-2xs text-sm leading-relaxed text-muted-foreground">
            Wykonuj treningi w podanej kolejności. Gdy trafisz górę zakresu powtórzeń we wszystkich seriach przy dobrej technice, następnym razem dołóż najmniejszy ciężar. Zostaw 1–3 powtórzenia w zapasie.
          </p>
        </section>

        <div className="flex flex-col gap-sm">
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
          <section key={day.id} className="rounded-xl bg-card p-md text-card-foreground shadow-sm">
            <p className="font-medium">{day.label}</p>
            <ul className="mt-xs space-y-2xs text-sm">
              {day.slots.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-sm">
                  {/* ⓘ podgląd „jak wykonać" (N2#2) — tap na nazwie otwiera sheet */}
                  <ExerciseInfoSheet exerciseId={s.exerciseId}>
                    <button
                      type="button"
                      className="flex min-h-11 min-w-0 items-center text-left underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`Jak wykonać: ${s.exerciseName}`}
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
                      : s.notes ?? "Brak zakresu"}
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
