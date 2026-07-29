import test from "node:test";
import assert from "node:assert/strict";
import { PROGRAMS } from "@/scripts/seed";

/**
 * Deklarowany czas sesji jest obietnicą złożoną użytkownikowi przed wyborem planu.
 * Przed PLAN-C2 łamało ją siedem planów — `beginner-gym-fbw3` obiecywał do godziny
 * i kończył się po 31 minutach. To nie jest kosmetyka: człowiek planuje wokół tej liczby.
 *
 * Estymata z audytu 2026-07-21 §2: ~40 s pracy na serię + przerwy wewnątrz ćwiczenia
 * + ~60 s na zmianę stanowiska, plus 6 minut przygotowania i serii narastających.
 */
function minutyDnia(slots: { sets: number; rest: number }[]) {
  const praca = slots.reduce((sum, slot) => sum + slot.sets * 40, 0);
  const przerwy = slots.reduce((sum, slot) => sum + (slot.sets - 1) * slot.rest, 0);
  return (praca + przerwy + slots.length * 60) / 60 + 6;
}

test("każdy plan systemowy mieści się w zadeklarowanym czasie sesji", () => {
  const klamstwa: string[] = [];
  for (const program of PROGRAMS) {
    for (const day of program.days) {
      const minuty = minutyDnia(day.slots);
      // Dolna granica z tolerancją 6 min: krótsza sesja niż dolny widełek jest w porządku,
      // dopóki nie jest to przepaść. Górna granica jest twarda — nikt nie lubi zostać dłużej.
      if (minuty > program.estimated_minutes_max || minuty < program.estimated_minutes_min - 6) {
        klamstwa.push(
          `${program.slug} / ${day.label}: ~${minuty.toFixed(0)} min wobec deklaracji ${program.estimated_minutes_min}–${program.estimated_minutes_max}`,
        );
      }
    }
  }
  assert.deepEqual(klamstwa, [], `Deklarowany czas nie zgadza się z receptą:\n${klamstwa.join("\n")}`);
});
