/**
 * Arco — smoke test Phase 1 (acceptance, sekcja 10 briefu).
 * Loguje się jako user (anon key + hasło) i przechodzi pełny przepływ przez RLS —
 * dokładnie tymi samymi wywołaniami supabase-js co aplikacja.
 *
 * Uruchom: npm run smoke
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/database.types";

config({ path: ".env.local" });

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const EMAIL = process.env.ADMIN_EMAIL!;
const PASSWORD = process.env.ADMIN_PASSWORD!;

const ok = (m: string) => console.log(`✓ ${m}`);
const fail = (m: string): never => {
  console.error(`✗ ${m}`);
  process.exit(1);
};

async function main() {
  const sb = createClient<Database>(URL, ANON, { auth: { persistSession: false } });

  const { data: auth, error: authErr } = await sb.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  });
  if (authErr || !auth.user) fail(`login: ${authErr?.message}`);
  const userId = auth.user!.id;
  ok(`login jako ${EMAIL}`);

  // 1. Przełączanie programu — stabilny slug, bo user-facing nazwa nie jest identyfikatorem.
  const { data: prevActive } = await sb
    .from("user_active_program")
    .select("program_id")
    .maybeSingle(); // przywracamy na końcu — smoke nie może zmieniać stanu usera
  const { data: prog3 } = await sb
    .from("programs")
    .select("id")
    .eq("slug", "beginner-gym-fbw3")
    .is("user_id", null)
    .single();
  if (!prog3) fail("brak programu beginner-gym-fbw3");
  await sb.from("user_active_program").upsert({ user_id: userId, program_id: prog3!.id });
  ok("ustawiono aktywny program (beginner gym, cykl 3 dni)");

  // 2. Start sesji z dnia A → session_exercises ze slotów (mimika startSession)
  const { data: dayA } = await sb
    .from("program_days")
    .select("id, label")
    .eq("program_id", prog3!.id)
    .order("position")
    .limit(1)
    .single();
  const { data: slots } = await sb
    .from("program_day_slots")
    .select("id, default_exercise_id, position, rest_seconds, target_sets")
    .eq("program_day_id", dayA!.id)
    .order("position");
  if (!slots?.length) fail("brak slotów dnia A");

  const { data: s1 } = await sb
    .from("sessions")
    .insert({ user_id: userId, program_day_id: dayA!.id })
    .select("id")
    .single();
  const se1 = slots!.map((s) => ({
    session_id: s1!.id,
    slot_id: s.id,
    exercise_id: s.default_exercise_id,
    position: s.position,
  }));
  const { data: insertedSe } = await sb.from("session_exercises").insert(se1).select("id, slot_id, exercise_id, position");
  if ((insertedSe?.length ?? 0) !== slots!.length) fail("start sesji nie utworzył wszystkich ćwiczeń ze slotów");
  const plannedSets = insertedSe!.flatMap((exercise) => {
    const slot = slots!.find((item) => item.id === exercise.slot_id)!;
    return Array.from({ length: slot.target_sets }, (_, setIndex) => ({
      session_exercise_id: exercise.id,
      set_index: setIndex,
      set_type: "working" as const,
    }));
  });
  const { data: insertedSets } = await sb
    .from("session_sets")
    .insert(plannedSets)
    .select("id, session_exercise_id, set_index");
  if ((insertedSets?.length ?? 0) !== plannedSets.length) fail("start sesji nie przygotował serii z planu");
  ok(`start sesji 1 → ${insertedSe!.length} ćwiczeń i ${insertedSets!.length} gotowych serii`);

  // 3. Log working seta na pierwszym ćwiczeniu (Barbell Squat)
  const squatSe = insertedSe!.find((x) => x.position === 0)!;
  const squatFirstSet = insertedSets!.find((set) => set.session_exercise_id === squatSe.id && set.set_index === 0)!;
  await sb.from("session_sets").update({ weight: 100, reps: 8, completed: true }).eq("id", squatFirstSet.id);
  ok("zalogowano working set 100kg × 8 (zaliczony)");

  // 4. Druga sesja tego samego dnia → previous_working_set ma zwrócić poprzedni wynik
  const { data: s2 } = await sb
    .from("sessions")
    .insert({ user_id: userId, program_day_id: dayA!.id })
    .select("id")
    .single();
  const { data: prev } = await sb.rpc("previous_working_set", {
    p_slot: squatSe.slot_id!,
    p_exercise: squatSe.exercise_id,
    p_session: s2!.id,
  });
  const pr = prev?.[0];
  if (!pr || pr.weight !== 100 || pr.reps !== 8)
    return fail(`poprzedni wynik nieprawidłowy: ${JSON.stringify(prev)}`);
  ok(`"poprzedni wynik" RPC zwraca ${pr.weight}kg × ${pr.reps}`);

  // 5. Edycja i usuwanie seta
  const editSet = insertedSets!.find((set) => set.session_exercise_id === squatSe.id && set.set_index === 1)!;
  await sb.from("session_sets").update({ weight: 82.5, reps: 10 }).eq("id", editSet.id);
  const { data: afterEdit } = await sb.from("session_sets").select("weight").eq("id", editSet.id).single();
  if (Number(afterEdit!.weight) !== 82.5) fail("edycja seta nie zadziałała");
  await sb.from("session_sets").delete().eq("id", editSet.id);
  const { count: afterDel } = await sb
    .from("session_sets")
    .select("*", { count: "exact", head: true })
    .eq("id", editSet.id);
  if (afterDel) fail("usuwanie seta nie zadziałało");
  ok("edycja (82.5kg) i usuwanie seta działają");

  // 6. Freestyle + dodanie ćwiczenia z katalogu
  const { data: sf } = await sb
    .from("sessions")
    .insert({ user_id: userId, program_day_id: null })
    .select("id")
    .single();
  const { data: anyEx } = await sb.from("exercises").select("id").ilike("name", "%curl%").limit(1).single();
  await sb.from("session_exercises").insert({
    session_id: sf!.id,
    slot_id: null,
    exercise_id: anyEx!.id,
    position: 0,
  });
  ok("freestyle: sesja bez programu + ćwiczenie z katalogu");

  // 7. Zaległy trening: data, flaga i zaplanowany czas są zapisane od początku.
  // finishSession ustawia finished_at na started_at + recorded_duration_seconds.
  const historicalStartedAt = "2026-07-12T15:30:00.000Z";
  const historicalDurationSeconds = 3_600;
  const { data: historical, error: historicalError } = await sb
    .from("sessions")
    .insert({
      user_id: userId,
      program_day_id: null,
      date: "2026-07-12",
      started_at: historicalStartedAt,
      is_historical: true,
      recorded_duration_seconds: historicalDurationSeconds,
    })
    .select("id, date, started_at, is_historical, recorded_duration_seconds")
    .single();
  if (
    historicalError ||
    !historical ||
    historical.date !== "2026-07-12" ||
    !historical.is_historical ||
    historical.recorded_duration_seconds !== historicalDurationSeconds
  ) {
    return fail(`zaległy trening nie zachował metadanych: ${historicalError?.message ?? "brak rekordu"}`);
  }
  const historicalFinishedAt = new Date(
    +new Date(historical.started_at) + historical.recorded_duration_seconds * 1_000,
  ).toISOString();
  const { data: finishedHistorical } = await sb
    .from("sessions")
    .update({ finished_at: historicalFinishedAt })
    .eq("id", historical.id)
    .select("finished_at")
    .single();
  if (
    !finishedHistorical?.finished_at ||
    +new Date(finishedHistorical.finished_at) !== +new Date(historicalFinishedAt)
  ) {
    return fail("zaległy trening nie zachował prawdziwego czasu trwania");
  }
  ok("zaległy trening: data i czas trwania zapisują się niezależnie od chwili wpisywania");

  // 8. Historia (kształt zapytania z /history)
  const { data: history } = await sb
    .from("sessions")
    .select("id, started_at, program_days(label), session_exercises(session_sets(completed))")
    .order("started_at", { ascending: false });
  if (!history?.length) fail("historia pusta");
  ok(`historia: ${history.length} sesji`);

  // 9. Pomiary: galeria do dwóch zdjęć, notatka, RLS i cascade przy usuwaniu.
  const { data: metric, error: metricError } = await sb
    .from("body_metrics")
    .insert({ user_id: userId, weight: 80.5, notes: "smoke: notatka pomiaru" })
    .select("id, notes")
    .single();
  if (metricError || !metric || metric.notes !== "smoke: notatka pomiaru") {
    return fail(`pomiar z notatką nie zapisał się: ${metricError?.message ?? "brak rekordu"}`);
  }
  const smokePhotoPrefix = `${userId}/smoke-body-metric-${metric.id}`;
  const { error: photosError } = await sb.from("body_metric_photos").insert([
    { body_metric_id: metric.id, user_id: userId, path: `${smokePhotoPrefix}-1.jpg`, position: 1 },
    { body_metric_id: metric.id, user_id: userId, path: `${smokePhotoPrefix}-2.jpg`, position: 2 },
  ]);
  if (photosError) return fail(`nie zapisano dwóch zdjęć pomiaru: ${photosError.message}`);
  const { error: overLimitError } = await sb.from("body_metric_photos").insert({
    body_metric_id: metric.id,
    user_id: userId,
    path: `${smokePhotoPrefix}-3.jpg`,
    position: 3,
  });
  if (!overLimitError) return fail("galeria pozwoliła zapisać trzecie zdjęcie");
  const { data: metricWithPhotos } = await sb
    .from("body_metrics")
    .select("id, notes, body_metric_photos(path, position)")
    .eq("id", metric.id)
    .single();
  const photoCount = (metricWithPhotos?.body_metric_photos ?? []).length;
  if (photoCount !== 2) return fail(`galeria zwróciła ${photoCount} zdjęć zamiast 2`);
  await sb.from("body_metrics").delete().eq("id", metric.id);
  const { count: orphanedPhotos } = await sb
    .from("body_metric_photos")
    .select("id", { count: "exact", head: true })
    .eq("body_metric_id", metric.id);
  if (orphanedPhotos) return fail("usunięty pomiar zostawił metadane zdjęć");
  ok("pomiar: notatka + limit 2 zdjęć + cascade działają");

  // Sprzątanie sesji testowych
  await sb.from("sessions").delete().in("id", [s1!.id, s2!.id, sf!.id, historical!.id]);
  if (prevActive?.program_id) {
    await sb.from("user_active_program").upsert({ user_id: userId, program_id: prevActive.program_id });
  } else {
    await sb.from("user_active_program").delete().eq("user_id", userId);
  }
  ok("posprzątano sesje testowe + przywrócono aktywny program");

  console.log("\n✅ Smoke Phase 1: wszystkie kryteria warstwy danych spełnione.");
}

main().catch((e) => fail(e.message));
