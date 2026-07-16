import { createClient } from "@/lib/supabase/server";
import { HistoricalWorkoutForm, type HistoricalProgram } from "./HistoricalWorkoutForm";
import { MomentIcon3D } from "@/components/MomentIcon3D";
import { PageHeader } from "@/components/navigation/PageHeader";

export const dynamic = "force-dynamic";

export default async function AddHistoricalWorkoutPage() {
  const supabase = await createClient();
  const [{ data: programs }, { data: auth }] = await Promise.all([
    supabase
      .from("programs")
      .select("id, name, program_days(id, label, position)")
      .order("name"),
    supabase.auth.getUser(),
  ]);

  const choices: HistoricalProgram[] = (programs ?? [])
    .map((program) => ({
      id: program.id,
      name: program.name,
      days: ((program.program_days as { id: string; label: string; position: number }[]) ?? [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .map(({ id, label }) => ({ id, label })),
    }))
    .filter((program) => program.days.length > 0);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <PageHeader title="Trening po fakcie" fallback="/history" backLabel="Wróć do historii" sticky />
      <main className="flex-1 space-y-lg p-md pb-[calc(2rem+var(--safe-area-bottom))]">
        <div className="space-y-2xs">
          <MomentIcon3D name="calendar" className="-my-sm size-24" priority />
          <h2 className="text-2xl font-semibold">Dodaj trening po fakcie</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Odtwórz trening, o którym zapomniałeś. Najpierw ustawiamy jego prawdziwą datę, potem wpisujesz ćwiczenia i serie.
          </p>
        </div>
        <HistoricalWorkoutForm programs={choices} userId={auth.user?.id ?? "anonymous"} />
      </main>
    </div>
  );
}
