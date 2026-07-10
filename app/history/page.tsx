import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { MonthCalendar } from "@/components/MonthCalendar";
import { weekStart, computeStreak, localDayKey } from "@/lib/week";
import { DeleteSessionButton } from "./DeleteSessionButton";

export const dynamic = "force-dynamic";

/** S9-cz.2 paczka 2: strona listy — kursor po started_at (optymalizacja.md §2.5). */
const PAGE_SIZE = 20;

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { before?: string };
}) {
  const supabase = createClient();
  const before = searchParams.before;

  // Kalendarz + passa liczone z OSOBNEGO, lekkiego zapytania (same daty ukończonych sesji) —
  // niezależnie od paginacji listy; lista ciągnie ciężkie zagnieżdżenia tylko dla strony.
  const [{ data: doneDates }, { data: pageRows }] = await Promise.all([
    supabase.from("sessions").select("started_at").not("finished_at", "is", null),
    (() => {
      let q = supabase
        .from("sessions")
        .select(
          "id, date, started_at, finished_at, program_days(label, programs(name)), session_exercises(session_sets(completed))",
        )
        .order("started_at", { ascending: false })
        .limit(PAGE_SIZE + 1); // +1 = detekcja "czy są starsze"
      if (before) q = q.lt("started_at", before);
      return q;
    })(),
  ]);

  const hasMore = (pageRows ?? []).length > PAGE_SIZE;
  const sessions = (pageRows ?? []).slice(0, PAGE_SIZE);

  // Klucze LOKALNE — spójnie z home/progress.
  const trainingDays = [
    ...new Set((doneDates ?? []).map((s) => localDayKey(new Date(s.started_at)))),
  ];
  const streak = computeStreak(
    new Set((doneDates ?? []).map((s) => weekStart(new Date(s.started_at)))),
  );

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex items-center justify-between border-b px-md py-sm">
        <Link href="/" className="text-xs text-muted-foreground">
          ← Trening
        </Link>
        <span className="font-semibold">Historia</span>
        <span className="w-12" />
      </header>

      <main className="flex-1 space-y-md p-md">
        <MonthCalendar trainingDays={trainingDays} streak={streak} />

        {sessions.length === 0 && !before && (
          /* S14 #2: kalendarz zostaje, pustka = obietnica + jeden krok */
          <div className="space-y-sm pt-lg text-center">
            <p className="text-base font-semibold">Tu zamieszka Twoja historia</p>
            <p className="text-sm text-muted-foreground">
              Każdy zakończony trening zapisze się w kalendarzu, a passa zacznie rosnąć 🔥
            </p>
            <Button asChild className="mx-auto">
              <Link href="/">Zacznij pierwszy trening</Link>
            </Button>
          </div>
        )}

        {sessions.length === 0 && before && (
          <p className="pt-lg text-center text-sm text-muted-foreground">
            To już wszystko — starszych treningów nie ma.
          </p>
        )}

        {sessions.map((s) => {
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
            <div
              key={s.id}
              className="flex items-stretch rounded-xl bg-card text-card-foreground shadow-sm"
            >
              <Link href={`/history/${s.id}`} className="block min-w-0 flex-1 p-md">
                <div className="flex items-center justify-between gap-sm">
                  <span className="truncate font-medium">{title}</span>
                  {!s.finished_at && (
                    <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
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
              <div className="flex items-center pr-sm">
                <DeleteSessionButton id={s.id} />
              </div>
            </div>
          );
        })}

        {hasMore && sessions.length > 0 && (
          <Button asChild variant="ghost" className="w-full">
            <Link
              href={`/history?before=${encodeURIComponent(
                sessions[sessions.length - 1].started_at,
              )}`}
            >
              Pokaż starsze
            </Link>
          </Button>
        )}
        {before && (
          <Button asChild variant="ghost" className="w-full">
            <Link href="/history">← Najnowsze</Link>
          </Button>
        )}
      </main>
    </div>
  );
}
