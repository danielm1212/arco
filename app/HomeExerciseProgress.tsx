import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Sparkline } from "@/components/Sparkline";
import type { HomeExerciseProgressRow } from "@/lib/homeExerciseProgress";
import { cardVariants } from "@/components/ui/card";

/**
 * HOME-03/04: zwarty wyciąg trendów na Home. Trzy ostatnio trenowane ćwiczenia
 * z min. dwoma sesjami; pełne wykresy pozostają na `/progress`.
 *
 * HOME-04: zdjęta siatka kresek. Poprzednia wersja miała obrys zewnętrzny ORAZ
 * `border-t` między wierszami — kreska w kresce, przy trzech ćwiczeniach dawało
 * to sześć linii poziomych na jednej karcie. Wiersze rozdziela teraz ODSTĘP,
 * a trzy metryki idą w jednej zwartej linii zamiast trzykolumnowego `dl`
 * z etykietami nad wartościami (dwa razy więcej wierszy tekstu przy tej samej treści).
 * Semantyka `dl`/`dt`/`dd` zostaje — zmienia się układ, nie znaczenie.
 */
export function HomeExerciseProgress({
  rows,
}: {
  rows: HomeExerciseProgressRow[];
}) {
  if (rows.length === 0) return null;

  return (
    <section
      aria-labelledby="home-exercise-progress-title"
      className={cardVariants()}
    >
      <div className="flex items-center justify-between gap-sm">
        <div className="min-w-0">
          <h2
            id="home-exercise-progress-title"
            className="text-xs font-medium text-foreground"
          >
            Postęp ćwiczeń
          </h2>
          <p className="text-xs text-muted-foreground">Ostatnie 90 dni</p>
        </div>
        <Link
          href="/progress"
          className="flex min-h-11 shrink-0 items-center gap-2xs rounded-md px-xs text-sm font-medium text-support underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Wykresy
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>

      <ul className="mt-sm">
        {rows.map((row, index) => (
          // Odstęp zamiast `border-t`. Pierwszy wiersz bez marginesu, żeby nie
          // odklejał się od nagłówka karty.
          <li key={row.id} className={index === 0 ? "" : "mt-md"}>
            <div className="flex items-center justify-between gap-sm">
              {/* `line-clamp-2`, nie `truncate`: „Wyciskanie hantli na ławce
                  skośnej" ucięte do „Wyciskanie hantli na ławce s…" przestaje
                  identyfikować ruch. Wysokość jest tania, czytelność nie. */}
              <h3 className="min-w-0 flex-1 line-clamp-2 text-sm font-medium leading-tight">
                {row.name}
              </h3>
              <div className="w-16 shrink-0">
                {/* `tone="primary"` to `--color-chart-primary`, czyli VIOLET
                    (nie rust) — zgodnie z v1.4 „violet = dane i wykresy".
                    Nazwa tokenu myli, wartość jest poprawna; nie zmieniać na
                    „support", bo `--color-chart-support` nie istnieje. */}
                <Sparkline
                  values={row.series}
                  tone={row.delta > 0 ? "primary" : "neutral"}
                  className="h-7 w-full"
                />
              </div>
            </div>

            {/* Trzy metryki w jednej linii: etykieta (`dt`) mała i wyciszona,
                wartość (`dd`) w kolorze treści — liczba wybija się bez
                zwiększania rozmiaru. `flex-wrap`, więc na 320 px linia łamie
                się między parami, nigdy w środku pary. */}
            <dl className="mt-2xs flex flex-wrap items-baseline gap-x-sm gap-y-2xs text-xs">
              <div className="flex items-baseline gap-1">
                <dt className="text-muted-foreground">rekord</dt>
                <dd className="font-medium tabular-nums text-foreground">{row.record}</dd>
              </div>
              <div className="flex items-baseline gap-1">
                <dt className="text-muted-foreground">{row.metricLabel}</dt>
                <dd className="font-medium tabular-nums text-foreground">{row.metricValue}</dd>
              </div>
              <div className="flex items-baseline gap-1">
                <dt className="text-muted-foreground">progres</dt>
                <dd
                  className={`font-medium tabular-nums ${
                    row.delta > 0 ? "text-support" : "text-muted-foreground"
                  }`}
                >
                  {row.deltaLabel}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}
