"use client";

import { useEffect, useState, useTransition } from "react";
import { useTheme } from "next-themes";
import { updateSettings } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UnitSystem } from "@/lib/types";

const THEMES = [
  { value: "light", label: "Jasny" },
  { value: "dark", label: "Ciemny" },
  { value: "system", label: "System" },
] as const;

const EQUIPMENT = [
  "barbell",
  "dumbbell",
  "kettlebells",
  "cable",
  "machine",
  "body only",
  "bands",
  "medicine ball",
  "exercise ball",
  "e-z curl bar",
  "foam roll",
  "other",
];

export function SettingsForm({
  unit,
  rest,
  equipment,
}: {
  unit: UnitSystem;
  rest: number;
  equipment: string[];
}) {
  const [u, setU] = useState<UnitSystem>(unit);
  const [r, setR] = useState(rest);
  const [eq, setEq] = useState<string[]>(equipment);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function toggle(item: string) {
    setEq((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
    );
  }

  function save() {
    setSaved(false);
    startTransition(async () => {
      await updateSettings({
        unit_system: u,
        default_rest_seconds: r,
        available_equipment: eq,
      });
      setSaved(true);
    });
  }

  return (
    <div className="space-y-lg">
      <section className="space-y-sm">
        <h2 className="text-sm font-medium text-muted-foreground">Motyw</h2>
        <div className="flex gap-xs">
          {THEMES.map((opt) => (
            <Button
              key={opt.value}
              variant={mounted && theme === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme(opt.value)}
              suppressHydrationWarning
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Logger zostaje ciemny niezależnie od wyboru (tryb skupienia).
        </p>
      </section>

      <section className="space-y-sm">
        <h2 className="text-sm font-medium text-muted-foreground">Jednostki</h2>
        <div className="flex gap-xs">
          {(["kg", "lbs"] as const).map((opt) => (
            <Button
              key={opt}
              variant={u === opt ? "default" : "outline"}
              size="sm"
              onClick={() => setU(opt)}
            >
              {opt}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-xs">
        <h2 className="text-sm font-medium text-muted-foreground">Domyślny rest (s)</h2>
        <Input
          type="number"
          inputMode="numeric"
          value={r}
          onChange={(e) => setR(Number(e.target.value))}
        />
      </section>

      <section className="space-y-sm">
        <h2 className="text-sm font-medium text-muted-foreground">
          Dostępny sprzęt (filtr podmiany)
        </h2>
        <div className="flex flex-wrap gap-2xs">
          {EQUIPMENT.map((item) => {
            const on = eq.includes(item);
            return (
              <button
                key={item}
                onClick={() => toggle(item)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  on
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-input text-muted-foreground"
                }`}
              >
                {item}
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
