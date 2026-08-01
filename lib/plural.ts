/**
 * Polska odmiana rzeczownika po liczbie — jedno miejsce dla całej aplikacji.
 *
 * D1 (audyt 2026-07-31): odmiana była rozsypana po komponentach jako
 * `n === 1 ? "x" : "y"` albo wprost wpisana w JSX („{count} ćwiczeń"), przez co
 * aplikacja mówiła „3 ćwiczeń", „1 serie" i „22 treningów". Polski ma trzy formy
 * i nie da się ich zredukować do dwóch, więc każde miejsce z dwiema formami jest
 * błędne dla jakiejś liczby — pytanie tylko, jak szybko na nią trafisz.
 *
 * Reguła: 1 → forma pojedyncza; końcówka 2–4 → forma „few"; reszta → „many".
 * Wyjątek 12–14 (i każde ...12–...14) idzie do „many", mimo końcówki 2–4 —
 * to jest ten przypadek, na którym poległ `WeeklyGoalBadge` przy 22 tygodniach.
 */
export type PluralForms = readonly [one: string, few: string, many: string];

export function pluralPl(n: number, [one, few, many]: PluralForms): string {
  if (n === 1) return one;
  const last2 = Math.abs(n) % 100;
  const last = Math.abs(n) % 10;
  if (last2 >= 12 && last2 <= 14) return many;
  return last >= 2 && last <= 4 ? few : many;
}

/** „3 serie" — liczba razem z odmienionym rzeczownikiem. */
export function countPl(n: number, forms: PluralForms): string {
  return `${n} ${pluralPl(n, forms)}`;
}

/** Rzeczowniki używane w więcej niż jednym miejscu. Formy trzymamy tutaj, żeby
 *  „ćwiczenie" nie odmieniało się inaczej na Dziś niż w loggerze. */
export const WORDS = {
  training: ["trening", "treningi", "treningów"],
  exercise: ["ćwiczenie", "ćwiczenia", "ćwiczeń"],
  set: ["seria", "serie", "serii"],
  session: ["sesja", "sesje", "sesji"],
  plan: ["plan", "plany", "planów"],
  week: ["tydzień", "tygodnie", "tygodni"],
  day: ["dzień", "dni", "dni"],
  record: ["rekord", "rekordy", "rekordów"],
} as const satisfies Record<string, PluralForms>;
