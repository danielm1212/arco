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
 * PLAN-05H: wariant listowy to trzy PIONOWE SŁUPKI ROSNĄCEJ WYSOKOŚCI (nie kropki
 * równej wielkości) — wzorzec z benchmarku (Tempo, Gymshark `▂▃`): kształt sam niesie
 * rangę, nie tylko liczba wypełnień. `items-end`, żeby słupki równały się do dołu,
 * jak słupki wykresu.
 *
 * Etykieta tekstowa jest teraz zawsze widoczna. PLAN-05G chował ją poza kartą aktywnego
 * planu, bo nagłówek grupy poziomu na liście niósł to samo słowo. PLAN-05H usuwa
 * nagłówki grup na rzecz chipów filtra u góry listy — bez nagłówka obok KAŻDEJ karty
 * nie ma już nic, co powtarzałoby etykietę, więc wraca ona jako stały element wariantu.
 *
 * Pusty segment jest wypełniony na szaro, nie obrysowany jak w `bars` — przy wąskim
 * słupku obrys czyta się jak osobny kształt, nie pusty stan tego samego elementu
 * (sprawdzone na realnym buildzie 2026-07-30 dla kropek; słupki mają ten sam problem
 * geometrii). Pełny vs pusty w dark to 2.44:1, poniżej progu 3:1 dla samodzielnej
 * grafiki (WCAG 1.4.11) — świadome odstępstwo: etykieta tekstowa stoi tuż obok i
 * `aria-label` niesie pełne zdanie, więc słupki są warstwą pomocniczą, nie jedynym
 * nośnikiem znaczenia.
 */
const LIST_BAR_HEIGHTS = ["h-2", "h-3", "h-4"];
export function LevelMeter({
  levelMin,
  levelMax,
  label,
  variant = "bars",
}: {
  levelMin: number | null;
  levelMax: number | null;
  label: string | null;
  variant?: "bars" | "list";
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
        <span aria-hidden className="flex shrink-0 items-end gap-1">
          {meter.segments.map((filled, i) => (
            <span
              key={i}
              className={`w-2 rounded-full ${LIST_BAR_HEIGHTS[i]} ${
                filled ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </span>
        <span aria-hidden className="min-w-0 break-words text-xs text-muted-foreground">
          {meter.label}
        </span>
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
