"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { clampNum, formatSet, LIMITS, weightToCanonicalKg, weightToDisplay } from "@/lib/format";
import type { ExerciseType, SessionSet, SetType, UnitSystem } from "@/lib/types";
import { loggerSetState } from "@/lib/sessionFlow";
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
  active = false,
  focusRequested = false,
  edited = false,
  onPatch,
  onPersist,
  onToggle,
  onActivate,
  onSaveEdit,
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
  active?: boolean;
  focusRequested?: boolean;
  edited?: boolean;
  onPatch: (patch: Partial<SessionSet>) => void;
  onPersist: (patch: Partial<SessionSet>) => void;
  onToggle: () => void;
  onActivate: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onTimedComplete?: (seconds: number) => void;
}) {
  const isWarmup = set.set_type === "warmup";
  // Placeholder = poprzedni wynik (szary podpowiadacz). Jednostki opisują nagłówki kolumn.
  const ph = (n: number | null | undefined) => (n != null ? String(n) : undefined);
  // DATA-02: waga w stanie/DB jest zawsze kanonicznym kg — placeholder wagi
  // konwertuje do jednostki profilu, tak samo jak sam input.
  const phWeight = (n: number | null | undefined) =>
    n != null ? String(weightToDisplay(n, unit)) : undefined;
  const weightMax = weightToDisplay(LIMITS.weight, unit);
  const rowRef = useRef<HTMLLIElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const repsFieldRef = useRef<HTMLInputElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const flowState = loggerSetState(type, set, edited);

  useEffect(() => {
    if (!focusRequested) return;
    rowRef.current?.scrollIntoView({ block: "nearest" });
    if (type === "timed") {
      rowRef.current?.focus({ preventScroll: true });
    } else {
      firstFieldRef.current?.focus({ preventScroll: true });
    }
  }, [focusRequested, type]);

  // „Last set" — wynik z poprzedniej sesji; tap = skopiuj do pól (Strong/Hevy).
  // Audyt P2: formatowanie przez wspólny formatSet zamiast trzeciej inline-kopii
  // (jedyna zmiana wizualna: „45s" jak w historii, nie „45 s").
  const prevFormatted = prev
    ? formatSet(
        type,
        {
          weight: prev.weight ?? null,
          reps: prev.reps ?? null,
          duration_seconds: prev.duration_seconds ?? null,
          added_weight: prev.added_weight ?? null,
        },
        unit,
      )
    : null;
  const prevText = prevFormatted === "Brak wyniku" ? null : prevFormatted;

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
      ref={rowRef}
      tabIndex={-1}
      data-set-state={flowState}
      aria-current={active ? "step" : undefined}
      className={`flex flex-wrap items-center gap-xs rounded-md transition-colors ${
        isPr ? "animate-pulse-once bg-primary/10 ring-1 ring-inset ring-primary/40" : ""
      } ${active ? "bg-secondary/60 ring-2 ring-inset ring-primary/35" : ""}`}
    >
      {prevText && !set.completed && (
        <button
          type="button"
          onClick={() => {
            onActivate();
            fillPrev();
          }}
          title="Dotknij, aby skopiować poprzedni wynik"
          className="flex min-h-11 w-full items-center text-left text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          ↺ {prevText}
        </button>
      )}
      {/* Jawny przełącznik typu serii — obramowany, więc widać że klikalny.
          R5 (F9): aria-label obok title — samo title jest niedostępne na dotyku,
          a widoczna treść przycisku ("W"/numer) nie tłumaczy się sama. */}
      <button
        onClick={() => {
          onActivate();
          const next: SetType = isWarmup ? "working" : "warmup";
          onPatch({ set_type: next });
          onPersist({ set_type: next });
        }}
        className={`size-11 shrink-0 rounded-md border text-xs font-medium tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          isWarmup
            ? "border-warning bg-warning/15 text-warning"
            : "border-input text-muted-foreground"
        }`}
        aria-label={isWarmup ? "Seria rozgrzewkowa. Dotknij, aby zmienić na roboczą" : "Seria robocza. Dotknij, aby zmienić na rozgrzewkową"}
        title={isWarmup ? "Zmień na serię roboczą" : "Zmień na serię rozgrzewkową"}
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
            inputRef={firstFieldRef}
            value={set.reps}
            max={LIMITS.reps}
            placeholder={ph(prev?.reps)}
            onPatch={(n) => onPatch({ reps: n })}
            onPersist={(n) => onPersist({ reps: n })}
            onFocus={onActivate}
            onEnter={() => actionRef.current?.focus()}
          />
          <Field
            value={set.added_weight != null ? weightToDisplay(set.added_weight, unit) : null}
            max={weightMax}
            placeholder={phWeight(prev?.added_weight)}
            onPatch={(n) => onPatch({ added_weight: n == null ? null : weightToCanonicalKg(n, unit) })}
            onPersist={(n) => onPersist({ added_weight: n == null ? null : weightToCanonicalKg(n, unit) })}
            onFocus={onActivate}
            onEnter={() => actionRef.current?.focus()}
          />
        </>
      ) : (
        <>
          <Field
            inputRef={firstFieldRef}
            value={set.weight != null ? weightToDisplay(set.weight, unit) : null}
            step="0.5"
            max={weightMax}
            placeholder={phWeight(prev?.weight)}
            onPatch={(n) => onPatch({ weight: n == null ? null : weightToCanonicalKg(n, unit) })}
            onPersist={(n) => onPersist({ weight: n == null ? null : weightToCanonicalKg(n, unit) })}
            onFocus={onActivate}
            onEnter={() => repsFieldRef.current?.focus()}
          />
          <Field
            inputRef={repsFieldRef}
            value={set.reps}
            max={LIMITS.reps}
            placeholder={ph(prev?.reps)}
            onPatch={(n) => onPatch({ reps: n })}
            onPersist={(n) => onPersist({ reps: n })}
            onFocus={onActivate}
            onEnter={() => actionRef.current?.focus()}
          />
        </>
      )}

      {type !== "timed" && showRpe && (
        <Field
          value={set.rpe}
          step="0.5"
          grow={false}
          max={LIMITS.rpe}
          placeholder="RPE"
          onPatch={(n) => onPatch({ rpe: n })}
          onPersist={(n) => onPersist({ rpe: n })}
          onFocus={onActivate}
          onEnter={() => actionRef.current?.focus()}
        />
      )}

      {/* Akcept serii ma własny, stały wiersz. Przy 320 px układ:
          typ + dwa pola + usuń zachowuje użyteczne szerokości pól, a tekstowe
          „Zalicz / Zapisz zmianę" nie przepycha ich ani nie zmienia layoutu. */}
      {isPr && (
        <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
          PR
        </span>
      )}
      {/* 44px = minimum z wytyczne-designu.md (było 40px — pod normą, feedback 2026-07-11) */}
      <button
        ref={actionRef}
        onClick={() => {
          onActivate();
          if (edited) onSaveEdit();
          else onToggle();
        }}
        aria-label={
          edited
            ? "Zapisz zmianę zaliczonej serii"
            : set.completed
              ? "Cofnij zaliczenie"
              : "Zalicz serię"
        }
        aria-pressed={set.completed}
        className={`order-last flex min-h-11 w-full items-center justify-center rounded-md border px-sm text-sm font-semibold ${
          edited || flowState === "ready"
            ? "border-primary bg-primary text-primary-foreground"
            : set.completed
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-input text-muted-foreground"
        }`}
      >
        {edited ? "Zapisz zmianę" : set.completed ? "✓ Zaliczone" : "Zalicz"}
      </button>
      {/* R3 (audyt-loggera.md F3): w-11 zamiast w-9 — pełny 44×44 target jak ✓,
          nie tylko wysokość (feedback 2026-07-11: "trzeba wyrównać") */}
      <button
        onClick={() => {
          onActivate();
          onDelete();
        }}
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
  a.isPr === b.isPr &&
  a.active === b.active &&
  a.focusRequested === b.focusRequested &&
  a.edited === b.edited);

function Field({
  value,
  step,
  grow = true,
  placeholder,
  max,
  min = 0,
  onPatch,
  onPersist,
  onFocus,
  onEnter,
  inputRef,
}: {
  value: number | null;
  step?: string;
  grow?: boolean;
  placeholder?: string;
  max: number;
  min?: number;
  onPatch: (n: number | null) => void;
  onPersist: (n: number | null) => void;
  onFocus?: () => void;
  onEnter?: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
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
      ref={inputRef}
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
        onFocus?.();
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
      onKeyDown={(event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        onEnter?.();
      }}
      className={`h-11 text-center font-medium tabular-nums ${grow ? "flex-1" : "w-16"}`}
    />
  );
}
