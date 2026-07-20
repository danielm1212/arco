import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createProgram } from "@/app/actions/program";
import { setActiveProgram } from "@/app/actions/session";
import { Button } from "@/components/ui/button";
import {
  formatEquipment,
  formatFrequency,
  missingProgramEquipment,
  type ProgramFocus,
} from "@/lib/programRecommendation";
import { ProgramFilters } from "./ProgramFilters";
import { TrainingHeader } from "@/components/TrainingHeader";
import { TrainingSubnav } from "@/components/navigation/TrainingSubnav";

export const dynamic = "force-dynamic";

type Prog = {
  id: string;
  name: string;
  cycle_days: number;
  user_id: string | null;
  goal: string | null;
  level: string | null;
  level_min: number | null;
  level_max: number | null;
  environment: string | null;
  focus_key: ProgramFocus;
  frequency_min: number | null;
  frequency_max: number | null;
  estimated_minutes_min: number | null;
  estimated_minutes_max: number | null;
  required_equipment: string[];
  program_days: { id: string }[];
};

type LibraryFilters = {
  environment?: string;
  level?: string;
  goal?: string;
  focus?: string;
};

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<LibraryFilters>;
}) {
  const filters = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: programs }, { data: active }, { data: settings }] = await Promise.all([
    supabase
      .from("programs")
      .select("id, name, cycle_days, user_id, goal, level, level_min, level_max, environment, focus_key, frequency_min, frequency_max, estimated_minutes_min, estimated_minutes_max, required_equipment, program_days(id)")
      .order("user_id", { nullsFirst: true }),
    supabase.from("user_active_program").select("program_id").maybeSingle(),
    supabase.from("user_settings").select("training_focus, display_name, available_equipment").maybeSingle(),
  ]);
  const activeId = active?.program_id ?? null;
  const preferredFocus = settings?.training_focus ?? "balanced";
  const availableEquipment = settings?.available_equipment ?? [];
  const activeProgram = ((programs as Prog[]) ?? []).find((p) => p.id === activeId) ?? null;
  const own = ((programs as Prog[]) ?? []).filter((p) => p.user_id === user?.id && p.id !== activeId);
  const presets = ((programs as Prog[]) ?? [])
    .filter((p) => p.user_id === null && p.id !== activeId)
    .sort((a, b) => {
      const environmentOrder = { gym: 0, home: 1, bodyweight: 2 } as Record<string, number>;
      return (
        Number(missingProgramEquipment(a.required_equipment, availableEquipment).length > 0) -
          Number(missingProgramEquipment(b.required_equipment, availableEquipment).length > 0) ||
        (a.level_min ?? 9) - (b.level_min ?? 9) ||
        (preferredFocus === "lower_body"
          ? Number(b.focus_key === preferredFocus) - Number(a.focus_key === preferredFocus)
          : 0) ||
        (environmentOrder[a.environment ?? ""] ?? 9) - (environmentOrder[b.environment ?? ""] ?? 9) ||
        (a.frequency_min ?? 9) - (b.frequency_min ?? 9)
      );
    });
  const selectedLevel = Number(filters.level);
  const hasSelectedLevel = Number.isInteger(selectedLevel) && selectedLevel >= 1 && selectedLevel <= 3;
  const presetGroups = [
    { rank: 1, label: "Początkujący" },
    { rank: 2, label: "Średniozaawansowani" },
    { rank: 3, label: "Zaawansowani" },
  ]
    .map((group) => ({
      ...group,
      programs: presets.filter(
        (program) =>
          (hasSelectedLevel
            ? group.rank === selectedLevel &&
              program.level_min !== null &&
              program.level_max !== null &&
              program.level_min <= selectedLevel &&
              program.level_max >= selectedLevel
            : program.level_min === group.rank) &&
          (!filters.environment || program.environment === filters.environment) &&
          (!filters.goal || program.goal === filters.goal) &&
          (!filters.focus || program.focus_key === filters.focus),
      ),
    }))
    .filter((group) => group.programs.length > 0);
  const visibleGroups = presetGroups;
  const goals = [...new Set(presets.map((program) => program.goal).filter((goal): goal is string => !!goal))].sort((a, b) => a.localeCompare(b, "pl"));

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      {/* R2: Plany są podwidokiem Treningu — wspólny header i lokalna nawigacja
          zamiast strzałki Back (przełączanie przez replace, jak Postępy/Ciało).
          Badge celu zostaje na Dziś — tu odpowiadałby na pytanie innego ekranu. */}
      <TrainingHeader displayName={settings?.display_name ?? null} />
      <TrainingSubnav active="plans" />

      <main className="flex-1 space-y-lg p-md">
        {activeProgram && (
          <section className="space-y-sm">
            <h2 className="text-base font-semibold">Aktywny plan</h2>
            <ProgramRow
              p={activeProgram}
              kind={activeProgram.user_id ? "own" : "preset"}
              isActive
              preferredFocus={preferredFocus}
              missingEquipment={missingProgramEquipment(activeProgram.required_equipment, availableEquipment)}
            />
          </section>
        )}

        {own.length > 0 && (
          <section className="space-y-sm">
            <h2 className="text-base font-semibold">Moje programy</h2>
            {own.map((p) => (
              <ProgramRow key={p.id} p={p} kind="own" isActive={false} preferredFocus={preferredFocus} />
            ))}
          </section>
        )}

        <section className="space-y-sm">
          <div className="flex items-start justify-between gap-sm">
            <div className="space-y-2xs">
              <h2 className="text-base font-semibold">Biblioteka programów</h2>
              <p className="text-sm text-muted-foreground">Najpierw pokazujemy plany zgodne z Twoim sprzętem i tygodniem.</p>
            </div>
            <ProgramFilters filters={filters} goals={goals} />
          </div>
          {visibleGroups.length === 0 && (
            <div className="rounded-xl bg-muted p-md text-sm text-muted-foreground">Nie ma jeszcze planu spełniającego te warunki. Wyczyść filtr albo wybierz najbliższy wariant.</div>
          )}
          {visibleGroups.map((group) => (
            <div key={group.rank} className="space-y-sm">
              <h3 className="pt-xs text-sm font-medium text-muted-foreground">{group.label}</h3>
              {group.programs.map((p) => (
                <ProgramRow
                  key={p.id}
                  p={p}
                  kind="preset"
                  isActive={false}
                  preferredFocus={preferredFocus}
                  missingEquipment={missingProgramEquipment(p.required_equipment, availableEquipment)}
                />
              ))}
            </div>
          ))}
        </section>

        <section className="space-y-xs border-t pt-md">
          <p className="text-sm text-muted-foreground">Masz własny plan?</p>
          <form action={createProgram}>
            <Button type="submit" variant="outline" className="w-full">
              Utwórz własny program
            </Button>
          </form>
        </section>
      </main>
    </div>
  );
}

