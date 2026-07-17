"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flame } from "lucide-react";

export interface WeekDay {
  key: string;
  on: boolean;
  today: boolean;
  dow: string;
}

/**
 * F2 (redesign-home.md §3.1): day-pills → FlameWeek. Stany: done=wypełniony
 * rust, dziś-nietrenowany=obrys+puls, przyszłe=obrys grey-300, minione-bez-
 * treningu=obrys grey-400 (nigdy czerwień/"przerwany ogień" — dni odpoczynku
 * to plan, nie porażka, ToV). Zapłon po powrocie z celebracji: link "Zamknij
 * i odpoczywaj" na done-screen dokłada ?trained=1, tu odpalamy animację raz
 * i czyścimy URL, żeby odświeżenie strony jej nie powtórzyło.
 */
export function FlameWeek({ week, streak }: { week: WeekDay[]; streak: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ignite] = useState(() => searchParams.get("trained") === "1");
  const cleaned = useRef(false);
  const todayKey = week.find((d) => d.today)?.key ?? "";

  useEffect(() => {
    if (cleaned.current) return;
    if (searchParams.get("trained") === "1") {
      cleaned.current = true;
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  return (
    <section className="rounded-xl bg-card p-md text-card-foreground shadow-sm">
      {/* Licznik celu przeniesiony do badge'a w headerze (plan §R2) — płomienie
          pokazują UNIKALNE DNI aktywności, nie drugą wersję licznika treningów. */}
      <div className="mb-sm flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Ten tydzień</span>
        <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1">
          <Flame className="size-3.5 fill-primary text-primary" aria-hidden />
          <span className="text-base font-semibold tabular-nums text-foreground">{streak}</span>
          <span className="text-xs text-muted-foreground">{streak === 1 ? "tydz." : "tyg."}</span>
        </span>
      </div>
      <div className="flex gap-1.5">
        {week.map((d) => {
          const future = !d.on && !d.today && d.key > todayKey;
          return (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
              <Flame
                className={`size-6 ${
                  d.on
                    ? `fill-primary text-primary ${ignite && d.today ? "animate-flame-ignite" : ""}`
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
        {week.map((d) => `${d.dow}: ${d.on ? "trening zaliczony" : d.today ? "dziś" : "brak treningu"}`).join(", ")}
      </span>
    </section>
  );
}
