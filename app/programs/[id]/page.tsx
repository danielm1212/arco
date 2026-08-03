import { joinMany } from "@/lib/dbJoins";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { exerciseDisplayName } from "@/lib/exerciseSearch";
import { duplicateProgram } from "@/app/actions/program";
import { setActiveProgram } from "@/app/actions/session";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Dumbbell,
  Info,
} from "lucide-react";
import { ExerciseInfoSheet } from "@/components/ExerciseInfoSheet";
import { LevelMeter } from "@/components/LevelMeter";
import { ProgramCover } from "@/components/ProgramCover";
import { ProgramEditor, type EditorDay } from "./ProgramEditor";
import { PageHeader } from "@/components/navigation/PageHeader";
import {
  formatEquipment,
  formatRotationGuidance,
  formatWeeklyRotationExample,
} from "@/lib/programRecommendation";
import {
  formatProgramDuration,
  formatProgramFrequency,
  formatProgramLevelLabel,
  formatProgramTrainingCount,
} from "@/lib/programDetail";
import { FavoriteProgramButton } from "../FavoriteProgramButton";
import { ProgramDayStartButton } from "../ProgramDayStartButton";

export const dynamic = "force-dynamic";

export default async function ProgramEditorPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: program },
    { data: settings },
    { data: activeProgram },
    { data: favorite },
  ] = await Promise.all([
    supabase
      .from("programs")
      .select(
        "id, name, user_id, description, goal, level, level_min, level_max, focus_key, cover_image_url, cycle_days, frequency_min, frequency_max, estimated_minutes_min, estimated_minutes_max, required_equipment, optional_equipment, program_days(id, label, position, program_day_slots(id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, notes, exercises(name, name_pl)))",
      )
      .eq("id", params.id)
      .maybeSingle(),
    supabase.from("user_settings").select("weekly_goal, training_focus").maybeSingle(),
    supabase.from("user_active_program").select("program_id").maybeSingle(),
    supabase
      .from("favorite_programs")
      .select("program_id")
      .eq("program_id", params.id)
      .maybeSingle(),
  ]);

  if (!program) notFound();

  const days: EditorDay[] = (
    joinMany<{
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
    }>(program.program_days)
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

  const isActive = activeProgram?.program_id === program.id;
  const isFavorite = favorite?.program_id === program.id;
  const alongsideActivePlan = !!activeProgram?.program_id && !isActive;

  // Własny program → edytor; preset → podgląd read-only z akcjami
  if (program.user_id === user?.id) {
    return (
      <ProgramEditor
        programId={program.id}
        name={program.name}
        days={days}
        isFavorite={isFavorite}
        alongsideActivePlan={alongsideActivePlan}
      />
    );
  }

  const frequency = formatProgramFrequency(program.frequency_min, program.frequency_max);
  const duration = formatProgramDuration(
    program.estimated_minutes_min,
    program.estimated_minutes_max,
  );
  const levelLabel = formatProgramLevelLabel(program.level);
  const matchesPreferredFocus =
    settings?.training_focus === "lower_body" &&
    program.focus_key === settings.training_focus;
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <PageHeader
        title="Plan treningowy"
        fallback="/programs"
        backLabel="Wróć do biblioteki programów"
        action={
          <FavoriteProgramButton
            programId={program.id}
            programName={program.name}
            isFavorite={isFavorite}
          />
        }
        sticky
      />

      <main className="flex-1 space-y-lg p-md">
        <section
          data-program-detail
          className="overflow-hidden rounded-xl bg-card text-card-foreground shadow-sm"
        >
          <ProgramCover
            coverImageUrl={program.cover_image_url}
            focusKey={program.focus_key}
            size="hero"
          />

          <div className="space-y-md p-md">
            <div className="space-y-xs">
              <h2 className="break-words text-xl font-semibold leading-tight">{program.name}</h2>

              <div data-program-facts className="space-y-xs">
                <div className="flex flex-wrap items-center gap-x-2xs gap-y-xs text-xs text-muted-foreground min-[360px]:gap-x-sm min-[360px]:text-sm">
                  <span className="inline-flex items-center gap-2xs whitespace-nowrap">
                    <Dumbbell
                      aria-hidden="true"
                      className="size-3.5 min-[360px]:size-4"
                    />
                    {formatProgramTrainingCount(days.length)}
                  </span>
                  {frequency && (
                    <span className="inline-flex items-center gap-2xs whitespace-nowrap">
                      <CalendarDays
                        aria-hidden="true"
                        className="size-3.5 min-[360px]:size-4"
                      />
                      {frequency}
                    </span>
                  )}
                  {duration && (
                    <span className="inline-flex items-center gap-2xs whitespace-nowrap">
                      <Clock3
                        aria-hidden="true"
                        className="size-3.5 min-[360px]:size-4"
                      />
                      {duration}
                    </span>
                  )}
                </div>

                <div
                  data-program-level
                  className="flex flex-wrap items-center gap-x-sm gap-y-xs"
                >
                  <LevelMeter
                    levelMin={program.level_min}
                    levelMax={program.level_max}
                    label={levelLabel}
                  />
                  {program.goal && (
                    <span className="text-sm text-muted-foreground">{program.goal}</span>
                  )}
                  {matchesPreferredFocus && (
                    <span className="text-sm font-medium text-support">
                      Pasuje do Twojego kierunku
                    </span>
                  )}
                </div>
              </div>
            </div>

            {isActive ? (
              <div
                data-program-cta
                role="status"
                className="flex min-h-11 w-full items-center justify-center gap-xs rounded-md bg-success/10 px-md text-sm font-semibold text-foreground"
              >
                <Check aria-hidden="true" className="size-4 text-success-text" />
                Aktywny
              </div>
            ) : (
              <form data-program-cta action={setActiveProgram.bind(null, program.id)}>
                <Button type="submit" className="w-full">
                  Ustaw jako aktywny
                </Button>
              </form>
            )}
          </div>
        </section>

        {program.description && (
          <details
            data-program-description
            open
            className="group rounded-xl bg-card text-card-foreground shadow-sm"
          >
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-sm rounded-xl px-md py-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-details-marker]:hidden">
              Opis
              <ChevronDown
                aria-hidden="true"
                className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none"
              />
            </summary>
            <p className="break-words border-t px-md pb-md pt-sm text-sm leading-relaxed text-muted-foreground">
              {program.description}
            </p>
          </details>
        )}

        <section
          aria-labelledby="program-details-heading"
          className="space-y-sm rounded-xl bg-card p-md text-card-foreground shadow-sm"
        >
          <h2 id="program-details-heading" className="text-base font-semibold">
            Szczegóły planu
          </h2>
          <dl className="space-y-sm text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Wymagany sprzęt</dt>
              <dd className="mt-2xs font-medium">
                {formatEquipment(program.required_equipment ?? [], 4) ||
                  "Bez dodatkowego sprzętu"}
              </dd>
            </div>
            {program.optional_equipment?.length > 0 && (
              <div className="border-t pt-sm">
                <dt className="text-xs text-muted-foreground">Opcjonalnie</dt>
                <dd className="mt-2xs">{formatEquipment(program.optional_equipment, 4)}</dd>
              </div>
            )}
            <div className="border-t pt-sm">
              <dt className="text-xs text-muted-foreground">Kolejność treningów</dt>
              <dd className="mt-2xs leading-relaxed">
                {formatRotationGuidance(program.cycle_days)}
              </dd>
              {settings?.weekly_goal && (
                <dd className="mt-xs leading-relaxed text-support">
                  Przy {settings.weekly_goal} treningach tygodniowo:{" "}
                  {formatWeeklyRotationExample(program.cycle_days, settings.weekly_goal)}.
                </dd>
              )}
            </div>
          </dl>
        </section>

        <section aria-labelledby="program-days-heading" className="space-y-sm">
          <h2 id="program-days-heading" className="text-base font-semibold">
            Dni planu
          </h2>
          {days.map((day) => (
            <article
              key={day.id}
              className="rounded-xl bg-card p-md text-card-foreground shadow-sm"
            >
              <h3 className="font-medium">{day.label}</h3>
              <ul className="mt-xs space-y-2xs text-sm">
                {day.slots.map((s) => {
                  // Token liczbowy (np. „4 × 8-10") zostaje kompaktowy i bez zawijania.
                  // Gdy slot nie ma zakresu, prawa kolumna pokazuje wolny tekst `notes`
                  // (np. „Zrób prawie maksymalną liczbę powtórzeń") — musi się zwężać
                  // i zawijać, inaczej `shrink-0` rozpycha wiersz w poziomie (bug Androida).
                  const isNumericReps = s.repsMin != null;
                  const prescription = isNumericReps
                    ? s.repsMax && s.repsMax !== s.repsMin
                      ? `${s.repsMin}-${s.repsMax}`
                      : `${s.repsMin}`
                    : s.notes ?? "Brak zakresu";
                  return (
                    <li key={s.id} className="flex items-center justify-between gap-sm">
                      {/* ⓘ podgląd „jak wykonać" (N2#2) — tap na nazwie otwiera sheet */}
                      <ExerciseInfoSheet exerciseId={s.exerciseId}>
                        <button
                          type="button"
                          className="flex min-h-11 min-w-0 items-center text-left underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`Jak wykonać: ${s.exerciseName}`}
                        >
                          {s.exerciseName}{" "}
                          <Info
                            aria-hidden="true"
                            className="inline size-3.5 align-[-2px] text-muted-foreground"
                          />
                        </button>
                      </ExerciseInfoSheet>
                      <span
                        className={`text-right text-muted-foreground ${
                          isNumericReps
                            ? "shrink-0 whitespace-nowrap tabular-nums"
                            : "min-w-0 shrink break-words"
                        }`}
                      >
                        {s.targetSets} × {prescription}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-sm">
                <ProgramDayStartButton
                  dayId={day.id}
                  dayLabel={day.label}
                  programName={program.name}
                  alongsideActivePlan={alongsideActivePlan}
                />
              </div>
            </article>
          ))}
        </section>

        <form action={duplicateProgram.bind(null, program.id)}>
          <Button type="submit" variant="outline" className="w-full">
            Duplikuj i edytuj
          </Button>
        </form>
      </main>
    </div>
  );
}
