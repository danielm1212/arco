import { setMetric } from "@/lib/exerciseMetrics";
import { formatSet, weightToDisplay } from "@/lib/format";
import type { HomeFactRow } from "@/lib/homePeriods";
import type { ExerciseType, UnitSystem } from "@/lib/types";

export const HOME_EXERCISE_PROGRESS_LIMIT = 3;

export interface HomeExerciseProgressRow {
  id: string;
  name: string;
  type: ExerciseType;
  series: number[];
  record: string;
  metricLabel: string;
  metricValue: string;
  delta: number;
  deltaLabel: string;
}

type SessionBest = {
  at: number;
  metric: number;
  row: HomeFactRow;
};

/**
 * HOME-03: trzy ostatnio trenowane ćwiczenia, dla których istnieją co najmniej
 * dwa punkty trendu. Wszystko powstaje z wierszy `getHomeInsights` — zero zapytań.
 */
export function aggregateHomeExerciseProgress(
  rows: HomeFactRow[],
  unit: UnitSystem,
  limit = HOME_EXERCISE_PROGRESS_LIMIT,
): HomeExerciseProgressRow[] {
  const byExercise = new Map<
    string,
    {
      name: string;
      type: ExerciseType;
      perSession: Map<string, SessionBest>;
    }
  >();

  for (const row of rows) {
    const metric = setMetric(row.type, row);
    if (metric == null) continue;

    let exercise = byExercise.get(row.exerciseId);
    if (!exercise) {
      exercise = {
        name: row.exerciseName,
        type: row.type,
        perSession: new Map(),
      };
      byExercise.set(row.exerciseId, exercise);
    }

    const current = exercise.perSession.get(row.sessionId);
    if (!current || metric > current.metric) {
      exercise.perSession.set(row.sessionId, {
        at: row.sessionDate.getTime(),
        metric,
        row,
      });
    }
  }

  return [...byExercise.entries()]
    .map(([id, exercise]) => {
      const sessions = [...exercise.perSession.values()].sort((a, b) => a.at - b.at);
      if (sessions.length < 2) return null;

      const displaySeries =
        exercise.type === "weighted"
          ? sessions.map((session) => weightToDisplay(session.metric, unit))
          : sessions.map((session) => session.metric);
      const first = displaySeries[0];
      const last = displaySeries[displaySeries.length - 1];
      const delta = Math.round((last - first) * 10) / 10;
      const record = sessions.reduce((best, session) =>
        session.metric > best.metric ? session : best
      );
      const suffix =
        exercise.type === "weighted" ? unit : exercise.type === "timed" ? "s" : " powt.";

      return {
        id,
        name: exercise.name,
        type: exercise.type,
        series: displaySeries,
        record: formatSet(
          exercise.type,
          {
            weight: record.row.weight,
            reps: record.row.reps,
            duration_seconds: record.row.duration_seconds,
            added_weight: null,
          },
          unit,
        ),
        metricLabel:
          exercise.type === "weighted"
            ? "1RM"
            : exercise.type === "timed"
              ? "Czas"
              : "Powtórzenia",
        metricValue: `${last.toLocaleString("pl-PL")}${exercise.type === "bodyweight" ? "" : ` ${suffix}`.trimEnd()}`,
        delta,
        deltaLabel:
          delta > 0
            ? `+${delta.toLocaleString("pl-PL")}${exercise.type === "bodyweight" ? " powt." : ` ${suffix}`}`
            : "bez zmian",
        lastTrainedAt: sessions[sessions.length - 1].at,
      };
    })
    .filter((row): row is HomeExerciseProgressRow & { lastTrainedAt: number } => row !== null)
    .sort((a, b) => b.lastTrainedAt - a.lastTrainedAt)
    .slice(0, Math.max(0, limit))
    .map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      series: row.series,
      record: row.record,
      metricLabel: row.metricLabel,
      metricValue: row.metricValue,
      delta: row.delta,
      deltaLabel: row.deltaLabel,
    }));
}