function ProgramRow({
  p,
  kind,
  isActive,
  preferredFocus,
  missingEquipment = [],
}: {
  p: Prog;
  kind: "own" | "preset";
  isActive: boolean;
  preferredFocus: string;
  missingEquipment?: string[];
}) {
  return (
      <div className="flex items-stretch rounded-xl bg-card text-card-foreground shadow-sm">
        <Link href={`/programs/${p.id}`} className="block min-w-0 flex-1 p-md">
          {/* Pełna nazwa (N2#1) — zawijanie zamiast ucinania */}
          <p className="break-words font-medium">{p.name}</p>
          {kind === "preset" && preferredFocus === "lower_body" && p.focus_key === preferredFocus && (
            <span className="mt-2xs inline-flex rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
              Pasuje do Twojego kierunku
            </span>
          )}
          {/* R2.1 (audyt P1): karta = nazwa + dwa fakty, nie tabela filtrów.
              Pełna specyfikacja (rotacja, sprzęt, minuty) żyje w szczególe planu. */}
          <p className="mt-2xs text-xs text-muted-foreground">
            {kind === "preset"
              ? [
                  p.frequency_min !== null && p.frequency_max !== null
                    ? formatFrequency(p.frequency_min, p.frequency_max)
                    : null,
                  p.estimated_minutes_min !== null && p.estimated_minutes_max !== null
                    ? `${p.estimated_minutes_min}–${p.estimated_minutes_max} min`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")
              : `${p.cycle_days} dni w cyklu · edytuj →`}
          </p>
          {kind === "preset" && missingEquipment.length > 0 && (
            <p className="mt-2xs text-xs text-amber-800 dark:text-amber-300">
              Potrzebujesz: {formatEquipment(missingEquipment, 2)}
            </p>
          )}
        </Link>
        <div className="flex items-center px-sm">
          {isActive ? (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
              Aktywny
            </span>
          ) : (
            <form action={setActiveProgram.bind(null, p.id)}>
              {/* R2.1: aktywacja podporządkowana wyborowi karty — ghost zamiast outline */}
              <Button variant="ghost" type="submit" className="text-primary">
                Ustaw
              </Button>
            </form>
          )}
        </div>
      </div>
    );
}
