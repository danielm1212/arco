// server-only: importuje `@/lib/supabase/server` (next/headers) → nie trafia do klienta.
import { joinMaybe, type ExerciseJoin } from "@/lib/dbJoins";
import { createClient } from "@/lib/supabase/server";
import { exerciseDisplayName } from "@/lib/exerciseSearch";
import { setMetric } from "@/lib/exerciseMetrics";
import { weekStart } from "@/lib/week";
import type { ExerciseType, UnitSystem } from "@/lib/types";
import {
  aggregateHomePeriods,
  type HomeFactRow,
  type HomePeriodFacts,
} from "@/lib/homePeriods";
import {
  balanceFlags,
  categoriesForExercise,
  deloadFlags,
  homeGuidance,
  stalenessFlags,
  type GuidanceItem,
  type MuscleCategory,
} from "@/lib/guidance";

const DAY = 86_400_000;

// F0.5: weekStart dzielony z lib/week (Europe/Warsaw) — była to trzecia niezależna
// kopia tej samej logiki z tym samym bugiem strefy czasowej po deployu na Vercel/UTC.

export interface HomeInsights {
  guidance: GuidanceItem[];
  /** `null` = brak historii; Home nie renderuje wtedy statystyk (HOME-02). */
  periods: HomePeriodFacts | null;
}

/**
 * Jeden przebieg danych Home: podpowiedzi guidance (Faza A: balans push/pull +
 * staleness partii) ORAZ agregaty okresu HOME-02 z tych samych wierszy.
 * Okno: 90 dni (staleness/trendy), bieżący tydzień (balans), 7/30 dni (kafle).
 * Liczone wyłącznie z zaliczonych serii roboczych zakończonych sesji.
 *
 * HOME-02 świadomie NIE woła `getPeriodOverview`/`periodStats` z
 * `app/progress/stats.ts`: każde okno to tam osobny 3-poziomowy waterfall, więc
 * trzy okna plus trendy to zmierzone **+13 zapytań** na najgorętszej trasie
 * (budżet `optymalizacja.md` §1 to „≤ 4, równolegle"). Te wiersze i tak już tu
 * lecą dla guidance — dołożenie agregatów kosztuje **+1** (licznik rekordów).
 * Definicje trzymamy zgodne z `periodStats`/`getStrengthTrends` (patrz
 * `lib/homePeriods.ts`), żeby Home i `/progress` nie mogły się rozjechać.
 */
export async function getHomeInsights(unit: UnitSystem): Promise<HomeInsights> {
  const supabase = await createClient();
  const since90 = new Date(Date.now() - 90 * DAY).toISOString();
  const since30 = new Date(Date.now() - 30 * DAY).toISOString();

  // Licznik rekordów jest niezależny od reszty — leci równolegle z pierwszym
  // poziomem waterfalla, więc nie pogłębia łańcucha. `head: true` = zero wierszy
  // w transferze, sam count.
  const [{ data: sessions }, { count: prCountRaw }] = await Promise.all([
    supabase
      .from("sessions")
      .select("id, started_at")
      .not("finished_at", "is", null)
      .gte("started_at", since90),
    supabase
      .from("personal_records")
      .select("id", { count: "exact", head: true })
      .gte("achieved_at", since30),
  ]);
  const prCount30 = prCountRaw ?? 0;
  const sessionDate = new Map((sessions ?? []).map((s) => [s.id, new Date(s.started_at)]));
  const sessionIds = [...sessionDate.keys()];
  const sessionDates = [...sessionDate.values()];
  if (sessionIds.length === 0) return { guidance: [], periods: null };

  const { data: ses } = await supabase
    .from("session_exercises")
    .select("id, session_id, exercise_id, exercises(name, name_pl, exercise_type, primary_muscles)")
    .eq("skipped", false)
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
    const ex = joinMaybe<
      Pick<ExerciseJoin, "name" | "name_pl" | "exercise_type" | "primary_muscles">
    >(se.exercises);
    seInfo.set(se.id, {
      date,
      sessionId: se.session_id,
      exerciseId: se.exercise_id,
      name: ex ? exerciseDisplayName(ex) : se.exercise_id,
      type: ex?.exercise_type ?? "weighted",
      categories: categoriesForExercise(se.exercise_id, ex?.primary_muscles ?? []),
    });
  });

  const seIds = [...seInfo.keys()];
  // Sesje bez ćwiczeń wciąż są faktem — kafle „treningi" mają je liczyć.
  if (seIds.length === 0) {
    return {
      guidance: [],
      periods: aggregateHomePeriods({ rows: [], sessionDates, prCount30, unit }),
    };
  }
  const { data: sets } = await supabase
    .from("session_sets")
    .select("session_exercise_id, weight, reps, duration_seconds")
    .in("session_exercise_id", seIds)
    .eq("completed", true)
    .eq("set_type", "working");

  const thisWeek = weekStart(new Date());
  const weekByCat: Partial<Record<MuscleCategory, number>> = {};
  const lastTrainedByCat: Partial<Record<MuscleCategory, number>> = {};
  // Deload: najlepsza metryka per ćwiczenie per sesja → seria chronologiczna.
  const bestByExSession = new Map<
    string,
    { name: string; type: ExerciseType; perSession: Map<string, number> }
  >();
  // HOME-02: ten sam przebieg buduje wiersze dla agregatów okresu — zero
  // dodatkowych zapytań, jedna definicja „zaliczonej serii roboczej".
  const factRows: HomeFactRow[] = [];
  (sets ?? []).forEach((s) => {
    const info = seInfo.get(s.session_exercise_id);
    if (!info) return;
    factRows.push({
      sessionDate: info.date,
      sessionId: info.sessionId,
      exerciseId: info.exerciseId,
      exerciseName: info.name,
      type: info.type,
      weight: s.weight,
      reps: s.reps,
      duration_seconds: s.duration_seconds,
    });
    const inThisWeek = weekStart(info.date) === thisWeek;
    for (const cat of info.categories) {
      if (inThisWeek) weekByCat[cat] = (weekByCat[cat] ?? 0) + 1;
      const t = info.date.getTime();
      if (t > (lastTrainedByCat[cat] ?? 0)) lastTrainedByCat[cat] = t;
    }
    const v = setMetric(info.type, s);
    if (v == null) return;
    let e = bestByExSession.get(info.exerciseId);
    if (!e) {
      e = { name: info.name, type: info.type, perSession: new Map() };
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
    type: e.type,
    series: [...e.perSession.entries()]
      .sort((a, b) => (sessionDate.get(a[0])?.getTime() ?? 0) - (sessionDate.get(b[0])?.getTime() ?? 0))
      .map(([, v]) => v),
  }));

  return {
    guidance: homeGuidance([
      ...stalenessFlags(daysSinceByCat),
      ...deloadFlags(deloadInput),
      ...balanceFlags(weekByCat),
    ]),
    periods: aggregateHomePeriods({ rows: factRows, sessionDates, prCount30, unit }),
  };
}
