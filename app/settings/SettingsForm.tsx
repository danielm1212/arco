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
import { TRAINING_PRIORITIES, type TrainingPriority } from "@/lib/trainingPriority";
import { PROGRAM_FOCUSES, type ProgramFocus } from "@/lib/programRecommendation";
import { DraftRecoveryNotice } from "@/components/forms/DraftRecoveryNotice";
import { useDirtyGuard } from "@/components/navigation/DirtyGuard";
import { usePersistentFormDraft } from "@/lib/usePersistentFormDraft";

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
type SettingsDraft = {
  unit: UnitSystem;
  name: string;
  rest: number;
  equipment: string[];
  weeklyGoal: number;
  priority: TrainingPriority;
  focus: ProgramFocus;
};

const isSettingsDraft = (candidate: unknown): candidate is SettingsDraft => {
  if (!candidate || typeof candidate !== "object") return false;
  const value = candidate as Partial<SettingsDraft>;
  return (
    (value.unit === "kg" || value.unit === "lbs") &&
    typeof value.name === "string" &&
    typeof value.rest === "number" &&
    Array.isArray(value.equipment) &&
    value.equipment.every((item) => typeof item === "string") &&
    typeof value.weeklyGoal === "number" &&
    TRAINING_PRIORITIES.some((item) => item.id === value.priority) &&
    PROGRAM_FOCUSES.some((item) => item.id === value.focus)
  );
};

const normalizedSettings = (value: SettingsDraft) => ({
  ...value,
  equipment: [...value.equipment].sort(),
});

export function SettingsForm({
  unit,
  rest,
  equipment,
  weeklyGoal,
  displayName,
  priority,
  focus,
  userId,
}: {
  unit: UnitSystem;
  rest: number;
  equipment: string[];
  weeklyGoal: number;
  displayName: string;
  priority: TrainingPriority;
  focus: ProgramFocus;
  userId: string;
}) {
  const [u, setU] = useState<UnitSystem>(unit);
  const [name, setName] = useState(displayName);
  const [r, setR] = useState(rest);
  const [eq, setEq] = useState<string[]>(equipment);
  const [goal, setGoal] = useState(weeklyGoal);
  const [trainingPriority, setTrainingPriority] = useState<TrainingPriority>(priority);
  const [trainingFocus, setTrainingFocus] = useState<ProgramFocus>(focus);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribeToNothing, () => true, () => false);
  const [baseline, setBaseline] = useState<SettingsDraft>(() => ({
    unit,
    name: displayName,
    rest,
    equipment,
    weeklyGoal,
    priority,
    focus,
  }));
  const draft: SettingsDraft = {
    unit: u,
    name,
    rest: r,
    equipment: eq,
    weeklyGoal: goal,
    priority: trainingPriority,
    focus: trainingFocus,
  };
  const dirty =
    JSON.stringify(normalizedSettings(draft)) !==
    JSON.stringify(normalizedSettings(baseline));
  const { recovered, clearDraft } = usePersistentFormDraft({
    storageKey: `arco-draft-settings-v1:${userId}`,
    value: draft,
    enabled: dirty,
    isValid: isSettingsDraft,
    onRestore: (value) => {
      setU(value.unit);
      setName(value.name);
      setR(value.rest);
      setEq(value.equipment);
      setGoal(value.weeklyGoal);
      setTrainingPriority(value.priority);
      setTrainingFocus(value.focus);
    },
  });
  useDirtyGuard({
    dirty,
    onDiscard: clearDraft,
    message: "Niezapisane ustawienia są zachowane jako szkic. Odrzucenie zmian przywróci ostatnią zapisaną konfigurację.",
  });

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
          training_priority: trainingPriority,
          training_focus: trainingFocus,
        });
        setBaseline(draft);
        clearDraft();
        setSaved(true);
        toast.success("Ustawienia zapisane.");
      } catch {
        toast.error("Nie udało się zapisać ustawień. Spróbuj ponownie.");
      }
    });
  }

  return (
    <div className="space-y-lg">
      {recovered && (
        <DraftRecoveryNotice
          onClear={() => {
            setU(baseline.unit);
            setName(baseline.name);
            setR(baseline.rest);
            setEq(baseline.equipment);
            setGoal(baseline.weeklyGoal);
            setTrainingPriority(baseline.priority);
            setTrainingFocus(baseline.focus);
            clearDraft();
          }}
        >
          Przywróciliśmy ustawienia zmienione przed zamknięciem aplikacji.
        </DraftRecoveryNotice>
      )}
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
        <h2 className="text-sm font-medium text-muted-foreground">Aktualny priorytet</h2>
        <div className="space-y-xs">
          {TRAINING_PRIORITIES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={trainingPriority === item.id}
              onClick={() => setTrainingPriority(item.id)}
              className={`w-full rounded-xl border p-sm text-left ${
                trainingPriority === item.id
                  ? "border-primary bg-primary/10"
                  : "border-input text-muted-foreground"
              }`}
            >
              <span className="block text-sm font-medium text-foreground">{item.label}</span>
              <span className="block text-xs">{item.hint}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Plan zostaje ten sam — zmieniamy wskazówki dotyczące progresji i regeneracji.</p>
      </section>

      <section className="space-y-sm">
        <h2 className="text-sm font-medium text-muted-foreground">Kierunek programu</h2>
        <div className="space-y-xs">
          {PROGRAM_FOCUSES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={trainingFocus === item.id}
              onClick={() => setTrainingFocus(item.id)}
              className={`w-full rounded-xl border p-sm text-left ${
                trainingFocus === item.id
                  ? "border-primary bg-primary/10"
                  : "border-input text-muted-foreground"
              }`}
            >
              <span className="block text-sm font-medium text-foreground">{item.label}</span>
              <span className="block text-xs">{item.hint}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Dopasowuje oznaczenia i kolejność w bibliotece. Nie zmienia aktywnego planu automatycznie.</p>
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
