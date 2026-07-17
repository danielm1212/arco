/**
 * R2.1 (audyt P1): logika widoczności insightu o przeglądzie planu.
 * Czyste funkcje — testowane w tests/program-review.test.ts; komponent
 * app/ProgramReviewInsight.tsx tylko je konsumuje.
 */

/** Insight wraca po kolejnych REVIEW_EVERY ukończonych sesjach od zamknięcia. */
export const REVIEW_EVERY = 12;

/**
 * Klucz per użytkownik i program — zamknięcie nie przecieka między kontami
 * ani planami na tym samym urządzeniu.
 */
export function reviewStorageKey(userId: string, programId: string): string {
  return `arco-program-review-dismissed:${userId}:${programId}`;
}

export function isReviewDue(completedSessions: number, dismissedAt: number): boolean {
  return completedSessions >= dismissedAt + REVIEW_EVERY;
}
