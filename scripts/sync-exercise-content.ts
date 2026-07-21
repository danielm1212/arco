/**
 * Wąska synchronizacja S11 dla istniejącej produkcji.
 * Aktualizuje wyłącznie URL-e zdjęć ćwiczeń systemowych i dostępne instrukcje PL.
 * Nie dotyka planów, sesji, ćwiczeń użytkownika ani aktywnego programu.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import rawExercises from "./data/exercises.json";
import rawContentReviews from "./data/exercise-content-reviews.json";
import polishInstructionOverrides from "./data/exercise-instructions-pl.json";

config({ path: ".env.local" });

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
if (!isLocal && process.env.CONFIRM_REMOTE_SYNC !== "exercise-content") {
  throw new Error("Synchronizacja zdalna zablokowana. Ustaw CONFIRM_REMOTE_SYNC=exercise-content.");
}

type SourceExercise = { id: string; images?: string[] };
type ContentReview = { published_images: string[] };
const instructionMap = polishInstructionOverrides as Record<string, string[]>;
const contentReviewMap = rawContentReviews.reviews as Record<string, ContentReview>;
const imageBase = `${url.replace(/\/+$/, "")}/storage/v1/object/public/exercise-images/`;
const updates = (rawExercises as SourceExercise[]).map((exercise) => ({
  id: exercise.id,
  values: {
    images: (contentReviewMap[exercise.id]?.published_images ?? exercise.images ?? []).map((image) =>
      image.startsWith("http") || image.startsWith("/") ? image : `${imageBase}${image}`,
    ),
    ...(instructionMap[exercise.id] ? { instructions: instructionMap[exercise.id] } : {}),
  },
}));

async function main() {
  const client = createClient(url!, serviceRole!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let cursor = 0;
  let completed = 0;
  let skipped = 0;
  const concurrency = 12;

  async function worker() {
    while (cursor < updates.length) {
      const update = updates[cursor++];
      const { data, error } = await client
        .from("exercises")
        .update(update.values)
        .eq("id", update.id)
        .is("user_id", null)
        .select("id");
      if (error) throw new Error(`${update.id}: ${error.message}`);
      // id może nie istnieć na produkcji (starszy/inny zestaw seeda) — pomiń,
      // nie przerywaj całej synchronizacji (inaczej ryzyko częściowej aktualizacji).
      if ((data?.length ?? 0) === 0) {
        skipped += 1;
        continue;
      }
      completed += 1;
      if ((completed + skipped) % 100 === 0 || cursor === updates.length) {
        console.log(`✓ treść ćwiczeń: ${completed} zaktualizowanych, ${skipped} pominiętych / ${updates.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  console.log(
    `✅ Zdjęcia i polskie instrukcje zsynchronizowane: ${completed} ćwiczeń` +
      (skipped > 0 ? ` (${skipped} pominiętych — brak na produkcji).` : "."),
  );
}

main().catch((error: unknown) => {
  console.error("❌ Synchronizacja treści nie powiodła się:", error instanceof Error ? error.message : error);
  process.exit(1);
});
