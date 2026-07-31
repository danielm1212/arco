import { buildLevelMeter } from "@/lib/levelMeter";

/**
 * PLAN-05C/05G: poziom trudności jako miernik + etykieta tekstowa, nie same kropki.
 * `role="img"` z pełnym `aria-label` — czytnik ekranu dostaje jedno zdanie,
 * nie N osobnych `<div>`.
 *
 * Puste segmenty w wariancie `bars` jako obrys (nie `bg-primary/20`): policzony kontrast
 * rust-500 przy 20% krycia na białej karcie wychodzi 1.34:1 — daleko poniżej progu 3:1
 * dla elementów graficznych (WCAG 1.4.11); 70% krycia by przeszło, ale wygląda już prawie
 * jak wypełniony segment. Pełny (`bg-primary`) vs pusty (obrys) różni się kształtem, nie
 * tylko kolorem — mocniejszy sygnał niż odcień, i mierzalnie zgodny: rust-500 na pełną
 * krycię ma 5.08:1 na jasnej karcie i 3.11:1 na ciemnej.
 */

/**
 * PLAN-05G: wariant listowy to trzy kropki bez etykiety tekstowej.
 *
 * Tekst zniknął świadomie (decyzja właściciela 2026-07-31): lista grupuje plany pod
 * nagłówkami „Początkujący” / „Średniozaawansowani” / „Zaawansowani”, więc etykieta przy
 * każdej karcie powtarzała nagłówek własnej grupy — ten sam błąd, który wcześniej
 * wytknięto nazwom planów. Znaczenie niesie nagłówek sekcji i `aria-label`, więc reguła
 * z PLAN-05C („nie pokazujemy miernika bez etykiety”) jest spełniona treścią, nie
 * powtórzeniem: `buildLevelMeter` nadal zwraca `null`, gdy etykiety brakuje w danych.
 *
 * Pusty segment jest tu wypełniony na szaro, nie obrysowany jak w `bars` — przy 8 px
 * obrys zamienia kropkę w pierścień czytany jak znak „0” (sprawdzone na realnym
 * buildzie 2026-07-30). Pełny vs pusty w dark to 2.44:1, poniżej 3:1, ale kropki są
 * warstwą pomocniczą: poziom stoi w nagłówku grupy i w `aria-label`, a nie wyłącznie
 * w kolorze kropek.
 */
export function LevelMeter({
  levelMin,
  levelMax,
  label,
  variant = "bars",
  showLabel = false,
}: {
  levelMin: number | null;
  levelMax: number | null;
  label: string | null;
  variant?: "bars" | "list";
  /**
   * Wariant listowy domyślnie nie pokazuje etykiety, bo niesie ją nagłówek grupy
   * poziomu. Sekcja „Aktywny plan” takiego nagłówka NIE ma — tam same kropki
   * zostawiłyby osobę widzącą bez legendy (czytnik ekranu ma `aria-label`, więc
   * luka dotyczyła wyłącznie wzroku). Włącz tam `showLabel`.
   */
  showLabel?: boolean;
}) {
  const meter = buildLevelMeter(levelMin, levelMax, label);
  if (!meter) return null;

  if (variant === "list") {
    return (
      <span
        role="img"
        aria-label={meter.ariaLabel}
        className="inline-flex min-w-0 flex-wrap items-center gap-x-xs gap-y-2xs"
      >
        <span aria-hidden className="flex shrink-0 items-center gap-1">
          {meter.segments.map((filled, i) => (
            <span
              key={i}
              className={`size-2 rounded-full ${
                filled ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </span>
        {showLabel && (
          <span aria-hidden className="min-w-0 break-words text-xs text-muted-foreground">
            {meter.label}
          </span>
        )}
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label={meter.ariaLabel}
      className="inline-flex max-w-full flex-wrap items-center gap-x-xs gap-y-2xs"
    >
      <span aria-hidden className="flex gap-2xs">
        {meter.segments.map((filled, i) => (
          <span
            key={i}
            className={`h-2 w-5 rounded-full ${
              filled ? "bg-primary" : "border border-primary bg-transparent"
            }`}
          />
        ))}
      </span>
      <span
        aria-hidden
        className="min-w-0 max-w-full break-words text-sm text-muted-foreground"
      >
        {meter.label}
      </span>
    </span>
  );
}
