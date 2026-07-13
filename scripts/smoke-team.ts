/**
 * Lokalne testy akceptacyjne Ekipy: dwa konta w ekipie i jedno konto z zewnątrz.
 * Uruchom: TEAM_TEST_PASSWORD='lokalne-haslo' npm run smoke:team
 * Skrypt działa wyłącznie na lokalnym Supabase i po sobie sprząta dane Ekipy.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/database.types";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.TEAM_TEST_PASSWORD;
const runId = Date.now().toString(36);
const teamName = `__arco_team_smoke_${runId}__`;
const people = [
  { email: `ekipa-alfa-${runId}@arco.local`, name: "Alfa", avatar: "🐻" },
  { email: `ekipa-beta-${runId}@arco.local`, name: "Beta", avatar: "🦊" },
  { email: `ekipa-gamma-${runId}@arco.local`, name: "Gamma", avatar: "🐯" },
];

if (!url || !anonKey || !serviceRole || !password) {
  throw new Error("Brak konfiguracji lokalnej lub TEAM_TEST_PASSWORD.");
}
const host = new URL(url).hostname;
const isLocalHost = host === "localhost" || /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host);
if (!isLocalHost) {
  throw new Error("Smoke Ekipy można uruchomić wyłącznie na lokalnym Supabase.");
}

const admin = createClient<Database>(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
const ok = (message: string) => console.log(`✓ ${message}`);
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function ensureUser(email: string, name: string) {
  const { data: listed, error: listError } = await admin.auth.admin.listUsers();
  if (listError) throw new Error(`listUsers: ${listError.message}`);
  const existing = listed.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
  const userId = existing?.id;
  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !data.user) throw new Error(`createUser: ${error?.message ?? "brak użytkownika"}`);
    const { error: settingsError } = await admin.from("user_settings").upsert({ user_id: data.user.id, display_name: name, weekly_goal: 2 }, { onConflict: "user_id" });
    if (settingsError) throw new Error(`user_settings: ${settingsError.message}`);
    return data.user.id;
  }
  const { error: updateError } = await admin.auth.admin.updateUserById(userId, { password });
  if (updateError) throw new Error(`updateUser: ${updateError.message}`);
  const { error: settingsError } = await admin.from("user_settings").upsert({ user_id: userId, display_name: name, weekly_goal: 2 }, { onConflict: "user_id" });
  if (settingsError) throw new Error(`user_settings: ${settingsError.message}`);
  return userId;
}

async function signIn(email: string) {
  const client = createClient<Database>(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw new Error(`login ${email}: ${error?.message ?? "brak użytkownika"}`);
  return { client, id: data.user.id };
}

async function removeTestUsers(userIds: string[]) {
  for (const userId of userIds) {
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) throw new Error(`cleanup auth user: ${error.message}`);
  }
}

async function main() {
  const ids: string[] = [];

  try {
    for (const person of people) ids.push(await ensureUser(person.email, person.name));
    const [alfa, beta, gamma] = await Promise.all(people.map((person) => signIn(person.email)));
    const today = new Date().toISOString().slice(0, 10);
    const { data: created, error: createError } = await alfa.client.rpc("create_pod", {
      p_name: teamName,
      p_display_name: people[0].name,
      p_avatar: people[0].avatar,
      p_confirmed: true,
    });
    assert(!createError && created?.[0], `create_pod: ${createError?.message ?? "brak ekipy"}`);
    const pod = created[0];
    ok("konto Alfa założyło prywatną ekipę ze świadomą zgodą");

    const { data: joinedPodId, error: joinError } = await beta.client.rpc("join_pod_by_invite", {
      p_invite_code: pod.invite_code,
      p_display_name: people[1].name,
      p_avatar: people[1].avatar,
      p_confirmed: true,
    });
    assert(!joinError && joinedPodId === pod.pod_id, `join_pod_by_invite: ${joinError?.message ?? "nieprawidłowe ID"}`);
    ok("konto Beta dołączyło kodem zaproszenia");

    const { data: hiddenPods, error: hiddenPodsError } = await gamma.client.from("pods").select("id").eq("id", pod.pod_id);
    assert(!hiddenPodsError && hiddenPods?.length === 0, "konto spoza ekipy widzi jej metadane");
    const { data: hiddenOverview, error: hiddenOverviewError } = await gamma.client.rpc("get_pod_members", { p_pod_id: pod.pod_id });
    assert(!hiddenOverviewError && hiddenOverview?.length === 0, "konto spoza ekipy widzi jej członków");
    const { error: outsiderNudge } = await gamma.client.rpc("send_pod_nudge", { p_pod_id: pod.pod_id, p_to_user_id: beta.id });
    assert(outsiderNudge, "konto spoza ekipy mogło wysłać sygnał wsparcia");
    ok("RLS ukrywa ekipę i blokuje działania konta z zewnątrz");

    const { data: session, error: sessionError } = await alfa.client
      .from("sessions")
      .insert({ user_id: alfa.id, program_day_id: null, date: today, finished_at: new Date().toISOString() })
      .select("id")
      .single();
    assert(!sessionError && session, `utworzenie ukończonej sesji: ${sessionError?.message ?? "brak sesji"}`);
    const { error: emitError } = await alfa.client.rpc("emit_workout_activity", { p_session_id: session.id });
    assert(!emitError, `emit_workout_activity: ${emitError?.message}`);
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    const { error: directEventError } = await alfa.client.from("activity_events").insert({ user_id: alfa.id, kind: "workout_done", occurred_on: tomorrow, streak_weeks: 0 });
    assert(directEventError, "klient mógł dodać check-in bez ukończenia treningu");
    ok("check-in powstał po ukończeniu treningu; ręczne tworzenie jest zablokowane");

    const { data: peerSessions, error: peerSessionsError } = await beta.client.from("sessions").select("id").eq("user_id", alfa.id);
    assert(!peerSessionsError && peerSessions?.length === 0, "Ekipa może odczytać sesje drugiej osoby");
    const { data: overview, error: overviewError } = await beta.client.rpc("get_pod_members", { p_pod_id: pod.pod_id });
    assert(!overviewError && overview?.length === 2, `overview: ${overviewError?.message ?? "nieprawidłowa liczba członków"}`);
    const alfaOverview = overview.find((member) => member.member_id === alfa.id);
    assert(alfaOverview?.latest_event_id, "Beta nie widzi dozwolonego check-inu Alfy");
    assert(overview.every((member) => ["Alfa", "Beta"].includes(member.display_name)), "widok Ekipy ujawnia dane inne niż profil Ekipy");
    const { error: reactionError } = await beta.client.from("reactions").insert({ activity_event_id: alfaOverview.latest_event_id, user_id: beta.id, emoji: "👏" });
    assert(!reactionError, `reakcja: ${reactionError?.message}`);
    ok("członkowie widzą wyłącznie check-in i mogą reagować");

    const { error: leaveError } = await beta.client.from("pod_members").delete().eq("pod_id", pod.pod_id).eq("user_id", beta.id);
    assert(!leaveError, `opuszczenie ekipy: ${leaveError?.message}`);
    const { data: afterLeave, error: afterLeaveError } = await alfa.client.rpc("get_pod_members", { p_pod_id: pod.pod_id });
    assert(!afterLeaveError && afterLeave?.length === 1 && afterLeave[0]?.member_id === alfa.id, "opuszczony członek nadal jest widoczny w ekipie");
    ok("opuszczenie ekipy natychmiast odcina widok członkostwa");
    console.log("\n✅ Smoke Ekipa: konta testowe, RLS, prywatność i check-in — OK.");
  } finally {
    await removeTestUsers(ids);
  }
}

main().catch((error: unknown) => {
  console.error("✗ Smoke Ekipa:", error instanceof Error ? error.message : error);
  process.exit(1);
});
