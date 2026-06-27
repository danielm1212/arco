import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import type { ExerciseType, SessionSet, UnitSystem } from "@/lib/types";
import { weekStart, computeStreak } from "@/lib/week";

export const dynamic = "force-dynamic";

// Rotujące nagłówki (logika Duolingo) — losowy z puli per stan, żeby nie spowszedniało.
const HEADLINES = {
  pr: [
    "Nowy rekord. Stara wersja Ciebie właśnie przegrała.",
    "PR zbity. Liczby nie kłamią.",
  ],
  comeback: ["Wróciłeś. Ciało pamięta — zaczynamy odbudowę."],
  streak: ["{n} tydzień z rzędu. Konsekwencja > motywacja."],
  short: ["Krótko i konkretnie. Liczy się, że było."],
  standard: [
    "Zrobione. Reszta świata dalej planuje.",
    "Sztanga odłożona. Ego podniesione.",
    "I po robocie. Forma rośnie w ciszy.",
    "Tyle. Bez owijania — dobra robota.",
  ],
} as const;

const pick = (pool: readonly string[]) => pool[Math.floor(Math.random() * pool.length)];

export default async function SessionDonePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: session }, { data: settings }, { data: allFinished }] = await Promise.all([
    supabase
      .from("sessions")
      .select(
        "id, started_at, finished_at, session_exercises(id, exercises(exercise_type), session_sets(id, weight, reps, completed))",
      )
      .eq("id", params.id)
      .maybeSingle(),
    supabase.from("user_settings").select("unit_system, weekly_goal").maybeSingle(),
    supabase.from("sessions").select("started_at").not("finished_at", "is", null),
  ]);

  if (!session) notFound();
  if (!session.finished_at) redirect(`/session/${params.id}`); // jeszcze w toku

  const unit: UnitSystem = settings?.unit_system ?? "kg";
  const goal = settings?.weekly_goal ?? 2;

  const exercises =
    (session.session_exercises as unknown as {
      id: string;
      exercises: { exercise_type: ExerciseType };
      session_sets: SessionSet[];
    }[]) ?? [];

  const allSets = exercises.flatMap((e) => e.session_sets);
  const completed = allSets.filter((s) => s.completed);
  const volume = completed.reduce((n, s) => n + (s.weight ?? 0) * (s.reps ?? 0), 0);
  const exCount = exercises.filter((e) =>
    e.session_sets.some((s) => s.completed),
  ).length;
  const durationMin = Math.round(
    (+new Date(session.finished_at) - +new Date(session.started_at)) / 60000,
  );

  // PR-y zdobyte w tej sesji
  const setIds = allSets.map((s) => s.id);
  const { count: prCount } = setIds.length
    ? await supabase
        .from("personal_records")
        .select("*", { count: "exact", head: true })
        .in("session_set_id", setIds)
    : { count: 0 };
  const hasPR = (prCount ?? 0) > 0;

  // Passa + cel + powrót po przerwie
  const finishedTimes = (allFinished ?? [])
    .map((s) => +new Date(s.started_at))
    .sort((a, b) => a - b);
  const weeks = new Set(finishedTimes.map((t) => weekStart(new Date(t))));
  const streak = computeStreak(weeks);
  const thisWeek = weekStart(new Date());
  const weeklyCount = finishedTimes.filter((t) => weekStart(new Date(t)) === thisWeek).length;
  // Przerwa przed tym treningiem: odstęp do poprzedniego ukończonego
  const thisStart = +new Date(session.started_at);
  const prevStart = finishedTimes.filter((t) => t < thisStart).pop();
  const gapDays = prevStart ? (thisStart - prevStart) / 86_400_000 : null;
  const comeback = gapDays != null && gapDays > 10;
  const short = durationMin < 20;

  // Stan → nagłówek (priorytet: PR > powrót > passa ≥2 > krótki > standard)
  const headline = hasPR
    ? pick(HEADLINES.pr)
    : comeback
      ? pick(HEADLINES.comeback)
      : streak >= 2
        ? HEADLINES.streak[0].replace("{n}", String(streak))
        : short
          ? pick(HEADLINES.short)
          : pick(HEADLINES.standard);

  const goalLeft = Math.max(0, goal - weeklyCount);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-xl p-lg text-center">
      {/* Hero — liczba-bohater */}
      <div>
        <p className="text-6xl font-bold leading-none tabular-nums text-primary">
          {Math.round(volume).toLocaleString("pl-PL")}
          <span className="text-2xl font-semibold"> {unit}</span>
        </p>
        <p className="mt-sm text-muted-foreground">tyle dziś uniosłeś</p>
      </div>

      {/* Nagłówek celebracji */}
      <p className="text-balance text-2xl font-bold leading-tight">{headline}</p>

      {/* Pasek statów */}
      <div className="flex items-center gap-md text-sm">
        <Stat value={String(completed.length)} label="serie" />
        <span className="text-border">·</span>
        <Stat value={`${durationMin} min`} label="czas" />
        <span className="text-border">·</span>
        <Stat value={String(exCount)} label="ćwiczenia" />
      </div>

      {/* CTA */}
      <div className="flex w-full flex-col gap-sm pt-lg">
        <Button asChild size="lg" className="w-full">
          <Link href="/">Zamknij i odpoczywaj</Link>
        </Button>
        {goalLeft > 0 && (
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/">
              {weeklyCount} z {goal} w tym tygodniu — jeszcze jeden
            </Link>
          </Button>
        )}
        {goalLeft === 0 && (
          <p className="text-sm font-medium text-primary">
            🎯 Cel tygodnia zrobiony ({weeklyCount}/{goal})
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <span className="flex flex-col">
      <span className="text-lg font-semibold tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </span>
  );
}
