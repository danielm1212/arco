/** Pomocniki tygodniowe (passa + cel) — tydzień zaczyna się w poniedziałek.
 *
 *  F0.5 (audyt 2026-07-18): wszystkie funkcje liczą dzień/tydzień w strefie
 *  Europe/Warsaw jawnie, niezależnie od strefy środowiska Node. Wcześniej
 *  używały getterów `Date` (getFullYear/getDate/getHours), które są zależne
 *  od `TZ` procesu — lokalnie (deweloper w PL) wychodziło poprawnie, ale na
 *  Vercel (TZ=UTC) "lokalna" północ w Warszawie (UTC+1/+2) wypadała jeszcze
 *  w poprzednim dniu UTC. Trening zakończony tuż po północy (00:00–02:00
 *  czasu PL latem) dostawał dayKey/weekStart poprzedniego dnia — pasek
 *  tygodnia, cel i passa mogły przesunąć się o jeden dzień/tydzień.
 *  Docelowo (użytkownicy poza PL): zamienić WARSAW_TZ na strefę z profilu
 *  użytkownika (patrz spec §16.1 edge case'y strefy czasowej).
 *
 *  Uwaga DST: tydzień obejmujący zmianę czasu (CET↔CEST) trwa 167 lub 169
 *  godzin, nie równe 168h. Dlatego przesunięcia dni/tygodni liczymy w
 *  przestrzeni dat kalendarzowych Warszawy (`addWarsawDays`), a nie stałą
 *  liczbą milisekund — inaczej granica tygodnia/dnia wypadałaby godzinę obok. */

export const WEEK_MS = 7 * 86_400_000;

const WARSAW_TZ = "Europe/Warsaw";

interface ZonedParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const zonedFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: WARSAW_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/** Rozkłada instant na części kalendarzowe w Europe/Warsaw (uwzględnia DST). */
function warsawParts(d: Date): ZonedParts {
  const parts = Object.fromEntries(
    zonedFormatter.formatToParts(d).map((p) => [p.type, p.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    // Intl z hour12:false potrafi zwrócić "24" dla północy zamiast "00".
    hour: parts.hour === "24" ? 0 : Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

/** Epoch ms dla 00:00:00 danego dnia kalendarzowego w Europe/Warsaw.
 *  Dwie iteracje wystarczają, by zbiec do właściwego offsetu (CET/CEST)
 *  nawet tuż przy granicy zmiany czasu. */
function warsawMidnightUtcMs(year: number, month: number, day: number): number {
  let guess = Date.UTC(year, month - 1, day, 0, 0, 0);
  const target = guess;
  for (let i = 0; i < 2; i++) {
    const p = warsawParts(new Date(guess));
    const guessedAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    guess += target - guessedAsUtc;
  }
  return guess;
}

/** Przesuwa epoch ms (powinien być warszawską północą, np. wynik `weekStart`)
 *  o `days` dni KALENDARZOWYCH w Europe/Warsaw i zwraca północ dnia docelowego.
 *  Bezpieczne pod DST — liczy w datach, nie w stałych 86 400 000 ms. */
export function addWarsawDays(epochMs: number, days: number): number {
  const { year, month, day } = warsawParts(new Date(epochMs));
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return warsawMidnightUtcMs(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, shifted.getUTCDate());
}

/** Klucz dnia w czasie Europe/Warsaw (YYYY-MM-DD). NIE używać toISOString().slice(0,10)
 *  ani getterów Date bez jawnej strefy — patrz komentarz na górze pliku
 *  (bug „sobota zamiast piątku", 2026-07-03; bug UTC-po-deployu, 2026-07-18). */
export const localDayKey = (d: Date): string => {
  const { year, month, day } = warsawParts(d);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

/** Dzień tygodnia w Europe/Warsaw: 0=niedziela..6=sobota (konwencja `Date.getDay()`). */
export const dayOfWeek = (d: Date): number => {
  const { year, month, day } = warsawParts(d);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
};

/** Epoch ms poniedziałku 00:00 (Europe/Warsaw) tygodnia zawierającego `d`. */
export const weekStart = (d: Date): number => {
  const { year, month, day } = warsawParts(d);
  const dow = new Date(Date.UTC(year, month - 1, day)).getUTCDay(); // 0=nd..6=sob
  const mondayOffset = (dow + 6) % 7;
  const monday = new Date(Date.UTC(year, month - 1, day - mondayOffset));
  return warsawMidnightUtcMs(monday.getUTCFullYear(), monday.getUTCMonth() + 1, monday.getUTCDate());
};

/** Passa = liczba kolejnych tygodni wstecz, w których dany tydzień „się liczy"
 *  (bieżący, jeszcze niedokończony tydzień nie zeruje passy — patrz niżej).
 *  `weekTimes` to zbiór epoch ms zwróconych przez `weekStart`; semantyka „co się liczy"
 *  (F0.6/D4: minimum celu planu, nie sam fakt treningu) należy do wywołującego —
 *  patrz `weeksMeetingGoal`. */
export function computeStreak(weekTimes: Set<number>): number {
  let streak = 0;
  let w = weekStart(new Date());
  if (!weekTimes.has(w)) w = addWarsawDays(w, -7);
  while (weekTimes.has(w)) {
    streak++;
    w = addWarsawDays(w, -7);
  }
  return streak;
}

/** F0.6 (audyt 2026-07-18, decyzja D4 — wersja surowa): tydzień „liczy się" do passy
 *  tylko, gdy liczba treningów w nim osiągnęła `goal`. Wcześniej wystarczał ≥1 trening
 *  niezależnie od celu planu — 1 z 2 wymaganych treningów fałszywie utrzymywał passę.
 *  Teraz 1 z 2 = passa przerwana; zgodność z planem, nie sama obecność. */
export function weeksMeetingGoal(times: (number | string | Date)[], goal: number): Set<number> {
  const counts = new Map<number, number>();
  for (const t of times) {
    const w = weekStart(t instanceof Date ? t : new Date(t));
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  const result = new Set<number>();
  for (const [w, n] of counts) if (n >= goal) result.add(w);
  return result;
}
