import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(new URL("../lib/useSync.ts", import.meta.url), "utf8");

test("SYNC-01: pierwszy render liczników outboxa jest zgodny z HTML-em serwera", () => {
  assert.match(source, /const \[pending, setPending\] = useState\(0\)/);
  assert.match(source, /const \[quarantined, setQuarantined\] = useState\(0\)/);
  assert.doesNotMatch(source, /useState\(\(\) =>[\s\S]{0,120}pendingCount/);
  assert.doesNotMatch(source, /useState\(\(\) =>[\s\S]{0,120}quarantineCount/);
  assert.match(
    source,
    /requestAnimationFrame\(\(\) => \{[\s\S]*setPending\(pendingCount\(scopeSessionId\)\)/,
  );
});

test("SYNC-01: logger nie czyta localStorage bezpośrednio podczas renderu", () => {
  const sessionOutbox = readFileSync(
    new URL("../app/session/[id]/useSessionOutbox.ts", import.meta.url),
    "utf8",
  );

  assert.match(sessionOutbox, /useSync\(sessionId\)/);
  assert.match(sessionOutbox, /pending: sync\.pending/);
  assert.match(sessionOutbox, /quarantined: sync\.quarantined/);
  assert.doesNotMatch(sessionOutbox, /pendingCount\(sessionId\)/);
  assert.doesNotMatch(sessionOutbox, /quarantineCount\(sessionId\)/);
});
