import { Flame } from "lucide-react";
import type { WeekDay } from "@/components/WeeklyGoalBadge";
import { streakHeadline, streakStatusText } from "@/lib/streakCopy";

/**
 * HOME-01: karta passy tygodniowej na Home. Renderowana tylko gdy jest historia
 * (zgłoszenie właściciela 2026-07-27 + POC data-when="rich") — świeże konto
 * dostaje zamiast niej "fresh-note", nie zera. Copy zawsze pozytywne
 * (tone-of-voice.md: zakaz "nie strać passy"); przy streak=0 nie pokazujemy
 * "0. tydzień passy", tylko neutralny nagłówek bez liczby.
 */
export function StreakCard({
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
  const headline = streakHeadline(streak);
  const statusText = streakStatusText(weeklyDone, weeklyGoal);
  const doneCount = week.filter((d) => d.on).length;

  return (
    <section
      aria-label="Passa tygodniowa"
      className="rounded-xl border bg-gradient-to-br from-primary/10 via-card to-card p-md text-card-foreground shadow-sm"
    >
      <div className="flex items-start justify-between gap-sm">
        {headline ? (
          <p className="leading-none">
            <span className="font-display text-4xl text-primary">{streak}</span>
            <span className="ml-2xs text-base font-semibold tracking-tight text-foreground">
              . tydzień passy
            </span>
          </p>
        ) : (
          <p className="text-base font-semibold text-foreground">Ten tydzień</p>
        )}
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15">
          <Flame className="size-5 fill-primary text-primary" strokeWidth={0} />
        </span>
      </div>

      {/* role="list" jawnie: Safari/VoiceOver zdejmuje domyślną rolę listy z <ol>,
          gdy list-style jest wyzerowany w CSS (tu przez list-none) — bez tego
          siedem kafelków ogłosiłoby się jako zwykły tekst na iPhone PWA. */}
      <ol
        role="list"
        aria-label={`Ten tydzień: ${doneCount} z ${weeklyGoal} treningów`}
        className="m-0 mt-sm grid list-none grid-cols-7 gap-1.5 p-0"
      >
        {week.map((d) => (
          <li key={d.key} className="flex flex-col items-center gap-1.5">
            <span
              aria-hidden
              className={`h-8 w-full rounded-lg ${
                d.on
                  ? "bg-primary"
                  : d.today
                    ? "border border-dashed border-primary bg-transparent"
                    : "bg-muted"
              }`}
            />
            <span className={`text-xs font-semibold ${d.today ? "text-foreground" : "text-muted-foreground"}`}>
              {d.dow}
              <span className="sr-only">{d.on ? " zaliczony" : d.today ? " dziś" : ""}</span>
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-sm text-xs font-semibold text-muted-foreground">{statusText}</p>
    </section>
  );
}
