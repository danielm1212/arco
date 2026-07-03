import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createProgram } from "@/app/actions/program";
import { setActiveProgram } from "@/app/actions/session";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type Prog = {
  id: string;
  name: string;
  days_per_week: number;
  user_id: string | null;
  goal: string | null;
  level: string | null;
  program_days: { id: string }[];
};

export default async function ProgramsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: programs }, { data: active }] = await Promise.all([
    supabase
      .from("programs")
      .select("id, name, days_per_week, user_id, goal, level, program_days(id)")
      .order("user_id", { nullsFirst: true }),
    supabase.from("user_active_program").select("program_id").maybeSingle(),
  ]);
  const activeId = active?.program_id ?? null;
  const own = ((programs as Prog[]) ?? []).filter((p) => p.user_id === user?.id);
  const presets = ((programs as Prog[]) ?? []).filter((p) => p.user_id === null);

  function Row({ p, kind }: { p: Prog; kind: "own" | "preset" }) {
    const isActive = p.id === activeId;
    return (
      <div className="flex items-stretch rounded-lg border bg-card text-card-foreground">
        <Link href={`/programs/${p.id}`} className="block min-w-0 flex-1 p-md">
          {/* Pełna nazwa (N2#1) — zawijanie zamiast ucinania */}
          <p className="break-words font-medium">{p.name}</p>
          <div className="mt-2xs flex flex-wrap items-center gap-2xs text-xs text-muted-foreground">
            {kind === "preset" ? (
              [p.goal, p.level, `${p.days_per_week}×/tydz.`].filter(Boolean).map((t) => (
                <span
                  key={t as string}
                  className="rounded-full bg-secondary px-2 py-0.5 capitalize text-secondary-foreground"
                >
                  {t}
                </span>
              ))
            ) : (
              <span>{p.program_days.length} dni · edytuj →</span>
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
              <Button variant="outline" size="sm" type="submit">
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
        <Link href="/" className="text-xs text-muted-foreground">
          ← Trening
        </Link>
        <span className="font-semibold">Programy</span>
        <span className="w-12" />
      </header>

      <main className="flex-1 space-y-lg p-md">
        <form action={createProgram}>
          <Button type="submit" className="w-full">
            + Nowy program
          </Button>
        </form>

        {own.length > 0 && (
          <section className="space-y-sm">
            <h2 className="text-base font-semibold">Moje programy</h2>
            {own.map((p) => (
              <Row key={p.id} p={p} kind="own" />
            ))}
          </section>
        )}

        <section className="space-y-sm">
          <h2 className="text-base font-semibold">Biblioteka programów</h2>
          {presets.map((p) => (
            <Row key={p.id} p={p} kind="preset" />
          ))}
        </section>
      </main>
    </div>
  );
}
