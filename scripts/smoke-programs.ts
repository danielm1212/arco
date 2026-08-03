/**
 * F1/F2: lokalny smoke wyboru dnia spoza aktywnego planu i izolacji ulubionych.
 * Tworzy dwa jednorazowe konta wyłącznie na lokalnym Supabase i usuwa je w finally.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/database.types";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.PROGRAM_TEST_PASSWORD;
const runId = Date.now().toString(36);
const emails = [
  `program-alpha-${runId}@arco.local`,
  `program-beta-${runId}@arco.local`,
];

if (!url || !anonKey || !serviceRole || !password) {
  throw new Error("Brak lokalnej konfiguracji lub PROGRAM_TEST_PASSWORD.");
}

const host = new URL(url).hostname;
const isLocalHost =
  host === "localhost" ||
  /^127\./.test(host) ||
  /^10\./.test(host) ||
  /^192\.168\./.test(host) ||
  /^172\.(1[6-9]|2\d|3[01])\./.test(host);
if (!isLocalHost) {
  throw new Error("Smoke programów można uruchomić wyłącznie na lokalnym Supabase.");
}

const admin = createClient<Database>(url, serviceRole, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const ok = (message: string) => console.log(`✓ ${message}`);
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function createUser(email: string) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    throw new Error(`createUser ${email}: ${error?.message ?? "brak użytkownika"}`);
  }
  return data.user.id;
}

async function signIn(email: string) {
  const client = createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    throw new Error(`login ${email}: ${error?.message ?? "brak użytkownika"}`);
  }
  return { client, id: data.user.id };
}

async function main() {
  const userIds: string[] = [];

  try {
    for (const email of emails) userIds.push(await createUser(email));
    const [alpha, beta] = await Promise.all(emails.map(signIn));

    const { data: systemPrograms, error: programsError } = await alpha.client
      .from("programs")
      .select("id, program_days(id, position)")
      .is("user_id", null)
      .order("id")
      .limit(2);
    assert(!programsError && systemPrograms?.length === 2, "brak dwóch planów systemowych");
    const activeProgram = systemPrograms[0];
    const sideProgram = systemPrograms[1];
    const activeDay = [...activeProgram.program_days].sort((a, b) => a.position - b.position)[0];
    const sideDay = [...sideProgram.program_days].sort((a, b) => a.position - b.position)[0];
    assert(activeDay && sideDay, "plan testowy nie ma dnia treningowego");

    const { error: activeError } = await alpha.client
      .from("user_active_program")
      .insert({ user_id: alpha.id, program_id: activeProgram.id });
    assert(!activeError, `ustawienie aktywnego planu: ${activeError?.message}`);

    const { data: firstStart, error: firstStartError } = await alpha.client.rpc(
      "start_or_resume_session",
      { p_program_day_id: sideDay.id },
    );
    const started = firstStart?.[0];
    assert(!firstStartError && started?.created, `start dnia obok planu: ${firstStartError?.message}`);
    const [{ data: activeAfter }, { data: sessionAfter }] = await Promise.all([
      alpha.client.from("user_active_program").select("program_id").single(),
      alpha.client
        .from("sessions")
        .select("id, program_day_id")
        .eq("id", started.session_id)
        .single(),
    ]);
    assert(activeAfter?.program_id === activeProgram.id, "start zmienił aktywny plan");
    assert(sessionAfter?.program_day_id === sideDay.id, "sesja nie użyła wybranego dnia");
    ok("dzień nieaktywnego planu startuje bez zmiany aktywnego planu");

    const { data: resumed, error: resumedError } = await alpha.client.rpc(
      "start_or_resume_session",
      { p_program_day_id: activeDay.id },
    );
    const resumedSession = resumed?.[0];
    const { count: openCount } = await alpha.client
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .is("finished_at", null);
    assert(!resumedError, `wznowienie sesji: ${resumedError?.message}`);
    assert(resumedSession?.created === false, "drugi start utworzył nową sesję");
    assert(resumedSession?.session_id === started.session_id, "drugi start nie wznowił sesji");
    assert(openCount === 1, `użytkownik ma ${openCount ?? 0} otwartych sesji zamiast jednej`);
    ok("drugi start wznawia jedyną otwartą sesję");

    const { error: alphaFavoriteError } = await alpha.client
      .from("favorite_programs")
      .insert({ user_id: alpha.id, program_id: sideProgram.id });
    assert(!alphaFavoriteError, `ulubiony plan Alfy: ${alphaFavoriteError?.message}`);

    const { data: betaSeesAlpha } = await beta.client
      .from("favorite_programs")
      .select("program_id")
      .eq("user_id", alpha.id);
    assert(betaSeesAlpha?.length === 0, "Beta widzi ulubione Alfy");

    const { error: crossInsertError } = await beta.client
      .from("favorite_programs")
      .insert({ user_id: alpha.id, program_id: sideProgram.id });
    assert(crossInsertError, "Beta dodała ulubiony plan w imieniu Alfy");

    await beta.client
      .from("favorite_programs")
      .delete()
      .eq("user_id", alpha.id)
      .eq("program_id", sideProgram.id);
    const { data: alphaStillHasFavorite } = await alpha.client
      .from("favorite_programs")
      .select("program_id")
      .eq("program_id", sideProgram.id)
      .single();
    assert(alphaStillHasFavorite, "Beta usunęła ulubiony plan Alfy");
    ok("RLS ukrywa ulubione i blokuje zapis oraz usunięcie między kontami");

    const { data: privateProgram, error: privateProgramError } = await alpha.client
      .from("programs")
      .insert({
        name: `Prywatny plan ${runId}`,
        days_per_week: 2,
        cycle_days: 1,
        is_default: false,
        user_id: alpha.id,
      })
      .select("id")
      .single();
    assert(!privateProgramError && privateProgram, `prywatny plan: ${privateProgramError?.message}`);

    const { error: privateFavoriteError } = await beta.client
      .from("favorite_programs")
      .insert({ user_id: beta.id, program_id: privateProgram.id });
    assert(privateFavoriteError, "Beta polubiła prywatny plan Alfy");

    const { error: betaFavoriteError } = await beta.client
      .from("favorite_programs")
      .insert({ user_id: beta.id, program_id: sideProgram.id });
    assert(!betaFavoriteError, `niezależny ulubiony Bety: ${betaFavoriteError?.message}`);
    const { error: duplicateFavoriteError } = await beta.client
      .from("favorite_programs")
      .insert({ user_id: beta.id, program_id: sideProgram.id });
    assert(duplicateFavoriteError?.code === "23505", "para użytkownik–plan nie jest unikalna");
    ok("plan systemowy może być ulubiony niezależnie na dwóch kontach");

    const { error: cleanupSessionError } = await alpha.client
      .from("sessions")
      .delete()
      .eq("id", started.session_id);
    assert(!cleanupSessionError, `sprzątanie sesji: ${cleanupSessionError?.message}`);
    console.log("\n✅ Smoke programów: start obok planu, jedna sesja i RLS ulubionych — OK.");
  } finally {
    for (const userId of userIds) {
      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) console.error(`✗ cleanup auth user ${userId}: ${error.message}`);
    }
  }
}

main().catch((error: unknown) => {
  console.error("✗ Smoke programów:", error instanceof Error ? error.message : error);
  process.exit(1);
});
