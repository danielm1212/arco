import { createClient } from "@/lib/supabase/server";
import { exerciseDisplayName } from "@/lib/exerciseSearch";
import { GUIDANCE, categoriesForExercise, type MuscleCategory } from "@/lib/guidance";
import { setMetric } from "@/lib/exerciseMetrics";
import { localDayKey, computeStreak, dayOfWeek, weeksMeetingGoal } from "@/lib/week";
import type { ExerciseType, UnitSystem } from "@/lib/types";
import { joinMany, joinMaybe, type ExerciseJoin } from "@/lib/dbJoins";
import { weightToDisplay } from "@/lib/format";
import { finishedSessions } from "@/lib/qualifiedFacts";

/**
 * Warstwa danych trasy /progress — S9-cz.2 paczka 4: logika przeniesiona 1:1
 * z progress/page.tsx (bez zmiany zapytań ani obliczeń).
 */

export const PERIODS = [
  { key: "7", label: "7 dni", days: 7 },
  { key: "30", label: "30 dni", days: 30 },
  { key: "all", label: "Wszystko", days: null as number | null },
];

type Supabase = Awaited<ReturnType<typeof createClient>>;

export interface PeriodStats {
  sessionCount: number;
  setCount: number;
  volume: number;
  setsPerMuscle: Map<string, number>;
  push: number;
  pull: number;
}

