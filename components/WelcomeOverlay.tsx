"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { updateSettings } from "@/app/actions/settings";
import { saveActiveProgram } from "@/app/actions/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MomentIcon3D } from "@/components/MomentIcon3D";
import { track } from "@/lib/analytics";
import {
  EQUIPMENT_BY_ENVIRONMENT,
  formatCycleStructure,
  formatEquipment,
  formatEstimatedMinutes,
  formatFrequency,
  recommendProgram,
  type ProgramCandidate,
  type TrainingEnvironment,
  type TrainingLevel,
} from "@/lib/programRecommendation";
import type { UnitSystem } from "@/lib/types";
import {
  DEFAULT_TRAINING_PRIORITY,
  TRAINING_PRIORITIES,
  type TrainingPriority,
} from "@/lib/trainingPriority";

// Onboarding v3 (docs/onboarding-v3.md, akcept [Ty] 2026-07-11):
// E0 moment (Gambarino) → E1 imię+jednostki → E2 gdzie → E3 poziom →
// E4 priorytet → E5 rytm (default wg poziomu) → E6 karta planu + potwierdzenie.
// Jedna decyzja na ekran · ≤60 s · wszystko skipowalne · kropki + wstecz.
// Na sand: teksty wtórne w brand-muted (stone), NIE muted-foreground (O5).
const FLAG = "arco-onboarded-v3";

const LEVELS: { id: TrainingLevel; label: string; hint: string }[] = [
  { id: "beginner", label: "Zaczynam", hint: "Dopiero zaczynam albo wracam po przerwie." },
  { id: "intermediate", label: "Trenuję regularnie", hint: "Mam co najmniej rok regularnych treningów." },
  { id: "advanced", label: "Mam doświadczenie", hint: "Trenuję od kilku lat i znam swoje wyniki." },
];

const ENVS: { id: TrainingEnvironment; label: string; hint: string }[] = [
  { id: "gym", label: "Siłownia", hint: "Mam dostęp do pełnego sprzętu." },
  { id: "home", label: "Dom z hantlami", hint: "Mam hantle i ławkę." },
  { id: "bodyweight", label: "Masa ciała", hint: "Drążek mile widziany — każde ćwiczenie ma zamiennik bez sprzętu." },
];

/** Default celu tygodniowego wg poziomu (onboarding-v3 §E4). */
const GOAL_DEFAULT: Record<TrainingLevel, number> = { beginner: 2, intermediate: 3, advanced: 4 };
const subscribeToNothing = () => () => {};

const LEVEL_REASON: Record<TrainingLevel, string> = {
  beginner: "zaczynasz albo wracasz po przerwie",
  intermediate: "trenujesz już regularnie",
  advanced: "masz duże doświadczenie treningowe",
};

const ENV_REASON: Record<TrainingEnvironment, string> = {
  gym: "trenujesz na siłowni",
  home: "trenujesz w domu z hantlami",
  bodyweight: "trenujesz głównie masą ciała",
};

/** Polska odmiana liczebnika przy „trening": 1 trening, 2–4 treningi, 5+ treningów. */
function pluralTreningow(n: number) {
  if (n === 1) return "trening";
  const lastTwo = n % 100;
  const lastDigit = n % 10;
  if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return "treningi";
  return "treningów";
}

function recommendationRhythmCopy(suggestion: ReturnType<typeof recommendProgram>) {
  if (!suggestion) return "Pokażemy najbliższy plan dla Twojego rytmu.";
  const rhythm = `${formatCycleStructure(suggestion.program.cycle_days)} · ${formatFrequency(
    suggestion.program.frequency_min!,
    suggestion.program.frequency_max!,
  )}`;
  return suggestion.exact
    ? `Twój plan będzie działał w rytmie: ${rhythm}.`
    : `Najbliższy pasujący plan działa w rytmie: ${rhythm}.`;
}

