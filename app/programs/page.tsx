import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createProgram } from "@/app/actions/program";
import { setActiveProgram } from "@/app/actions/session";
import { Button } from "@/components/ui/button";
import { formatCycleStructure, formatEquipment, formatFrequency } from "@/lib/programRecommendation";

export const dynamic = "force-dynamic";

type Prog = {
  id: string;
  name: string;
  cycle_days: number;
  user_id: string | null;
  goal: string | null;
  level: string | null;
  level_min: number | null;
  environment: string | null;
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
};

const ENVIRONMENT_LABELS: Record<string, string> = {
  gym: "Siłownia",
  home: "Dom z hantlami",
  bodyweight: "Masa ciała",
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

  const [{ data: programs }, { data: active }] = await Promise.all([
    supabase
      .from("programs")
      .select("id, name, cycle_days, user_id, goal, level, level_min, environment, frequency_min, frequency_max, estimated_minutes_min, estimated_minutes_max, required_equipment, program_days(id)")
      .order("user_id", { nullsFirst: true }),
    supabase.from("user_active_program").select("program_id").maybeSingle(),
  ]);
  const activeId = active?.program_id ?? null;
  const own = ((programs as Prog[]) ?? []).filter((p) => p.user_id === user?.id);
  const presets = ((programs as Prog[]) ?? [])
    .filter((p) => p.user_id === null)
    .sort((a, b) => {
      const environmentOrder = { gym: 0, home: 1, bodyweight: 2 } as Record<string, number>;
      return (
        (a.level_min ?? 9) - (b.level_min ?? 9) ||
        (environmentOrder[a.environment ?? ""] ?? 9) - (environmentOrder[b.environment ?? ""] ?? 9) ||
        (a.frequency_min ?? 9) - (b.frequency_min ?? 9)
      );
    });
  const presetGroups = [
    { rank: 1, label: "Początkujący" },
    { rank: 2, label: "Średniozaawansowani" },
    { rank: 3, label: "Zaawansowani" },
  ]
    .map((group) => ({
      ...group,
      programs: presets.filter(
        (program) =>
          program.level_min === group.rank &&
          (!filters.environment || program.environment === filters.environment) &&
          (!filters.goal || program.goal === filters.goal),
      ),
    }))
    .filter((group) => group.programs.length > 0);
  const selectedLevel = Number(filters.level);
  const visibleGroups = Number.isInteger(selectedLevel) && selectedLevel >= 1 && selectedLevel <= 3
    ? presetGroups.filter((group) => group.rank === selectedLevel)
    : presetGroups;
  const goals = [...new Set(presets.map((program) => program.goal).filter((goal): goal is string => !!goal))].sort((a, b) => a.localeCompare(b, "pl"));
  const hasFilters = Boolean(filters.environment || filters.level || filters.goal);

  function filterHref(next: LibraryFilters) {
    const query = new URLSearchParams();
    if (next.environment) query.set("environment", next.environment);
    if (next.level) query.set("level", next.level);
    if (next.goal) query.set("goal", next.goal);
    const value = query.toString();
    return value ? `/programs?${value}` : "/programs";
  }

  const chipClass = (selected: boolean) =>
    `inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium transition-colors ${
      selected ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
    }`;

  function Row({ p, kind }: { p: Prog; kind: "own" | "preset" }) {
    const isActive = p.id === activeId;
    return (
      <div className="flex items-stretch rounded-xl bg-card text-card-foreground shadow-sm">
        <Link href={`/programs/${p.id}`} className="block min-w-0 flex-1 p-md">
          {/* Pełna nazwa (N2#1) — zawijanie zamiast ucinania */}
          <p className="break-words font-medium">{p.name}</p>
          <div className="mt-2xs flex flex-wrap items-center gap-2xs text-xs text-muted-foreground">
            {kind === "preset" ? (
              [
                p.goal,
                `kolejność: ${formatCycleStructure(p.cycle_days)}`,
                p.frequency_min !== null && p.frequency_max !== null
                  ? formatFrequency(p.frequency_min, p.frequency_max)
                  : null,
                p.estimated_minutes_min !== null && p.estimated_minutes_max !== null
                  ? `od ${p.estimated_minutes_min} do ${p.estimated_minutes_max} min`
                  : null,
                p.required_equipment.length > 0
                  ? `sprzęt: ${formatEquipment(p.required_equipment, 2)}`
                  : null,
              ].filter(Boolean).map((t) => (
                <span
                  key={t as string}
                  className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground"
                >
                  {t}
                </span>
              ))
            ) : (
              <span>{p.cycle_days} dni w cyklu · edytuj →</span>
            )}
          </div>
        </Link>
        <div className="flex items-center px-sm">
          {isActive ? (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
              Aktywny
            </span>
          ) : (
            <form action={setActiveProgram.bind(null, p.id)}>
              <Button variant="outline" type="submit">
                Ustaw
              </Button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex items-center justify-between border-b px-md py-sm">
        <Link href="/" className="flex min-h-11 items-center text-sm text-muted-foreground">
          ← Trening
        </Link>
        <h1 className="font-semibold">Programy</h1>
        <span className="w-12" />
      </header>

      <main className="flex-1 space-y-lg p-md">
        {own.length > 0 && (
          <section className="space-y-sm">
            <h2 className="text-base font-semibold">Moje programy</h2>
            {own.map((p) => (
              <Row key={p.id} p={p} kind="own" />
            ))}
          </section>
        )}

        <section className="space-y-sm">
          <div className="space-y-2xs">
            <h2 className="text-base font-semibold">Biblioteka programów</h2>
            <p className="text-sm text-muted-foreground">Porównaj plany i ustaw ten, który realnie pasuje do Twojego tygodnia.</p>
          </div>
          <div className="space-y-xs rounded-xl border bg-card p-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Gdzie trenujesz?</p>
              <div className="mt-2xs flex flex-wrap gap-2xs">
                <Link href={filterHref({ ...filters, environment: undefined })} className={chipClass(!filters.environment)}>Wszędzie</Link>
                {Object.entries(ENVIRONMENT_LABELS).map(([value, label]) => (
                  <Link key={value} href={filterHref({ ...filters, environment: filters.environment === value ? undefined : value })} className={chipClass(filters.environment === value)}>{label}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Poziom</p>
              <div className="mt-2xs flex flex-wrap gap-2xs">
                <Link href={filterHref({ ...filters, level: undefined })} className={chipClass(!filters.level)}>Każdy</Link>
                {["Początkujący", "Średniozaawansowany", "Zaawansowany"].map((label, index) => {
                  const value = String(index + 1);
                  return <Link key={value} href={filterHref({ ...filters, level: filters.level === value ? undefined : value })} className={chipClass(filters.level === value)}>{label}</Link>;
                })}
              </div>
            </div>
            {goals.length > 1 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Cel</p>
                <div className="mt-2xs flex flex-wrap gap-2xs">
                  <Link href={filterHref({ ...filters, goal: undefined })} className={chipClass(!filters.goal)}>Każdy</Link>
                  {goals.map((goal) => <Link key={goal} href={filterHref({ ...filters, goal: filters.goal === goal ? undefined : goal })} className={chipClass(filters.goal === goal)}>{goal}</Link>)}
                </div>
              </div>
            )}
            {hasFilters && <Link href="/programs" className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-2 hover:underline">Wyczyść filtry</Link>}
          </div>
          {visibleGroups.length === 0 && (
            <div className="rounded-xl bg-muted p-md text-sm text-muted-foreground">Nie ma jeszcze planu spełniającego te warunki. Wyczyść filtr albo wybierz najbliższy wariant.</div>
          )}
          {visibleGroups.map((group) => (
            <div key={group.rank} className="space-y-sm">
              <h3 className="pt-xs text-sm font-medium text-muted-foreground">{group.label}</h3>
              {group.programs.map((p) => (
                <Row key={p.id} p={p} kind="preset" />
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
