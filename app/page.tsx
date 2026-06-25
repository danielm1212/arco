import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import { startSession, startFreestyle } from "@/app/actions/session";
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";
import { WelcomeOverlay } from "@/components/WelcomeOverlay";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createClient();

  const [
    { data: programs },
    { data: active },
    { data: openSession },
    { data: finished },
    { data: settings },
    { count: sessionCount },
  ] = await Promise.all([
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
    supabase
      .from("sessions")
      .select("started_at")
      .not("finished_at", "is", null)
      .gte("started_at", new Date(Date.now() - 120 * 86_400_000).toISOString()),
    supabase.from("user_settings").select("unit_system").maybeSingle(),
    supabase.from("sessions").select("id", { count: "exact", head: true }),
  ]);

  const activeId = active?.program_id ?? null;
  const activeProgram = (programs ?? []).find((p) => p.id === activeId) ?? null;
  const activeDays = activeProgram
    ? ((activeProgram.program_days as { id: string; label: string; position: number }[]) ?? [])
        .slice()
        .sort((a, b) => a.position - b.position)
    : [];

  // Pasek tygodnia + streak
  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const doneDays = new Set((finished ?? []).map((s) => dayKey(new Date(s.started_at))));
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const todayKey = dayKey(new Date());
  const DOW = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = dayKey(d);
    return { key, on: doneDays.has(key), today: key === todayKey, dow: DOW[i] };
  });
  const wkStart = (d: Date) => {
    const x = new Date(d);
    x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
    x.setHours(0, 0, 0, 0);
    return x.getTime();
  };
  const weeks = new Set((finished ?? []).map((s) => wkStart(new Date(s.started_at))));
  const WEEK = 7 * 86_400_000;
  let streak = 0;
  let w = wkStart(new Date());
  if (!weeks.has(w)) w -= WEEK;
  while (weeks.has(w)) {
    streak++;
    w -= WEEK;
  }

  // Sugestia kolejnego dnia (rotacja wg ostatniej zakończonej sesji aktywnego programu)
  let suggested: { dayId: string; label: string } | null = null;
  if (activeId && programs) {
    const ap = programs.find((p) => p.id === activeId);
    const days = (
      (ap?.program_days as { id: string; label: string; position: number }[]) ?? []
    )
      .slice()
      .sort((a, b) => a.position - b.position);
    if (days.length) {
      const { data: last } = await supabase
        .from("sessions")
        .select("program_day_id")
        .not("finished_at", "is", null)
        .in(
          "program_day_id",
          days.map((d) => d.id),
        )
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      let idx = 0;
      if (last?.program_day_id) {
        const pos = days.findIndex((d) => d.id === last.program_day_id);
        idx = pos >= 0 ? (pos + 1) % days.length : 0;
      }
      suggested = { dayId: days[idx].id, label: days[idx].label };
    }
  }

  // Metadane sugerowanego dnia (liczba ćwiczeń, szac. czas, podgląd)
  let suggestedMeta: { count: number; minutes: number; preview: string[] } | null = null;
  if (suggested) {
    const { data: slots } = await supabase
      .from("program_day_slots")
      .select("target_sets, rest_seconds, exercises(name)")
      .eq("program_day_id", suggested.dayId)
      .order("position");
    if (slots?.length) {
      const minutes = Math.round(
        slots.reduce((m, s) => m + s.target_sets * (40 + (s.rest_seconds ?? 90)), 0) / 60,
      );
      const preview = slots
        .slice(0, 3)
        .map((s) => (s.exercises as unknown as { name: string } | null)?.name ?? "")
        .filter(Boolean);
      suggestedMeta = { count: slots.length, minutes, preview };
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <WelcomeOverlay
        eligible={(sessionCount ?? 0) === 0}
        unit={settings?.unit_system ?? "kg"}
      />
      <header className="flex items-center justify-between border-b px-sm py-sm">
        <span className="pl-2xs text-lg font-bold tracking-tight">Arco</span>
        <nav className="flex items-center">
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
        <section className="rounded-xl bg-card p-md text-card-foreground shadow-sm">
          <div className="mb-sm flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Ten tydzień</span>
            <span className="flex items-center gap-1 rounded-full bg-volt/15 px-2.5 py-1">
              <span aria-hidden>🔥</span>
              <span className="text-base font-semibold tabular-nums text-foreground">{streak}</span>
              <span className="text-xs text-muted-foreground">
                {streak === 1 ? "tydz." : "tyg."}
              </span>
            </span>
          </div>
          <div className="flex gap-1.5">
            {week.map((d) => (
              <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
                    d.on ? "bg-volt text-volt-foreground" : "bg-muted text-muted-foreground"
                  } ${d.today ? "ring-2 ring-volt ring-offset-2 ring-offset-card" : ""}`}
                >
                  {d.on ? "✓" : ""}
                </div>
                <span
                  className={`text-[11px] ${
                    d.today ? "font-bold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {d.dow}
                </span>
              </div>
            ))}
          </div>
        </section>

        {openSession ? (
          <Link
            href={`/session/${openSession.id}`}
            className="block rounded-xl bg-card p-md shadow-sm ring-1 ring-inset ring-volt/40"
          >
            <p className="font-semibold text-primary">Wznów trening →</p>
            <p className="text-sm text-muted-foreground">Masz niezakończoną sesję.</p>
          </Link>
        ) : (
          suggested && (
            <form action={startSession.bind(null, suggested.dayId)}>
              <button
                type="submit"
                className="block w-full rounded-xl bg-volt p-md text-left text-volt-foreground shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-volt-foreground/70">Sugerowane dziś</span>
                  <span className="flex items-center gap-1 rounded-full bg-volt-foreground px-3 py-1 text-xs font-semibold text-volt">
                    Start →
                  </span>
                </div>
                <p className="mt-sm text-2xl font-bold leading-tight">{suggested.label}</p>
                {suggestedMeta && (
                  <>
                    <p className="mt-2xs text-sm font-medium text-volt-foreground/80">
                      {suggestedMeta.count} ćwiczeń · ~{suggestedMeta.minutes} min
                    </p>
                    {suggestedMeta.preview.length > 0 && (
                      <p className="mt-2xs truncate text-xs text-volt-foreground/70">
                        {suggestedMeta.preview.join(" · ")}
                        {suggestedMeta.count > suggestedMeta.preview.length ? " …" : ""}
                      </p>
                    )}
                  </>
                )}
              </button>
            </form>
          )
        )}

        <section className="space-y-sm">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-semibold">Program</h2>
            <Link href="/programs" className="text-xs text-primary">
              {activeId ? "Zmień →" : "Biblioteka →"}
            </Link>
          </div>

          {activeProgram ? (
            <div className="space-y-sm rounded-xl bg-card p-md text-card-foreground shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-medium">{activeProgram.name}</p>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                  Aktywny
                </span>
              </div>
              <ul className="space-y-2xs">
                {activeDays.map((d) => (
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
            </div>
          ) : (
            <Link
              href="/programs"
              className="block rounded-xl border border-dashed p-md text-center text-sm text-muted-foreground"
            >
              Nie masz aktywnego programu — wybierz z biblioteki →
            </Link>
          )}
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
