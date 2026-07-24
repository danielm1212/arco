// server-only: używany w server components (supabase klient z next/headers).
import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

/**
 * DATA-03 (CORE-0): jedyna definicja "zakończonej sesji" dla agregatów (Postępy,
 * trendy siły) — jedno miejsce zamiast powtarzanego `.not("finished_at", "is", null)`
 * w każdym zapytaniu z osobna (audyt wykrył dwa niezależne miejsca bez tego warunku).
 * Serie w środku nadal filtrujemy osobno przy konsumencie (`completed=true`,
 * `set_type='working'`) — różne zapytania potrzebują różnych kolumn z session_sets.
 */
export async function finishedSessions(
  supabase: Supabase,
  range: { gte?: string; lt?: string } = {},
): Promise<{ id: string; started_at: string }[]> {
  let q = supabase.from("sessions").select("id, started_at").not("finished_at", "is", null);
  if (range.gte) q = q.gte("started_at", range.gte);
  if (range.lt) q = q.lt("started_at", range.lt);
  const { data } = await q;
  return data ?? [];
}
