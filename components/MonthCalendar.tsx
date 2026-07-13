"use client";

import { useState } from "react";
import { Flame } from "lucide-react";

const DOW = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];
const MONTHS = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
];
const localKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Kalendarz miesięczny z dniami treningowymi (klucze LOKALNE — spójnie z home/progress). */
export function MonthCalendar({
  trainingDays,
  streak,
}: {
  trainingDays: string[];
  streak: number;
}) {
  const days = new Set(trainingDays);
  const now = new Date();
  const todayKey = localKey(now);
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });

  const first = new Date(ym.y, ym.m, 1);
  const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7; // przesunięcie pod start od poniedziałku

  const cells: ({ key: string; n: number } | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ key: localKey(new Date(ym.y, ym.m, d)), n: d });
  }

  const step = (delta: number) =>
    setYm(({ y, m }) => {
      const total = y * 12 + m + delta;
      return { y: Math.floor(total / 12), m: ((total % 12) + 12) % 12 };
    });

  return (
    <section className="rounded-xl bg-card p-md shadow-sm">
      <div className="mb-sm flex items-center justify-between">
        <button
          onClick={() => step(-1)}
          aria-label="poprzedni miesiąc"
          className="size-11 rounded-md text-lg text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          ‹
        </button>
        <span className="text-sm font-medium">
          {MONTHS[ym.m]} {ym.y}
        </span>
        <button
          onClick={() => step(1)}
          aria-label="następny miesiąc"
          className="size-11 rounded-md text-lg text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          ›
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs uppercase tracking-wide text-muted-foreground">
        {DOW.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) =>
          c === null ? (
            <span key={`b${i}`} />
          ) : (
            /* W2 (audyt-wizualny): dzień treningowy = TEN SAM glif ognia co FlameWeek —
               jeden symbol od home przez historię po przyszły recap. Numer dnia niesie
               pozycja w siatce + sr-only; „dziś" bez zmian (ring). */
            <div
              key={c.key}
              className={`flex aspect-square items-center justify-center rounded-md text-xs tabular-nums ${
                days.has(c.key) ? "" : "text-muted-foreground"
              } ${c.key === todayKey ? "ring-1 ring-volt" : ""}`}
            >
              {days.has(c.key) ? (
                <>
                  <Flame className="size-4 fill-primary text-primary" strokeWidth={0} aria-hidden />
                  <span className="sr-only">{c.n}, trening zaliczony</span>
                </>
              ) : (
                c.n
              )}
            </div>
          ),
        )}
      </div>

      {streak > 0 && (
        <p className="mt-sm text-xs text-muted-foreground">
          🔥 Passa: {streak} {streak === 1 ? "tydzień" : "tyg."} z rzędu
        </p>
      )}
    </section>
  );
}
