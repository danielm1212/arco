import type { ExerciseType } from "@/lib/types";

/**
 * Kształty zagnieżdżonych joinów PostgREST (audyt kodu P2, „zdrowie kodu").
 * Supabase typuje relacje joinów zbyt luźno, więc rzutowanie jest nieuniknione —
 * ale niech przechodzi przez JEDNO miejsce i wspólne kształty zamiast ~20
 * lokalnych literałów, które mogą się rozjechać z selectami.
 *
 * Zasada: w miejscu użycia bierz `Pick<ExerciseJoin, ...>` dokładnie z kolumnami
 * z selecta — kształt szerszy niż select to kłamstwo w typach.
 */
export interface ExerciseJoin {
  name: string;
  name_pl: string | null;
  exercise_type: ExerciseType;
  equipment: string | null;
  primary_muscles: string[];
  images: string[] | null;
  user_id: string | null;
}

/** Join dnia programu z nazwą programu (sesje, historia, mini-bar). */
export interface DayJoin {
  label: string;
  programs: { name: string } | null;
}

/** Relacja wymagana (inner join / FK not null). */
export function joinOne<T>(value: unknown): T {
  return value as T;
}

/** Relacja opcjonalna — ujednolica undefined/null. */
export function joinMaybe<T>(value: unknown): T | null {
  return (value ?? null) as T | null;
}

/** Kolekcja z joinu — ujednolica brak danych do pustej tablicy. */
export function joinMany<T>(value: unknown): T[] {
  return (value ?? []) as T[];
}
