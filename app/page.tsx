import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { startSession, startFreestyle } from "@/app/actions/session";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { WelcomeOverlay } from "@/components/WelcomeOverlay";
import { getHomeGuidance } from "@/lib/getHomeGuidance";
import { localDayKey } from "@/lib/week";
import { DayPickerSheet } from "./DayPickerSheet";
import { GuidanceChip } from "./GuidanceChip";
import { FlameWeek } from "./FlameWeek";

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
        programs={((programs ?? []) as { id: string; name: string; days_per_week: number }[]).map(
          (p) => ({ id: p.id, name: p.name, days_per_week: p.days_per_week }),
        )}
      />
      <header className="flex items-center justify-between border-b px-sm py-sm">
        <span className="pl-2xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Arco" className="h-8 w-auto dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dark.svg" alt="" aria-hidden className="hidden h-8 w-auto dark:block" />
        </span>
        <nav className="flex items-center">
          {/* F1 (redesign-home.md §3.4): wylogowanie przeniesione do /settings —
              raz-na-kwartał akcja nie zasługuje na drugą ikonę w headerze */}
          <Button variant="ghost" size="icon" aria-label="Ustawienia" asChild>
            <Link href="/settings">
              <Settings />
            </Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1 space-y-lg p-md">
        {/* Powitanie z imieniem (S7) — tylko gdy ustawione */}
        {settings?.display_name && (
          <h1 className="text-2xl font-semibold tracking-tight">
            Cześć, {settings.display_name} 👋
          </h1>
        )}
        {/* F2 (redesign-home.md §3.6): FlameWeek ukryty do 1. treningu —
            rząd wygaszonych płomieni na dzień dobry to smutek, nie obietnica */}
        {(sessionCount ?? 0) > 0 && (
          <Suspense fallback={null}>
            <FlameWeek week={week} streak={streak} weeklyDone={weeklyDone} weeklyGoal={weeklyGoal} />
          </Suspense>
        )}

        {openSession ? (
          <Link
            href={`/session/${openSession.id}`}
            className="block rounded-xl bg-card p-md shadow-sm ring-1 ring-inset ring-volt/40"
          >
            <p className="font-semibold text-primary">Wznów trening →</p>
            <p className="text-sm text-muted-foreground">Masz niezakończoną sesję.</p>
          </Link>
        ) : suggested ? (
          // F1 (redesign-home.md V4): hero = BIAŁY kafel (nie sand) — hierarchię
          // robi skala typografii + jedyne wypełnione rust-CTA na ekranie.
          <div className="overflow-hidden rounded-xl bg-card text-card-foreground shadow-md">
            <form action={startSession.bind(null, suggested.dayId)}>
              <button type="submit" className="block w-full p-md text-left">
                <div className="flex items-center justify-between gap-sm">
                  <span className="min-w-0 truncate text-xs font-medium text-muted-foreground">
                    {activeProgram?.name}
                  </span>
                  <span className="shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Start →
                  </span>
                </div>
                <p className="mt-sm text-2xl font-semibold leading-tight">
                  Dziś · {suggested.label}
                </p>
                {suggestedMeta && (
                  <>
                    <p className="mt-2xs text-sm font-medium text-muted-foreground">
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
            {/* F1 (§3.2): stopka hero przejmuje WSZYSTKIE alternatywy jako ciche
                tekst-linki — koniec z trzema równorzędnymi drogami startu */}
            <div className="flex items-center gap-md border-t px-md py-2 text-xs font-semibold text-primary">
              <Link href={`/programs/${activeId}`} className="underline-offset-2 hover:underline">
                Zobacz ćwiczenia
              </Link>
              {activeDays.length > 1 && (
                <DayPickerSheet programName={activeProgram!.name} days={activeDays} />
              )}
              <form action={startFreestyle}>
                <button type="submit" className="underline-offset-2 hover:underline">
                  Freestyle
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Pusty stan (redesign-home.md §3.6, wariant B — bez zapamiętanej
             sugestii z onboardingu; wariant A wymaga persystencji poziom/
             środowisko z WelcomeOverlay, nie w tym zakresie, patrz HANDOFF) */
          <div className="space-y-sm">
            <div className="space-y-sm rounded-xl bg-card p-md text-card-foreground shadow-md">
              <p className="text-2xl font-semibold leading-tight">Zacznij od planu</p>
              <p className="text-sm text-muted-foreground">
                8 programów od trenera — wybierz swój, a apka poprowadzi Cię serię po serii.
              </p>
              <Button asChild className="w-full">
                <Link href="/programs">Wybierz program →</Link>
              </Button>
            </div>
            <form action={startFreestyle}>
              <button
                type="submit"
                className="block w-full rounded-xl bg-card p-md text-left text-sm font-medium shadow-sm"
              >
                Freestyle
                <span className="block text-xs font-normal text-muted-foreground">
                  Zacznij bez planu — dodawaj ćwiczenia w trakcie
                </span>
              </button>
            </form>
          </div>
        )}

        <GuidanceChip items={guidance} />
      </main>
    </div>
  );
}
