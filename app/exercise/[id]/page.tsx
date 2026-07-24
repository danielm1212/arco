import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { exerciseDisplayName } from "@/lib/exerciseSearch";
import type { ExerciseType, SessionSet, UnitSystem } from "@/lib/types";
import { formatSet, LIMITS, weightToDisplay } from "@/lib/format";
import { setMetric } from "@/lib/exerciseMetrics";
import { repPRRows } from "@/lib/repPRs";
import { Sparkline } from "@/components/Sparkline";
import { PageHeader } from "@/components/navigation/PageHeader";
import { ScreenChrome } from "@/components/navigation/ScreenChrome";
import { joinMany } from "@/lib/dbJoins";

/** Najlepsza metryka sesji wg typu: e1RM (weighted) / powt. (bodyweight) / czas (timed). */
function bestMetric(type: ExerciseType, sets: SessionSet[]): number | null {
  let best: number | null = null;
  for (const s of sets) {
    const v = setMetric(type, s);
    if (v != null && (best == null || v > best)) best = v;
  }
  return best;
}

export const dynamic = "force-dynamic";

export default async function ExercisePage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ m?: string; returnTo?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const exerciseId = decodeURIComponent(params.id);
  const sessionReturnTo = /^\/session\/[^/]+$/.test(searchParams.returnTo ?? "")
    ? searchParams.returnTo!
    : null;

  const [{ data: exercise }, { data: settings }] = await Promise.all([
    supabase
      .from("exercises")
      .select(
        "name, name_pl, exercise_type, primary_muscles, secondary_muscles, equipment, level, instructions, images",
      )
      .eq("id", exerciseId)
      .maybeSingle(),
    supabase.from("user_settings").select("unit_system").maybeSingle(),
  ]);
  if (!exercise) notFound();
  const unit: UnitSystem = settings?.unit_system ?? "kg";
  const type = exercise.exercise_type as ExerciseType;

  // Agregacja po exercise_id (brief: widok exercise-first).
  // Cap do 100 ostatnich wystąpień (audyt P2): bez limitu zapytanie rosło bez
  // końca ze stażem konta; sort po joinie, żeby limit ciął najstarsze.
  // DATA-03 (CORE-0): historia/trend ćwiczenia liczy się tylko z zakończonych
  // sesji — `sessions!inner` + filtr finished_at pozwalają odciąć otwartą sesję.
  const { data: occurrences } = await supabase
    .from("session_exercises")
    .select(
      "id, sessions!inner(started_at, finished_at), session_sets(set_index, set_type, weight, reps, duration_seconds, added_weight, completed)",
    )
    .eq("exercise_id", exerciseId)
    .not("sessions.finished_at", "is", null)
    .order("sessions(started_at)", { ascending: false, nullsFirst: false })
    .limit(100);

  const sessions = joinMany<{
    sessions: { started_at: string } | null;
    session_sets: SessionSet[];
  }>(occurrences)
    .filter((o) => o.sessions && o.session_sets.some((s) => s.completed))
    .map((o) => ({
      date: o.sessions!.started_at,
      sets: o.session_sets
        .filter((s) => s.completed)
        .sort((a, b) => a.set_index - b.set_index),
    }))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));

  // S12: rep-PRs z już pobranych serii (roboczych) — mapa reps → najlepszy ciężar
  const repBest: Record<number, number> = {};
  sessions
    .flatMap((s) => s.sets)
    .forEach((s) => {
      if (
        s.set_type !== "working" ||
        s.weight == null ||
        s.reps == null ||
        s.weight < 0 ||
        s.weight > LIMITS.weight ||
        s.reps < 1 ||
        s.reps > LIMITS.reps
      )
        return;
      if (s.weight > (repBest[s.reps] ?? 0)) repBest[s.reps] = s.weight;
    });
  const repRows = repPRRows(repBest);

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
    const workingSets = sets.filter((s) => s.set_type === "working");
    if (isWeighted) {
      if (sel === "weight") {
        let b: number | null = null;
        for (const s of workingSets)
          if (
            s.weight != null &&
            s.weight >= 0 &&
            s.weight <= LIMITS.weight &&
            (b == null || s.weight > b)
          )
            b = s.weight;
        return b;
      }
      if (sel === "vol") {
        const v = workingSets.reduce(
          (m, s) =>
            s.weight != null &&
            s.weight >= 0 &&
            s.weight <= LIMITS.weight &&
            s.reps != null &&
            s.reps >= 1 &&
            s.reps <= LIMITS.reps
              ? m + s.weight * s.reps
              : m,
          0,
        );
        return v > 0 ? Math.round(v) : null;
      }
      let b: number | null = null;
      for (const s of workingSets) {
        const v = setMetric("weighted", s);
        if (v != null && (b == null || v > b)) b = v;
      }
      return b;
    }
    return bestMetric(type, workingSets);
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
    .filter((v): v is number => v != null)
    // DATA-02: e1RM/najcięższa/objętość są liniowe w wadze — kanoniczny kg
    // konwertujemy do jednostki profilu dopiero tutaj, na granicy wyświetlania.
    .map((v) => (isWeighted ? weightToDisplay(v, unit) : v));

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      {sessionReturnTo ? (
        <ScreenChrome
          screenType="session-child"
          showBottomNav={false}
          activeTab={null}
          showSessionMiniBar={false}
          miniBarPosition="safe-bottom"
        />
      ) : null}
      <PageHeader
        title={exerciseDisplayName(exercise)}
        fallback={sessionReturnTo ?? "/progress"}
        backLabel={sessionReturnTo ? "Wróć do treningu" : "Wróć do postępów"}
        sticky
      />

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
                    alt={exerciseDisplayName(exercise)}
                    loading="lazy"
                    decoding="async"
                    width={800}
                    height={600}
                    className="h-auto w-full rounded-md border bg-muted"
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
                    replace
                    href={`/exercise/${encodeURIComponent(exerciseId)}?${new URLSearchParams({
                      ...(t.key === "e1rm" ? {} : { m: t.key }),
                      ...(sessionReturnTo ? { returnTo: sessionReturnTo } : {}),
                    }).toString()}`}
                    aria-current={t.key === sel ? "page" : undefined}
                    className={`flex min-h-11 flex-1 items-center justify-center rounded-md border px-2 text-center text-sm ${
                      t.key === sel
                        ? "border-support bg-support/10 font-medium text-support"
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
                Po drugim treningu zobaczysz pierwszy trend.
              </p>
            )}
          </section>
        )}

        {/* S12: rekordy per liczba powtórzeń (wzorzec Hevy „Set Records") */}
        {isWeighted && repRows.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Rekordy dla różnych zakresów powtórzeń pojawią się po pierwszych seriach roboczych.
          </p>
        )}
        {isWeighted && repRows.length > 0 && (
          <section className="space-y-sm rounded-xl bg-card p-md text-card-foreground shadow-sm">
            <h2 className="text-base font-semibold">Rekordy dla liczby powtórzeń</h2>
            <ul className="space-y-px text-sm">
              {repRows.map((r) => (
                <li key={r.reps} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{r.reps} powt.</span>
                  <span className="font-medium tabular-nums">
                    {weightToDisplay(r.weight, unit)} {unit}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              Najlepszy ciężar dla danej liczby powtórzeń. Na tej podstawie Arco podpowiada kolejny cel.
            </p>
          </section>
        )}

        <h2 className="text-base font-semibold">Historia</h2>

        {sessions.length === 0 ? (
          <p className="pt-xl text-center text-sm text-muted-foreground">
            Jeszcze go nie robiłeś. Dodaj do treningu, a historia i rekordy zbudują się same.
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