export function WelcomeOverlay({
  eligible,
  unit,
  weeklyGoal,
  programs,
}: {
  eligible: boolean;
  unit: UnitSystem;
  weeklyGoal: number;
  programs: ProgramCandidate[];
}) {
  const router = useRouter();
  const eligibleToShow = useSyncExternalStore(
    subscribeToNothing,
    () => eligible && !localStorage.getItem(FLAG),
    () => false,
  );
  const [dismissed, setDismissed] = useState(false);
  // 0=moment · 1=ty · 2=gdzie · 3=poziom · 4=priorytet · 5=rytm · 6=plan · 7=potwierdzenie
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [u, setU] = useState<UnitSystem>(unit);
  const [level, setLevel] = useState<TrainingLevel | null>(null);
  const [env, setEnv] = useState<TrainingEnvironment | null>(null);
  const [goal, setGoal] = useState(weeklyGoal);
  const [goalTouched, setGoalTouched] = useState(false);
  const [priority, setPriority] = useState<TrainingPriority>(DEFAULT_TRAINING_PRIORITY);
  const [saving, setSaving] = useState(false);
  // E4: default celu wg poziomu — dopóki user sam nie dotknął wyboru.
  const effectiveGoal = level && !goalTouched ? GOAL_DEFAULT[level] : goal;

  const suggestion = useMemo(() => {
    if (!level || !env) return null;
    return recommendProgram({
      programs,
      level,
      environment: env,
      weeklyGoal: effectiveGoal,
      availableEquipment: EQUIPMENT_BY_ENVIRONMENT[env],
    });
  }, [level, env, effectiveGoal, programs]);

  if (!eligibleToShow || dismissed) return null;

  function finish() {
    localStorage.setItem(FLAG, "1");
    setDismissed(true);
    router.refresh();
  }

  async function saveProfile(activate: boolean) {
    setSaving(true);
    try {
      const profileSettings = {
        unit_system: u,
        weekly_goal: effectiveGoal,
        training_priority: priority,
        display_name: name.trim() || null,
        ...(env ? { available_equipment: EQUIPMENT_BY_ENVIRONMENT[env] } : {}),
      };
      await updateSettings(profileSettings);
      if (activate && suggestion) {
        await saveActiveProgram(suggestion.program.id);
        if (suggestion.program.slug) {
          track({
            name: "program_activated",
            props: { program_slug: suggestion.program.slug, source: "onboarding" },
          });
        }
      }
    } catch {
      toast.error("Nie udało się zapisać ustawień. Sprawdź połączenie i spróbuj ponownie.");
      setSaving(false);
      return;
    }
    track({
      name: "onboarding_completed",
      props: {
        level: level ?? "skip",
        env: env ?? "skip",
        weekly_goal: effectiveGoal,
        recommendation_kind: suggestion ? (suggestion.exact ? "exact" : "fallback") : "none",
        program_slug: suggestion?.program.slug ?? null,
        suggested_program_accepted: activate && !!suggestion,
      },
    });
    setSaving(false);
    if (activate && suggestion) {
      // E6 → mikro-potwierdzenie E7 (0,9 s), potem home z hero „Dziś" gotowym na Start
      setStep(7);
      window.setTimeout(finish, 900);
    } else {
      finish();
    }
  }

  function skipAll() {
    // Od E5 user ma już wpisany profil (imię/jednostki/cel/priorytet) — „Pomiń"
    // ma go zapisać, nie zgubić w milczeniu (O2). Na E6 przycisk jest ukryty:
    // obie gałęzie E6 mają już dwa jawne wyjścia (O1).
    if (step >= 5) {
      void saveProfile(false);
      return;
    }
    track({ name: "onboarding_skipped", props: { step } });
    finish();
  }

  const dots = 6;

  return (
    // fixed → poza pt-safe z <body>; własny safe-area (notch PWA, ekran pełnoekranowy)
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-brand p-md pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))] text-brand-foreground">
      <div className="flex min-h-11 items-center justify-between">
        {step >= 1 && step <= 6 ? (
          <button
            onClick={() => setStep(step - 1)}
            aria-label="Wstecz"
            className="-ml-1 flex size-11 items-center justify-center rounded-full text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft className="size-5" />
          </button>
        ) : (
          <span />
        )}
        {step <= 5 && (
          <button onClick={skipAll} className="min-h-11 px-2 text-sm text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            Pomiń
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center gap-lg">
        {/* E0 · MOMENT — jedyny ekran bez decyzji; retro-analog debiutuje w produkcie */}
        {step === 0 && (
          <div className="space-y-lg">
            <h1 className="font-display text-5xl uppercase leading-[1.04] tracking-tight">
              Trenuj.
              <br />
              Zapisuj.
              <br />
              Rób postęp.
            </h1>
            <p className="text-lg text-brand-muted">Minuta i masz plan na pierwszy trening.</p>
          </div>
        )}

        {/* E1 · TY — imię (opcjonalne) + jednostki (glance-confirm, kg default) */}
        {step === 1 && (
          <div className="space-y-md">
            <h1 className="text-2xl font-semibold tracking-tight">Jak masz na imię?</h1>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder="Imię (opcjonalnie)"
              autoFocus
            />
            <p className="-mt-xs text-xs text-brand-muted">Będziemy mówić po imieniu. Możesz zostawić puste.</p>
            <div className="space-y-xs">
              <p className="text-sm font-medium text-brand-muted">Jednostki</p>
              <div className="flex gap-xs">
                {(["kg", "lbs"] as const).map((opt) => (
                  <Button
                    key={opt}
                    variant={u === opt ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setU(opt)}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* E2 · GDZIE — auto-advance */}
        {step === 2 && (
          <div className="space-y-md">
            <h1 className="text-2xl font-semibold tracking-tight">Gdzie trenujesz?</h1>
            <div className="space-y-xs">
              {ENVS.map((e) => (
                <button
                  key={e.id}
                  onClick={() => {
                    setEnv(e.id);
                    setStep(3);
                  }}
                  className={`w-full rounded-xl border p-md text-left ${
                    env === e.id
                      ? "border-primary bg-primary/10"
                      : "border-input bg-card text-card-foreground"
                  }`}
                >
                  <p className="font-medium">{e.label}</p>
                  <p className="text-xs text-muted-foreground">{e.hint}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* E3 · POZIOM — auto-advance */}
        {step === 3 && (
          <div className="space-y-md">
            <h1 className="text-2xl font-semibold tracking-tight">Ile masz doświadczenia?</h1>
            <div className="space-y-xs">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setLevel(l.id);
                    setStep(4);
                  }}
                  className={`w-full rounded-xl border p-md text-left ${
                    level === l.id
                      ? "border-primary bg-primary/10"
                      : "border-input bg-card text-card-foreground"
                  }`}
                >
                  <p className="font-medium">{l.label}</p>
                  <p className="text-xs text-muted-foreground">{l.hint}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* E4 · PRIORYTET — język prosty dla osoby początkującej, bez „bazy". */}
        {step === 4 && (
          <div className="space-y-md">
            <h1 className="text-2xl font-semibold tracking-tight">Co jest teraz najważniejsze?</h1>
            <p className="text-sm text-brand-muted">Nie zmienia to planu. Dopasujemy do tego wskazówki w treningu.</p>
            <div className="space-y-xs">
              {TRAINING_PRIORITIES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setPriority(item.id);
                    setStep(5);
                  }}
                  className={`w-full rounded-xl border p-md text-left ${
                    priority === item.id
                      ? "border-primary bg-primary/10"
                      : "border-input bg-card text-card-foreground"
                  }`}
                >
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.hint}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* E5 · RYTM — default wg poziomu, copy „życiowo, nie ambitnie" */}
        {step === 5 && (
          <div className="space-y-md">
            <h1 className="text-2xl font-semibold tracking-tight">Ile treningów w tygodniu?</h1>
            <div className="flex gap-xs">
              {[2, 3, 4, 5].map((n) => (
                <Button
                  key={n}
                  variant={effectiveGoal === n ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => {
                    setGoal(n);
                    setGoalTouched(true);
                  }}
                >
                  {n}
                </Button>
              ))}
            </div>
            <p className="text-sm text-brand-muted">
              Wybierz liczbę, którą spokojnie utrzymasz. Cel możesz zmienić w ustawieniach.
            </p>
            <p className="rounded-lg bg-brand-foreground/8 px-sm py-xs text-sm font-medium text-brand-foreground">
              {recommendationRhythmCopy(suggestion)}
            </p>
            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                if (suggestion?.program.slug && level && env) {
                  track({
                    name: "program_recommended",
                    props: {
                      program_slug: suggestion.program.slug,
                      level,
                      env,
                      weekly_goal: effectiveGoal,
                      match: suggestion.exact ? "exact" : "fallback",
                    },
                  });
                }
                setStep(6);
              }}
            >
              Dalej
            </Button>
          </div>
        )}

        {/* E6 · WYNIK (outcome-first) — karta planu; świadomie BEZ auto-startu Dnia A */}
        {step === 6 && (
          <div className="space-y-md">
            {suggestion ? (
              <>
                <p className="text-sm text-brand-muted">
                  {suggestion.exact ? "Dopasowany plan" : "Najbliższy plan w bibliotece"}
                </p>
                <div className="rounded-xl bg-card p-md text-card-foreground shadow-md">
                  <p className="text-xl font-semibold leading-tight">{suggestion.program.name}</p>
                  <p className="mt-2xs text-sm text-muted-foreground">
                    Wybraliśmy go, bo {LEVEL_REASON[level!]}, {ENV_REASON[env!]} i wybierasz {effectiveGoal}{" "}
                    {pluralTreningow(effectiveGoal)} w tygodniu.
                  </p>
                  <dl className="mt-sm grid grid-cols-2 gap-xs text-xs">
                    <div className="rounded-lg bg-secondary p-sm">
                      <dt className="text-muted-foreground">Twój rytm</dt>
                      <dd className="mt-2xs font-medium">{formatFrequency(suggestion.program.frequency_min!, suggestion.program.frequency_max!)}</dd>
                    </div>
                    <div className="rounded-lg bg-secondary p-sm">
                      <dt className="text-muted-foreground">Kolejność</dt>
                      <dd className="mt-2xs font-medium">{formatCycleStructure(suggestion.program.cycle_days)}</dd>
                    </div>
                    <div className="rounded-lg bg-secondary p-sm">
                      <dt className="text-muted-foreground">Czas treningu</dt>
                      <dd className="mt-2xs font-medium">
                        {formatEstimatedMinutes(
                          suggestion.program.estimated_minutes_min,
                          suggestion.program.estimated_minutes_max,
                        ) ?? "według tempa"}
                      </dd>
                    </div>
                    <div className="rounded-lg bg-secondary p-sm">
                      <dt className="text-muted-foreground">Potrzebujesz</dt>
                      <dd className="mt-2xs font-medium">
                        {formatEquipment(suggestion.program.required_equipment, 2) || "podstawowy sprzęt"}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-sm text-xs text-muted-foreground">
                    Progresja: gdy wykonasz górny zakres powtórzeń we wszystkich seriach z dobrą techniką, następnym razem dołóż najmniejszy ciężar.
                  </p>
                  {suggestion.note && (
                    <p className="mt-xs text-xs text-muted-foreground">{suggestion.note}</p>
                  )}
                </div>
                <Button
                  size="lg"
                  className="w-full"
                  disabled={saving}
                  onClick={() => saveProfile(true)}
                >
                  {saving ? "Zapisuję…" : "Aktywuj plan"}
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full text-brand-foreground"
                  disabled={saving}
                  onClick={() => saveProfile(false).then(() => router.push("/programs"))}
                >
                  Wybierz inny program
                </Button>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-semibold tracking-tight">Prawie gotowe</h1>
                <p className="text-sm text-brand-muted">
                  W bibliotece czeka {programs.filter((program) => program.slug).length} gotowych programów. Wybierz ten, który pasuje do Ciebie.
                </p>
                <Button
                  size="lg"
                  className="w-full"
                  disabled={saving}
                  onClick={() => saveProfile(false).then(() => router.push("/programs"))}
                >
                  {saving ? "Zapisuję…" : "Przejdź do biblioteki"}
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full text-brand-foreground"
                  disabled={saving}
                  onClick={() => saveProfile(false)}
                >
                  Wybiorę później
                </Button>
              </>
            )}
          </div>
        )}

        {/* Mikro-potwierdzenie po aktywacji (0,9 s) — domknięcie pętli E5 */}
        {step === 7 && (
          <div className="flex flex-col items-center gap-md text-center">
            <MomentIcon3D name="rocket" className="-my-sm size-24" priority />
            <p className="text-lg font-semibold">Plan gotowy</p>
            <p className="text-sm text-brand-muted">
              Czeka na ekranie głównym. Możesz od razu zacząć trening.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-md">
        {step >= 1 && step <= 6 && (
          <div className="flex justify-center gap-xs" aria-hidden>
            {Array.from({ length: dots }, (_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step - 1 ? "w-6 bg-primary" : "w-1.5 bg-brand-foreground/15"
                }`}
              />
            ))}
          </div>
        )}
        {step === 0 && (
          <Button size="lg" className="w-full" onClick={() => setStep(1)}>
            Zaczynamy →
          </Button>
        )}
        {step === 1 && (
          <Button size="lg" className="w-full" onClick={() => setStep(2)}>
            Dalej
          </Button>
        )}
        {(step === 2 || step === 3 || step === 4) && (
          <Button
            size="lg"
            variant="ghost"
            className="w-full text-brand-muted"
            onClick={() => {
              track({ name: "onboarding_skipped", props: { step } });
              setStep(step + 1);
            }}
          >
            Pomiń ten krok
          </Button>
        )}
      </div>
    </div>
  );
}
