const warsawDateTimeFormatter = new Intl.DateTimeFormat("pl-PL", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "Europe/Warsaw",
});

const warsawDateFormatter = new Intl.DateTimeFormat("pl-PL", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Europe/Warsaw",
});

/**
 * Deterministiczny zapis daty dla UI Arco.
 *
 * Jawna strefa jest konieczna także w komponentach klienckich renderowanych
 * na serwerze: Vercel działa w UTC, a przeglądarka użytkownika zwykle w
 * Europe/Warsaw. Bez niej pierwszy HTML i hydratacja pokazują inny tekst.
 */
export function formatWarsawDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return warsawDateTimeFormatter.format(date);
}

/**
 * Warianty zapisu daty używane w UI. Istnieją, bo trzy ekrany (Historia,
 * karta ćwiczenia, Ciało) wołały `toLocaleDateString("pl-PL", {…})` BEZ
 * `timeZone` — Vercel liczy w UTC, więc trening zapisany po 22:00 czasu
 * polskiego pokazywał tam dzień wcześniejszy niż kalendarz nad tą samą listą
 * (kalendarz liczy przez `lib/week.ts`, czyli jawnie w Europe/Warsaw).
 * Wariant wybiera się nazwą, a strefy nie da się pominąć — o to chodzi.
 */
const WARSAW_DATE_STYLES = {
  /** 01.08.2026 — zapis techniczny, domyślny. */
  numeric: { year: "numeric", month: "2-digit", day: "2-digit" },
  /** 1 sie 2026 */
  dayMonthYear: { year: "numeric", month: "short", day: "numeric" },
  /** pt, 1 sie — listy w obrębie bieżącego roku. */
  weekdayDayMonth: { weekday: "short", month: "short", day: "numeric" },
  /** pt, 1 sie 2026 */
  weekdayDayMonthYear: { weekday: "short", year: "numeric", month: "short", day: "numeric" },
} as const satisfies Record<string, Intl.DateTimeFormatOptions>;

export type WarsawDateStyle = keyof typeof WARSAW_DATE_STYLES;

const styleFormatters = new Map<WarsawDateStyle, Intl.DateTimeFormat>();

export function formatWarsawDate(
  value: string | Date,
  style: WarsawDateStyle = "numeric",
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (style === "numeric") return warsawDateFormatter.format(date);
  let formatter = styleFormatters.get(style);
  if (!formatter) {
    // Formatter jest drogi w konstrukcji, a listy Historii wołają go raz na wiersz.
    formatter = new Intl.DateTimeFormat("pl-PL", {
      ...WARSAW_DATE_STYLES[style],
      timeZone: "Europe/Warsaw",
    });
    styleFormatters.set(style, formatter);
  }
  return formatter.format(date);
}
