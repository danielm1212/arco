"use client";

import { useState } from "react";

const DOW = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];
const MONTHS = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
];
const utcKey = (d: Date) => d.toISOString().slice(0, 10);

/** Kalendarz miesięczny z dniami treningowymi (klucze UTC — spójnie z home/progress). */
export function MonthCalendar({
  trainingDays,
  streak,
}: {
  trainingDays: string[];
  streak: number;
}) {
  const days = new Set(trainingDays);
  const now = new Date();
  const todayKey = utcKey(now);
  const [ym, setYm] = useState({ y: now.getUTCFullYear(), m: now.getUTCMonth() });

  const first = new Date(Date.UTC(ym.y, ym.m, 1));
  const daysInMonth = new Date(Date.UTC(ym.y, ym.m + 1, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7; // przesunięcie pod start od poniedziałku

  const cells: ({ key: string; n: number } | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ key: utcKey(new Date(Date.UTC(ym.y, ym.m, d))), n: d });
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
          className="h-7 w-7 rounded-md text-muted-foreground hover:bg-muted"
        >
          ‹
        </button>
        <span className="text-sm font-medium">
          {MONTHS[ym.m]} {ym.y}
        </span>
        <button
          onClick={() => step(1)}
          aria-label="następny miesiąc"
          className="h-7 w-7 rounded-md text-muted-foreground hover:bg-muted"
        >
          ›
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wide text-muted-foreground">
        {DOW.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) =>
          c === null ? (
            <span key={`b${i}`} />
          ) : (
            <div
              key={c.key}
              className={`flex aspect-square items-center justify-center rounded-md text-xs tabular-nums ${
                days.has(c.key)
                  ? "bg-volt font-semibold text-volt-foreground"
                  : "text-muted-foreground"
              } ${c.key === todayKey ? "ring-1 ring-volt" : ""}`}
            >
              {c.n}
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
