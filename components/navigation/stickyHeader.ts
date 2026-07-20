/**
 * Jedno źródło prawdy dla sticky nagłówków respektujących safe-area (F0.4).
 *
 * Sticky header przypina się na `top: var(--safe-area-top)`, więc pas pod paskiem
 * statusu NAD nagłówkiem zostaje przezroczysty — bez tego prześwituje przezeń
 * scrollowana treść. Pseudo-element `before:` docleja `bg-background` na ten pas.
 *
 * Używają tego `PageHeader` (tryb sticky) oraz bespoke nagłówek Loggera. NIE
 * duplikuj tego łańcucha klas w kolejnych nagłówkach — dodaj własny z-index,
 * `bg-background`, obramowanie i padding obok tej stałej. Regresję pilnuje
 * `tests/sticky-header.test.ts`.
 */
export const STICKY_HEADER_SAFE_AREA =
  "sticky top-[var(--safe-area-top)] before:pointer-events-none before:absolute before:inset-x-0 before:bottom-full before:h-[var(--safe-area-top)] before:bg-background";

/**
 * Własny nagłówek Loggera ma dwie linie i działa wewnątrz globalnego `body pt-safe`.
 * Zwykły sticky offset dodałby safe-area drugi raz, zostawiając nad nim pusty pas.
 * Ujemny margines kasuje globalny odstęp tylko dla tła, a padding odkłada treść
 * bezpiecznie pod status barem zarówno przy starcie, jak i po scrollu.
 */
export const LOGGER_STICKY_HEADER_SAFE_AREA =
  "sticky top-0 -mt-[var(--safe-area-top)] pt-[calc(var(--safe-area-top)+var(--space-sm))]";
