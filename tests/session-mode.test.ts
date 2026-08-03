import assert from "node:assert/strict";
import { test } from "node:test";
import {
  modeAllowsRest,
  modeShowsProgression,
  sessionInteractionMode,
  type SessionInteractionMode,
} from "../lib/sessionMode";

test("E3: kontekst sesji ma jeden jawny tryb zachowania", () => {
  assert.equal(
    sessionInteractionMode({ isFinished: false, isHistorical: false }),
    "live",
  );
  assert.equal(
    sessionInteractionMode({ isFinished: true, isHistorical: false }),
    "finished",
  );
  assert.equal(
    sessionInteractionMode({ isFinished: false, isHistorical: true }),
    "historical",
  );
  assert.equal(
    sessionInteractionMode({ isFinished: true, isHistorical: true }),
    "historical",
    "zakończony wpis historyczny nie może odzyskać zachowań treningu na żywo",
  );
});

test("E3: tylko trening live może uruchomić nową przerwę", () => {
  const expected: Record<SessionInteractionMode, boolean> = {
    live: true,
    finished: false,
    historical: false,
  };
  for (const [mode, allowed] of Object.entries(expected)) {
    assert.equal(modeAllowsRest(mode as SessionInteractionMode), allowed, mode);
  }
});

test("E3: historia nie doradza progresji, zwykła edycja pozostaje bez regresji", () => {
  assert.equal(modeShowsProgression("live"), true);
  assert.equal(modeShowsProgression("finished"), true);
  assert.equal(modeShowsProgression("historical"), false);
});
