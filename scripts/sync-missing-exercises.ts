/**
 * R1b: punktowy sync dwóch rekordów wykrytych przez backup/restore.
 * Nie dotyka programów, aktywnych planów, sesji ani pozostałych ćwiczeń.
 *
 * Sprawdzenie: npm run sync:missing-exercises -- --check
 * Zapis lokalny: npm run sync:missing-exercises
 * Zapis zdalny wymaga jawnego CONFIRM_REMOTE_SYNC=missing-exercises.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { pathToFileURL } from "node:url";
import rawExercises from "./data/exercises.json";
import { toSeedExercise, type RawExercise } from "./seed";

config({ path: ".env.local" });

export const REQUIRED_EXERCISE_IDS = [
  "Band_Lat_Pulldown",
  "Single_Leg_Calf_Raise",
] as const;

export function missingExerciseRows(source: RawExercise[]) {
  const byId = new Map(source.map((exercise) => [exercise.id, exercise]));
  return REQUIRED_EXERCISE_IDS.map((id) => {
    const exercise = byId.get(id);
    if (!exercise) throw new Error(`Brak ${id} w źródłowym exercises.json.`);
    return toSeedExercise(exercise);
  });
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) throw new Error("Brak URL lub service-role w .env.local.");
  const host = new URL(url).hostname;
  const isLocal =
    host === "localhost" ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host);
  const checkOnly = process.argv.includes("--check");
  if (!checkOnly && !isLocal && process.env.CONFIRM_REMOTE_SYNC !== "missing-exercises") {
    throw new Error(
      "Zdalny zapis zablokowany. Ustaw CONFIRM_REMOTE_SYNC=missing-exercises po audycie celu.",
    );
  }
  const client = createClient(url!, serviceRole!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const rows = missingExerciseRows(rawExercises as RawExercise[]);
  const { data: before, error: beforeError } = await client
    .from("exercises")
    .select("id")
    .in("id", [...REQUIRED_EXERCISE_IDS]);
  if (beforeError) throw new Error(`Audyt przed syncem: ${beforeError.message}`);
  const presentBefore = new Set((before ?? []).map((row) => row.id));
  const missingBefore = REQUIRED_EXERCISE_IDS.filter((id) => !presentBefore.has(id));

  if (checkOnly) {
    console.log(
      missingBefore.length === 0
        ? "✅ Oba wymagane ćwiczenia są obecne."
        : `⚠ Brakujące ćwiczenia (${missingBefore.length}): ${missingBefore.join(", ")}`,
    );
    return;
  }

  const { error: upsertError } = await client.from("exercises").upsert(rows, { onConflict: "id" });
  if (upsertError) throw new Error(`Punktowy upsert: ${upsertError.message}`);

  const { data: after, error: afterError } = await client
    .from("exercises")
    .select("id, movement_pattern, exercise_type, hidden")
    .in("id", [...REQUIRED_EXERCISE_IDS]);
  if (afterError) throw new Error(`Weryfikacja po syncu: ${afterError.message}`);
  if ((after ?? []).length !== REQUIRED_EXERCISE_IDS.length) {
    throw new Error("Weryfikacja nie znalazła obu rekordów po syncu.");
  }
  console.log(
    `✅ Punktowy sync zakończony: ${REQUIRED_EXERCISE_IDS.join(", ")} ` +
      `(przed zapisem brakowało: ${missingBefore.length}).`,
  );
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : null;
if (invokedPath === import.meta.url) {
  main().catch((error: unknown) => {
    console.error("❌ Punktowy sync nie powiódł się:", error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
