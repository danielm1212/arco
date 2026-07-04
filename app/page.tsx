import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import { startSession, startFreestyle } from "@/app/actions/session";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, Scale, Hourglass, TrendingDown, Lightbulb } from "lucide-react";
import { WelcomeOverlay } from "@/components/WelcomeOverlay";
import { getHomeGuidance } from "@/lib/getHomeGuidance";
import { localDayKey } from "@/lib/week";

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
    guidance,
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
    supabase.from("user_settings").select("unit_system, weekly_goal, display_name").maybeSingle(),
    supabase.from("sessions").select("id", { count: "exact", head: true }),
    getHomeGuidance(),
  ]);

  const activeId = active?.program_id ?? null;
  const activeProgram = (programs ?? []).find((p) => p.id === activeId) ?? null;
  const activeDays = activeProgram
    ? ((activeProgram.program_days as { id: string; label: string; position: number }[]) ?? [])
        .slice()
        .sort((a, b) => a.position - b.position)
    : [];

  // Pasek tygodnia + streak
  const dayKey = localDayKey; // klucz LOKALNY (fix: ring „dziś" wskazywał sobotę w piątek)
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
  // Cel tygodniowy + postęp
  const weeklyGoal = settings?.weekly_goal ?? 2;
  const thisWeek = wkStart(new Date());
  const weeklyDone = (finished ?? []).filter(
    (s) => wkStart(new Date(s.started_at)) === thisWeek,
  ).length;

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
        weeklyGoal={settings?.weekly_goal ?? 2}
        programs={((programs ?? []) as { id: string; name: string }[]).map((p) => ({
          id: p.id,
          name: p.name,
        }))}
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
        {/* Powitanie z imieniem (S7) — tylko gdy ustawione */}
        {settings?.display_name && (
          <h1 className="text-2xl font-bold tracking-tight">
            Cześć, {settings.display_name} 👋
          </h1>
        )}
        <section className="rounded-xl bg-card p-md text-card-foreground shadow-sm">
          <div className="mb-sm flex items-center justify-between">
            <span className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-muted-foreground">Ten tydzień</span>
              <span className="text-sm font-semibold tabular-nums">
                {weeklyDone}/{weeklyGoal}
                {weeklyDone >= weeklyGoal && (
                  <span className="ml-1 text-primary" aria-label="cel osiągnięty">
                    🎯
                  </span>
                )}
              </span>
            </span>
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
            <div className="overflow-hidden rounded-xl bg-volt text-volt-foreground shadow-md">
              <form action={startSession.bind(null, suggested.dayId)}>
                <button type="submit" className="block w-full p-md text-left">
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
              {/* Podgląd bez startowania sesji (N2#3) — read-only lista dni/ćwiczeń */}
              <Link
                href={`/programs/${activeId}`}
                className="block border-t border-volt-foreground/15 px-md py-2 text-xs font-semibold text-volt-foreground/80"
              >
                Zobacz ćwiczenia (bez startu) →
              </Link>
            </div>
          )
        )}

        {/* S14 #7: sekcja nie znika — pozytywny stan, żeby guidance było widoczne */}
        {guidance.length === 0 && (sessionCount ?? 0) > 0 && (
          <section className="space-y-2xs rounded-xl bg-card p-md shadow-sm">
            <h2 className="text-sm font-semibold text-muted-foreground">Wskazówki</h2>
            <p className="text-sm">Wszystko na torze 💪</p>
            <p className="text-xs text-muted-foreground">
              Trenuj zgodnie z planem — dam znać, gdy coś będzie wymagało uwagi (balans, przerwy, deload).
            </p>
          </section>
        )}
        {guidance.length > 0 && (
          <section className="space-y-xs rounded-xl bg-card p-md shadow-sm">
            <h2 className="text-sm font-semibold text-muted-foreground">Wskazówki</h2>
            <ul className="space-y-2xs">
              {guidance.map((g) => (
                <li key={g.id} className="flex items-start gap-sm text-sm">
                  <span aria-hidden className="mt-1 shrink-0 text-muted-foreground">
                    {g.kind === "balance" ? (
                      <Scale className="size-4" />
                    ) : g.kind === "staleness" ? (
                      <Hourglass className="size-4" />
                    ) : g.kind === "deload" ? (
                      <TrendingDown className="size-4" />
                    ) : (
                      <Lightbulb className="size-4" />
                    )}
                  </span>
                  <span className="leading-6">{g.message}</span>
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-muted-foreground">
              Podpowiedzi z Twoich danych — sugestia, nie nakaz. Pełny bilans na{" "}
              <Link href="/progress" className="underline">
                Postępach
              </Link>
              .
            </p>
          </section>
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
              <div className="flex items-center justify-between gap-sm">
                {/* Nazwa = link do podglądu programu (N2#3) */}
                <Link
                  href={`/programs/${activeProgram.id}`}
                  className="min-w-0 break-words font-medium underline-offset-2 hover:underline"
                >
                  {activeProgram.name}
                </Link>
                <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
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
            /* S14 #1: obietnica wartości + jeden krok zamiast szarej ramki */
            <div className="space-y-sm rounded-xl bg-card p-md text-card-foreground shadow-sm">
              <p className="text-lg font-bold">Zacznij od planu</p>
              <p className="text-sm text-muted-foreground">
                6 programów od trenera — wybierz swój, a apka poprowadzi Cię serię po serii.
              </p>
              <Button asChild className="w-full">
                <Link href="/programs">Wybierz program →</Link>
              </Button>
            </div>
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
