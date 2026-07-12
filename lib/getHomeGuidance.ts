// server-only: importuje `@/lib/supabase/server` (next/headers) → nie trafia do klienta.
import { createClient } from "@/lib/supabase/server";
import type { ExerciseType } from "@/lib/types";
import {
  balanceFlags,
  categoriesForExercise,
  deloadFlags,
  homeGuidance,
  stalenessFlags,
  type GuidanceItem,
  type MuscleCategory,
} from "@/lib/guidance";

/** Najlepsza metryka serii: e1RM (weighted) / powt. (bodyweight) / czas (timed). */
function setMetric(
  type: ExerciseType,
  s: { weight: number | null; reps: number | null; duration_seconds: number | null },
): number | null {
  if (type === "weighted" && s.weight != null && s.reps != null)
    return Math.round(s.weight * (1 + s.reps / 30) * 10) / 10;
  if (type === "bodyweight" && s.reps != null) return s.reps;
  if (type === "timed" && s.duration_seconds != null) return s.duration_seconds;
  return null;
}

const DAY = 86_400_000;

const weekStartMs = (d: Date): number => {
  const x = new Date(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  x.setHours(0, 0, 0, 0);
  return x.getTime();
};

/**
 * Buduje podpowiedzi guidance na home (Faza A: balans push/pull + staleness partii).
 * Okno: 90 dni (staleness), bieżący tydzień (balans). Liczone z serii roboczych zaliczonych.
 */
export async function getHomeGuidance(): Promise<GuidanceItem[]> {
  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, started_at")
    .not("finished_at", "is", null)
    .gte("started_at", new Date(Date.now() - 90 * DAY).toISOString());
  const sessionDate = new Map((sessions ?? []).map((s) => [s.id, new Date(s.started_at)]));
  const sessionIds = [...sessionDate.keys()];
  if (sessionIds.length === 0) return [];

  const { data: ses } = await supabase
    .from("session_exercises")
    .select("id, session_id, exercise_id, exercises(name, exercise_type, primary_muscles)")
    .in("session_id", sessionIds);
  type SeInfo = {
    date: Date;
    sessionId: string;
    exerciseId: string;
    name: string;
    type: ExerciseType;
    categories: MuscleCategory[];
  };
  const seInfo = new Map<string, SeInfo>();
  (ses ?? []).forEach((se) => {
    const date = sessionDate.get(se.session_id);
    if (!date) return;
    const ex = se.exercises as unknown as {
      name: string;
      exercise_type: ExerciseType;
      primary_muscles: string[];
    } | null;
    seInfo.set(se.id, {
      date,
      sessionId: se.session_id,
      exerciseId: se.exercise_id,
      name: ex?.name ?? se.exercise_id,
      type: ex?.exercise_type ?? "weighted",
      categories: categoriesForExercise(se.exercise_id, ex?.primary_muscles ?? []),
    });
  });

  const seIds = [...seInfo.keys()];
  if (seIds.length === 0) return [];
  const { data: sets } = await supabase
    .from("session_sets")
    .select("session_exercise_id, weight, reps, duration_seconds")
    .in("session_exercise_id", seIds)
    .eq("completed", true)
    .eq("set_type", "working");

  const thisWeek = weekStartMs(new Date());
  const weekByCat: Partial<Record<MuscleCategory, number>> = {};
  const lastTrainedByCat: Partial<Record<MuscleCategory, number>> = {};
  // Deload: najlepsza metryka per ćwiczenie per sesja → seria chronologiczna.
  const bestByExSession = new Map<string, { name: string; perSession: Map<string, number> }>();
  (sets ?? []).forEach((s) => {
    const info = seInfo.get(s.session_exercise_id);
    if (!info) return;
    const inThisWeek = weekStartMs(info.date) === thisWeek;
    for (const cat of info.categories) {
      if (inThisWeek) weekByCat[cat] = (weekByCat[cat] ?? 0) + 1;
      const t = info.date.getTime();
      if (t > (lastTrainedByCat[cat] ?? 0)) lastTrainedByCat[cat] = t;
    }
    const v = setMetric(info.type, s);
    if (v == null) return;
    let e = bestByExSession.get(info.exerciseId);
    if (!e) {
      e = { name: info.name, perSession: new Map() };
      bestByExSession.set(info.exerciseId, e);
    }
    const cur = e.perSession.get(info.sessionId);
    if (cur == null || v > cur) e.perSession.set(info.sessionId, v);
  });

  const now = Date.now();
  const daysSinceByCat: Partial<Record<MuscleCategory, number | null>> = {};
  (Object.entries(lastTrainedByCat) as [MuscleCategory, number][]).forEach(([cat, t]) => {
    daysSinceByCat[cat] = Math.floor((now - t) / DAY);
  });

  const deloadInput = [...bestByExSession.values()].map((e) => ({
    name: e.name,
    series: [...e.perSession.entries()]
      .sort((a, b) => (sessionDate.get(a[0])?.getTime() ?? 0) - (sessionDate.get(b[0])?.getTime() ?? 0))
      .map(([, v]) => v),
  }));

  return homeGuidance([
    ...stalenessFlags(daysSinceByCat),
    ...deloadFlags(deloadInput),
    ...balanceFlags(weekByCat),
  ]);
}
