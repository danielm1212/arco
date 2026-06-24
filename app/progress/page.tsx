import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Sparkline } from "@/components/Sparkline";
import type { ExerciseType, UnitSystem } from "@/lib/types";

const PERIODS = [
  { key: "7", label: "7 dni", days: 7 },
  { key: "30", label: "30 dni", days: 30 },
  { key: "all", label: "Wszystko", days: null as number | null },
];

export const dynamic = "force-dynamic";

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: { okres?: string };
}) {
  const supabase = createClient();
  const period = PERIODS.find((p) => p.key === searchParams.okres) ?? PERIODS[0];
  const cutoff = period.days
    ? new Date(Date.now() - period.days * 86_400_000).toISOString()
    : new Date(0).toISOString();

  const { data: settings } = await supabase
    .from("user_settings")
    .select("unit_system")
    .maybeSingle();
  const unit: UnitSystem = settings?.unit_system ?? "kg";

  // Sesje w wybranym okresie
  const { data: recentSessions } = await supabase
    .from("sessions")
    .select("id")
    .gte("started_at", cutoff);
  const sessionIds = (recentSessions ?? []).map((s) => s.id);

  // Ćwiczenia tych sesji + partie mięśniowe
  const { data: ses } = sessionIds.length
    ? await supabase
        .from("session_exercises")
        .select("id, exercises(primary_muscles)")
        .in("session_id", sessionIds)
    : { data: [] as { id: string; exercises: { primary_muscles: string[] } | null }[] };

  const muscleBySe = new Map<string, string[]>();
  (ses ?? []).forEach((se) => {
    const ex = se.exercises as unknown as { primary_muscles: string[] } | null;
    muscleBySe.set(se.id, ex?.primary_muscles ?? []);
  });

  // Serie ukończone (working) z tych ćwiczeń
  const seIds = [...muscleBySe.keys()];
  const { data: sets } = seIds.length
    ? await supabase
        .from("session_sets")
        .select("session_exercise_id, weight, reps")
        .in("session_exercise_id", seIds)
        .eq("completed", true)
        .eq("set_type", "working")
    : { data: [] as { session_exercise_id: string; weight: number | null; reps: number | null }[] };

  let volume = 0;
  const setsPerMuscle = new Map<string, number>();
  (sets ?? []).forEach((s) => {
    if (s.weight != null && s.reps != null) volume += s.weight * s.reps;
    for (const m of muscleBySe.get(s.session_exercise_id) ?? []) {
      setsPerMuscle.set(m, (setsPerMuscle.get(m) ?? 0) + 1);
    }
  });
  const muscleRows = [...setsPerMuscle.entries()].sort((a, b) => b[1] - a[1]);

  // Rekordy: najlepszy e1RM i max ciężaru per ćwiczenie
  const { data: prs } = await supabase
    .from("personal_records")
    .select("exercise_id, record_type, value, reps_context, exercises(name)")
    .in("record_type", ["max_e1rm", "max_weight"])
    .order("value", { ascending: false });

  type PrRow = {
    exercise_id: string;
    record_type: string;
    value: number;
    reps_context: number | null;
    exercises: { name: string } | null;
  };
  const byExercise = new Map<string, { name: string; e1rm?: number; maxWeight?: number }>();
  ((prs as unknown as PrRow[]) ?? []).forEach((p) => {
    const cur = byExercise.get(p.exercise_id) ?? { name: p.exercises?.name ?? p.exercise_id };
    if (p.record_type === "max_e1rm") cur.e1rm = p.value;
    if (p.record_type === "max_weight") cur.maxWeight = p.value;
    byExercise.set(p.exercise_id, cur);
  });
  const prRows = [...byExercise.entries()].sort(
    (a, b) => (b[1].e1rm ?? 0) - (a[1].e1rm ?? 0),
  );

  // Aktywność / streak (zakończone sesje z ~120 dni)
  const { data: finished } = await supabase
    .from("sessions")
    .select("started_at")
    .not("finished_at", "is", null)
    .gte("started_at", new Date(Date.now() - 120 * 86_400_000).toISOString());
  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const doneDays = new Set((finished ?? []).map((s) => dayKey(new Date(s.started_at))));
  const DOW = ["N", "P", "W", "Ś", "C", "P", "S"];
  const strip = Array.from({ length: 14 }, (_, idx) => {
    const d = new Date(Date.now() - (13 - idx) * 86_400_000);
    return { key: dayKey(d), on: doneDays.has(dayKey(d)), dow: DOW[d.getDay()] };
  });
  const weekStart = (d: Date) => {
    const x = new Date(d);
    x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
    x.setHours(0, 0, 0, 0);
    return x.getTime();
  };
  const weeks = new Set((finished ?? []).map((s) => weekStart(new Date(s.started_at))));
  const WEEK = 7 * 86_400_000;
  let streak = 0;
  let w = weekStart(new Date());
  if (!weeks.has(w)) w -= WEEK; // bieżący tydzień bez treningu nie zeruje passy
  while (weeks.has(w)) {
    streak++;
    w -= WEEK;
  }

  // Postęp siły — najlepsza metryka per sesja, per ćwiczenie (~90 dni)
  const strengthCutoff = new Date(Date.now() - 90 * 86_400_000).toISOString();
  const { data: sSessions } = await supabase
    .from("sessions")
    .select("id, started_at")
    .gte("started_at", strengthCutoff);
  const sStart = new Map((sSessions ?? []).map((s) => [s.id, s.started_at]));
  const sSessIds = [...sStart.keys()];
  const { data: sExs } = sSessIds.length
    ? await supabase
        .from("session_exercises")
        .select("id, exercise_id, session_id, exercises(name, exercise_type)")
        .in("session_id", sSessIds)
    : { data: [] };
  const seMeta = new Map<
    string,
    { exerciseId: string; name: string; type: ExerciseType; sessionId: string }
  >();
  (sExs ?? []).forEach((se) => {
    const ex = se.exercises as unknown as { name: string; exercise_type: ExerciseType } | null;
    seMeta.set(se.id, {
      exerciseId: se.exercise_id,
      name: ex?.name ?? se.exercise_id,
      type: ex?.exercise_type ?? "weighted",
      sessionId: se.session_id,
    });
  });
  const sSeIds = [...seMeta.keys()];
  const { data: sStrSets } = sSeIds.length
    ? await supabase
        .from("session_sets")
        .select("session_exercise_id, weight, reps, duration_seconds")
        .eq("completed", true)
        .eq("set_type", "working")
        .in("session_exercise_id", sSeIds)
    : { data: [] };
  const metric = (
    type: ExerciseType,
    s: { weight: number | null; reps: number | null; duration_seconds: number | null },
  ): number | null => {
    if (type === "weighted" && s.weight != null && s.reps != null)
      return Math.round(s.weight * (1 + s.reps / 30) * 10) / 10;
    if (type === "bodyweight" && s.reps != null) return s.reps;
    if (type === "timed" && s.duration_seconds != null) return s.duration_seconds;
    return null;
  };
  const byExSession = new Map<
    string,
    { name: string; type: ExerciseType; perSession: Map<string, number> }
  >();
  (sStrSets ?? []).forEach((ss) => {
    const m = seMeta.get(ss.session_exercise_id);
    if (!m) return;
    const v = metric(m.type, ss);
    if (v == null) return;
    let e = byExSession.get(m.exerciseId);
    if (!e) {
      e = { name: m.name, type: m.type, perSession: new Map() };
      byExSession.set(m.exerciseId, e);
    }
    const cur = e.perSession.get(m.sessionId);
    if (cur == null || v > cur) e.perSession.set(m.sessionId, v);
  });
  const strength = [...byExSession.entries()]
    .map(([id, e]) => {
      const series = [...e.perSession.entries()]
        .sort((a, b) => +new Date(sStart.get(a[0])!) - +new Date(sStart.get(b[0])!))
        .map(([, v]) => v);
      const last = series[series.length - 1];
      const delta = series.length >= 2 ? Math.round((last - series[0]) * 10) / 10 : 0;
      const suffix = e.type === "weighted" ? unit : e.type === "timed" ? "s" : "";
      return { id, name: e.name, series, last, delta, suffix };
    })
    .filter((x) => x.series.length >= 2)
    .sort((a, b) => b.series.length - a.series.length)
    .slice(0, 6);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex items-center justify-between border-b px-md py-sm">
        <Link href="/" className="text-xs text-muted-foreground">
          ← Trening
        </Link>
        <span className="font-semibold">Postępy</span>
        <span className="w-12" />
      </header>

      <main className="flex-1 space-y-lg p-md">
        <section className="space-y-sm rounded-lg border bg-card p-md">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Aktywność</h2>
            <span className="text-sm font-medium text-primary">
              🔥 {streak} {streak === 1 ? "tydzień" : "tyg."} z rzędu
            </span>
          </div>
          <div className="flex gap-px">
            {strip.map((d, i) => (
              <div key={`${d.key}-${i}`} className="flex flex-1 flex-col items-center gap-0.5">
                <div className={`h-6 w-full rounded-sm ${d.on ? "bg-primary" : "bg-muted"}`} />
                <span className="text-[9px] text-muted-foreground">{d.dow}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground">Ostatnie 14 dni</p>
        </section>

        <div className="flex gap-2xs">
          {PERIODS.map((p) => (
            <Link
              key={p.key}
              href={p.key === "7" ? "/progress" : `/progress?okres=${p.key}`}
              className={`flex-1 rounded-md border px-2 py-1 text-center text-xs ${
                p.key === period.key
                  ? "border-primary bg-primary/10 font-medium text-primary"
                  : "border-input text-muted-foreground"
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>

        <section className="grid grid-cols-3 gap-sm">
          <Stat label={`Sesje · ${period.label}`} value={String(sessionIds.length)} />
          <Stat label="Serie" value={String(sets?.length ?? 0)} />
          <Stat label={`Objętość ${unit}`} value={Math.round(volume).toLocaleString("pl-PL")} />
        </section>

        <section className="space-y-sm">
          <h2 className="text-base font-semibold">Bilans partii · {period.label}</h2>
          {muscleRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Brak danych w tym okresie.</p>
          ) : (
            <ul className="space-y-xs">
              {muscleRows.map(([m, n]) => {
                const max = muscleRows[0][1] || 1;
                return (
                  <li key={m} className="flex items-center gap-sm text-sm">
                    <span className="w-24 shrink-0 truncate capitalize">{m}</span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.max(8, (n / max) * 100)}%` }}
                      />
                    </div>
                    <span className="w-5 shrink-0 text-right font-medium tabular-nums">{n}</span>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="text-[10px] text-muted-foreground">
            Liczba serii roboczych na partię — pilnuj równowagi (np. push vs pull).
          </p>
        </section>

        {strength.length > 0 && (
          <section className="space-y-sm">
            <h2 className="text-base font-semibold">Postęp siły</h2>
            <ul className="space-y-2xs">
              {strength.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-sm rounded-md border bg-card p-sm text-card-foreground"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.series.length} sesji</p>
                  </div>
                  <div className="w-20 shrink-0">
                    <Sparkline values={s.series} className="h-9 w-full" />
                  </div>
                  <div className="w-16 shrink-0 text-right">
                    <p className="text-sm font-medium tabular-nums">
                      {s.last}
                      {s.suffix}
                    </p>
                    <p
                      className={`text-xs tabular-nums ${
                        s.delta > 0
                          ? "text-success"
                          : s.delta < 0
                            ? "text-warning"
                            : "text-muted-foreground"
                      }`}
                    >
                      {s.delta > 0 ? "+" : ""}
                      {s.delta}
                      {s.suffix}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="space-y-sm">
          <h2 className="text-base font-semibold">Rekordy</h2>
          {prRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Brak rekordów — zakończ sesję z zaliczonymi seriami.
            </p>
          ) : (
            <ul className="space-y-2xs">
              {prRows.map(([id, r]) => (
                <li key={id}>
                  <Link
                    href={`/exercise/${encodeURIComponent(id)}`}
                    className="flex items-center justify-between rounded-md border bg-card p-sm text-sm"
                  >
                    <span className="truncate">{r.name}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {r.e1rm ? `e1RM ${r.e1rm}${unit}` : ""}
                      {r.maxWeight ? ` · max ${r.maxWeight}${unit}` : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-sm text-center">
      <p className="text-xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
