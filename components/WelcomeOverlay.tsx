"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { updateSettings } from "@/app/actions/settings";
import { setActiveProgram } from "@/app/actions/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { track } from "@/lib/analytics";
import type { UnitSystem } from "@/lib/types";

// Onboarding v3 (docs/onboarding-v3.md, akcept [Ty] 2026-07-11):
// E0 moment (Gambarino) → E1 imię+jednostki → E2 gdzie → E3 poziom →
// E4 cel (default wg poziomu) → E5 karta planu „Aktywuj" + mikro-potwierdzenie.
// Jedna decyzja na ekran · ≤60 s · wszystko skipowalne · kropki + wstecz.
// Na sand: teksty wtórne w brand-muted (stone), NIE muted-foreground (O5).
const FLAG = "arco-onboarded-v3";

type Level = "beginner" | "intermediate" | "advanced";
type Env = "gym" | "home" | "bodyweight";

const LEVELS: { id: Level; label: string; hint: string }[] = [
  { id: "beginner", label: "Zaczynam", hint: "pierwsze miesiące albo powrót po przerwie" },
  { id: "intermediate", label: "Trenuję regularnie", hint: "rok+ systematycznych treningów" },
  { id: "advanced", label: "Zaawansowany", hint: "kilka lat, znam swoje liczby" },
];

const ENVS: { id: Env; label: string; hint: string }[] = [
  { id: "gym", label: "Siłownia", hint: "pełny sprzęt" },
  { id: "home", label: "Dom z hantlami", hint: "regulowane hantle + ławka" },
  { id: "bodyweight", label: "Masa ciała", hint: "bez sprzętu / drążek" },
];

/** Default celu tygodniowego wg poziomu (onboarding-v3 §E4). */
const GOAL_DEFAULT: Record<Level, number> = { beginner: 2, intermediate: 3, advanced: 4 };

/**
 * Mapowanie poziom×środowisko → nazwa programu z seedu (grid docs/trainings/).
 * Braki gridu wg README trainings: adv×home → PPL ze swapami DB;
 * (intermediate|advanced)×bodyweight → beginner-bodyweight z twardszą progresją.
 */
const GRID: Record<Level, Record<Env, { name: string; note?: string }>> = {
  beginner: {
    gym: { name: "Beginner · Siłownia · Full Body 3×" },
    home: { name: "Beginner · Dom z hantlami · Full Body 3×" },
    bodyweight: { name: "Beginner · Masa ciała · Full Body 3×" },
  },
  intermediate: {
    gym: { name: "Intermediate · Siłownia · Upper / Lower 4×" },
    home: { name: "Intermediate · Dom z hantlami · Upper / Lower 4×" },
    bodyweight: {
      name: "Beginner · Masa ciała · Full Body 3×",
      note: "Ten sam szkielet — celuj w trudniejsze wariacje (drabinki w opisie programu).",
    },
  },
  advanced: {
    gym: { name: "Advanced · Siłownia · Push / Pull / Legs 6×" },
    home: {
      name: "Advanced · Siłownia · Push / Pull / Legs 6×",
      note: "Wersja hantlowa: podmieniaj na warianty DB (⇄ w loggerze); unilateral + tempo, gdy zabraknie ciężaru.",
    },
    bodyweight: {
      name: "Beginner · Masa ciała · Full Body 3×",
      note: "Zaawansowana kalistenika to osobna dyscyplina — startuj z najtrudniejszych wariacji.",
    },
  },
};

