import assert from "node:assert/strict";
import test from "node:test";
import { REVIEW_EVERY, isReviewDue, reviewStorageKey } from "../lib/programReview";

test("insight: próg pierwszego pokazania i powrót co REVIEW_EVERY sesji", () => {
  // Bez zamknięcia (dismissedAt=0): pokazuje się dopiero od REVIEW_EVERY sesji.
  assert.equal(isReviewDue(REVIEW_EVERY - 1, 0), false);
  assert.equal(isReviewDue(REVIEW_EVERY, 0), true);

  // Zamknięcie przy N sesjach: wraca dopiero po kolejnych REVIEW_EVERY.
  const dismissedAt = 14;
  assert.equal(isReviewDue(dismissedAt, dismissedAt), false);
  assert.equal(isReviewDue(dismissedAt + REVIEW_EVERY - 1, dismissedAt), false);
  assert.equal(isReviewDue(dismissedAt + REVIEW_EVERY, dismissedAt), true);
});

test("insight: klucz izoluje użytkowników i programy (audyt R2.1 P1)", () => {
  const a = reviewStorageKey("user-a", "program-1");
  const b = reviewStorageKey("user-b", "program-1");
  const c = reviewStorageKey("user-a", "program-2");

  // Dwa konta na tym samym urządzeniu i dwa programy tego samego konta
  // mają OSOBNE stany zamknięcia — dismiss nie przecieka.
  assert.notEqual(a, b);
  assert.notEqual(a, c);
  assert.notEqual(b, c);
  assert.ok(a.startsWith("arco-program-review-dismissed:"));

  // Zamknięcie w programie 1 nie ukrywa insightu w programie 2 (symulacja
  // localStorage jako mapy klucz→wartość).
  const storage = new Map<string, string>([[a, "14"]]);
  const read = (key: string) => Number.parseInt(storage.get(key) ?? "0", 10);
  assert.equal(isReviewDue(15, read(a)), false);
  assert.equal(isReviewDue(15, read(c)), true);
});
