import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { MuscleSplitBars, muscleSplit } from "@/components/MuscleSplitBars";
import { MomentIcon3D, type MomentIconName } from "@/components/MomentIcon3D";
import type { ExerciseType, SessionSet, UnitSystem } from "@/lib/types";
import { weekStart, computeStreak } from "@/lib/week";

export const dynamic = "force-dynamic";

// Rotujące nagłówki (logika Duolingo) — losowy z puli per stan, żeby nie spowszedniało.
const HEADLINES = {
  pr: [
    "Nowy rekord. Dobra robota.",
    "Poszło więcej. Rekord zapisany.",
  ],
  comeback: ["Dobrze, że jesteś z powrotem."],
  streak: ["{n}. tydzień z rzędu. Rytm trzyma."],
  short: ["Krótki trening też się liczy."],
  standard: [
    "Trening zapisany. Dobra robota.",
    "Gotowe. Teraz czas na odpoczynek.",
    "Plan wykonany. Możesz odhaczyć ten dzień.",
  ],
} as const;

const pick = (pool: readonly string[]) => pool[Math.floor(Math.random() * pool.length)];

export default async function SessionDonePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();

  const [{ data: session }, { data: settings }, { data: allFinished }] = await Promise.all([
    supabase
      .from("sessions")
      .select(
        "id, started_at, finished_at, session_exercises(id, exercises(exercise_type, primary_muscles), session_sets(id, weight, reps, set_type, completed))",
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
      exercises: { exercise_type: ExerciseType; primary_muscles: string[] };
      session_sets: SessionSet[];
    }[]) ?? [];

  const allSets = exercises.flatMap((e) => e.session_sets);
  const completed = allSets.filter((s) => s.completed);
  const volume = completed.reduce((n, s) => n + (s.weight ?? 0) * (s.reps ?? 0), 0);
  const totalReps = completed.reduce((n, s) => n + (s.reps ?? 0), 0);
  const totalSeconds = completed.reduce((n, s) => n + (s.duration_seconds ?? 0), 0);
  const exCount = exercises.filter((e) =>
    e.session_sets.some((s) => s.completed),
  ).length;
  const durationMin = Math.round(
    (+new Date(session.finished_at) - +new Date(session.started_at)) / 60000,
  );

  // S13: Muscle Split % na celebracji
  const perMuscle = new Map<string, number>();
  exercises.forEach((e) => {
    const m = e.exercises.primary_muscles?.[0];
    if (!m) return;
    const n = e.session_sets.filter((s) => s.completed && s.set_type === "working").length;
    if (n > 0) perMuscle.set(m, (perMuscle.get(m) ?? 0) + n);
  });
  const split = muscleSplit(perMuscle);

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
  const hero = volume > 0
    ? { value: Math.round(volume).toLocaleString("pl-PL"), unit, label: "tyle dziś uniosłeś" }
    : totalReps > 0
      ? { value: totalReps.toLocaleString("pl-PL"), unit: "powt.", label: "tyle powtórzeń zrobiłeś" }
      : { value: totalSeconds.toLocaleString("pl-PL"), unit: "s", label: "tyle czasu pracowałeś" };
  const celebrationIcon: MomentIconName = hasPR
    ? "medal"
    : goalLeft === 0
      ? "target"
      : streak >= 2
        ? "fire"
        : "tick";

  return (
    <div className="bg-brand text-brand-foreground">
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-xl p-lg text-center">
      {/* Hero — liczba-bohater. font-display (Gambarino, 2026-07-11): pierwszy
          z 3 ekranów testowych z roadmap.md (celebracja/kłódka premium/recap) */}
      <div>
        <MomentIcon3D name={celebrationIcon} className="mx-auto -mb-sm size-24" priority />
        <p className="font-display text-6xl leading-none tabular-nums text-primary">
          {hero.value}
          <span className="text-2xl font-semibold"> {hero.unit}</span>
        </p>
        <p className="mt-sm text-brand-muted">{hero.label}</p>
      </div>

      {/* Nagłówek celebracji */}
      <p className="text-balance text-2xl font-semibold leading-tight">{headline}</p>

      {/* Pasek statów */}
      <div className="flex items-center gap-md text-sm">
        <Stat value={String(completed.length)} label="serie" />
        <span className="text-border">·</span>
        <Stat value={`${durationMin} min`} label="czas" />
        <span className="text-border">·</span>
        <Stat value={String(exCount)} label="ćwiczenia" />
      </div>

      {/* S13: Muscle Split — co dziś pracowało */}
      {split.length > 0 && (
        <div className="w-full rounded-xl bg-card p-md text-left shadow-sm">
          {/* W9 (audyt-wizualny): cichsza etykieta — celebracja = liczba + headline,
              sekcje pomocnicze nie krzyczą uppercasem */}
          <p className="mb-sm text-xs font-medium text-muted-foreground">
            Co dziś pracowało
          </p>
          <MuscleSplitBars rows={split} max={4} />
        </div>
      )}

      {/* CTA */}
      <div className="flex w-full flex-col gap-sm pt-lg">
        <Button asChild size="lg" className="w-full">
          {/* F2 (redesign-home.md §3.6): ?trained=1 odpala zapłon flame'a
              dzisiejszego dnia na home, raz, po powrocie z celebracji */}
          <Link href="/?trained=1">Wróć na ekran główny</Link>
        </Button>
        {goalLeft > 0 && (
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/">
              {weeklyCount} z {goal} w tym tygodniu. {goalLeft === 1 ? "Został jeden" : `Zostały ${goalLeft}`}
            </Link>
          </Button>
        )}
        {goalLeft === 0 && (
          <p className="text-sm font-medium text-primary">
            🎯 Cel tygodniowy wykonany: {weeklyCount}/{goal}
          </p>
        )}
      </div>
    </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <span className="flex flex-col">
      <span className="text-lg font-semibold tabular-nums">{value}</span>
      <span className="text-xs text-brand-muted">{label}</span>
    </span>
  );
}
