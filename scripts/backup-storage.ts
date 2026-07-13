/**
 * Pobiera rzeczywiste pliki użytkownika ze Storage. Dump Postgresa zawiera tylko
 * metadane storage.objects, nie zawartość obiektów.
 */
import { config } from "dotenv";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const buckets = (process.env.BACKUP_STORAGE_BUCKETS ?? "body-photos,exercise-photos")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
const outputRoot = path.resolve(process.env.BACKUP_STORAGE_ROOT ?? `backups/${stamp}/storage`);

if (!url || !serviceRole) throw new Error("Brak URL lub service-role w .env.local.");

async function listFiles(client: SupabaseClient, bucket: string, prefix = ""): Promise<string[]> {
  const files: string[] = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await client.storage.from(bucket).list(prefix, {
      limit,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) {
      if (/not found/i.test(error.message)) return [];
      throw new Error(`${bucket}/${prefix}: ${error.message}`);
    }
    for (const item of data ?? []) {
      const objectPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id) files.push(objectPath);
      else files.push(...(await listFiles(client, bucket, objectPath)));
    }
    if ((data?.length ?? 0) < limit) break;
    offset += limit;
  }

  return files;
}

async function main() {
  const client = createClient(url!, serviceRole!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const manifest: { bucket: string; path: string; bytes: number }[] = [];

  for (const bucket of buckets) {
    const files = await listFiles(client, bucket);
    for (const objectPath of files) {
      const { data, error } = await client.storage.from(bucket).download(objectPath);
      if (error || !data) throw new Error(`${bucket}/${objectPath}: ${error?.message ?? "brak pliku"}`);
      const bytes = Buffer.from(await data.arrayBuffer());
      const target = path.join(outputRoot, bucket, objectPath);
      await mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
      await writeFile(target, bytes, { mode: 0o600 });
      manifest.push({ bucket, path: objectPath, bytes: bytes.length });
    }
    console.log(`✓ ${bucket}: ${files.length} plików`);
  }

  await mkdir(outputRoot, { recursive: true, mode: 0o700 });
  await writeFile(
    path.join(outputRoot, "manifest.json"),
    `${JSON.stringify({ createdAt: new Date().toISOString(), objects: manifest }, null, 2)}\n`,
    { mode: 0o600 },
  );
  console.log(`✅ Kopia Storage gotowa: ${manifest.length} plików w ${outputRoot}`);
}

main().catch((error: unknown) => {
  console.error("❌ Backup Storage nie powiódł się:", error instanceof Error ? error.message : error);
  process.exit(1);
});
