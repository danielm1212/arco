import { buildLevelMeter } from "@/lib/levelMeter";

/**
 * PLAN-05C: poziom trudności jako pasek + etykieta tekstowa, nie same kropki.
 * `role="img"` z pełnym `aria-label` — czytnik ekranu dostaje jedno zdanie,
 * nie N osobnych `<div>`. Jeden komponent, myślany pod dwa miejsca użycia
 * (lista i szczegół planu) — wpięcie w oba ekrany jest zakresem PLAN-05D/05E.
 *
 * Puste segmenty jako obrys (nie `bg-primary/20`): policzony kontrast rust-500
 * przy 20% krycia na białej karcie wychodzi 1.34:1 — daleko poniżej progu 3:1
 * dla elementów graficznych (WCAG 1.4.11); 70% krycia by przeszło, ale wygląda
 * już prawie jak wypełniony segment. Pełny (`bg-primary`) vs pusty (obrys)
 * różni się kształtem, nie tylko kolorem — mocniejszy sygnał niż odcień, i
 * mierzalnie zgodny: rust-500 na pełną krycię ma 5.08:1 na jasnej karcie i
 * 3.11:1 na ciemnej.
 */
export function LevelMeter({
  levelMin,
  levelMax,
  label,
}: {
  levelMin: number | null;
  levelMax: number | null;
  label: string | null;
}) {
  const meter = buildLevelMeter(levelMin, levelMax, label);
  if (!meter) return null;

  return (
    <span role="img" aria-label={meter.ariaLabel} className="inline-flex items-center gap-xs">
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
      <span aria-hidden className="text-sm text-muted-foreground">
        {meter.label}
      </span>
    </span>
  );
}
