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

export function formatWarsawDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return warsawDateFormatter.format(date);
}
