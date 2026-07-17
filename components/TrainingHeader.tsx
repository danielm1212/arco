import Link from "next/link";
import { Flame } from "lucide-react";

/**
 * Header przestrzeni Trening (userflows §3): logo po lewej, kompaktowy badge
 * celu tygodniowego i awatar po prawej. Badge liczy UKOŃCZONE TRENINGI w tym
 * tygodniu (plan §R2) — płomienie FlameWeek niżej pokazują unikalne dni i nie
 * są drugą wersją tego samego licznika. Awatar zastępuje koło zębate; do czasu
 * pełnego ekranu profilu prowadzi do /settings.
 */
export function TrainingHeader({
  goalBadge,
  displayName,
}: {
  goalBadge: { done: number; goal: number } | null;
  displayName: string | null;
}) {
  const monogram = (displayName ?? "").trim().charAt(0).toUpperCase() || null;
  const goalMet = goalBadge != null && goalBadge.done >= goalBadge.goal;

  return (
    <header className="flex items-center justify-between border-b px-sm py-sm">
      <span className="pl-2xs">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Arco" className="h-8 w-auto dark:hidden" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-dark.svg" alt="" aria-hidden className="hidden h-8 w-auto dark:block" />
      </span>
      <div className="flex items-center gap-xs">
        {goalBadge && (
          <span
            className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1"
            role="status"
            aria-label={`Cel tygodniowy: ${goalBadge.done} z ${goalBadge.goal} treningów`}
          >
            <Flame
              className={`size-3.5 ${goalMet ? "fill-primary text-primary" : "fill-none text-muted-foreground"}`}
              strokeWidth={goalMet ? 0 : 1.75}
              aria-hidden
            />
            <span className="text-xs font-semibold tabular-nums">
              {goalBadge.done}/{goalBadge.goal}
            </span>
          </span>
        )}
        <Link
          href="/settings"
          aria-label="Profil i ustawienia"
          className="grid size-11 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="grid size-8 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
            {monogram ?? <span aria-hidden>•</span>}
          </span>
        </Link>
      </div>
    </header>
  );
}
