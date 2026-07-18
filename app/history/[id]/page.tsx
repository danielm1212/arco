import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { exerciseDisplayName } from "@/lib/exerciseSearch";
import { Button } from "@/components/ui/button";
import type { SessionSet, UnitSystem } from "@/lib/types";
import { formatSet } from "@/lib/format";
import { DateEditor } from "./DateEditor";
import { MuscleSplitBars, muscleSplit } from "@/components/MuscleSplitBars";
import { PageHeader } from "@/components/navigation/PageHeader";
import { MomentIcon3D } from "@/components/MomentIcon3D";
import { joinMany, joinMaybe, type DayJoin, type ExerciseJoin } from "@/lib/dbJoins";

export const dynamic = "force-dynamic";

export default async function SessionDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ added?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  const [{ data: session }, { data: settings }] = await Promise.all([
    supabase
      .from("sessions")
      .select(
        "id, started_at, finished_at, program_days(label, programs(name)), session_exercises(id, position, superset_group, exercises(name, name_pl, exercise_type, primary_muscles), session_sets(id, set_index, set_type, weight, reps, duration_seconds, added_weight, completed))",
      )
      .eq("id", params.id)
      .maybeSingle(),
    supabase.from("user_settings").select("unit_system").maybeSingle(),
  ]);

  if (!session) notFound();
  const unit: UnitSystem = settings?.unit_system ?? "kg";

  const day = joinMaybe<DayJoin>(session.program_days);
  const title = day ? `${day.programs?.name ?? ""} · ${day.label}` : "Bez planu";

  const exercises = (
    joinMany<{
      id: string;
      position: number;
      superset_group: number | null;
      exercises: Pick<ExerciseJoin, "name" | "name_pl" | "exercise_type" | "primary_muscles">;
      session_sets: SessionSet[];
    }>(session.session_exercises)
  )
    .slice()
    .sort((a, b) => a.position - b.position);

  // Podsumowanie
  const allSets = exercises.flatMap((e) => e.session_sets);
  const completed = allSets.filter((s) => s.completed);
  const volume = completed.reduce(
    (n, s) => n + (s.weight ?? 0) * (s.reps ?? 0),
    0,
  );
  const durationMin = session.finished_at
    ? Math.round((+new Date(session.finished_at) - +new Date(session.started_at)) / 60000)
    : null;

  // S13: Muscle Split % — serie robocze per główna partia
  const perMuscle = new Map<string, number>();
  exercises.forEach((e) => {
    const m = e.exercises.primary_muscles?.[0];
    if (!m) return;
    const n = e.session_sets.filter((s) => s.completed && s.set_type === "working").length;
    if (n > 0) perMuscle.set(m, (perMuscle.get(m) ?? 0) + n);
  });
  const split = muscleSplit(perMuscle);

  // PR-y zdobyte w tej sesji (wciąż aktualne rekordy z setów tej sesji)
  const setIds = allSets.map((s) => s.id);
  const { data: prsRaw } = setIds.length
    ? await supabase
        .from("personal_records")
        .select("record_type, value, exercises(name, name_pl)")
        .in("session_set_id", setIds)
    : { data: [] };
  const PR_LABEL: Record<string, string> = {
    max_weight: "ciężar",
    max_e1rm: "e1RM",
    max_reps: "powt.",
    max_duration: "czas",
  };
  const prs = joinMany<{
    record_type: string;
    value: number;
    exercises: Pick<ExerciseJoin, "name" | "name_pl"> | null;
  }>(prsRaw).map((p) => ({
    name: p.exercises ? exerciseDisplayName(p.exercises) : "",
    label: PR_LABEL[p.record_type] ?? p.record_type,
    value: p.value,
  }));

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <PageHeader
        title={title}
        fallback="/history"
        backLabel="Wróć do historii"
        sticky
        action={
          <Button variant="outline" asChild>
            <Link href={`/session/${session.id}`}>{session.finished_at ? "Edytuj" : "Otwórz"}</Link>
          </Button>
        }
      />

      <main className="flex-1 space-y-md p-md">
        {searchParams.added === "1" && (
          <section
            className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 flex items-center gap-sm rounded-xl bg-primary/10 p-sm text-primary duration-300"
            role="status"
          >
            <MomentIcon3D name="tick" className="size-12" />
            <div>
              <p className="text-sm font-semibold">Trening dodany do historii</p>
              <p className="text-xs text-muted-foreground">
                Zapisaliśmy prawdziwą datę i przeliczyliśmy Twoje rekordy.
              </p>
            </div>
          </section>
        )}

        {/* S12: edycja daty/czasu (logowanie po fakcie); sesja w toku — bez edycji */}
        {session.finished_at ? (
          <DateEditor sessionId={session.id} startedAt={session.started_at} />
        ) : (
          <p className="text-sm text-muted-foreground">
            {new Date(session.started_at).toLocaleString("pl-PL")} · w toku
          </p>
        )}

        <section className="grid grid-cols-3 gap-sm">
          <div className="rounded-xl bg-card p-sm text-center shadow-sm">
            <p className="font-display text-2xl tabular-nums">{completed.length}</p>
            <p className="text-xs text-muted-foreground">serie</p>
          </div>
          <div className="rounded-xl bg-card p-sm text-center shadow-sm">
            <p className="font-display text-2xl tabular-nums">
              {Math.round(volume).toLocaleString("pl-PL")}
            </p>
            <p className="text-xs text-muted-foreground">objętość {unit}</p>
          </div>
          <div className="rounded-xl bg-card p-sm text-center shadow-sm">
            <p className="font-display text-2xl tabular-nums">
              {durationMin != null ? `${durationMin}'` : "Brak"}
            </p>
            <p className="text-xs text-muted-foreground">czas</p>
          </div>
        </section>

        {split.length > 0 && (
          <section className="space-y-sm rounded-xl bg-card p-md text-card-foreground shadow-sm">
            <h2 className="text-sm font-semibold text-muted-foreground">Pracujące partie</h2>
            <MuscleSplitBars rows={split} />
          </section>
        )}

        {prs.length > 0 && (
          <section className="space-y-2xs rounded-xl border border-primary/40 bg-primary/5 p-md">
            <p className="text-sm font-semibold text-primary">🏆 Rekordy w tej sesji</p>
            <ul className="space-y-px text-sm">
              {prs.map((p, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="truncate">{p.name}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {p.label} {p.value}
                    {p.label === "ciężar" || p.label === "e1RM" ? unit : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {exercises.map((ex) => (
          <section
            key={ex.id}
            className={`rounded-xl bg-card p-md text-card-foreground shadow-sm ${
              ex.superset_group != null ? "border-l-4 border-l-primary" : ""
            }`}
          >
            <p className="font-medium">
              {exerciseDisplayName(ex.exercises)}
              {ex.superset_group != null && (
                <span className="ml-xs rounded-full bg-primary/15 px-2 py-0.5 align-middle text-xs font-medium text-primary">
                  SS{ex.superset_group}
                </span>
              )}
            </p>
            <ul className="mt-xs space-y-2xs">
              {ex.session_sets
                .slice()
                .sort((a, b) => a.set_index - b.set_index)
                .map((s, i) => (
                  <li
                    key={`${ex.id}-${s.set_index}-${i}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {s.set_type === "warmup" ? "W" : i + 1}
                    </span>
                    <span className="font-medium">
                      {formatSet(ex.exercises.exercise_type, s, unit)}
                    </span>
                    <span>{s.completed ? "✓" : "○"}</span>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
