"use client";

import { useState } from "react";
import { Check, SlidersHorizontal } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { useNavigationHistory } from "@/components/navigation/NavigationHistory";

type Filters = {
  environment?: string;
  level?: string;
  goal?: string;
  focus?: string;
};

const ENVIRONMENTS = [
  ["gym", "Siłownia"],
  ["home", "Dom z hantlami"],
  ["bodyweight", "Masa ciała"],
] as const;

const LEVELS = [
  ["1", "Początkujący"],
  ["2", "Średniozaawansowany"],
  ["3", "Zaawansowany"],
] as const;

function countFilters(filters: Filters) {
  return Number(Boolean(filters.environment)) + Number(Boolean(filters.level)) + Number(Boolean(filters.goal)) + Number(Boolean(filters.focus));
}

function FilterGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value?: string;
  options: readonly (readonly [string, string])[];
  onChange: (value?: string) => void;
}) {
  return (
    <section className="space-y-2xs">
      <h3 className="text-sm font-medium">{label}</h3>
      <div className="flex flex-wrap gap-2xs">
        <button
          type="button"
          aria-pressed={!value}
          onClick={() => onChange(undefined)}
          className={`inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-medium transition-colors ${
            !value ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-muted"
          }`}
        >
          {!value && <Check className="size-4" aria-hidden />}
          Każdy
        </button>
        {options.map(([optionValue, optionLabel]) => {
          const selected = value === optionValue;
          return (
            <button
              key={optionValue}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected ? undefined : optionValue)}
              className={`inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-medium transition-colors ${
                selected ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-muted"
              }`}
            >
              {selected && <Check className="size-4" aria-hidden />}
              {optionLabel}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function ProgramFilters({ filters, goals }: { filters: Filters; goals: string[] }) {
  const { replace } = useNavigationHistory();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Filters>(filters);
  const appliedCount = countFilters(filters);
  const draftCount = countFilters(draft);

  function changeOpen(nextOpen: boolean) {
    if (nextOpen) setDraft(filters);
    setOpen(nextOpen);
  }

  function apply() {
    const query = new URLSearchParams();
    if (draft.environment) query.set("environment", draft.environment);
    if (draft.level) query.set("level", draft.level);
    if (draft.goal) query.set("goal", draft.goal);
    if (draft.focus) query.set("focus", draft.focus);
    const value = query.toString();
    setOpen(false);
    replace(value ? `/programs?${value}` : "/programs");
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={changeOpen}
      title="Filtry programów"
      description="Dopasuj bibliotekę programów do miejsca, poziomu, celu i kierunku treningu."
      trigger={
        <Button type="button" variant="outline" size="sm" className="shrink-0 gap-xs">
          <SlidersHorizontal className="size-4" aria-hidden />
          Filtry{appliedCount ? ` · ${appliedCount}` : ""}
        </Button>
      }
    >
      <div className="space-y-lg">
        <FilterGroup
          label="Gdzie trenujesz?"
          value={draft.environment}
          options={ENVIRONMENTS}
          onChange={(environment) => setDraft((current) => ({ ...current, environment }))}
        />
        <FilterGroup
          label="Kierunek programu"
          value={draft.focus}
          options={[
            ["balanced", "Całe ciało równomiernie"],
            ["lower_body", "Więcej pośladków i nóg"],
          ]}
          onChange={(focus) => setDraft((current) => ({ ...current, focus }))}
        />
        <FilterGroup
          label="Poziom"
          value={draft.level}
          options={LEVELS}
          onChange={(level) => setDraft((current) => ({ ...current, level }))}
        />
        {goals.length > 1 && (
          <FilterGroup
            label="Cel"
            value={draft.goal}
            options={goals.map((goal) => [goal, goal] as const)}
            onChange={(goal) => setDraft((current) => ({ ...current, goal }))}
          />
        )}
        <div className="space-y-xs border-t pt-md">
          <Button type="button" className="w-full" onClick={apply}>
            Pokaż programy{draftCount ? ` · ${draftCount} filtr${draftCount === 1 ? "" : "y"}` : ""}
          </Button>
          {draftCount > 0 && (
            <button
              type="button"
              className="flex min-h-11 w-full items-center justify-center text-sm font-medium text-primary underline-offset-2 hover:underline"
              onClick={() => setDraft({})}
            >
              Wyczyść filtry
            </button>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
