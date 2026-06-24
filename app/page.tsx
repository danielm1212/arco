import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import {
  setActiveProgram,
  startSession,
  startFreestyle,
} from "@/app/actions/session";
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";
import { WelcomeOverlay } from "@/components/WelcomeOverlay";

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
        <section className="rounded-lg border bg-card p-md text-card-foreground">
          <div className="mb-sm flex items-center justify-between">
            <span className="text-sm font-medium">Ten tydzień</span>
            <span className="text-sm font-medium text-primary">
              🔥 {streak} {streak === 1 ? "tydz." : "tyg."}
            </span>
          </div>
          <div className="flex gap-px">
            {week.map((d) => (
              <div key={d.key} className="flex flex-1 flex-col items-center gap-0.5">
                <div
                  className={`flex h-7 w-full items-center justify-center rounded-sm text-[10px] ${
                    d.on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  } ${d.today ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""}`}
                >
                  {d.on ? "✓" : ""}
                </div>
                <span
                  className={`text-[9px] ${
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
            className="block rounded-lg border border-primary bg-primary/10 p-md"
          >
            <p className="font-medium text-primary">Wznów trening →</p>
            <p className="text-sm text-muted-foreground">Masz niezakończoną sesję.</p>
          </Link>
        ) : (
          suggested && (
            <form action={startSession.bind(null, suggested.dayId)}>
              <button
                type="submit"
                className="block w-full rounded-lg border border-primary bg-primary/10 p-md text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Sugerowane dziś</span>
                  <span className="text-sm font-medium text-primary">Start →</span>
                </div>
                <p className="mt-2xs font-semibold text-primary">{suggested.label}</p>
                {suggestedMeta && (
                  <>
                    <p className="text-xs text-muted-foreground">
                      {suggestedMeta.count} ćwiczeń · ~{suggestedMeta.minutes} min
                    </p>
                    {suggestedMeta.preview.length > 0 && (
                      <p className="mt-2xs truncate text-xs text-muted-foreground">
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
