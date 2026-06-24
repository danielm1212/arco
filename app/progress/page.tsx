import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { UnitSystem } from "@/lib/types";

export default async function ProgressPage() {
  const supabase = createClient();
  const cutoff = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const { data: settings } = await supabase
    .from("user_settings")
    .select("unit_system")
    .maybeSingle();
  const unit: UnitSystem = settings?.unit_system ?? "kg";

  // Sesje z ostatnich 7 dni
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

        <section className="grid grid-cols-3 gap-sm">
          <Stat label="Sesje (7 dni)" value={String(sessionIds.length)} />
          <Stat label="Serie" value={String(sets?.length ?? 0)} />
          <Stat label={`Objętość ${unit}`} value={Math.round(volume).toLocaleString("pl-PL")} />
        </section>

        <section className="space-y-sm">
          <h2 className="text-base font-semibold">Bilans partii (7 dni)</h2>
          {muscleRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Brak danych z ostatnich 7 dni.</p>
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
