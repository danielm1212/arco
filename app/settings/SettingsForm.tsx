"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UnitSystem } from "@/lib/types";

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

const COMMON_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25, 1, 0.5];

export function SettingsForm({
  unit,
  rest,
  bar,
  equipment,
  plates,
}: {
  unit: UnitSystem;
  rest: number;
  bar: number;
  equipment: string[];
  plates: number[];
}) {
  const [u, setU] = useState<UnitSystem>(unit);
  const [r, setR] = useState(rest);
  const [b, setB] = useState(bar);
  const [eq, setEq] = useState<string[]>(equipment);
  const [pl, setPl] = useState<number[]>(plates);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function toggle(item: string) {
    setEq((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
    );
  }

  function togglePlate(p: number) {
    setPl((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p].sort((a, b) => b - a),
    );
  }

  function save() {
    setSaved(false);
    startTransition(async () => {
      await updateSettings({
        unit_system: u,
        default_rest_seconds: r,
        bar_weight: b,
        available_equipment: eq,
        available_plates: pl,
      });
      setSaved(true);
    });
  }

  return (
    <div className="space-y-lg">
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

      <section className="grid grid-cols-2 gap-sm">
        <div className="space-y-xs">
          <h2 className="text-sm font-medium text-muted-foreground">Domyślny rest (s)</h2>
          <Input
            type="number"
            inputMode="numeric"
            value={r}
            onChange={(e) => setR(Number(e.target.value))}
          />
        </div>
        <div className="space-y-xs">
          <h2 className="text-sm font-medium text-muted-foreground">Gryf ({u})</h2>
          <Input
            type="number"
            inputMode="decimal"
            step="0.5"
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
          />
        </div>
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

      <section className="space-y-sm">
        <h2 className="text-sm font-medium text-muted-foreground">
          Dostępne talerze ({u}, na stronę) — kalkulator obciążenia
        </h2>
        <div className="flex flex-wrap gap-2xs">
          {COMMON_PLATES.map((p) => {
            const on = pl.includes(p);
            return (
              <button
                key={p}
                onClick={() => togglePlate(p)}
                className={`rounded-full border px-3 py-1 text-xs tabular-nums ${
                  on
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-input text-muted-foreground"
                }`}
              >
                {p}
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
