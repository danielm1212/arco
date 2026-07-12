"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { clampNum, LIMITS } from "@/lib/format";
import type { ExerciseType, SessionSet, SetType, UnitSystem } from "@/lib/types";
import { TimedStopwatch } from "./TimedStopwatch";

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

/**
 * S9-cz.2 paczka 3: memo z komparatorem pomijającym propsy-funkcje — tap ✓ jednej
 * serii nie renderuje pozostałych wierszy karty. Bezpieczne, bo handlery rodzica
 * (ExerciseCard/Logger) operują wyłącznie na ID + funkcyjnych setState/refach,
 * a domknięte obiekty `ex`/`set` są porównywane referencyjnie w komparatorach.
 */
export const SetRow = memo(function SetRow({
  index,
  set,
  prev,
  type,
  unit,
  showRpe = false,
  isPr = false,
  onPatch,
  onPersist,
  onToggle,
  onDelete,
  onTimedComplete,
}: {
  index: number;
  set: SessionSet;
  prev: PrevSet | null;
  type: ExerciseType;
  unit: UnitSystem;
  showRpe?: boolean;
  /** S12: seria pobiła rep-PR w tej sesji — badge + flash w momencie zdarzenia */
  isPr?: boolean;
  onPatch: (patch: Partial<SessionSet>) => void;
  onPersist: (patch: Partial<SessionSet>) => void;
  onToggle: () => void;
  onDelete: () => void;
  onTimedComplete?: (seconds: number) => void;
}) {
  const isWarmup = set.set_type === "warmup";
  // Placeholder = poprzedni wynik (szary podpowiadacz). Jednostki opisują nagłówki kolumn.
  const ph = (n: number | null | undefined) => (n != null ? String(n) : undefined);

  // „Last set" — wynik z poprzedniej sesji; tap = skopiuj do pól (Strong/Hevy)
  const prevText =
    type === "timed"
      ? prev?.duration_seconds != null
        ? `${prev.duration_seconds} s`
        : null
      : type === "bodyweight"
        ? prev?.reps != null
          ? `${prev.reps} powt.${prev.added_weight ? ` +${prev.added_weight}${unit}` : ""}`
          : null
        : prev?.weight != null && prev?.reps != null
          ? `${prev.weight}${unit} × ${prev.reps}`
          : null;

  function fillPrev() {
    if (!prev) return;
    const patch: Partial<SessionSet> =
      type === "timed"
        ? { duration_seconds: prev.duration_seconds }
        : type === "bodyweight"
          ? { reps: prev.reps, added_weight: prev.added_weight }
          : { weight: prev.weight, reps: prev.reps };
    onPatch(patch);
    onPersist(patch);
  }

  return (
    <li
      className={`flex flex-wrap items-center gap-xs rounded-md transition-colors ${
        isPr ? "animate-pulse-once bg-primary/10 ring-1 ring-inset ring-primary/40" : ""
      }`}
    >
      {prevText && !set.completed && (
        <button
          type="button"
          onClick={fillPrev}
          title="Tap — skopiuj poprzedni wynik"
          className="w-full text-left text-[11px] text-muted-foreground hover:text-foreground"
        >
          ↺ {prevText}
        </button>
      )}
      {/* Jawny przełącznik typu serii — obramowany, więc widać że klikalny.
          R5 (F9): aria-label obok title — samo title jest niedostępne na dotyku,
          a widoczna treść przycisku ("W"/numer) nie tłumaczy się sama. */}
      <button
        onClick={() => {
          const next: SetType = isWarmup ? "working" : "warmup";
          onPatch({ set_type: next });
          onPersist({ set_type: next });
        }}
        className={`h-11 w-9 shrink-0 rounded-md border text-xs font-medium tabular-nums ${
          isWarmup
            ? "border-warning bg-warning/15 text-warning"
            : "border-input text-muted-foreground"
        }`}
        aria-label={isWarmup ? "rozgrzewkowa (tap → robocza)" : "robocza (tap → rozgrzewkowa)"}
        title={isWarmup ? "rozgrzewkowa (tap → robocza)" : "robocza (tap → rozgrzewkowa)"}
      >
        {isWarmup ? "W" : index}
      </button>

      {type === "timed" ? (
        <TimedStopwatch
          value={set.duration_seconds}
          prev={prev?.duration_seconds ?? null}
          completed={set.completed}
          onManualPersist={(n) => {
            onPatch({ duration_seconds: n });
            onPersist({ duration_seconds: n });
          }}
          onComplete={(sec) => onTimedComplete?.(sec)}
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
      {isPr && (
        <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
          PR
        </span>
      )}
      {/* 44px = minimum z wytyczne-designu.md (było 40px — pod normą, feedback 2026-07-11) */}
      <button
        onClick={onToggle}
        aria-label={set.completed ? "Cofnij zaliczenie" : "Zalicz serię"}
        aria-pressed={set.completed}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md border text-base ${
          set.completed
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input text-muted-foreground"
        }`}
      >
        ✓
      </button>
      {/* R3 (audyt-loggera.md F3): w-11 zamiast w-9 — pełny 44×44 target jak ✓,
          nie tylko wysokość (feedback 2026-07-11: "trzeba wyrównać") */}
      <button
        onClick={onDelete}
        aria-label="Usuń serię"
        className="flex h-11 w-11 shrink-0 items-center justify-center text-xs text-muted-foreground hover:text-danger"
      >
        ✕
      </button>
    </li>
  );
},
// Komparator pomija funkcje (patrz doc-comment): re-render tylko gdy zmieniły się
// dane TEGO wiersza. `set`/`prev` porównywane referencyjnie — patchSetLocal tworzy
// nowy obiekt wyłącznie dla edytowanej serii.
(a, b) =>
  a.index === b.index &&
  a.set === b.set &&
  a.prev === b.prev &&
  a.type === b.type &&
  a.unit === b.unit &&
  a.showRpe === b.showRpe &&
  a.isPr === b.isPr);

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

  // type="text" (nie "number") celowo: natywny input[type=number] odrzuca przecinek
  // na poziomie DOM niezależnie od inputMode — polska klawiatura wpisuje wagę z ","
  // (22,5 kg), znak nigdy nie docierał do onChange. parseNum już obsługuje ","→".".
  // Wyświetlany tekst trzymamy LOKALNIE (nie wprost ze sparsowanej `value`) — inaczej
  // przy type="text" React nadpisuje pole w trakcie pisania (React ma wyjątek od tego
  // tylko dla type="number", którego świadomie tu nie używamy) i "22," wraca do "22"
  // zanim user dopisze "5". Sync z zewnętrznym `value` tylko gdy pole nie ma fokusu
  // (np. po "skopiuj poprzedni wynik" albo po przełączeniu ćwiczenia).
  const [raw, setRaw] = useState(() => (value != null ? String(value) : ""));
  const focused = useRef(false);
  useEffect(() => {
    if (!focused.current) setRaw(value != null ? String(value) : "");
  }, [value]);

  return (
    <Input
      type="text"
      inputMode="decimal"
      pattern="[0-9]*[.,]?[0-9]*"
      step={step}
      min={min}
      max={max}
      placeholder={placeholder}
      value={raw}
      onFocus={() => {
        focused.current = true;
      }}
      onChange={(e) => {
        setRaw(e.target.value);
        onPatch(clamp(e.target.value));
      }}
      onBlur={(e) => {
        focused.current = false;
        const n = clamp(e.target.value);
        setRaw(n != null ? String(n) : "");
        onPersist(n);
      }}
      className={`h-11 text-center font-medium tabular-nums ${grow ? "flex-1" : "w-16"}`}
    />
  );
}
