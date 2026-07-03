import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { Sparkline } from "@/components/Sparkline";
import { MuscleHeatmap } from "@/components/MuscleHeatmap";
import { GUIDANCE, categoriesForExercise, type MuscleCategory } from "@/lib/guidance";
import { localDayKey } from "@/lib/week";
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

  const [{ data: settings }, { count: totalSessions }] = await Promise.all([
    supabase.from("user_settings").select("unit_system").maybeSingle(),
    supabase.from("sessions").select("id", { count: "exact", head: true }),
  ]);
  const fresh = (totalSessions ?? 0) === 0; // świeże konto — inny stan niż pusty okres
  const unit: UnitSystem = settings?.unit_system ?? "kg";

  // Agregat okresu (sesje → ćwiczenia → serie robocze): count/serie/objętość + partie + push/pull
  async function periodStats(fromIso: string, toIso: string | null) {
    let q = supabase.from("sessions").select("id").gte("started_at", fromIso);
    if (toIso) q = q.lt("started_at", toIso);
    const { data: recent } = await q;
    const ids = (recent ?? []).map((s) => s.id);
    const empty = {
      sessionCount: ids.length,
      setCount: 0,
      volume: 0,
      setsPerMuscle: new Map<string, number>(),
      push: 0,
      pull: 0,
    };
    if (!ids.length) return empty;

    const { data: ses } = await supabase
      .from("session_exercises")
      .select("id, exercise_id, exercises(primary_muscles)")
      .in("session_id", ids);
    const bySe = new Map<string, { muscles: string[]; cats: MuscleCategory[] }>();
    (ses ?? []).forEach((se) => {
      const ex = se.exercises as unknown as { primary_muscles: string[] } | null;
      bySe.set(se.id, {
        muscles: ex?.primary_muscles ?? [],
        cats: categoriesForExercise(se.exercise_id, ex?.primary_muscles ?? []),
      });
    });
    const seIds = [...bySe.keys()];
    if (!seIds.length) return empty;
    const { data: sets } = await supabase
      .from("session_sets")
      .select("session_exercise_id, weight, reps")
      .in("session_exercise_id", seIds)
      .eq("completed", true)
      .eq("set_type", "working");

    const out = { ...empty, setCount: (sets ?? []).length };
    (sets ?? []).forEach((s) => {
      if (s.weight != null && s.reps != null) out.volume += s.weight * s.reps;
      const info = bySe.get(s.session_exercise_id);
      for (const m of info?.muscles ?? [])
        out.setsPerMuscle.set(m, (out.setsPerMuscle.get(m) ?? 0) + 1);
      if (info?.cats.includes("push")) out.push += 1;
      if (info?.cats.includes("pull")) out.pull += 1;
    });
    return out;
  }

  // Bieżący okres + (dla 7/30 dni) poprzedni okres tej samej długości — delta-karty (S13)
  const prevCutoff = period.days
    ? new Date(Date.now() - 2 * period.days * 86_400_000).toISOString()
    : null;
  const [cur, prev] = await Promise.all([
    periodStats(cutoff, null),
    period.days ? periodStats(prevCutoff!, cutoff) : Promise.resolve(null),
  ]);
  const volume = cur.volume;
  const muscleRows = [...cur.setsPerMuscle.entries()].sort((a, b) => b[1] - a[1]);

  // S13: interpretacje — zdanie-wniosek zamiast surowej tabeli (progi: ±10% = zmiana)
  const pct = (a: number, b: number) => (b > 0 ? Math.round(((a - b) / b) * 100) : null);
  const volPct = prev ? pct(cur.volume, prev.volume) : null;
  const volInsight =
    prev && volPct != null
      ? volPct >= 10
        ? `Objętość ↑${volPct}% vs poprzednie ${period.days} dni — progresja działa.`
        : volPct <= -10
          ? `Objętość ↓${Math.abs(volPct)}% vs poprzednie ${period.days} dni — lżejszy okres.`
          : `Objętość stabilna vs poprzednie ${period.days} dni (${volPct >= 0 ? "+" : ""}${volPct}%).`
      : null;
  const balanceInsight = (() => {
    const { push, pull } = cur;
    const strong = Math.max(push, pull);
    if (strong < GUIDANCE.balanceMinSets) return null;
    if (Math.min(push, pull) < strong * GUIDANCE.balanceRatio) {
      const lack = push < pull ? "push" : "pull";
      return `${lack === "push" ? "Push" : "Pull"} odstaje w tym okresie (push ${push} / pull ${pull} serii).`;
    }
    return `Push i pull w równowadze (${push}/${pull} serii).`;
  })();

  const deltas = prev
    ? {
        sessions: pct(cur.sessionCount, prev.sessionCount),
        sets: pct(cur.setCount, prev.setCount),
        volume: volPct,
      }
    : { sessions: null, sets: null, volume: null };

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
  const dayKey = localDayKey; // klucz LOKALNY (spójnie z home; fix przesunięcia dnia)
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
        <section className="space-y-sm rounded-xl bg-card p-md shadow-sm">
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

        {volInsight && (
          <p className="text-sm font-medium">{volInsight}</p>
        )}
        <section className="grid grid-cols-3 gap-sm">
          <Stat label={`Sesje · ${period.label}`} value={String(cur.sessionCount)} delta={deltas.sessions} />
          <Stat label="Serie" value={String(cur.setCount)} delta={deltas.sets} />
          <Stat label={`Objętość ${unit}`} value={Math.round(volume).toLocaleString("pl-PL")} delta={deltas.volume} />
        </section>

        <section className="space-y-sm">
          <h2 className="text-base font-semibold">Bilans partii · {period.label}</h2>
          {balanceInsight && <p className="text-sm text-muted-foreground">{balanceInsight}</p>}
          {muscleRows.length === 0 ? (
            fresh ? (
              /* S14 #3a: świeże konto — ghost zamiast „brak danych" */
              <div className="space-y-sm rounded-xl bg-card p-md text-center shadow-sm">
                <div className="pointer-events-none opacity-40" aria-hidden>
                  <Sparkline values={[2, 3, 3, 4, 5, 5, 6]} className="h-16 w-full" />
                </div>
                <p className="text-sm font-medium">
                  Po 2 treningach zobaczysz tu trend siły i bilans partii.
                </p>
                <p className="text-xs text-muted-foreground">
                  Heatmapa sylwetki zapali się po pierwszym treningu.
                </p>
                <Button asChild size="sm">
                  <Link href="/">Zacznij trening</Link>
                </Button>
              </div>
            ) : (
              /* S14 #3b: pusty OKRES przy starszych danych — pokaż wyjście */
              <div className="flex items-center justify-between gap-sm rounded-xl bg-card p-md shadow-sm">
                <p className="text-sm text-muted-foreground">
                  W tych {period.days} dniach pusto — Twoje dane są w szerszym zakresie.
                </p>
                <Link
                  href="/progress?okres=all"
                  className="shrink-0 rounded-md border border-primary bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                >
                  Pokaż wszystko
                </Link>
              </div>
            )
          ) : (
            <>
              <div className="rounded-xl bg-card p-md shadow-sm">
                <MuscleHeatmap setsPerMuscle={muscleRows} />
              </div>
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
            </>
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
                  className="flex items-center gap-sm rounded-lg bg-muted p-sm text-card-foreground"
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
              Rekordy wpadną same — wystarczy zaliczać serie ✓. Pierwszy PR to zawsze
              najlepszy dzień na siłowni.
            </p>
          ) : (
            <ul className="space-y-2xs">
              {prRows.map(([id, r]) => (
                <li key={id}>
                  <Link
                    href={`/exercise/${encodeURIComponent(id)}`}
                    className="flex items-center justify-between rounded-lg bg-muted p-sm text-sm"
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

function Stat({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: number | null;
}) {
  // S13: delta vs poprzedni okres — ↑ volt / ↓ stonowane / → neutralne (±10% = bez zmiany)
  const d =
    delta == null ? null : delta >= 10 ? "up" : delta <= -10 ? "down" : "flat";
  return (
    <div className="rounded-xl bg-card p-sm text-center shadow-sm">
      <p className="text-xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {d && (
        <p
          className={`mt-0.5 text-[11px] font-medium tabular-nums ${
            d === "up" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {d === "up" ? "↑" : d === "down" ? "↓" : "→"} {delta! > 0 ? "+" : ""}
          {delta}%
        </p>
      )}
    </div>
  );
}
