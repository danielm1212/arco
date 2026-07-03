/** Pomocniki tygodniowe (passa + cel) — tydzień zaczyna się w poniedziałek. */

export const WEEK_MS = 7 * 86_400_000;

/** Klucz dnia w CZASIE LOKALNYM (YYYY-MM-DD). NIE używać toISOString().slice(0,10):
 *  to data UTC — w PL (UTC+2) lokalna północ to 22:00 poprzedniego dnia, więc paski
 *  tygodnia/kalendarz przesuwały się o dzień (bug „sobota zamiast piątku", 2026-07-03).
 *  ⚠️ Po deployu (Vercel = UTC) server components będą liczyć "lokalnie" w UTC —
 *  do QA w N1; docelowo jawna strefa usera (Intl / przeniesienie na klienta). */
export const localDayKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

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
