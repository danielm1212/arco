// server-only: używany w server components (supabase klient z next/headers).
import type { createClient } from "@/lib/supabase/server";
import { joinOne } from "@/lib/dbJoins";
import { LIMITS } from "@/lib/format";

/** exerciseId → (liczba powtórzeń → najlepszy ciężar). */
export type RepPRMap = Record<string, Record<number, number>>;

/**
 * S12: rep-PRs (rekordy per liczba powtórzeń) liczone on-the-fly z serii
 * roboczych zaliczonych — świadomie BEZ rozszerzania personal_records/recompute
 * (zero ryzyka dryfu; przy jednym userze tanie; zmaterializujemy, gdy będzie wolno).
 * `excludeSessionId` — bieżąca sesja nie zawyża własnych rekordów „do pobicia".
 */
export async function getRepPRs(
  supabase: Awaited<ReturnType<typeof createClient>>,
  exerciseIds: string[],
  excludeSessionId?: string,
): Promise<RepPRMap> {
  if (exerciseIds.length === 0) return {};
  // DATA-03 (CORE-0): rep-PR liczą się tylko z zakończonych sesji — bez tego
  // filtru, seria zaliczona w innej otwartej sesji (np. przy edycji starej
  // historii, gdy równolegle trwa nowy trening) zawyżałaby rekord do pobicia.
  let q = supabase
    .from("session_sets")
    .select(
      "weight, reps, session_exercises!inner(exercise_id, session_id, sessions!inner(finished_at))",
    )
    .eq("completed", true)
    .eq("set_type", "working")
    .not("weight", "is", null)
    .not("reps", "is", null)
    .not("session_exercises.sessions.finished_at", "is", null)
    .in("session_exercises.exercise_id", exerciseIds);
  if (excludeSessionId) q = q.neq("session_exercises.session_id", excludeSessionId);
  const { data } = await q;

  const out: RepPRMap = {};
  (data ?? []).forEach((s) => {
    const se = joinOne<{ exercise_id: string }>(s.session_exercises);
    if (
      s.weight == null ||
      s.reps == null ||
      s.weight < 0 ||
      s.weight > LIMITS.weight ||
      !Number.isInteger(s.reps) ||
      s.reps < 1 ||
      s.reps > LIMITS.reps
    )
      return;
    const m = (out[se.exercise_id] ??= {});
    if (s.weight > (m[s.reps] ?? 0)) m[s.reps] = s.weight;
  });
  return out;
}

/**
 * Kondensacja do widoku „Rekordy per powtórzenia" (detal ćwiczenia):
 * tylko wpisy Pareto (więcej powtórzeń przy niższym ciężarze niż sąsiad = szum).
 */
export function repPRRows(m: Record<number, number>): { reps: number; weight: number }[] {
  const rows = Object.entries(m)
    .map(([r, w]) => ({ reps: Number(r), weight: w }))
    .sort((a, b) => a.reps - b.reps);
  // zostaw tylko te, których ciężar jest wyższy niż każdy przy większej liczbie powt.
  return rows.filter((row, i) => !rows.slice(i + 1).some((later) => later.weight >= row.weight));
}
