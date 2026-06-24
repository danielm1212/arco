import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ExerciseType, SessionSet, UnitSystem } from "@/lib/types";
import { formatSet } from "@/lib/format";
import { Sparkline } from "@/components/Sparkline";

/** Najlepsza metryka sesji wg typu: e1RM (weighted) / powt. (bodyweight) / czas (timed). */
function bestMetric(type: ExerciseType, sets: SessionSet[]): number | null {
  let best: number | null = null;
  for (const s of sets) {
    let v: number | null = null;
    if (type === "weighted" && s.weight != null && s.reps != null)
      v = Math.round(s.weight * (1 + s.reps / 30) * 10) / 10;
    else if (type === "bodyweight" && s.reps != null) v = s.reps;
    else if (type === "timed" && s.duration_seconds != null) v = s.duration_seconds;
    if (v != null && (best == null || v > best)) best = v;
  }
  return best;
}

export default async function ExercisePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const exerciseId = decodeURIComponent(params.id);

  const [{ data: exercise }, { data: settings }] = await Promise.all([
    supabase
      .from("exercises")
      .select(
        "name, exercise_type, primary_muscles, secondary_muscles, equipment, level, instructions, images",
      )
      .eq("id", exerciseId)
      .maybeSingle(),
    supabase.from("user_settings").select("unit_system").maybeSingle(),
  ]);
  if (!exercise) notFound();
  const unit: UnitSystem = settings?.unit_system ?? "kg";
  const type = exercise.exercise_type as ExerciseType;

  // Agregacja po exercise_id (brief: widok exercise-first)
  const { data: occurrences } = await supabase
    .from("session_exercises")
    .select(
      "id, sessions(started_at), session_sets(set_index, set_type, weight, reps, duration_seconds, added_weight, completed)",
    )
    .eq("exercise_id", exerciseId);

  const sessions = ((occurrences as unknown as {
    sessions: { started_at: string } | null;
    session_sets: SessionSet[];
  }[]) ?? [])
    .filter((o) => o.sessions && o.session_sets.some((s) => s.completed))
    .map((o) => ({
      date: o.sessions!.started_at,
      sets: o.session_sets
        .filter((s) => s.completed)
        .sort((a, b) => a.set_index - b.set_index),
    }))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));

  const metricLabel =
    type === "weighted" ? "e1RM" : type === "bodyweight" ? "powt." : "czas (s)";
  const trend = sessions
    .slice()
    .reverse()
    .map((s) => bestMetric(type, s.sets))
    .filter((v): v is number => v != null);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex items-center justify-between border-b px-md py-sm">
        <Link href="/progress" className="text-xs text-muted-foreground">
          ← Postępy
        </Link>
        <span className="truncate px-sm font-semibold">{exercise.name}</span>
        <span className="w-12" />
      </header>

      <main className="flex-1 space-y-md p-md">
        <p className="text-xs capitalize text-muted-foreground">
          {[exercise.equipment, exercise.level].filter(Boolean).join(" · ")}
          {(exercise.primary_muscles as string[])?.length
            ? ` · ${(exercise.primary_muscles as string[]).join(", ")}`
            : ""}
        </p>

        {/* Jak wykonać — zdjęcia + instrukcje (free-exercise-db) */}
        {(((exercise.images as string[]) ?? []).length > 0 ||
          ((exercise.instructions as string[]) ?? []).length > 0) && (
          <section className="space-y-sm rounded-lg border bg-card p-md text-card-foreground">
            <h2 className="text-base font-semibold">Jak wykonać</h2>
            {((exercise.images as string[]) ?? []).length > 0 && (
              <div className="grid grid-cols-2 gap-xs">
                {(exercise.images as string[]).slice(0, 2).map((src) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={src}
                    src={src}
                    alt={exercise.name}
                    loading="lazy"
                    className="w-full rounded-md border bg-muted"
                  />
                ))}
              </div>
            )}
            {((exercise.instructions as string[]) ?? []).length > 0 && (
              <ol className="list-decimal space-y-xs pl-5 text-sm">
                {(exercise.instructions as string[]).map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            )}
          </section>
        )}

        {trend.length >= 2 && (
          <section className="space-y-xs rounded-lg border bg-card p-md">
            <div className="flex items-baseline justify-between">
              <h2 className="text-base font-semibold">Trend · {metricLabel}</h2>
              <span className="text-sm text-muted-foreground">
                {trend[trend.length - 1]}
                {type === "weighted" ? unit : ""}
              </span>
            </div>
            <Sparkline values={trend} />
          </section>
        )}

        <h2 className="text-base font-semibold">Historia</h2>

        {sessions.length === 0 ? (
          <p className="pt-xl text-center text-sm text-muted-foreground">
            Brak zaliczonych serii tego ćwiczenia.
          </p>
        ) : (
          sessions.map((s, i) => (
            <section key={i} className="rounded-lg border bg-card p-md text-card-foreground">
              <p className="text-sm text-muted-foreground">
                {new Date(s.date).toLocaleDateString("pl-PL", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="mt-2xs font-medium">
                {s.sets.map((set) => formatSet(type, set, unit)).join("  ·  ")}
              </p>
            </section>
          ))
        )}
      </main>
    </div>
  );
}
