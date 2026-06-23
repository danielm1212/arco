import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createProgram, duplicateProgram } from "@/app/actions/program";
import { Button } from "@/components/ui/button";

export default async function ProgramsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: programs } = await supabase
    .from("programs")
    .select("id, name, days_per_week, user_id, program_days(id)")
    .order("user_id", { nullsFirst: true });

  const own = (programs ?? []).filter((p) => p.user_id === user?.id);
  const presets = (programs ?? []).filter((p) => p.user_id === null);

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
              <Link
                key={p.id}
                href={`/programs/${p.id}`}
                className="flex items-center justify-between rounded-lg border bg-card p-md text-card-foreground"
              >
                <span className="font-medium">{p.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(p.program_days as { id: string }[]).length} dni · edytuj →
                </span>
              </Link>
            ))}
          </section>
        )}

        <section className="space-y-sm">
          <h2 className="text-base font-semibold">Gotowe programy</h2>
          {presets.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border bg-card p-md text-card-foreground"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.days_per_week} dni / tydz.</p>
              </div>
              <form action={duplicateProgram.bind(null, p.id)}>
                <Button variant="outline" size="sm" type="submit">
                  Duplikuj i edytuj
                </Button>
              </form>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
