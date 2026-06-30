// server-only: importuje `@/lib/supabase/server` (next/headers) → nie trafia do klienta.
import { createClient } from "@/lib/supabase/server";
import {
  balanceFlags,
  categoriesForMuscles,
  homeGuidance,
  stalenessFlags,
  type GuidanceItem,
  type MuscleCategory,
} from "@/lib/guidance";

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
  const supabase = createClient();

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
    .select("id, session_id, exercises(primary_muscles)")
    .in("session_id", sessionIds);
  const seInfo = new Map<string, { date: Date; categories: MuscleCategory[] }>();
  (ses ?? []).forEach((se) => {
    const date = sessionDate.get(se.session_id);
    if (!date) return;
    const ex = se.exercises as unknown as { primary_muscles: string[] } | null;
    seInfo.set(se.id, { date, categories: categoriesForMuscles(ex?.primary_muscles ?? []) });
  });

  const seIds = [...seInfo.keys()];
  if (seIds.length === 0) return [];
  const { data: sets } = await supabase
    .from("session_sets")
    .select("session_exercise_id")
    .in("session_exercise_id", seIds)
    .eq("completed", true)
    .eq("set_type", "working");

  const thisWeek = weekStartMs(new Date());
  const weekByCat: Partial<Record<MuscleCategory, number>> = {};
  const lastTrainedByCat: Partial<Record<MuscleCategory, number>> = {};
  (sets ?? []).forEach((s) => {
    const info = seInfo.get(s.session_exercise_id);
    if (!info) return;
    const inThisWeek = weekStartMs(info.date) === thisWeek;
    for (const cat of info.categories) {
      if (inThisWeek) weekByCat[cat] = (weekByCat[cat] ?? 0) + 1;
      const t = info.date.getTime();
      if (t > (lastTrainedByCat[cat] ?? 0)) lastTrainedByCat[cat] = t;
    }
  });

  const now = Date.now();
  const daysSinceByCat: Partial<Record<MuscleCategory, number | null>> = {};
  (Object.entries(lastTrainedByCat) as [MuscleCategory, number][]).forEach(([cat, t]) => {
    daysSinceByCat[cat] = Math.floor((now - t) / DAY);
  });

  return homeGuidance([...stalenessFlags(daysSinceByCat), ...balanceFlags(weekByCat)]);
}
