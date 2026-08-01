"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { StreakFlame } from "@/components/StreakFlame";
import { WeekStrip } from "@/components/WeekStrip";
import type { WeekDay } from "@/lib/week";
import { STREAK_NOT_STARTED, streakBadgeLabel, streakWeeksText } from "@/lib/streakCopy";
import { formatGoalSentence } from "@/lib/programRecommendation";

/**
 * Badge w headerze Dziś + sheet ze szczegółem tygodnia.
 * Następca `WeeklyGoalBadge` (R2.1 → HOME-05 → HOME-05b).
 *
 * HOME-05b (zgłoszenie właściciela 2026-07-31: „na górze miał być strike
 * tygodniowy, a nie jakaś tarcza"): w headerze stoi PASSA, nie realizacja celu.
 *
 * Historia tej decyzji, żeby nikt jej nie cofnął przez przypadek:
 * HOME-05 rozdzieliło symbole (płomień znaczył naraz cel, dzień i passę) i dało
 * celowi własny znak — tarczę. Rozdzielenie było słuszne, ale wybór był zły:
 * cel tygodnia to ZADANIE, a header to miejsce na tożsamość, nie na licznik
 * zadania. Do tego ułamek „1/2" powtarzał informację, którą karta „Ten tydzień"
 * i tak pokazuje niżej pełną siatką. Teraz: header = passa (jedna liczba,
 * jeden symbol), cel = karta na home + nagłówek tego sheeta.
 *
 * Skrót „tyg." jest obowiązkowy, nie ozdobny: Arco liczy passę w TYGODNIACH,
 * a wzorzec z Opala („🔥 4") czyta się jako dni. Bez jednostki liczba kłamie.
 *
 * Zapłon `?trained=1` (powrót z celebracji) zostaje i trafia teraz na właściwy
 * symbol: wracamy z ukończonego treningu, więc passa mogła się właśnie
 * przesunąć. Animacja jednorazowa, respektuje `prefers-reduced-motion`.
 */
export function StreakBadge({
  streak,
  week,
  weeklyDone,
  weeklyGoal,
}: {
  streak: number;
  week: WeekDay[];
  weeklyDone: number;
  weeklyGoal: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [ignite] = useState(() => searchParams.get("trained") === "1");
  const cleaned = useRef(false);
  const badgeRef = useRef<HTMLButtonElement>(null);
  const lit = streak > 0;
  const label = streakBadgeLabel(streak);
  // Jedno źródło zdania o passie — `null` samo niesie „jeszcze nie zaczęta".
  const weeksText = streakWeeksText(streak);

  useEffect(() => {
    if (cleaned.current) return;
    if (searchParams.get("trained") === "1") {
      cleaned.current = true;
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  return (
    <BottomSheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        // Audyt P0: po zamknięciu fokus wraca na element otwierający.
        if (!next) requestAnimationFrame(() => badgeRef.current?.focus());
      }}
      trigger={
        <button
          ref={badgeRef}
          type="button"
          aria-haspopup="dialog"
          aria-label={
            weeksText
              ? `Passa: ${weeksText}. Pokaż szczegóły tygodnia`
              : "Passa jeszcze nie zaczęta. Pokaż szczegóły tygodnia"
          }
          /* Bez wypełnionego tła — rust wypełniony zostaje wyłącznie dla „Zacznij
             trening" (F1: jedyne wypełnione rust-CTA na ekranie). Tło pojawia się
             dopiero na hover/fokus, a stopnie gradientu są wybrane tak, żeby
             trzymały ≥3:1 także na tym tle (globals.css §„glif passy"). */
          className="flex min-h-11 min-w-11 items-center gap-1.5 rounded-full px-2.5 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <StreakFlame lit={lit} className={`size-5 ${ignite ? "animate-ignite" : ""}`} />
          {label && (
            <span className="text-sm font-semibold tabular-nums text-foreground">{label}</span>
          )}
        </button>
      }
      title="Twoja passa"
      description="Szczegóły passy i bieżącego tygodnia: cel, odhaczone dni, link do historii"
    >
      <div className="space-y-md">
        <div className="flex items-center gap-sm">
          <StreakFlame lit={lit} className="size-8 shrink-0" />
          <div>
            <p className="text-2xl font-semibold leading-tight tabular-nums">
              {weeksText ?? STREAK_NOT_STARTED}
            </p>
            {/* Bez „Tyle ${weekWord(streak)}…": po „tyle" polski wymusza dopełniacz
                („tyle tygodni"), więc odmiana liczbowa dałaby tu „Tyle tygodnie".
                Zdanie o REGULE jest i poprawne, i użyteczniejsze niż powtórzenie
                liczby z nagłówka — wyłapane w podglądzie. */}
            <p className="mt-2xs text-sm text-muted-foreground">
              {lit
                ? "Każdy tydzień z domkniętym celem przedłuża passę."
                : "Pierwszy tydzień z celem zrobionym w całości zapala passę."}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-muted/50 p-md">
          <p className="text-sm font-semibold">{formatGoalSentence(weeklyDone, weeklyGoal)}</p>
          <WeekStrip week={week} weeklyGoal={weeklyGoal} className="mt-sm" />
          <p className="mt-sm text-xs text-muted-foreground">
            Odhaczone dni to dni z co najmniej jednym treningiem. Dni odpoczynku są częścią planu.
          </p>
        </div>

        <Link
          href="/history"
          className="flex min-h-11 items-center text-sm font-semibold text-primary underline-offset-2 hover:underline"
          onClick={() => setOpen(false)}
        >
          Zobacz pełną historię →
        </Link>
      </div>
    </BottomSheet>
  );
}
