"use client";

import { Input } from "@/components/ui/input";
import { clampNum, LIMITS } from "@/lib/format";
import type { ExerciseType, SessionSet, SetType, UnitSystem } from "@/lib/types";

export interface PrevSet {
  set_index: number;
  weight: number | null;
  reps: number | null;
  duration_seconds: number | null;
  added_weight: number | null;
}

const parseNum = (v: string): number | null => {
  if (v.trim() === "") return null;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

export function SetRow({
  index,
  set,
  prev,
  type,
  showRpe = false,
  onPatch,
  onPersist,
  onToggle,
  onDelete,
}: {
  index: number;
  set: SessionSet;
  prev: PrevSet | null;
  type: ExerciseType;
  unit: UnitSystem;
  showRpe?: boolean;
  onPatch: (patch: Partial<SessionSet>) => void;
  onPersist: (patch: Partial<SessionSet>) => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const isWarmup = set.set_type === "warmup";
  // Placeholder = poprzedni wynik (szary podpowiadacz). Jednostki opisują nagłówki kolumn.
  const ph = (n: number | null | undefined) => (n != null ? String(n) : undefined);

  return (
    <li className="flex flex-wrap items-center gap-xs">
      {/* Jawny przełącznik typu serii — obramowany, więc widać że klikalny */}
      <button
        onClick={() => {
          const next: SetType = isWarmup ? "working" : "warmup";
          onPatch({ set_type: next });
          onPersist({ set_type: next });
        }}
        className={`h-9 w-7 shrink-0 rounded-md border text-xs font-medium tabular-nums ${
          isWarmup
            ? "border-warning bg-warning/15 text-warning"
            : "border-input text-muted-foreground"
        }`}
        title={isWarmup ? "rozgrzewkowa (tap → robocza)" : "robocza (tap → rozgrzewkowa)"}
      >
        {isWarmup ? "W" : index}
      </button>

      {type === "timed" ? (
        <Field
          value={set.duration_seconds}
          max={LIMITS.duration}
          placeholder={ph(prev?.duration_seconds)}
          onPatch={(n) => onPatch({ duration_seconds: n })}
          onPersist={(n) => onPersist({ duration_seconds: n })}
        />
      ) : type === "bodyweight" ? (
        <>
          <Field
            value={set.reps}
            max={LIMITS.reps}
            placeholder={ph(prev?.reps)}
            onPatch={(n) => onPatch({ reps: n })}
            onPersist={(n) => onPersist({ reps: n })}
          />
          <Field
            value={set.added_weight}
            max={LIMITS.weight}
            placeholder={ph(prev?.added_weight)}
            onPatch={(n) => onPatch({ added_weight: n })}
            onPersist={(n) => onPersist({ added_weight: n })}
          />
        </>
      ) : (
        <>
          <Field
            value={set.weight}
            step="0.5"
            max={LIMITS.weight}
            placeholder={ph(prev?.weight)}
            onPatch={(n) => onPatch({ weight: n })}
            onPersist={(n) => onPersist({ weight: n })}
          />
          <Field
            value={set.reps}
            max={LIMITS.reps}
            placeholder={ph(prev?.reps)}
            onPatch={(n) => onPatch({ reps: n })}
            onPersist={(n) => onPersist({ reps: n })}
          />
        </>
      )}

      {type !== "timed" && showRpe && (
        <Field
          value={set.rpe}
          step="0.5"
          grow={false}
          max={LIMITS.rpe}
          placeholder="—"
          onPatch={(n) => onPatch({ rpe: n })}
          onPersist={(n) => onPersist({ rpe: n })}
        />
      )}

      {/* Akcept serii: ✓ zawsze widoczny (muted) → wypełniony volt po zaliczeniu
          (wzorzec Hevy/Gymshark — czytelne, że to przycisk zatwierdzenia) */}
      <button
        onClick={onToggle}
        aria-label={set.completed ? "Cofnij zaliczenie" : "Zalicz serię"}
        aria-pressed={set.completed}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border text-base ${
          set.completed
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input text-muted-foreground"
        }`}
      >
        ✓
      </button>
      <button
        onClick={onDelete}
        aria-label="Usuń serię"
        className="shrink-0 px-1 text-xs text-muted-foreground hover:text-danger"
      >
        ✕
      </button>
    </li>
  );
}

function Field({
  value,
  step,
  grow = true,
  placeholder,
  max,
  min = 0,
  onPatch,
  onPersist,
}: {
  value: number | null;
  step?: string;
  grow?: boolean;
  placeholder?: string;
  max: number;
  min?: number;
  onPatch: (n: number | null) => void;
  onPersist: (n: number | null) => void;
}) {
  const clamp = (v: string) => clampNum(parseNum(v), { min, max });
  return (
    <Input
      type="number"
      inputMode="decimal"
      step={step}
      min={min}
      max={max}
      placeholder={placeholder}
      value={value ?? ""}
      onChange={(e) => onPatch(clamp(e.target.value))}
      onBlur={(e) => onPersist(clamp(e.target.value))}
      className={`h-9 text-center font-medium tabular-nums ${grow ? "flex-1" : "w-16"}`}
    />
  );
}