export function WelcomeOverlay({
  eligible,
  unit,
  weeklyGoal,
  programs,
}: {
  eligible: boolean;
  unit: UnitSystem;
  weeklyGoal: number;
  programs: { id: string; name: string; days_per_week: number }[];
}) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  // 0=E0 moment · 1=E1 ty · 2=E2 gdzie · 3=E3 poziom · 4=E4 cel · 5=E5 plan · 6=potwierdzenie
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [u, setU] = useState<UnitSystem>(unit);
  const [level, setLevel] = useState<Level | null>(null);
  const [env, setEnv] = useState<Env | null>(null);
  const [goal, setGoal] = useState(weeklyGoal);
  const [goalTouched, setGoalTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (eligible && !localStorage.getItem(FLAG)) setShow(true);
  }, [eligible]);

  // E4: default celu wg poziomu — dopóki user sam nie dotknął wyboru
  useEffect(() => {
    if (level && !goalTouched) setGoal(GOAL_DEFAULT[level]);
  }, [level, goalTouched]);

  const suggestion = useMemo(() => {
    if (!level || !env) return null;
    const g = GRID[level][env];
    const program = programs.find((p) => p.name === g.name) ?? null;
    return program ? { ...g, id: program.id, daysPerWeek: program.days_per_week } : null;
  }, [level, env, programs]);

  if (!show) return null;

  function finish() {
    localStorage.setItem(FLAG, "1");
    setShow(false);
    router.refresh();
  }

  async function saveProfile(activate: boolean) {
    setSaving(true);
    try {
      await updateSettings({
        unit_system: u,
        weekly_goal: goal,
        display_name: name.trim() || null,
      });
      if (activate && suggestion) await setActiveProgram(suggestion.id);
    } catch {
      /* preferencje można ustawić później w Ustawieniach */
    }
    track({
      name: "onboarding_completed",
      props: {
        level: level ?? "skip",
        env: env ?? "skip",
        suggested_program_accepted: activate && !!suggestion,
      },
    });
    setSaving(false);
    if (activate && suggestion) {
      // E5 → mikro-potwierdzenie (0,9 s), potem home z hero „Dziś" gotowym na Start
      setStep(6);
      window.setTimeout(finish, 900);
    } else {
      finish();
    }
  }

  function skipAll() {
    track({ name: "onboarding_skipped", props: { step } });
    finish();
  }

  const dots = 5; // E1–E5

  return (
    // fixed → poza pt-safe z <body>; własny safe-area (notch PWA, ekran pełnoekranowy)
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-brand p-md pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))] text-brand-foreground">
      <div className="flex min-h-9 items-center justify-between">
        {step >= 1 && step <= 5 ? (
          <button
            onClick={() => setStep(step - 1)}
            aria-label="Wstecz"
            className="-ml-1 flex h-9 w-9 items-center justify-center text-brand-muted"
          >
            <ArrowLeft className="size-5" />
          </button>
        ) : (
          <span />
        )}
        {step <= 5 && (
          <button onClick={skipAll} className="text-sm text-brand-muted">
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
              Nie odpuszczaj.
            </h1>
            <p className="text-lg text-brand-muted">60 sekund i masz plan od trenera.</p>
          </div>
        )}

        {/* E1 · TY — imię (opcjonalne) + jednostki (glance-confirm, kg default) */}
        {step === 1 && (
          <div className="space-y-md">
            <h1 className="text-2xl font-semibold tracking-tight">Jak mamy na Ciebie wołać?</h1>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder="Imię (opcjonalnie)"
              autoFocus
            />
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
            <h1 className="text-2xl font-semibold tracking-tight">Twoje doświadczenie?</h1>
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

        {/* E4 · CEL — default wg poziomu, copy „życiowo, nie ambitnie" */}
        {step === 4 && (
          <div className="space-y-md">
            <h1 className="text-2xl font-semibold tracking-tight">Ile treningów w tygodniu?</h1>
            <div className="flex gap-xs">
              {[2, 3, 4, 5].map((n) => (
                <Button
                  key={n}
                  variant={goal === n ? "default" : "outline"}
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
              Ustaw życiowo, nie ambitnie — passa liczy się tygodniami, a cel podniesiesz jednym
              tapem w Ustawieniach.
            </p>
            <Button size="lg" className="w-full" onClick={() => setStep(5)}>
              Dalej
            </Button>
          </div>
        )}

        {/* E5 · WYNIK (outcome-first) — karta planu; świadomie BEZ auto-startu Dnia A */}
        {step === 5 && (
          <div className="space-y-md">
            {suggestion ? (
              <>
                <p className="text-sm text-brand-muted">Twój plan, dopasowany:</p>
                <div className="rounded-xl bg-card p-md text-card-foreground shadow-md">
                  <p className="text-xl font-semibold leading-tight">{suggestion.name}</p>
                  <p className="mt-2xs text-xs text-muted-foreground">
                    plan od trenera · {suggestion.daysPerWeek}{" "}
                    {suggestion.daysPerWeek === 1 ? "dzień" : "dni"}/tydz.
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
                  Inny program
                </Button>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-semibold tracking-tight">Prawie gotowe</h1>
                <p className="text-sm text-brand-muted">
                  Wybierz program w bibliotece — 8 planów od trenera czeka.
                </p>
                <Button
                  size="lg"
                  className="w-full"
                  disabled={saving}
                  onClick={() => saveProfile(false)}
                >
                  {saving ? "Zapisuję…" : "Przejdź do biblioteki"}
                </Button>
              </>
            )}
          </div>
        )}

        {/* Mikro-potwierdzenie po aktywacji (0,9 s) — domknięcie pętli E5 */}
        {step === 6 && (
          <div className="flex flex-col items-center gap-md text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-7" />
            </span>
            <p className="text-lg font-semibold">Plan gotowy</p>
            <p className="text-sm text-brand-muted">
              Czeka na ekranie głównym — wystartujesz jednym tapem.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-md">
        {step >= 1 && step <= 5 && (
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
        {(step === 2 || step === 3) && (
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
