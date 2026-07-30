import assert from "node:assert/strict";
import { test } from "node:test";
import { programCoverGradient } from "../lib/programCover";

/** PLAN-05B: `focus_key` steruje fallbackiem, nie jest dekoracją zaszytą na stałe. */

test("programCoverGradient: balanced wybiera rustowy fallback", () => {
  const gradient = programCoverGradient("balanced");

  assert.match(gradient, /--arco-rust-50/);
  assert.match(gradient, /--arco-rust-100/);
});

test("programCoverGradient: lower_body wybiera violetowy fallback", () => {
  const gradient = programCoverGradient("lower_body");

  assert.match(gradient, /--arco-violet-50/);
  assert.match(gradient, /--arco-violet-100/);
});

test("programCoverGradient: brak focus_key bezpiecznie wraca do wariantu balanced", () => {
  assert.equal(programCoverGradient(null), programCoverGradient("balanced"));
});
