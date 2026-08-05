import { Card } from "@/components/ui/card";
import { WeekStrip } from "@/components/WeekStrip";
import type { WeekDay } from "@/lib/week";
import { streakStatusText } from "@/lib/streakCopy";
import { formatGoalRatio } from "@/lib/programRecommendation";

/**
 * Karta „Ten tydzień" na Home. Następca `StreakCard` (HOME-01 → HOME-05b).
 *
 * HOME-05b zmienia jej temat, nie tylko wygląd. `StreakCard` pokazywała passę
 * (wielka liczba + „. tydzień passy") ORAZ siatkę tygodnia — a passa siedzi
 * teraz w headerze. Dwie powierzchnie z tą samą liczbą to nie hierarchia, to
 * duplikat, więc karta oddała passę do headera i wzięła to, czego header nie
 * unosi: cały tydzień, dzień po dniu, z ułamkiem celu jako liczbową kotwicą
 * (ułamek zszedł tu z badge'a — zniknąć nie mógł, bo to jedyna liczba mówiąca
 * „ile z ilu").
 *
 * Chrome karty zrównany z `HomeStats` i `HomeExerciseProgress`: `bg-card` bez
 * obrysu i bez gradientowego washu `from-primary/10`. Wcześniej trzy karty pod
 * hero miały dwa traktowania — obroniłoby się jako hierarchia, gdyby była
 * zaprojektowana; ta była przypadkowa (pozostałość po HOME-01).
 *
 * Renderowana tylko z historią (POC data-when="rich", zgłoszenie właściciela
 * 2026-07-27): świeże konto dostaje „fresh-note", nie kolumnę zer.
 */
export function WeekCard({
  week,
  weeklyDone,
  weeklyGoal,
}: {
  week: WeekDay[];
  weeklyDone: number;
  weeklyGoal: number;
}) {
  return (
    <Card asChild>
      <section aria-label="Ten tydzień">
        <div className="flex items-baseline justify-between gap-sm">
          <h2 className="text-base font-semibold tracking-tight">Ten tydzień</h2>
          {/* Audyt P0 4.1: „6/5" wyglądałoby jak błąd — nadwyżkę obsługuje
              `formatGoalRatio`. */}
          <span className="text-sm font-semibold tabular-nums text-muted-foreground">
            {formatGoalRatio(weeklyDone, weeklyGoal)}
          </span>
        </div>

        <WeekStrip week={week} weeklyGoal={weeklyGoal} className="mt-sm" />

        <p className="mt-sm text-xs font-semibold text-muted-foreground">
          {streakStatusText(weeklyDone, weeklyGoal)}
        </p>
      </section>
    </Card>
  );
}
