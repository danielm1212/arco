import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HistoryPage() {
  const supabase = createClient();

  const { data: sessions } = await supabase
    .from("sessions")
    .select(
      "id, date, started_at, finished_at, program_days(label, programs(name)), session_exercises(session_sets(completed))",
    )
    .order("started_at", { ascending: false });

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex items-center justify-between border-b px-md py-sm">
        <Link href="/" className="text-xs text-muted-foreground">
          ← Trening
        </Link>
        <span className="font-semibold">Historia</span>
        <span className="w-12" />
      </header>

      <main className="flex-1 space-y-sm p-md">
        {(!sessions || sessions.length === 0) && (
          <p className="pt-xl text-center text-sm text-muted-foreground">
            Brak sesji. Zacznij trening na ekranie głównym.
          </p>
        )}

        {sessions?.map((s) => {
          const day = s.program_days as unknown as
            | { label: string; programs: { name: string } | null }
            | null;
          const title = day ? `${day.programs?.name ?? ""} · ${day.label}` : "Freestyle";
          const exs = (s.session_exercises as unknown as {
            session_sets: { completed: boolean }[];
          }[]) ?? [];
          const doneSets = exs.reduce(
            (n, e) => n + e.session_sets.filter((x) => x.completed).length,
            0,
          );
          return (
            <Link
              key={s.id}
              href={`/history/${s.id}`}
              className="block rounded-lg border bg-card p-md text-card-foreground"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{title}</span>
                {!s.finished_at && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                    w toku
                  </span>
                )}
              </div>
              <p className="mt-2xs text-sm text-muted-foreground">
                {new Date(s.started_at).toLocaleDateString("pl-PL", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}{" "}
                · {exs.length} ćwiczeń · {doneSets} zaliczonych serii
              </p>
            </Link>
          );
        })}
      </main>
    </div>
  );
}
