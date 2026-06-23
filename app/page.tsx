import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import {
  setActiveProgram,
  startSession,
  startFreestyle,
} from "@/app/actions/session";
import { Button } from "@/components/ui/button";
import { TrendingUp, History, Scale, Settings, LogOut } from "lucide-react";

export default async function HomePage() {
  const supabase = createClient();

  const [{ data: programs }, { data: active }, { data: openSession }] =
    await Promise.all([
      supabase
        .from("programs")
        .select("id, name, days_per_week, program_days(id, label, position)")
        .order("days_per_week"),
      supabase.from("user_active_program").select("program_id").maybeSingle(),
      supabase
        .from("sessions")
        .select("id, started_at")
        .is("finished_at", null)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const activeId = active?.program_id ?? null;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex items-center justify-between border-b px-sm py-sm">
        <span className="pl-2xs text-lg font-bold tracking-tight">Arco</span>
        <nav className="flex items-center">
          <Button variant="ghost" size="icon" aria-label="Postępy" asChild>
            <Link href="/progress">
              <TrendingUp />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Historia" asChild>
            <Link href="/history">
              <History />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Ciało" asChild>
            <Link href="/body">
              <Scale />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Ustawienia" asChild>
            <Link href="/settings">
              <Settings />
            </Link>
          </Button>
          <form action={logout}>
            <Button variant="ghost" size="icon" type="submit" aria-label="Wyloguj">
              <LogOut />
            </Button>
          </form>
        </nav>
      </header>

      <main className="flex-1 space-y-lg p-md">
        {openSession && (
          <Link
            href={`/session/${openSession.id}`}
            className="block rounded-lg border border-primary bg-primary/10 p-md"
          >
            <p className="font-medium text-primary">Wznów trening →</p>
            <p className="text-sm text-muted-foreground">Masz niezakończoną sesję.</p>
          </Link>
        )}

        <section className="space-y-sm">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-semibold">Programy</h2>
            <Link href="/programs" className="text-xs text-primary">
              Zarządzaj →
            </Link>
          </div>

          {programs?.map((p) => {
            const isActive = p.id === activeId;
            const days = (p.program_days as { id: string; label: string; position: number }[])
              .slice()
              .sort((a, b) => a.position - b.position);
            return (
              <div
                key={p.id}
                className="space-y-sm rounded-lg border bg-card p-md text-card-foreground"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.days_per_week}× / tydzień
                    </p>
                  </div>
                  {isActive ? (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                      Aktywny
                    </span>
                  ) : (
                    <form action={setActiveProgram.bind(null, p.id)}>
                      <Button variant="outline" size="sm" type="submit">
                        Ustaw aktywny
                      </Button>
                    </form>
                  )}
                </div>

                {isActive && (
                  <ul className="space-y-2xs">
                    {days.map((d) => (
                      <li key={d.id}>
                        <form action={startSession.bind(null, d.id)}>
                          <Button
                            variant="secondary"
                            type="submit"
                            className="w-full justify-between"
                          >
                            <span>{d.label}</span>
                            <span className="text-xs text-muted-foreground">Start →</span>
                          </Button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </section>

        <section className="space-y-sm">
          <h2 className="text-base font-semibold">Bez programu</h2>
          <form action={startFreestyle}>
            <Button variant="outline" type="submit" className="w-full">
              Start freestyle
            </Button>
          </form>
        </section>
      </main>
    </div>
  );
}
