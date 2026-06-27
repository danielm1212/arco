/** Pomocniki tygodniowe (passa + cel) — tydzień zaczyna się w poniedziałek. */

export const WEEK_MS = 7 * 86_400_000;

export const weekStart = (d: Date): number => {
  const x = new Date(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  x.setHours(0, 0, 0, 0);
  return x.getTime();
};

/** Passa = liczba kolejnych tygodni wstecz z ≥1 treningiem (bieżący pusty nie zeruje). */
export function computeStreak(weekTimes: Set<number>): number {
  let streak = 0;
  let w = weekStart(new Date());
  if (!weekTimes.has(w)) w -= WEEK_MS;
  while (weekTimes.has(w)) {
    streak++;
    w -= WEEK_MS;
  }
  return streak;
}
