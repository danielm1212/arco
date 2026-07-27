import assert from "node:assert/strict";
import test from "node:test";
import { formatWarsawDateTime } from "../lib/dateTime";

test("Historia: data ma ten sam tekst na serwerze i w przeglądarce", () => {
  assert.equal(
    formatWarsawDateTime("2026-07-19T10:38:56.000Z"),
    "19.07.2026, 12:38:56",
  );
});

test("Historia: formatowanie respektuje zmianę czasu Europe/Warsaw", () => {
  assert.equal(
    formatWarsawDateTime("2026-01-19T10:38:56.000Z"),
    "19.01.2026, 11:38:56",
  );
});
