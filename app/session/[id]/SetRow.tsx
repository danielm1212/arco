"use client";

import { Input } from "@/components/ui/input";
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
  unit,
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
  const ph = (n: number | null | undefined) => (n != null ? String(n) : undefined);
  const weightInc = unit === "kg" ? 2.5 : 5;

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
          suffix="s"
          inc={5}
          placeholder={ph(prev?.duration_seconds)}
          onPatch={(n) => onPatch({ duration_seconds: n })}
          onPersist={(n) => onPersist({ duration_seconds: n })}
        />
      ) : type === "bodyweight" ? (
        <>
          <Field
            value={set.reps}
            suffix="powt."
            inc={1}
            placeholder={ph(prev?.reps)}
            onPatch={(n) => onPatch({ reps: n })}
            onPersist={(n) => onPersist({ reps: n })}
          />
          <Field
            value={set.added_weight}
            suffix={`+${unit}`}
            placeholder={ph(prev?.added_weight)}
            onPatch={(n) => onPatch({ added_weight: n })}
            onPersist={(n) => onPersist({ added_weight: n })}
          />
        </>
      ) : (
        <>
          <Field
            value={set.weight}
            suffix={unit}
            step="0.5"
            inc={weightInc}
            placeholder={ph(prev?.weight)}
            onPatch={(n) => onPatch({ weight: n })}
            onPersist={(n) => onPersist({ weight: n })}
          />
          <Field
            value={set.reps}
            suffix="powt."
            placeholder={ph(prev?.reps)}
            onPatch={(n) => onPatch({ reps: n })}
            onPersist={(n) => onPersist({ reps: n })}
          />
        </>
      )}

      {type !== "timed" && showRpe && (
        <Field
          value={set.rpe}
          suffix="RPE"
          step="0.5"
          grow={false}
          onPatch={(n) => onPatch({ rpe: n })}
          onPersist={(n) => onPersist({ rpe: n })}
        />
      )}

      <button
        onClick={onToggle}
        aria-label="Zalicz serię"
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-sm ${
          set.completed
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input bg-background"
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
  suffix,
  step,
  grow = true,
  placeholder,
  inc,
  onPatch,
  onPersist,
}: {
  value: number | null;
  suffix: string;
  step?: string;
  grow?: boolean;
  placeholder?: string;
  inc?: number;
  onPatch: (n: number | null) => void;
  onPersist: (n: number | null) => void;
}) {
  const bump = (d: number) => {
    const next = Math.max(0, Math.round(((value ?? 0) + d) * 100) / 100);
    onPatch(next);
    onPersist(next);
  };

  return (
    <div className={`flex items-center gap-px ${grow ? "flex-1" : "w-16"}`}>
      {inc != null && (
        <button
          type="button"
          aria-label="mniej"
          onClick={() => bump(-inc)}
          className="h-9 w-6 shrink-0 rounded-md border border-input text-muted-foreground active:bg-muted"
        >
          −
        </button>
      )}
      <div className="relative min-w-0 flex-1">
        <Input
          type="number"
          inputMode="decimal"
          step={step}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={(e) => onPatch(parseNum(e.target.value))}
          onBlur={(e) => onPersist(parseNum(e.target.value))}
          className={`h-9 text-center font-medium tabular-nums ${inc != null ? "px-1" : "pr-9"}`}
        />
        {inc == null && (
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {inc != null && (
        <button
          type="button"
          aria-label="więcej"
          onClick={() => bump(inc)}
          className="h-9 w-6 shrink-0 rounded-md border border-input text-muted-foreground active:bg-muted"
        >
          +
        </button>
      )}
    </div>
  );
}
