import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Seed (read-only przez RLS) + dane usera (RLS po user_id)
  const [{ data: programs }, { count: exerciseCount }, { data: settings }] =
    await Promise.all([
      supabase
        .from("programs")
        .select("id, name, days_per_week, program_days(label)")
        .is("user_id", null)
        .order("days_per_week"),
      supabase.from("exercises").select("*", { count: "exact", head: true }),
      supabase.from("user_settings").select("unit_system, default_rest_seconds").single(),
    ]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex items-center justify-between border-b px-md py-sm">
        <span className="text-lg font-bold tracking-tight">Arco</span>
        <form action={logout}>
          <Button variant="ghost" size="sm" type="submit">
            Wyloguj
          </Button>
        </form>
      </header>

      <main className="flex-1 space-y-lg p-md">
        <section className="rounded-lg border bg-card p-md text-card-foreground">
          <h2 className="text-sm font-medium text-muted-foreground">Zalogowano jako</h2>
          <p className="truncate font-medium">{user?.email}</p>
          {settings && (
            <p className="mt-2xs text-sm text-muted-foreground">
              Jednostki: {settings.unit_system} · domyślny rest:{" "}
              {settings.default_rest_seconds}s
            </p>
          )}
        </section>

        <section className="space-y-sm">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-semibold">Programy</h2>
            <span className="text-sm text-muted-foreground">
              {exerciseCount ?? 0} ćwiczeń w bazie
            </span>
          </div>

          <ul className="space-y-sm">
            {programs?.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border bg-card p-md text-card-foreground"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{p.name}</span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    {p.days_per_week}× / tydz.
                  </span>
                </div>
                <p className="mt-2xs text-sm text-muted-foreground">
                  {(p.program_days as { label: string }[])
                    ?.map((d) => d.label)
                    .join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <p className="pt-md text-center text-xs text-muted-foreground">
          Phase 0 — fundament. Logger i sesje w Phase 1.
        </p>
      </main>
    </div>
  );
}
