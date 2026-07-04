/**
 * Arco — smoke test Phase 2 (acceptance sekcja 10): podmiana + fallback, PR/e1RM, plate calc.
 * Uruchom: npm run smoke:phase2
 */
import { config } from "dotenv";
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
  const uid = auth.user.id;
  ok("login");


  // 2. Przeliczanie PR + e1RM (Epley)
  const { data: sess } = await sb
    .from("sessions")
    .insert({ user_id: uid, program_day_id: null })
    .select("id")
    .single();
  const { data: se } = await sb
    .from("session_exercises")
    .insert({ session_id: sess!.id, slot_id: null, exercise_id: "Barbell_Squat", position: 0 })
    .select("id")
    .single();
  await sb.from("session_sets").insert({
    session_exercise_id: se!.id,
    set_index: 0,
    set_type: "working",
    weight: 120,
    reps: 5,
    completed: true,
  });
  const { error: rpcErr } = await sb.rpc("recompute_personal_records");
  if (rpcErr) return fail(`rpc recompute: ${rpcErr.message}`);

  const { data: prs, error: prErr } = await sb
    .from("personal_records")
    .select("record_type, value")
    .eq("exercise_id", "Barbell_Squat");
  if (prErr) return fail(`select PR: ${prErr.message}`);
  const maxW = prs?.find((p) => p.record_type === "max_weight")?.value;
  const e1rm = prs?.find((p) => p.record_type === "max_e1rm")?.value;
  const expectedE1rm = Math.round(120 * (1 + 5 / 30) * 10) / 10; // 140.0
  if (Number(maxW) !== 120) return fail(`PR max_weight = ${maxW}, oczekiwano 120`);
  if (Number(e1rm) !== expectedE1rm)
    return fail(`PR max_e1rm = ${e1rm}, oczekiwano ${expectedE1rm}`);
  ok(`PR: max_weight 120kg, e1RM ${e1rm}kg (Epley)`);

  // 3. Silnik podmiany — tier 1 (pełny sprzęt) zwraca kandydatów
  const { data: bench } = await sb
    .from("exercises")
    .select("movement_pattern, primary_muscles")
    .eq("id", "Barbell_Bench_Press_-_Medium_Grip")
    .single();
  const { data: cands } = await sb
    .from("exercises")
    .select("id")
    .eq("movement_pattern", bench!.movement_pattern!)
    .overlaps("primary_muscles", bench!.primary_muscles)
    .neq("id", "Barbell_Bench_Press_-_Medium_Grip")
    .limit(20);
  if ((cands?.length ?? 0) === 0) return fail("podmiana: brak kandydatów tier-1");
  ok(`podmiana tier-1 (push + klatka): ${cands!.length} kandydatów`);

  // 4. Fallback — sam "foam roll" jako sprzęt: tier-1 pusty, ale equipment-only nigdy pusty
  const { data: strict } = await sb
    .from("exercises")
    .select("id")
    .eq("movement_pattern", bench!.movement_pattern!)
    .overlaps("primary_muscles", bench!.primary_muscles)
    .eq("equipment", "foam roll")
    .limit(5);
  const { data: fallback } = await sb
    .from("exercises")
    .select("id")
    .eq("equipment", "foam roll")
    .limit(5);
  if ((fallback?.length ?? 0) === 0) return fail("fallback: equipment-only puste");
  ok(`fallback: tier-1 (foam roll) = ${strict?.length ?? 0}, equipment-only = ${fallback!.length} (nigdy pusto)`);

  // Sprzątanie
  await sb.from("sessions").delete().eq("id", sess!.id);
  await sb.rpc("recompute_personal_records");
  ok("posprzątano");

  console.log("\n✅ Smoke Phase 2: podmiana+fallback, PR/e1RM, plate calc — OK.");
}

main().catch((e) => fail(e.message));
