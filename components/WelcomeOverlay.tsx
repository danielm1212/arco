"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { updateSettings } from "@/app/actions/settings";
import { setActiveProgram } from "@/app/actions/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UnitSystem } from "@/lib/types";

// v2 (S7): imię + poziom + środowisko → sugestia programu + cel tygodniowy.
const FLAG = "arco-onboarded-v2";

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
  programs: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [u, setU] = useState<UnitSystem>(unit);
  const [level, setLevel] = useState<Level | null>(null);
  const [env, setEnv] = useState<Env | null>(null);
  const [goal, setGoal] = useState(weeklyGoal);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (eligible && !localStorage.getItem(FLAG)) setShow(true);
  }, [eligible]);

  const suggestion = useMemo(() => {
    if (!level || !env) return null;
    const g = GRID[level][env];
    const program = programs.find((p) => p.name === g.name) ?? null;
    return program ? { ...g, id: program.id } : null;
  }, [level, env, programs]);

  if (!show) return null;

  async function saveProfile(withProgram: boolean) {
    setSaving(true);
    try {
      await updateSettings({
        unit_system: u,
        weekly_goal: goal,
        display_name: name.trim() || null,
      });
      if (withProgram && suggestion) await setActiveProgram(suggestion.id);
    } catch {
      /* preferencje można ustawić później w Ustawieniach */
    }
    localStorage.setItem(FLAG, "1");
    setShow(false);
    setSaving(false);
    router.refresh();
  }

  function skip() {
    localStorage.setItem(FLAG, "1");
    setShow(false);
    router.refresh();
  }

  const steps = 4;

  return (
    // fixed → poza pt-safe z <body>; własny safe-area (notch PWA, ekran pełnoekranowy)
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-brand p-md pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))] text-brand-foreground">
      <div className="flex justify-end">
        <button onClick={skip} className="text-sm text-muted-foreground">
          Pomiń
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-lg">
        {step === 0 && (
          <div className="space-y-md">
            <h1 className="text-3xl font-bold tracking-tight">Witaj w Arco 👋</h1>
            <p className="text-muted-foreground">
              Twój dziennik siłowni — programy, logger serii i postępy. Działa też offline.
            </p>
            <div className="space-y-xs">
              <p className="text-sm font-medium text-muted-foreground">Jak masz na imię?</p>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                placeholder="Imię (opcjonalnie)"
              />
            </div>
            <div className="space-y-xs">
              <p className="text-sm font-medium text-muted-foreground">Jednostki</p>
              <div className="flex gap-xs">
                {(["kg", "lbs"] as const).map((opt) => (
                  <Button
                    key={opt}
                    variant={u === opt ? "default" : "outline"}
                    onClick={() => setU(opt)}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-md">
            <h1 className="text-2xl font-bold tracking-tight">Twój poziom?</h1>
            <div className="space-y-xs">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setLevel(l.id);
                    setStep(2);
                  }}
                  className={`w-full rounded-xl border p-md text-left ${
                    level === l.id ? "border-primary bg-primary/10" : "border-input bg-card"
                  }`}
                >
                  <p className="font-medium">{l.label}</p>
                  <p className="text-xs text-muted-foreground">{l.hint}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-md">
            <h1 className="text-2xl font-bold tracking-tight">Gdzie trenujesz?</h1>
            <div className="space-y-xs">
              {ENVS.map((e) => (
                <button
                  key={e.id}
                  onClick={() => {
                    setEnv(e.id);
                    setStep(3);
                  }}
                  className={`w-full rounded-xl border p-md text-left ${
                    env === e.id ? "border-primary bg-primary/10" : "border-input bg-card"
                  }`}
                >
                  <p className="font-medium">{e.label}</p>
                  <p className="text-xs text-muted-foreground">{e.hint}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-md">
            <h1 className="text-2xl font-bold tracking-tight">Twój plan</h1>
            {suggestion ? (
              <div className="rounded-xl bg-primary p-md text-primary-foreground shadow-md">
                <p className="text-xs font-medium text-primary-foreground/80">Polecany program</p>
                <p className="mt-2xs text-xl font-bold leading-tight">{suggestion.name}</p>
                {suggestion.note && (
                  <p className="mt-xs text-xs text-primary-foreground/80">{suggestion.note}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Wybierzesz program później w bibliotece.
              </p>
            )}
            <div className="space-y-xs">
              <p className="text-sm font-medium text-muted-foreground">
                Ile treningów tygodniowo planujesz?
              </p>
              <div className="flex gap-xs">
                {[2, 3, 4, 5].map((n) => (
                  <Button
                    key={n}
                    variant={goal === n ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setGoal(n)}
                  >
                    {n}
                  </Button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Cel napędza pasek tygodnia i passę — zmienisz w Ustawieniach.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-md">
        <div className="flex justify-center gap-xs">
          {Array.from({ length: steps }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-primary" : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>
        {step === 0 && (
          <Button size="lg" className="w-full" onClick={() => setStep(1)}>
            Dalej
          </Button>
        )}
        {(step === 1 || step === 2) && (
          <Button
            size="lg"
            variant="ghost"
            className="w-full"
            onClick={() => setStep(step + 1)}
          >
            Pomiń ten krok
          </Button>
        )}
        {step === 3 && (
          <div className="space-y-xs">
            {suggestion && (
              <Button size="lg" className="w-full" disabled={saving} onClick={() => saveProfile(true)}>
                {saving ? "Zapisuję…" : "Ustaw program i zaczynamy 💪"}
              </Button>
            )}
            <Button
              size="lg"
              variant={suggestion ? "ghost" : "default"}
              className="w-full"
              disabled={saving}
              onClick={() => saveProfile(false)}
            >
              {suggestion ? "Bez programu — sam wybiorę" : "Zaczynam 💪"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
