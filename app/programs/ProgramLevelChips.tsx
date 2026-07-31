"use client";

import { useNavigationHistory } from "@/components/navigation/NavigationHistory";

type Filters = {
  environment?: string;
  level?: string;
  goal?: string;
  focus?: string;
};

/**
 * PLAN-05H: zastępuje nagłówki grup „Początkujący”/„Średniozaawansowani”/„Zaawansowani”
 * nad listą. Nagłówek grupował plany po `level_min`, więc plan o zakresie poziomów mógł
 * stanąć pod nagłówkiem, z którym jego etykieta (na karcie, per PLAN-05G) była sprzeczna —
 * właściciel to wyłapał na produkcji. Chip filtruje ten sam parametr `?level=`, który już
 * obsługiwał sheet filtrów (`ProgramFilters`), więc backend filtrowania się nie zmienia —
 * usunięta jest wyłącznie prezentacja przez sztywny podział, nie logika.
 *
 * „Wszystkie” pierwsze i domyślnie aktywne (decyzja właściciela 2026-07-31): użytkownik
 * wchodzi i widzi cały katalog, nie wycinek. Rząd przewija się w poziomie i NIE zawija —
 * `overflow-x-auto` + `shrink-0` na każdym chipie, wzorzec z `TeamPanel.tsx`.
 */
const LEVEL_CHIPS: readonly (readonly [string | undefined, string])[] = [
  [undefined, "Wszystkie"],
  ["1", "Początkujący"],
  ["2", "Średniozaawansowany"],
  ["3", "Zaawansowany"],
];

export function ProgramLevelChips({ filters }: { filters: Filters }) {
  const { replace } = useNavigationHistory();

  function go(level: string | undefined) {
    const query = new URLSearchParams();
    if (filters.environment) query.set("environment", filters.environment);
    if (level) query.set("level", level);
    if (filters.goal) query.set("goal", filters.goal);
    if (filters.focus) query.set("focus", filters.focus);
    const value = query.toString();
    // `scroll: false`: tap na chip to filtr na TEJ SAMEJ liście, nie przejście na
    // nową stronę — domyślny reset scrolla Next.js (`router.replace` skacze na górę)
    // wyrzucał użytkownika z miejsca przeglądania biblioteki (zgłoszenie 2026-07-31).
    replace(value ? `/programs?${value}` : "/programs", { scroll: false });
  }

  return (
    <div
      role="tablist"
      aria-label="Filtruj bibliotekę po poziomie"
      className="flex gap-xs overflow-x-auto pb-1"
    >
      {LEVEL_CHIPS.map(([level, label]) => {
        const active = (filters.level ?? undefined) === level;
        return (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => go(level)}
            className={`h-11 shrink-0 rounded-full px-4 text-sm font-medium transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
