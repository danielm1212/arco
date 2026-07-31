import { cn } from "@/lib/utils";

/**
 * HOME-05b: JEDYNY glif płomienia w Arco. Płomień = passa i nic innego.
 *
 * Dlaczego własny komponent, a nie `<Flame />` z lucide w pięciu miejscach:
 * przed tą zmianą płomień był rysowany na pięć różnych sposobów naraz
 * (`fill-primary strokeWidth={0}`, `fill-primary` z obrysem, `fill-current`,
 * sam obrys, plus emoji 🔥 w dwóch miejscach — kalendarz historii i ekipa).
 * HOME-05 ujednoliło ZNACZENIE symboli, ale nie ich rysunek, więc rozjazd wrócił
 * inną drogą. Symbol z jednym znaczeniem musi mieć jedno miejsce w kodzie.
 *
 * Kształt to path lucide `flame` (v1.23, ISC) wypełniony gradientem — trzymamy
 * ten sam rysunek co reszta ikonografii, tylko wypełniony, bo passa jest
 * elementem tożsamościowym, nie kolejną ikoną narzędzia (kierunek: Opal).
 * Gradient i jego progi kontrastu: `app/globals.css` §„glif passy".
 *
 * `lit={false}` = passa jeszcze nie zaczęta: płaski, przygaszony obrys. Nie
 * pokazujemy „0 tyg." ani wygasłego płomienia w kolorze błędu — brak passy to
 * stan neutralny, nie porażka (tone-of-voice.md).
 */

/** lucide `flame` v1.23.0 (ISC) — jeden path, viewBox 24×24. */
const FLAME_PATH =
  "M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4";

/* Stałe (nie `useId()`) — komponent zostaje serwerowy, a każda instancja nosi
   własną, identyczną definicję gradientu. Duplikat id w dokumencie jest tu
   nieszkodliwy: `url(#…)` bierze pierwsze trafienie, a wszystkie są takie same,
   więc odmontowanie jednej instancji nie psuje pozostałych. Alternatywy odpadły:
   `useId()` wymusiłby "use client" na liściu, a jedna globalna definicja w
   layoucie zrobiłaby z ikony komponent, który nie renderuje się w izolacji
   (czyli i w harnessie testowym). */
const GRADIENT_ID = "arco-streak-flame";

export function StreakFlame({
  className,
  lit = true,
}: {
  className?: string;
  /** `false` = passa = 0. */
  lit?: boolean;
}) {
  if (!lit) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className={cn("size-4 text-muted-foreground", className)}
      >
        <path d={FLAME_PATH} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-4", className)}>
      <defs>
        {/* Kierunek jak `bg-gradient-to-br` w resztą repo (karta hero, okładki
            planów): jaśniej w lewym górnym, głębiej w prawym dolnym. */}
        <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--streak-flame-from)" />
          <stop offset="100%" stopColor="var(--streak-flame-to)" />
        </linearGradient>
      </defs>
      <path d={FLAME_PATH} fill={`url(#${GRADIENT_ID})`} />
    </svg>
  );
}
