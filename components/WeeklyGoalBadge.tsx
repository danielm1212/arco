"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Flame } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";

export interface WeekDay {
  key: string;
  on: boolean;
  today: boolean;
  dow: string;
}

/**
 * R2.1 (audyt-r2-home-plany §P0): badge celu tygodniowego jako realna akcja.
 * Tap/Enter/Space otwierają sheet ze szczegółem tygodnia (wynik celu, unikalne
 * dni jako płomienie, passa, link do Historii); Escape/overlay/swipe zamykają
 * (BottomSheet), a fokus wraca na badge. Badge liczy UKOŃCZONE TRENINGI —
 * jedna semantyka; dni i passa są objaśnieniem w szczególe, nie drugim
 * licznikiem na Home. Zapłon `?trained=1` (powrót z celebracji) przeniesiony
 * tu z usuniętej karty FlameWeek: animacja raz + czyszczenie URL.
 */
export function WeeklyGoalBadge({
  done,
  goal,
  week,
  streak,
}: {
  done: number;
  goal: number;
  week: WeekDay[];
  streak: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [ignite] = useState(() => searchParams.get("trained") === "1");
  const cleaned = useRef(false);
  const badgeRef = useRef<HTMLButtonElement>(null);
  const goalMet = done >= goal;
  const todayKey = week.find((d) => d.today)?.key ?? "";

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
          aria-label={`Cel tygodniowy: ${done} z ${goal} treningów. Pokaż szczegóły tygodnia`}
          className={`flex min-h-11 min-w-11 items-center gap-1 rounded-full px-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            goalMet
              ? "bg-primary/15 text-primary hover:bg-primary/25"
              : "bg-secondary text-foreground hover:bg-secondary/80"
          }`}
        >
          <Flame
            className={`size-4 ${goalMet ? "fill-primary text-primary" : "fill-none text-muted-foreground"} ${
              ignite ? "animate-flame-ignite" : ""
            }`}
            strokeWidth={goalMet ? 0 : 1.75}
            aria-hidden
          />
          <span className="text-xs font-semibold tabular-nums">
            {done}/{goal}
          </span>
        </button>
      }
      title="Twój tydzień"
      description="Szczegóły celu tygodniowego: ukończone treningi, dni aktywności i passa"
    >
      <div className="space-y-md">
        <div>
          <p className="text-2xl font-semibold leading-tight tabular-nums">
            {done} z {goal} treningów
          </p>
          <p className="mt-2xs text-sm text-muted-foreground">
            {goalMet
              ? "Cel tygodnia zrobiony. Wszystko powyżej to bonus — regeneracja też jest treningiem."
              : `Do celu ${goal - done === 1 ? "został 1 trening" : `zostały ${goal - done} treningi`} do niedzieli.`}
          </p>
        </div>

        <div className="rounded-xl bg-muted/50 p-md">
          <div className="flex gap-1.5">
            {week.map((d) => {
              const future = !d.on && !d.today && d.key > todayKey;
              return (
                <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
                  <Flame
                    className={`size-6 ${
                      d.on
                        ? "fill-primary text-primary"
                        : d.today
                          ? "fill-none text-foreground animate-flame-today"
                          : future
                            ? "fill-none text-muted-foreground/30"
                            : "fill-none text-muted-foreground/50"
                    }`}
                    strokeWidth={d.on ? 0 : 1.75}
                    aria-hidden
                  />
                  <span
                    className={`text-xs ${
                      d.today
                        ? "font-semibold text-foreground"
                        : future
                          ? "text-muted-foreground/60"
                          : "text-muted-foreground"
                    }`}
                  >
                    {d.dow}
                  </span>
                </div>
              );
            })}
          </div>
          <span className="sr-only" role="status">
            {week
              .map((d) => `${d.dow}: ${d.on ? "trening zaliczony" : d.today ? "dziś" : "brak treningu"}`)
              .join(", ")}
          </span>
          <p className="mt-sm text-xs text-muted-foreground">
            Płomienie to dni z co najmniej jednym treningiem. Dni odpoczynku są częścią planu.
          </p>
        </div>

        {streak > 0 && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Flame className="size-4 fill-primary text-primary" aria-hidden />
            <span>
              Passa: <span className="font-semibold text-foreground tabular-nums">{streak}</span>{" "}
              {streak === 1 ? "tydzień" : streak < 5 ? "tygodnie" : "tygodni"} z treningiem
            </span>
          </p>
        )}

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
