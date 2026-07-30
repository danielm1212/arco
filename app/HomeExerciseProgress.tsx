import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Sparkline } from "@/components/Sparkline";
import type { HomeExerciseProgressRow } from "@/lib/homeExerciseProgress";

/**
 * HOME-03: zwarty wyciąg trendów na Home. Trzy ostatnio trenowane ćwiczenia
 * z min. dwoma sesjami; pełne wykresy pozostają na `/progress`.
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
      className="rounded-xl border bg-card px-md text-card-foreground"
    >
      <div className="flex min-h-11 items-center justify-between gap-sm">
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

      <ul>
        {rows.map((row) => (
          <li key={row.id} className="border-t py-sm">
            <div className="flex items-center justify-between gap-sm">
              <h3 className="min-w-0 line-clamp-2 text-sm font-medium leading-tight">
                {row.name}
              </h3>
              <div className="w-20 shrink-0">
                <Sparkline
                  values={row.series}
                  tone={row.delta > 0 ? "primary" : "neutral"}
                  className="h-7 w-full"
                />
              </div>
            </div>

            <dl className="mt-xs grid grid-cols-3 gap-sm">
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">Rekord</dt>
                <dd className="mt-0.5 text-xs font-medium leading-tight tabular-nums">
                  {row.record}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">{row.metricLabel}</dt>
                <dd className="mt-0.5 text-xs font-medium leading-tight tabular-nums">
                  {row.metricValue}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">Progres</dt>
                <dd
                  className={`mt-0.5 text-xs font-medium leading-tight tabular-nums ${
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