// Agregat okresu (sesje → ćwiczenia → serie robocze): count/serie/objętość + partie + push/pull
async function periodStats(
  supabase: Supabase,
  fromIso: string,
  toIso: string | null,
): Promise<PeriodStats> {
  // DATA-03 (CORE-0): tylko zakończone sesje liczą się do agregatu okresu —
  // otwarta sesja nie jest jeszcze kwalifikowanym faktem.
  const recent = await finishedSessions(supabase, { gte: fromIso, lt: toIso ?? undefined });
  const ids = recent.map((s) => s.id);
  const empty: PeriodStats = {
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
    const ex = joinMaybe<Pick<ExerciseJoin, "primary_muscles">>(se.exercises);
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

const pct = (a: number, b: number) => (b > 0 ? Math.round(((a - b) / b) * 100) : null);

/** Bieżący + poprzedni okres (delta-karty S13) wraz z interpretacjami-zdaniami. */
export async function getPeriodOverview(
  supabase: Supabase,
  period: (typeof PERIODS)[number],
) {
  const cutoff = period.days
    ? new Date(Date.now() - period.days * 86_400_000).toISOString()
    : new Date(0).toISOString();
  const prevCutoff = period.days
    ? new Date(Date.now() - 2 * period.days * 86_400_000).toISOString()
    : null;
  const [cur, prev] = await Promise.all([
    periodStats(supabase, cutoff, null),
    period.days
      ? periodStats(supabase, prevCutoff!, cutoff)
      : Promise.resolve<PeriodStats | null>(null),
  ]);

  // S13: interpretacje — zdanie-wniosek zamiast surowej tabeli (progi: ±10% = zmiana)
  const volPct = prev ? pct(cur.volume, prev.volume) : null;
  const volInsight =
    prev && volPct != null
      ? volPct >= 10
        ? `Objętość wzrosła o ${volPct}% w porównaniu z poprzednimi ${period.days} dniami.`
        : volPct <= -10
          ? `Objętość spadła o ${Math.abs(volPct)}% w porównaniu z poprzednimi ${period.days} dniami.`
          : `Objętość jest podobna do poprzednich ${period.days} dni (${volPct >= 0 ? "+" : ""}${volPct}%).`
      : null;
  const balanceInsight = (() => {
    const { push, pull } = cur;
    const strong = Math.max(push, pull);
    if (strong < GUIDANCE.balanceMinSets) return null;
    if (Math.min(push, pull) < strong * GUIDANCE.balanceRatio) {
      const lack = push < pull ? "push" : "pull";
      return `${lack === "push" ? "Ruchów wypychających" : "Ruchów przyciągających"} jest w tym okresie mniej. Wypychające: ${push}, przyciągające: ${pull} serii.`;
    }
    return `Ruchy wypychające i przyciągające są w równowadze (${push}/${pull} serii).`;
  })();

  const deltas = prev
    ? {
        sessions: pct(cur.sessionCount, prev.sessionCount),
        sets: pct(cur.setCount, prev.setCount),
        volume: volPct,
      }
    : { sessions: null, sets: null, volume: null };

  return { cur, volInsight, balanceInsight, deltas };
}

export interface PrEntry {
  name: string;
  e1rm?: number;
  maxWeight?: number;
}

/** Rekordy: najlepszy e1RM i max ciężaru per ćwiczenie. */
export async function getPersonalRecords(supabase: Supabase): Promise<[string, PrEntry][]> {
  const { data: prs } = await supabase
    .from("personal_records")
    .select("exercise_id, record_type, value, reps_context, exercises(name, name_pl)")
    .in("record_type", ["max_e1rm", "max_weight"])
    .order("value", { ascending: false });

  type PrRow = {
    exercise_id: string;
    record_type: string;
    value: number;
    reps_context: number | null;
    exercises: { name: string } | null;
  };
  const byExercise = new Map<string, PrEntry>();
  joinMany<PrRow>(prs).forEach((p) => {
    const cur = byExercise.get(p.exercise_id) ?? { name: p.exercises ? exerciseDisplayName(p.exercises) : p.exercise_id };
    if (p.record_type === "max_e1rm") cur.e1rm = p.value;
    if (p.record_type === "max_weight") cur.maxWeight = p.value;
    byExercise.set(p.exercise_id, cur);
  });
  return [...byExercise.entries()].sort((a, b) => (b[1].e1rm ?? 0) - (a[1].e1rm ?? 0));
}

/** Aktywność / streak (zakończone sesje z ~120 dni): pasek 14 dni + passa tygodniowa.
 *  `weeklyGoal` — F0.6 (D4, wersja surowa): tydzień liczy się do passy tylko, gdy
 *  osiągnął cel planu, nie przy samym fakcie treningu. */
export async function getActivity(supabase: Supabase, weeklyGoal: number) {
  const { data: finished } = await supabase
    .from("sessions")
    .select("started_at")
    .not("finished_at", "is", null)
    .gte("started_at", new Date(Date.now() - 120 * 86_400_000).toISOString());
  // F0.5: dayKey/weekStart/streak dzielone z lib/week (Europe/Warsaw, bezpieczne pod DST
  // i niezależne od strefy środowiska Node — patrz komentarz w lib/week.ts).
  const dayKey = localDayKey;
  const doneDays = new Set((finished ?? []).map((s) => dayKey(new Date(s.started_at))));
  const DOW = ["N", "P", "W", "Ś", "C", "P", "S"];
  const strip = Array.from({ length: 14 }, (_, idx) => {
    const d = new Date(Date.now() - (13 - idx) * 86_400_000);
    return { key: dayKey(d), on: doneDays.has(dayKey(d)), dow: DOW[dayOfWeek(d)] };
  });
  const weeks = weeksMeetingGoal(
    (finished ?? []).map((s) => s.started_at),
    weeklyGoal,
  );
  const streak = computeStreak(weeks);
  return { strip, streak };
}

export interface StrengthRow {
  id: string;
  name: string;
  series: number[];
  last: number;
  delta: number;
  suffix: string;
}

/** Postęp siły — najlepsza metryka per sesja, per ćwiczenie (~90 dni). */
export async function getStrengthTrends(
  supabase: Supabase,
  unit: UnitSystem,
): Promise<StrengthRow[]> {
  const strengthCutoff = new Date(Date.now() - 90 * 86_400_000).toISOString();
  // DATA-03 (CORE-0): trend siły liczy się tylko z zakończonych sesji.
  const sSessions = await finishedSessions(supabase, { gte: strengthCutoff });
  const sStart = new Map(sSessions.map((s) => [s.id, s.started_at]));
  const sSessIds = [...sStart.keys()];
  const { data: sExs } = sSessIds.length
    ? await supabase
        .from("session_exercises")
        .select("id, exercise_id, session_id, exercises(name, name_pl, exercise_type)")
        .in("session_id", sSessIds)
    : { data: [] };
  const seMeta = new Map<
    string,
    { exerciseId: string; name: string; type: ExerciseType; sessionId: string }
  >();
  (sExs ?? []).forEach((se) => {
    const ex = joinMaybe<Pick<ExerciseJoin, "name" | "name_pl" | "exercise_type">>(se.exercises);
    seMeta.set(se.id, {
      exerciseId: se.exercise_id,
      name: ex ? exerciseDisplayName(ex) : se.exercise_id,
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
  const byExSession = new Map<
    string,
    { name: string; type: ExerciseType; perSession: Map<string, number> }
  >();
  (sStrSets ?? []).forEach((ss) => {
    const m = seMeta.get(ss.session_exercise_id);
    if (!m) return;
    const v = setMetric(m.type, ss);
    if (v == null) return;
    let e = byExSession.get(m.exerciseId);
    if (!e) {
      e = { name: m.name, type: m.type, perSession: new Map() };
      byExSession.set(m.exerciseId, e);
    }
    const cur = e.perSession.get(m.sessionId);
    if (cur == null || v > cur) e.perSession.set(m.sessionId, v);
  });
  return [...byExSession.entries()]
    .map(([id, e]) => {
      // DATA-02: e1RM (weighted) jest w kanonicznym kg — konwersja do jednostki
      // profilu dopiero tutaj, na granicy zwracanej do prezentacji (progress/page.tsx).
      const rawSeries = [...e.perSession.entries()]
        .sort((a, b) => +new Date(sStart.get(a[0])!) - +new Date(sStart.get(b[0])!))
        .map(([, v]) => v);
      const series = e.type === "weighted" ? rawSeries.map((v) => weightToDisplay(v, unit)) : rawSeries;
      const last = series[series.length - 1];
      const delta = series.length >= 2 ? Math.round((last - series[0]) * 10) / 10 : 0;
      const suffix = e.type === "weighted" ? unit : e.type === "timed" ? "s" : "";
      return { id, name: e.name, series, last, delta, suffix };
    })
    .filter((x) => x.series.length >= 2)
    .sort((a, b) => b.series.length - a.series.length)
    .slice(0, 6);
}
