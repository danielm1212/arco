"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Flame, Target } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { formatGoalRatio, formatGoalSentence } from "@/lib/programRecommendation";

export interface WeekDay {
  key: string;
  on: boolean;
  today: boolean;
  dow: string;
}

/**
 * R2.1 (audyt-r2-home-plany §P0): badge celu tygodniowego jako realna akcja.
 * Tap/Enter/Space otwierają sheet ze szczegółem tygodnia (wynik celu, odhaczone
 * dni, passa, link do Historii); Escape/overlay/swipe zamykają (BottomSheet),
 * a fokus wraca na badge. Badge liczy UKOŃCZONE TRENINGI — jedna semantyka;
 * dni i passa są objaśnieniem w szczególe, nie drugim licznikiem na Home.
 * Zapłon `?trained=1` (powrót z celebracji) przeniesiony tu z usuniętej karty
 * FlameWeek: animacja raz + czyszczenie URL.
 *
 * HOME-05 (2026-07-31): rozdzielona semantyka symboli. Płomień oznaczał wcześniej
 * trzy różne rzeczy naraz — cel tygodnia (ten badge), pojedynczy zaliczony dzień
 * (siatka w sheecie) i passę w tygodniach (`StreakCard`). Teraz: tarcza = cel,
 * odhaczone kółko = zaliczony dzień, płomień = wyłącznie passa.
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
          aria-label={`Cel tygodniowy ${formatGoalRatio(done, goal)}: ${formatGoalSentence(done, goal)}. Pokaż szczegóły tygodnia`}
          className={`flex min-h-11 min-w-11 items-center gap-1 rounded-full px-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            goalMet
              ? "bg-primary/15 text-primary hover:bg-primary/25"
              : "bg-secondary text-foreground hover:bg-secondary/80"
          }`}
        >
          {/* HOME-05: CEL tygodnia dostaje tarczę, nie płomień. Płomień oznacza
              passę (`StreakCard`) i tylko ją — obok ułamka „1/2" czytał się jako
              druga, sprzeczna semantyka: ikona mówiła „regularność w tygodniach",
              a liczba „realizacja celu w tym tygodniu". Jeden symbol = jedno
              znaczenie (zgłoszenie właściciela 2026-07-31).
              Animacja zapłonu zostaje: powrót z celebracji (`?trained=1`) oznacza,
              że cel właśnie się przesunął, więc animujemy znak celu. Keyframes są
              generyczne (skala + krycie) i respektują `prefers-reduced-motion`. */}
          <Target
            className={`size-4 ${goalMet ? "text-primary" : "text-muted-foreground"} ${
              ignite ? "animate-goal-ignite" : ""
            }`}
            strokeWidth={goalMet ? 2.5 : 1.75}
            aria-hidden
          />
          <span className="text-xs font-semibold tabular-nums">
            {/* Audyt P0 4.1: "6/5" wygląda jak błąd — nadwyżka to bonus (formatGoalRatio). */}
            {formatGoalRatio(done, goal)}
          </span>
        </button>
      }
      title="Twój tydzień"
      description="Szczegóły celu tygodniowego: ukończone treningi, dni aktywności i passa"
    >
      <div className="space-y-md">
        <div>
          <p className="text-2xl font-semibold leading-tight tabular-nums">
            {formatGoalSentence(done, goal)}
          </p>
          <p className="mt-2xs text-sm text-muted-foreground">
            {goalMet
              ? "Cel tygodnia zrobiony. Wszystko powyżej to bonus — regeneracja też jest treningiem."
              : `Do celu ${goal - done === 1 ? "został 1 trening" : `zostały ${goal - done} treningi`} do niedzieli.`}
          </p>
        </div>

        <div className="rounded-xl bg-muted/50 p-md">
          <div className="flex gap-1.5">
            {week.map((d) => (
              <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
                {/* HOME-05: pojedynczy dzień to ZALICZONY TRENING, nie passa — stąd
                    wypełnione kółko z checkiem zamiast płomienia. Dziś to pierścień
                    („w toku"), reszta to neutralne kółko.

                    Dzień przyszły i pominięty wyglądają TAK SAMO. Wcześniej różniły
                    się kryciem (/30 vs /50), co odróżniało „jeszcze nie" od „nie
                    zrobiłeś" — czyli cicha ocena, wbrew tone-of-voice („dni odpoczynku
                    są częścią planu"). `sr-only` niżej i tak od zawsze mówił o obu
                    „brak treningu", więc wizualna różnica była też niespójna z tym,
                    co słyszy czytnik ekranu.

                    Kontrast pustego kółka wobec panelu to ~1,5:1 (light) / ~1,9:1
                    (dark) — poniżej 3:1, świadomie. To marker rytmu, nie nośnik
                    znaczenia: pod każdym slotem stoi litera dnia, a `sr-only`
                    wypisuje stan wszystkich siedmiu. Panel `bg-muted/50` jest tak
                    blisko koloru kółek, że próg 3:1 dałoby się osiągnąć wyłącznie
                    krzykliwym wypełnieniem konkurującym z checkiem. */}
                <span
                  aria-hidden
                  className={`grid size-6 place-items-center rounded-full ${
                    d.on
                      ? "bg-primary text-primary-foreground"
                      : d.today
                        ? "animate-today-pulse border-2 border-primary text-primary"
                        : "bg-muted-foreground/30 text-transparent"
                  }`}
                >
                  {d.on && <Check className="size-4" strokeWidth={3} />}
                </span>
                <span
                  className={`text-xs ${
                    d.today ? "font-semibold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {d.dow}
                </span>
              </div>
            ))}
          </div>
          <span className="sr-only" role="status">
            {week
              .map((d) => `${d.dow}: ${d.on ? "trening zaliczony" : d.today ? "dziś" : "brak treningu"}`)
              .join(", ")}
          </span>
          {/* Copy szło za ikoną: dopóki dni były płomieniami, mówiło „Płomienie to dni…".
              Po HOME-05 dzień to odhaczone kółko, a płomień został przy passie niżej. */}
          <p className="mt-sm text-xs text-muted-foreground">
            Odhaczone dni to dni z co najmniej jednym treningiem. Dni odpoczynku są częścią planu.
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
