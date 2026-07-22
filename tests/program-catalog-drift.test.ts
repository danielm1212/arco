import assert from "node:assert/strict";
import test from "node:test";
import {
  MISSING_PRODUCTION_READINESS,
  auditProgramCatalog,
  type ProgramRow,
} from "../scripts/audit-program-catalog-drift";
import { PROGRAMS } from "../scripts/seed";

const presentProductionSlugs = new Set([
  "advanced-gym-ppl6",
  "beginner-bodyweight-fbw3",
  "beginner-gym-fbw3",
  "beginner-home-fbw3",
  "intermediate-gym-fbw2",
  "intermediate-gym-upper-lower4",
  "intermediate-home-fbw2",
  "intermediate-home-upper-lower4",
  "lower-body-gym3",
  "lower-body-home3",
]);

function systemRow(slug: string): ProgramRow {
  const program = PROGRAMS.find((candidate) => candidate.slug === slug);
  assert.ok(program, `Brak programu ${slug} w seedzie.`);
  return {
    id: `system-${slug}`,
    slug,
    name: program.name,
    content_version: program.content_version,
    user_id: null,
  };
}

test("TRAIN-02A1 identyfikuje dokładnie pięć brakujących planów produkcyjnych", () => {
  const audit = auditProgramCatalog([...presentProductionSlugs].map(systemRow));

  assert.equal(audit.actualSystemPrograms, 10);
  assert.equal(audit.expectedSystemPrograms, 15);
  assert.deepEqual(audit.missingSlugs, [
    "advanced-bodyweight-upper-lower4",
    "advanced-home-upper-lower4",
    "beginner-gym-fbw2",
    "beginner-home-fbw2",
    "intermediate-bodyweight-fbw3",
  ]);
  assert.equal(audit.pointSyncDecision, "blocked");
});

test("A2 odblokowuje recepty P01/P08, ale pełny point sync nadal jest zablokowany", () => {
  const audit = auditProgramCatalog([...presentProductionSlugs].map(systemRow));

  assert.equal(audit.missingReadiness.length, 5);
  for (const { slug, readiness } of audit.missingReadiness) {
    assert.deepEqual(readiness, MISSING_PRODUCTION_READINESS[slug]);
  }
  assert.equal(MISSING_PRODUCTION_READINESS["beginner-gym-fbw2"]?.recipeStatus, "ready");
  assert.equal(
    MISSING_PRODUCTION_READINESS["intermediate-bodyweight-fbw3"]?.recipeStatus,
    "ready",
  );
  assert.equal(MISSING_PRODUCTION_READINESS["beginner-home-fbw2"]?.recipeStatus, "ready");
  assert.equal(MISSING_PRODUCTION_READINESS["beginner-gym-fbw2"]?.status, "blocked");
  assert.equal(MISSING_PRODUCTION_READINESS["intermediate-bodyweight-fbw3"]?.status, "blocked");
  assert.equal(MISSING_PRODUCTION_READINESS["beginner-home-fbw2"]?.status, "blocked");
  assert.equal(MISSING_PRODUCTION_READINESS["advanced-home-upper-lower4"]?.status, "blocked");
  assert.equal(
    MISSING_PRODUCTION_READINESS["advanced-bodyweight-upper-lower4"]?.status,
    "blocked",
  );
  assert.equal(audit.pointSyncDecision, "blocked");
});

test("pełny katalog zgodny z seedem nie wymaga synchronizacji", () => {
  const audit = auditProgramCatalog(PROGRAMS.map((program) => systemRow(program.slug)));

  assert.equal(audit.actualSystemPrograms, 15);
  assert.deepEqual(audit.missingSlugs, []);
  assert.deepEqual(audit.versionMismatches, []);
  assert.equal(audit.pointSyncDecision, "not_needed");
});

test("audyt wykrywa nieznany preset i rozjazd content_version, ignorując program użytkownika", () => {
  const rows = PROGRAMS.map((program) => systemRow(program.slug));
  rows.push({
    id: "unexpected-system",
    slug: "unexpected-system-program",
    name: "Unexpected",
    content_version: 1,
    user_id: null,
  });
  rows.push({
    id: "user-program",
    slug: "my-private-program",
    name: "Mój plan",
    content_version: null,
    user_id: "user-a",
  });
  rows[0] = { ...rows[0], content_version: (rows[0].content_version ?? 0) + 1 };

  const audit = auditProgramCatalog(rows);

  assert.deepEqual(audit.unexpectedSystemSlugs, ["unexpected-system-program"]);
  assert.equal(audit.versionMismatches.length, 1);
  assert.equal(audit.actualSystemPrograms, 16);
});
