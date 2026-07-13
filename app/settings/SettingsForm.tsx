"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { updateSettings } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { clampNum, LIMITS } from "@/lib/format";
import { getAutoRest, setAutoRest, getKeepAwake, setKeepAwake } from "@/lib/prefs";
import type { UnitSystem } from "@/lib/types";

const THEMES = [
  { value: "light", label: "Jasny" },
  { value: "dark", label: "Ciemny" },
  { value: "system", label: "System" },
] as const;

const EQUIPMENT = [
  ["barbell", "Sztanga"],
  ["dumbbell", "Hantle"],
  ["kettlebells", "Kettlebell"],
  ["cable", "Wyciąg"],
  ["machine", "Maszyny"],
  ["body only", "Masa ciała"],
  ["bands", "Gumy"],
  ["pull-up bar", "Drążek"],
  ["medicine ball", "Piłka lekarska"],
  ["exercise ball", "Piłka gimnastyczna"],
  ["e-z curl bar", "Gryf łamany"],
  ["foam roll", "Roller"],
  ["other", "Inne"],
] as const;
const subscribeToNothing = () => () => {};

export function SettingsForm({
  unit,
  rest,
  equipment,
  weeklyGoal,
  displayName,
}: {
  unit: UnitSystem;
  rest: number;
  equipment: string[];
  weeklyGoal: number;
  displayName: string;
}) {
  const [u, setU] = useState<UnitSystem>(unit);
  const [name, setName] = useState(displayName);
  const [r, setR] = useState(rest);
  const [eq, setEq] = useState<string[]>(equipment);
  const [goal, setGoal] = useState(weeklyGoal);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribeToNothing, () => true, () => false);

  function toggle(item: string) {
    setEq((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
    );
  }

  function save() {
    setSaved(false);
    startTransition(async () => {
      try {
        await updateSettings({
          unit_system: u,
          default_rest_seconds: r,
          available_equipment: eq,
          weekly_goal: goal,
          display_name: name.trim() || null,
        });
        setSaved(true);
        toast.success("Ustawienia zapisane.");
      } catch {
        toast.error("Nie udało się zapisać ustawień. Spróbuj ponownie.");
      }
    });
  }

  return (
    <div className="space-y-lg">
      <section className="space-y-xs">
        <h2 className="text-sm font-medium text-muted-foreground">Imię</h2>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          placeholder="Jak się do Ciebie zwracać?"
        />
        <p className="text-xs text-muted-foreground">Widoczne w powitaniu na ekranie Trening.</p>
      </section>

      <section className="space-y-sm">
        <h2 className="text-sm font-medium text-muted-foreground">Motyw</h2>
        <div className="flex gap-xs">
          {THEMES.map((opt) => (
            <Button
              key={opt.value}
              variant={mounted && theme === opt.value ? "default" : "outline"}
              aria-pressed={mounted && theme === opt.value}
              onClick={() => setTheme(opt.value)}
              suppressHydrationWarning
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Motyw zmienia się od razu. Pozostałe ustawienia zatwierdź przyciskiem Zapisz.
        </p>
      </section>

      <section className="space-y-sm">
        <h2 className="text-sm font-medium text-muted-foreground">Jednostki</h2>
        <div className="flex gap-xs">
          {(["kg", "lbs"] as const).map((opt) => (
            <Button
              key={opt}
              variant={u === opt ? "default" : "outline"}
              aria-pressed={u === opt}
              onClick={() => setU(opt)}
            >
              {opt}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-xs">
        <h2 className="text-sm font-medium text-muted-foreground">Domyślna przerwa (sekundy)</h2>
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          max={LIMITS.rest}
          value={r}
          onChange={(e) => setR(clampNum(Number(e.target.value), { max: LIMITS.rest }) ?? 0)}
        />
      </section>

      <section className="space-y-sm">
        <h2 className="text-sm font-medium text-muted-foreground">Trening</h2>
        {mounted ? <DevicePreferences /> : <DevicePreferences disabled />}
      </section>

      <section className="space-y-sm">
        <h2 className="text-sm font-medium text-muted-foreground">
          Cel tygodniowy
        </h2>
        <div className="flex gap-xs">
          {[2, 3, 4, 5].map((n) => (
            <Button
              key={n}
              variant={goal === n ? "default" : "outline"}
              aria-pressed={goal === n}
              onClick={() => setGoal(n)}
            >
              {n}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-sm">
        <h2 className="text-sm font-medium text-muted-foreground">
          Sprzęt dostępny do zamian
        </h2>
        <div className="flex flex-wrap gap-2xs">
          {EQUIPMENT.map(([value, label]) => {
            const on = eq.includes(value);
            return (
              <button
                key={value}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(value)}
                className={`min-h-11 rounded-full border px-4 py-2 text-sm ${
                  on
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-input text-muted-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex items-center gap-sm">
        <Button onClick={save} disabled={pending}>
          {pending ? "Zapisuję…" : "Zapisz"}
        </Button>
        {saved && <span className="text-sm text-success">Zapisano ✓</span>}
      </div>
    </div>
  );
}

function DevicePreferences({ disabled = false }: { disabled?: boolean }) {
  const [autoRest, setAutoRestState] = useState(() => (disabled ? true : getAutoRest()));
  const [keepAwake, setKeepAwakeState] = useState(() => (disabled ? true : getKeepAwake()));

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm">Automatyczna przerwa po serii</span>
        <Switch
          checked={autoRest}
          disabled={disabled}
          aria-label="Automatyczna przerwa po serii"
          onCheckedChange={(value) => {
            setAutoRest(value);
            setAutoRestState(value);
          }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm">Nie wygaszaj ekranu w treningu</span>
        <Switch
          checked={keepAwake}
          disabled={disabled}
          aria-label="Nie wygaszaj ekranu w treningu"
          onCheckedChange={(value) => {
            setKeepAwake(value);
            setKeepAwakeState(value);
          }}
        />
      </div>
    </>
  );
}
