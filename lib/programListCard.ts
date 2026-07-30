/**
 * PLAN-05E: nazwa prezentacyjna i tag środowiska dla wiersza biblioteki.
 *
 * Nazwy presetów w bazie mają format „Poziom · Środowisko · Fokus · Częstotliwość”
 * (migracja `20260716160000_program_names_and_rotation_copy.sql`). Na liście poziom
 * ma własny miernik, środowisko własny tag, a częstotliwość stoi w wierszu faktów —
 * powtarzanie tych trzech rzeczy w tytule robiło z niego czterokrotnie zduplikowaną
 * etykietę filtra. Zostaje sam fokus („Całe ciało”, „Push / Pull / Legs”).
 *
 * Wyprowadzamy to z istniejącego pola `name`, bez migracji i bez przepisywania danych:
 * pełna nazwa zostaje prawdą w bazie i na `/programs/[id]`. Dzięki temu nie tracimy
 * niczego, gdy reguła nie rozpozna nietypowej nazwy — degradujemy się do pełnej nazwy.
 */

const NAME_SEPARATOR = "·";

/** Poziomy tak, jak zapisano je w nazwach presetów (`level` z bazy zaczyna się
 *  wielką literą, w nazwach bywa też człon zakresu po myślniku). */
const LEVEL_WORDS = ["początkujący", "średniozaawansowany", "zaawansowany"];

/** Środowiska w nazwach presetów. „Dom z hantlami” musi stać przed „dom”,
 *  bo dopasowanie idzie po całym członie, nie po prefiksie. */
const ENVIRONMENT_WORDS = ["dom z hantlami", "masa ciała", "siłownia", "dom"];

function normalize(segment: string): string {
  return segment.trim().toLocaleLowerCase("pl-PL");
}

/** Człon poziomu to również zakres typu „Początkujący–średniozaawansowany”.
 *  Rozbijamy po myślnikach i ukośniku, ale „Góra / dół ciała” czy
 *  „Push / Pull / Legs” nie przejdą, bo ich części nie są nazwami poziomów. */
function isLevelSegment(segment: string): boolean {
  const parts = segment.split(/[–—\-/]/);
  return parts.every((part) => LEVEL_WORDS.includes(normalize(part)));
}

function isEnvironmentSegment(segment: string): boolean {
  return ENVIRONMENT_WORDS.includes(normalize(segment));
}

/** „2× w tygodniu”, „2–3× w tygodniu”, a także sam zapis liczbowy bez sufiksu. */
function isFrequencySegment(segment: string): boolean {
  const value = normalize(segment);
  return /w tygodniu/.test(value) || /^\d+([–—-]\d+)?\s*[×x]$/.test(value);
}

/**
 * Krótki tytuł karty. Zwraca pełną nazwę, gdy reguła nie ma czego zostawić —
 * własny plan użytkownika („Mój plan”) nie ma członów, więc przechodzi bez zmian.
 */
export function formatProgramShortName(name: string): string {
  const segments = name
    .split(NAME_SEPARATOR)
    .map((segment) => segment.trim())
    .filter(Boolean);
  if (segments.length <= 1) return name;

  const kept = segments.filter(
    (segment) =>
      !isLevelSegment(segment) &&
      !isEnvironmentSegment(segment) &&
      !isFrequencySegment(segment),
  );
  if (kept.length === 0) return name;

  return kept.join(` ${NAME_SEPARATOR} `);
}

/**
 * Etykieta taga środowiska na liście. Krótsza niż etykieta filtra
 * („Dom” zamiast „Dom z hantlami”) — tag ma być znacznikiem, nie zdaniem;
 * pełny opis sprzętu żyje w szczególe planu.
 */
export function formatProgramEnvironmentTag(environment: string | null): string | null {
  switch (environment) {
    case "gym":
      return "Siłownia";
    case "home":
      return "Dom";
    case "bodyweight":
      return "Masa ciała";
    default:
      return null;
  }
}
