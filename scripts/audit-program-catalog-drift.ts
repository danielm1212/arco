/**
 * Read-only TRAIN-02A1 audit of system program parity.
 *
 * This script never writes to Supabase. It compares the current structural source
 * (`PROGRAMS`) with rows present in a selected database and explains why a missing
 * plan must not be point-synced yet.
 */
import { pathToFileURL } from "node:url";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { PROGRAMS } from "./seed";

export type ProgramReleaseReadiness = {
  auditId: `P${string}`;
  status: "blocked" | "ready";
  blockers: string[];
};

export type ProgramRow = {
  id: string;
  slug: string | null;
  name: string;
  content_version: number | null;
  user_id: string | null;
};

export const MISSING_PRODUCTION_READINESS: Record<string, ProgramReleaseReadiness> = {
  "beginner-gym-fbw2": {
    auditId: "P01",
    status: "blocked",
    blockers: ["TRAIN-02A2: korekta recepty P01"],
  },
  "beginner-home-fbw2": {
    auditId: "P03",
    status: "blocked",
    blockers: ["TRAIN-03/05: strukturalne alternatywy i prawda sprzętowa P03"],
  },
  "intermediate-bodyweight-fbw3": {
    auditId: "P08",
    status: "blocked",
    blockers: ["TRAIN-02A2: skrócenie dnia C P08 do 18 serii"],
  },
  "advanced-home-upper-lower4": {
    auditId: "P11",
    status: "blocked",
    blockers: [
      "TRAIN-02A3: pozostała korekta objętości P11",
      "TRAIN-03/05: alternatywy i prawda sprzętowa P11",
    ],
  },
  "advanced-bodyweight-upper-lower4": {
    auditId: "P12",
    status: "blocked",
    blockers: [
      "TRAIN-02A3: pozostała korekta objętości P12",
      "TRAIN-03/05: alternatywy i prawda sprzętowa P12",
    ],
  },
};

const expectedBySlug = new Map(PROGRAMS.map((program) => [program.slug, program]));

export type ProgramCatalogAudit = {
  expectedSystemPrograms: number;
  actualSystemPrograms: number;
  missingSlugs: string[];
  unexpectedSystemSlugs: string[];
  duplicateSystemSlugs: string[];
  versionMismatches: Array<{ slug: string; expected: number; actual: number | null }>;
  missingReadiness: Array<{ slug: string; readiness: ProgramReleaseReadiness | null }>;
  pointSyncDecision: "blocked" | "ready" | "not_needed";
};

export function auditProgramCatalog(rows: ProgramRow[]): ProgramCatalogAudit {
  const systemRows = rows.filter((row) => row.user_id === null);
  const slugCounts = new Map<string, number>();
  for (const row of systemRows) {
    if (row.slug) slugCounts.set(row.slug, (slugCounts.get(row.slug) ?? 0) + 1);
  }

  const actualSlugs = new Set([...slugCounts.keys()]);
  const expectedSlugs = [...expectedBySlug.keys()];
  const missingSlugs = expectedSlugs.filter((slug) => !actualSlugs.has(slug)).sort();
  const unexpectedSystemSlugs = [...actualSlugs]
    .filter((slug) => !expectedBySlug.has(slug))
    .sort();
  const duplicateSystemSlugs = [...slugCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([slug]) => slug)
    .sort();
  const versionMismatches = systemRows
    .flatMap((row) => {
      if (!row.slug) return [];
      const expected = expectedBySlug.get(row.slug);
      if (!expected || row.content_version === expected.content_version) return [];
      return [{ slug: row.slug, expected: expected.content_version, actual: row.content_version }];
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
  const missingReadiness = missingSlugs.map((slug) => ({
    slug,
    readiness: MISSING_PRODUCTION_READINESS[slug] ?? null,
  }));
  const pointSyncDecision =
    missingSlugs.length === 0
      ? "not_needed"
      : missingReadiness.every(({ readiness }) => readiness?.status === "ready") &&
          unexpectedSystemSlugs.length === 0 &&
          duplicateSystemSlugs.length === 0
        ? "ready"
        : "blocked";

  return {
    expectedSystemPrograms: PROGRAMS.length,
    actualSystemPrograms: systemRows.length,
    missingSlugs,
    unexpectedSystemSlugs,
    duplicateSystemSlugs,
    versionMismatches,
    missingReadiness,
    pointSyncDecision,
  };
}

async function main() {
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
  if (!isLocal && process.env.CONFIRM_REMOTE_AUDIT !== "program-catalog-readonly") {
    throw new Error(
      "Zdalny audyt zablokowany. Ustaw CONFIRM_REMOTE_AUDIT=program-catalog-readonly; skrypt nadal nie wykonuje zapisów.",
    );
  }

  const client = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client
    .from("programs")
    .select("id, slug, name, content_version, user_id");
  if (error) throw new Error(error.message);

  const audit = auditProgramCatalog((data ?? []) as ProgramRow[]);
  console.log(JSON.stringify({ targetHost: host, ...audit }, null, 2));
  if (
    audit.missingSlugs.length > 0 ||
    audit.unexpectedSystemSlugs.length > 0 ||
    audit.duplicateSystemSlugs.length > 0 ||
    audit.versionMismatches.length > 0
  ) {
    process.exitCode = 2;
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : null;
if (invokedPath === import.meta.url) {
  main().catch((error: unknown) => {
    console.error("❌ Audyt katalogu nie powiódł się:", error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
