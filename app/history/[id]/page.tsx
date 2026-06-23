import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import type { ExerciseType, SessionSet, UnitSystem } from "@/lib/types";

function formatSet(type: ExerciseType, s: SessionSet, unit: UnitSystem): string {
  if (type === "timed") return s.duration_seconds != null ? `${s.duration_seconds}s` : "—";
  if (type === "bodyweight")
    return (
      [s.reps != null ? `${s.reps} powt.` : null, s.added_weight ? `+${s.added_weight}${unit}` : null]
        .filter(Boolean)
        .join(" ") || "—"
    );
  return s.weight != null && s.reps != null ? `${s.weight}${unit} × ${s.reps}` : "—";
}

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: session }, { data: settings }] = await Promise.all([
    supabase
      .from("sessions")
      .select(
        "id, started_at, finished_at, program_days(label, programs(name)), session_exercises(id, position, exercises(name, exercise_type), session_sets(set_index, set_type, weight, reps, duration_seconds, added_weight, completed))",
      )
      .eq("id", params.id)
      .maybeSingle(),
    supabase.from("user_settings").select("unit_system").maybeSingle(),
  ]);

  if (!session) notFound();
  const unit: UnitSystem = settings?.unit_system ?? "kg";

  const day = session.program_days as unknown as
    | { label: string; programs: { name: string } | null }
    | null;
  const title = day ? `${day.programs?.name ?? ""} · ${day.label}` : "Freestyle";

  const exercises = (
    (session.session_exercises as unknown as {
      id: string;
      position: number;
      exercises: { name: string; exercise_type: ExerciseType };
      session_sets: SessionSet[];
    }[]) ?? []
  )
    .slice()
    .sort((a, b) => a.position - b.position);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex items-center justify-between border-b px-md py-sm">
        <Link href="/history" className="text-xs text-muted-foreground">
          ← Historia
        </Link>
        <span className="truncate px-sm font-semibold">{title}</span>
        <Button size="sm" variant="outline" asChild>
          <Link href={`/session/${session.id}`}>Otwórz</Link>
        </Button>
      </header>

      <main className="flex-1 space-y-md p-md">
        <p className="text-sm text-muted-foreground">
          {new Date(session.started_at).toLocaleString("pl-PL")}
          {session.finished_at ? "" : " · w toku"}
        </p>

        {exercises.map((ex) => (
          <section key={ex.id} className="rounded-lg border bg-card p-md text-card-foreground">
            <p className="font-medium">{ex.exercises.name}</p>
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
                    <span>{s.completed ? "✓" : "—"}</span>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
