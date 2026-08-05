"use client";

import { useState } from "react";
import { StreakFlame } from "@/components/StreakFlame";
import { localDayKey } from "@/lib/week";
import { STREAK_NOT_STARTED, streakWeeksText } from "@/lib/streakCopy";
import { cardVariants } from "@/components/ui/card";

const DOW = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];
const MONTHS = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
];
// F0.5: klucz dzielony z lib/week (Europe/Warsaw) zamiast lokalnej kopii opartej
// o gettery przeglądarki — `trainingDays` z serwera już liczy klucze w tej strefie,
// więc urządzenie ustawione na inną strefę (np. podróż) nie rozjeżdżałoby się z danymi.
const localKey = localDayKey;

/** Kalendarz miesięczny z dniami treningowymi (klucze Europe/Warsaw — spójnie z home/progress). */
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
    <section className={cardVariants()}>
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
            /* HOME-05b (zgłoszenie właściciela 2026-07-31: „w kalendarzu nie widać
               daty, uxowo chujowo"): dzień treningowy NIE zastępuje już numeru
               płomieniem. Płomień oznacza wyłącznie passę (HOME-05), a kalendarz
               mówi o pojedynczych dniach — więc dostaje ten sam język co siatka
               tygodnia (`WeekStrip`): wypełnione kółko = dzień z treningiem.
               Różnica jest tylko w tym, CO stoi w kółku — tu numer dnia, bo
               kalendarz bez daty jest bezużyteczny; w pasku tygodnia check, bo
               tam datę niesie litera pod spodem.

               Poprzedni komentarz (W2) twierdził, że ogień to „TEN SAM glif co
               szczegół tygodnia" — po HOME-05 przestało to być prawdą, bo tydzień
               dostał check. Kalendarz był ostatnim miejscem, gdzie ogień znaczył
               dzień. Sprzeczny zapis w `wytyczne-designu.md` §glif ognia jest
               poprawiony tą samą paczką.

               Kontrast: `primary-foreground` na `bg-primary` = 5,08:1 (light) /
               5,65:1 (dark, tekst CIEMNY na rust-400 — nie biel). „Dziś" bez
               treningu to pierścień `border-2` jak w `WeekStrip`; „dziś" z
               treningiem wygrywa wypełnieniem, a dzisiejszość niesie pogrubienie
               i `sr-only` (pierścień primary na wypełnieniu primary byłby
               niewidoczny, a offset kolidowałby z sąsiadem przy `gap-1`). */
            <div
              key={c.key}
              className="flex aspect-square items-center justify-center text-xs tabular-nums"
            >
              {/* `aspect-square w-full max-w-8`, NIE `size-full max-w-8`: komórka
                  siatki jest szersza niż 32 px na 393 px, więc pełna wysokość +
                  ograniczona szerokość dawały owal, nie kółko (wyłapane w podglądzie). */}
              <span
                className={`grid aspect-square w-full max-w-8 place-items-center rounded-full ${
                  days.has(c.key)
                    ? "bg-primary font-semibold text-primary-foreground"
                    : c.key === todayKey
                      ? "border-2 border-primary font-semibold text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                {c.n}
                <span className="sr-only">
                  {c.key === todayKey ? ", dziś" : ""}
                  {days.has(c.key) ? ", trening zaliczony" : ""}
                </span>
              </span>
            </div>
          ),
        )}
      </div>

      {streak > 0 && (
        <p className="mt-sm flex items-center gap-1.5 text-xs text-muted-foreground">
          {/* Emoji 🔥 wypadło: w warstwie narzędzia glif ma pierwszeństwo przed
              emoji (wytyczne-designu §glif ognia), a `StreakFlame` jest tym
              glifem — ten sam rysunek co badge w headerze i `/postępy`. */}
          <StreakFlame className="size-3.5 shrink-0" />
          Passa: {streakWeeksText(streak) ?? STREAK_NOT_STARTED}
        </p>
      )}
    </section>
  );
}
