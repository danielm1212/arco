/**
 * Kopiuje oryginalne zdjęcia free-exercise-db do własnego bucketa Supabase.
 * Źródłem jest lokalny backup poza repo, domyślnie ../free-exercise-db/exercises.
 *
 * Produkcja wymaga jawnego bezpiecznika:
 * CONFIRM_REMOTE_UPLOAD=exercise-images npm run upload:exercise-images
 */
import { config } from "dotenv";
import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import rawExercises from "./data/exercises.json";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sourceRoot = path.resolve(
  process.env.EXERCISE_IMAGE_SOURCE_DIR ?? "../free-exercise-db/exercises",
);
const bucket = "exercise-images";
const concurrency = Math.max(1, Math.min(16, Number(process.env.IMAGE_UPLOAD_CONCURRENCY) || 8));

if (!url || !serviceRole) throw new Error("Brak URL lub service-role w .env.local.");

const host = new URL(url).hostname;
const isLocal =
  host === "localhost" ||
  /^127\./.test(host) ||
  /^10\./.test(host) ||
  /^192\.168\./.test(host) ||
  /^172\.(1[6-9]|2\d|3[01])\./.test(host);

if (!isLocal && process.env.CONFIRM_REMOTE_UPLOAD !== bucket) {
  throw new Error(`Upload zdalny zablokowany. Ustaw CONFIRM_REMOTE_UPLOAD=${bucket}.`);
}

type RawImageExercise = { images?: string[] };
const imagePaths = [
  ...new Set(
    (rawExercises as RawImageExercise[])
      .flatMap((exercise) => exercise.images ?? [])
      .filter((image) => !image.startsWith("http") && !image.startsWith("/")),
  ),
].sort();

for (const imagePath of imagePaths) {
  if (imagePath.includes("..") || path.isAbsolute(imagePath)) {
    throw new Error(`Niebezpieczna ścieżka obrazu: ${imagePath}`);
  }
}

async function main() {
  await access(sourceRoot);
  console.log(`Cel uploadu: ${host} · bucket "${bucket}" · źródło ${sourceRoot}`);
  const client = createClient(url!, serviceRole!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const storage = client.storage;
  const { data: buckets, error: bucketsError } = await storage.listBuckets();
  if (bucketsError) throw new Error(`lista bucketów: ${bucketsError.message}`);
  if (!(buckets ?? []).some((item) => item.id === bucket)) {
    const { error } = await storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg"],
    });
    if (error) throw new Error(`utworzenie bucketa: ${error.message}`);
    console.log(`✓ utworzono bucket ${bucket}`);
  }

  let cursor = 0;
  let uploaded = 0;

  async function worker() {
    while (cursor < imagePaths.length) {
      const imagePath = imagePaths[cursor++];
      const bytes = await readFile(path.join(sourceRoot, imagePath));
      const { error } = await storage.from(bucket).upload(imagePath, bytes, {
        contentType: "image/jpeg",
        cacheControl: "31536000",
        upsert: true,
      });
      if (error) throw new Error(`${imagePath}: ${error.message}`);
      uploaded += 1;
      if (uploaded % 100 === 0 || uploaded === imagePaths.length) {
        console.log(`✓ zdjęcia: ${uploaded}/${imagePaths.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  // Guard (po incydencie 2026-07-13): potwierdź, że pliki są REALNIE serwowalne
  // przez publiczny URL bucketa — łapie upload do złego projektu, brak flagi
  // public i rozjazd ścieżek obiekt↔URL-w-bazie. Ścieżka surowa, bez enkodowania,
  // żeby dokładnie odwzorować URL-e budowane przez seed (IMG_PREFIX + img).
  const step = Math.max(1, Math.floor(imagePaths.length / 5));
  const sample = imagePaths.filter((_, i) => i % step === 0).slice(0, 5);
  const publicBase = `${url!.replace(/\/+$/, "")}/storage/v1/object/public/${bucket}/`;
  const unreachable: string[] = [];
  for (const rel of sample) {
    const res = await fetch(publicBase + rel);
    if (!res.ok) unreachable.push(`${rel} → HTTP ${res.status}`);
  }
  if (unreachable.length > 0) {
    throw new Error(
      `Pliki wgrane, ale niedostępne publicznie (bucket nie serwuje):\n${unreachable.join("\n")}`,
    );
  }
  console.log(`✓ weryfikacja: ${sample.length}/${sample.length} próbek serwowanych publicznie (HTTP 200)`);
  console.log(`✅ Własny hosting zdjęć gotowy: ${uploaded} plików w ${bucket}.`);
}

main().catch((error: unknown) => {
  console.error("❌ Upload zdjęć nie powiódł się:", error instanceof Error ? error.message : error);
  process.exit(1);
});
