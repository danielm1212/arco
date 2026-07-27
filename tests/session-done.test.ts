import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("app/session/[id]/done/page.tsx", "utf8");

test("Done: zapytanie pobiera czas serii potrzebny treningom timed", () => {
  assert.match(
    source,
    /session_sets\(id, weight, reps, duration_seconds, set_type, completed\)/,
  );
});

test("Done: podsumowanie nie celebruje pominiętych ćwiczeń", () => {
  assert.match(source, /\.filter\(\(exercise\) => !exercise\.skipped\)/);
});
