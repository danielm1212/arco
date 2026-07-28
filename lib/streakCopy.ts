/** HOME-01: wybór copy karty passy — wydzielone z komponentu, żeby dało się
 *  przetestować bez renderowania (wzorzec jak `formatGoalSentence` w
 *  `lib/programRecommendation.ts`). Zasada z `tone-of-voice.md`: nigdy przez
 *  stratę — streak=0 nie pokazuje "0. tydzień passy", tylko brak nagłówka
 *  liczbowego (komponent renderuje wtedy neutralny fallback). Liczebnik
 *  porządkowy ("1.", "5.") nie odmienia rzeczownika w polskim, więc jeden
 *  wzorzec obsługuje 1 i N bez osobnej liczby mnogiej. */
export function streakHeadline(streak: number): string | null {
  return streak > 0 ? `${streak}. tydzień passy` : null;
}

/** Jedno zdanie stanu tygodnia dla karty passy. `trening` odmienia się
 *  (1 vs N), inaczej niż porządkowy "tydzień" powyżej. */
export function streakStatusText(weeklyDone: number, weeklyGoal: number): string {
  if (weeklyDone >= weeklyGoal) return "Cel tygodnia zrobiony.";
  const remaining = weeklyGoal - weeklyDone;
  return remaining === 1
    ? "Jeszcze jeden trening domyka ten tydzień."
    : `Jeszcze ${remaining} treningi domykają ten tydzień.`;
}
