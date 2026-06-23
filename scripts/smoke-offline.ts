/**
 * Arco — smoke Phase 2.5: idempotencja zapisu serii (podstawa odtwarzania outboxa).
 * Uruchom: npm run smoke:offline
 */
import { config } from "dotenv";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/database.types";

config({ path: ".env.local" });

const sb = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } },
);

const ok = (m: string) => console.log(`✓ ${m}`);
function fail(m: string): never {
  console.error(`✗ ${m}`);
  process.exit(1);
}

async function main() {
  const { data: auth, error } = await sb.auth.signInWithPassword({
    email: process.env.ADMIN_EMAIL!,
    password: process.env.ADMIN_PASSWORD!,
  });
  if (error || !auth.user) return fail(`login: ${error?.message}`);
  ok("login");

  const { data: s } = await sb
    .from("sessions")
    .insert({ user_id: auth.user.id, program_day_id: null })
    .select("id")
    .single();
  const { data: se } = await sb
    .from("session_exercises")
    .insert({ session_id: s!.id, slot_id: null, exercise_id: "Barbell_Squat", position: 0 })
    .select("id")
    .single();

  // Client UUID — symuluje serię dodaną offline
  const setId = randomUUID();
  const base = {
    id: setId,
    session_exercise_id: se!.id,
    set_index: 0,
    set_type: "working" as const,
    duration_seconds: null,
    added_weight: null,
    rpe: null,
  };

  // Pierwszy zapis (jak po powrocie sieci)
  let r = await sb.from("session_sets").upsert({ ...base, weight: 100, reps: 5, completed: false });
  if (r.error) return fail(`upsert 1: ${r.error.message}`);

  // Odtworzenie tej samej operacji ze zmienionymi wartościami (koalescencja → ostatni stan)
  r = await sb.from("session_sets").upsert({ ...base, weight: 102.5, reps: 5, completed: true });
  if (r.error) return fail(`upsert 2: ${r.error.message}`);

  const { data: rows } = await sb.from("session_sets").select("weight, completed").eq("id", setId);
  if ((rows?.length ?? 0) !== 1) return fail(`oczekiwano 1 wiersza, jest ${rows?.length}`);
  if (Number(rows![0].weight) !== 102.5 || rows![0].completed !== true)
    return fail(`zła wartość po replay: ${JSON.stringify(rows![0])}`);
  ok("idempotentny upsert po client-UUID: 1 wiersz, ostatni stan (102.5kg, ✓)");

  // Delete idempotentny (dwa razy — bez błędu)
  await sb.from("session_sets").delete().eq("id", setId);
  const d2 = await sb.from("session_sets").delete().eq("id", setId);
  if (d2.error) return fail(`delete idempotentny: ${d2.error.message}`);
  ok("delete idempotentny (powtórzony) — bez błędu");

  await sb.from("sessions").delete().eq("id", s!.id);
  ok("posprzątano");
  console.log("\n✅ Smoke offline: zapis serii jest idempotentny i odtwarzalny.");
}

main().catch((e) => fail(e.message));
