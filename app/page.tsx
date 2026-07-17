import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { startSession, startFreestyle } from "@/app/actions/session";
import { Button } from "@/components/ui/button";
import { WelcomeOverlay } from "@/components/WelcomeOverlay";
import { getHomeGuidance } from "@/lib/getHomeGuidance";
import { localDayKey } from "@/lib/week";
import { DayPickerSheet } from "./DayPickerSheet";
import { GuidanceChip } from "./GuidanceChip";
import { FlameWeek } from "./FlameWeek";
import { ProgramReviewInsight } from "./ProgramReviewInsight";
import { MomentIcon3D } from "@/components/MomentIcon3D";
import { TrainingHeader } from "@/components/TrainingHeader";
import { TrainingSubnav } from "@/components/navigation/TrainingSubnav";
import {
  formatCycleStructure,
  type ProgramCandidate,
  type ProgramFocus,
  type TrainingEnvironment,
} from "@/lib/programRecommendation";

export const dynamic = "force-dynamic";

type ActiveDay = {
  id: string;
  label: string;
  position: number;
  program_day_slots: {
    position: number;
    target_sets: number;
    rest_seconds: number | null;
    exercises: { name: string } | null;
  }[];
};

export default async function HomePage() {
  const supabase = await createClient();
  const historySince = new Date();
  historySince.setDate(historySince.getDate() - 120);

  // R2: jeden równoległy batch — hero nie może czekać na sekwencyjny waterfall.
  // Dni i sloty aktywnego planu wchodzą zagnieżdżonym joinem zamiast dwóch
  // dodatkowych rund (sugerowany dzień + jego metadane).
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
      .select("id, slug, name, cycle_days, environment, focus_key, level_min, level_max, frequency_min, frequency_max, estimated_minutes_min, estimated_minutes_max, required_equipment, optional_equipment")
      .order("cycle_days"),
    supabase
      .from("user_active_program")
      .select("program_id, programs(program_days(id, label, position, program_day_slots(position, target_sets, rest_seconds, exercises(name))))")
      .maybeSingle(),
    supabase
      .from("sessions")
      .select("id, started_at")
      .is("finished_at", null)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("sessions")
      .select("started_at, program_day_id")
      .not("finished_at", "is", null)
      .gte("started_at", historySince.toISOString()),
    supabase.from("user_settings").select("unit_system, weekly_goal, display_name").maybeSingle(),
    supabase.from("sessions").select("id", { count: "exact", head: true }),
    getHomeGuidance(),
  ]);

  const activeId = active?.program_id ?? null;
  const activeProgram = (programs ?? []).find((p) => p.id === activeId) ?? null;
  const presetCount = (programs ?? []).filter((p) => p.slug).length;
  const activeDays = (
    ((active?.programs as unknown as { program_days: ActiveDay[] } | null)?.program_days ?? [])
  )
    .slice()
    .sort((a, b) => a.position - b.position);
  const activeDayIds = new Set(activeDays.map((day) => day.id));
  // 12 sesji to ok. 4–6 tygodni dla najczęstszych rytmów 2–3×/tydz. Nie liczymy
  // freestyle ani poprzednich programów — sugestia ma dotyczyć właśnie tego cyklu.
  const completedSessionsInActiveProgram = (finished ?? []).filter(
    (session) => session.program_day_id && activeDayIds.has(session.program_day_id),
  ).length;

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
  // Cel tygodniowy + postęp (badge w headerze liczy UKOŃCZONE TRENINGI — plan §R2)
  const weeklyGoal = settings?.weekly_goal ?? 2;
  const thisWeek = wkStart(new Date());
  const weeklyDone = (finished ?? []).filter(
    (s) => wkStart(new Date(s.started_at)) === thisWeek,
  ).length;

  // Sugestia kolejnego dnia: rotacja liczona z już pobranej historii (bez
  // dodatkowego zapytania). Ostatnia ukończona sesja aktywnego planu → następna
  // pozycja w cyklu; brak historii w oknie 120 dni → pierwszy dzień.
  let suggested: { dayId: string; label: string } | null = null;
  if (activeDays.length) {
    const lastActive = (finished ?? [])
      .filter((s) => s.program_day_id && activeDayIds.has(s.program_day_id))
      .sort((a, b) => +new Date(b.started_at) - +new Date(a.started_at))[0];
    let idx = 0;
    if (lastActive?.program_day_id) {
      const pos = activeDays.findIndex((d) => d.id === lastActive.program_day_id);
      idx = pos >= 0 ? (pos + 1) % activeDays.length : 0;
    }
    suggested = { dayId: activeDays[idx].id, label: activeDays[idx].label };
  }

  // Metadane sugerowanego dnia z zagnieżdżonego joinu
  let suggestedMeta: { count: number; minutes: number; preview: string[] } | null = null;
  if (suggested) {
    const slots = (activeDays.find((d) => d.id === suggested.dayId)?.program_day_slots ?? [])
      .slice()
      .sort((a, b) => a.position - b.position);
    if (slots.length) {
      const minutes = Math.round(
        slots.reduce((m, s) => m + s.target_sets * (40 + (s.rest_seconds ?? 90)), 0) / 60,
      );
      const preview = slots
        .slice(0, 3)
        .map((s) => s.exercises?.name ?? "")
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
        programs={(programs ?? []).map((p): ProgramCandidate => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          cycle_days: p.cycle_days,
          environment: p.environment as TrainingEnvironment | null,
          focus_key: p.focus_key as ProgramFocus | null,
          level_min: p.level_min,
          level_max: p.level_max,
          frequency_min: p.frequency_min,
          frequency_max: p.frequency_max,
          estimated_minutes_min: p.estimated_minutes_min,
          estimated_minutes_max: p.estimated_minutes_max,
          required_equipment: p.required_equipment,
          optional_equipment: p.optional_equipment,
        }))}
      />
      <TrainingHeader
        goalBadge={(sessionCount ?? 0) > 0 ? { done: weeklyDone, goal: weeklyGoal } : null}
        displayName={settings?.display_name ?? null}
      />
      <TrainingSubnav active="today" />

      <main className="flex-1 space-y-lg p-md">
        {/* F2 (redesign-home.md §3.6): FlameWeek ukryty do 1. treningu —
            rząd wygaszonych płomieni na dzień dobry to smutek, nie obietnica */}
        {(sessionCount ?? 0) > 0 && (
          <Suspense fallback={null}>
            <FlameWeek week={week} streak={streak} />
          </Suspense>
        )}

        {openSession ? null : suggested ? (
          // F1 (redesign-home.md V4): hero = BIAŁY kafel (nie sand) — hierarchię
          // robi skala typografii + jedyne wypełnione rust-CTA na ekranie.
          // R2: karta NIE jest jednym wielkim przyciskiem — osobne cele tapnięcia:
          // CTA startuje sesję, nazwa planu otwiera szczegół, stopka = podgląd/zmiana.
          <div className="overflow-hidden rounded-xl bg-card text-card-foreground shadow-md">
            <div className="p-md">
              <div className="flex items-center justify-between gap-sm">
                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                  Następny trening
                </span>
                {activeProgram && (
                  <Link
                    href={`/programs/${activeId}`}
                    className="min-w-0 truncate text-xs font-medium text-primary underline-offset-2 hover:underline"
                  >
                    {activeProgram.name}
                  </Link>
                )}
              </div>
              <p className="mt-sm text-2xl font-semibold leading-tight">{suggested.label}</p>
              {activeProgram && activeDays.length > 1 && (
                <p className="mt-2xs text-xs text-muted-foreground">
                  Rotacja {formatCycleStructure(activeProgram.cycle_days)} · następny trening po ostatniej ukończonej sesji
                </p>
              )}
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
              <form action={startSession.bind(null, suggested.dayId)} className="mt-md">
                <Button type="submit" className="w-full">
                  Zacznij trening
                </Button>
              </form>
            </div>
            {/* F1 (§3.2): stopka hero przejmuje WSZYSTKIE alternatywy jako ciche
                tekst-linki — koniec z trzema równorzędnymi drogami startu */}
            <div className="flex items-center gap-sm border-t px-md text-xs font-semibold text-primary">
              <Link href={`/programs/${activeId}`} className="flex min-h-11 items-center underline-offset-2 hover:underline">
                Podgląd ćwiczeń
              </Link>
              {activeDays.length > 1 && (
                <DayPickerSheet
                  programName={activeProgram?.name ?? "Aktywny plan"}
                  days={activeDays.map(({ id, label, position }) => ({ id, label, position }))}
                />
              )}
              <form action={startFreestyle} className="ml-auto">
                <button type="submit" className="min-h-11 underline-offset-2 hover:underline">
                  Bez planu
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Pusty stan (redesign-home.md §3.6, wariant B — bez zapamiętanej
             sugestii z onboardingu; wariant A wymaga persystencji poziom/
             środowisko z WelcomeOverlay, nie w tym zakresie, patrz HANDOFF) */
          <div className="space-y-sm">
            <div className="space-y-sm rounded-xl bg-card p-md text-center text-card-foreground shadow-md">
              <MomentIcon3D name="gym" className="mx-auto -my-xs" priority />
              <p className="text-2xl font-semibold leading-tight">Zacznij od planu</p>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                Wybierz jeden z {presetCount} planów. Arco poprowadzi Cię przez trening serię po serii.
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
                Bez planu
                <span className="block text-xs font-normal text-muted-foreground">
                  Zacznij bez planu i dodawaj ćwiczenia w trakcie
                </span>
              </button>
            </form>
          </div>
        )}

        {/* R2: przegląd planu jako kontekstowy, dismissowalny insight —
            komponent sam pilnuje progu 12 sesji i pamięta zamknięcie */}
        {activeProgram && (
          <ProgramReviewInsight
            programId={activeProgram.id}
            completedSessions={completedSessionsInActiveProgram}
          />
        )}

        <GuidanceChip items={guidance} />
      </main>
    </div>
  );
}
