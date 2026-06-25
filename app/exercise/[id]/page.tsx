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

export const dynamic = "force-dynamic";

export default async function ExercisePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { m?: string };
}) {
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

  // Wybór metryki (tylko ćwiczenia ciężarowe mają zakładki)
  const isWeighted = type === "weighted";
  const WEIGHTED_TABS = [
    { key: "e1rm", label: "e1RM" },
    { key: "weight", label: "Najcięższa" },
    { key: "vol", label: "Objętość" },
  ];
  const sel =
    isWeighted && WEIGHTED_TABS.some((t) => t.key === searchParams.m)
      ? (searchParams.m as string)
      : "e1rm";

  function seriesValue(sets: SessionSet[]): number | null {
    if (isWeighted) {
      if (sel === "weight") {
        let b: number | null = null;
        for (const s of sets) if (s.weight != null && (b == null || s.weight > b)) b = s.weight;
        return b;
      }
      if (sel === "vol") {
        const v = sets.reduce((m, s) => m + (s.weight ?? 0) * (s.reps ?? 0), 0);
        return v > 0 ? Math.round(v) : null;
      }
      let b: number | null = null;
      for (const s of sets)
        if (s.weight != null && s.reps != null) {
          const v = Math.round(s.weight * (1 + s.reps / 30) * 10) / 10;
          if (b == null || v > b) b = v;
        }
      return b;
    }
    return bestMetric(type, sets);
  }

  const metricLabel = isWeighted
    ? WEIGHTED_TABS.find((t) => t.key === sel)!.label
    : type === "bodyweight"
      ? "powt."
      : "czas (s)";
  const trendSuffix = isWeighted ? unit : type === "timed" ? "s" : "";
  const trend = sessions
    .slice()
    .reverse()
    .map((s) => seriesValue(s.sets))
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
          <section className="space-y-sm rounded-xl bg-card p-md text-card-foreground shadow-sm">
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

        {(isWeighted || trend.length >= 2) && (
          <section className="space-y-sm rounded-xl bg-card p-md shadow-sm">
            <div className="flex items-baseline justify-between">
              <h2 className="text-base font-semibold">
                Trend{!isWeighted ? ` · ${metricLabel}` : ""}
              </h2>
              {trend.length >= 1 && (
                <span className="text-sm text-muted-foreground">
                  {trend[trend.length - 1]}
                  {trendSuffix}
                </span>
              )}
            </div>
            {isWeighted && (
              <div className="flex gap-2xs">
                {WEIGHTED_TABS.map((t) => (
                  <Link
                    key={t.key}
                    href={
                      t.key === "e1rm"
                        ? `/exercise/${encodeURIComponent(exerciseId)}`
                        : `/exercise/${encodeURIComponent(exerciseId)}?m=${t.key}`
                    }
                    className={`flex-1 rounded-md border px-2 py-1 text-center text-xs ${
                      t.key === sel
                        ? "border-primary bg-primary/10 font-medium text-primary"
                        : "border-input text-muted-foreground"
                    }`}
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            )}
            {trend.length >= 2 ? (
              <Sparkline values={trend} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Za mało danych — potrzeba 2+ sesji.
              </p>
            )}
          </section>
        )}

        <h2 className="text-base font-semibold">Historia</h2>

        {sessions.length === 0 ? (
          <p className="pt-xl text-center text-sm text-muted-foreground">
            Brak zaliczonych serii tego ćwiczenia.
          </p>
        ) : (
          sessions.map((s, i) => (
            <section key={i} className="rounded-xl bg-card p-md text-card-foreground shadow-sm">
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
