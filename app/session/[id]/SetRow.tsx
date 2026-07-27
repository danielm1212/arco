"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { clampNum, LIMITS, weightToCanonicalKg, weightToDisplay } from "@/lib/format";
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
  const setButtonRef = useRef<HTMLButtonElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const repsFieldRef = useRef<HTMLInputElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const [setMenuOpen, setSetMenuOpen] = useState(false);
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

  useEffect(() => {
    if (!setMenuOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (!rowRef.current?.contains(event.target as Node)) setSetMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSetMenuOpen(false);
      setButtonRef.current?.focus();
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [setMenuOpen]);

  function changeSetType(next: SetType) {
    onActivate();
    if (next !== set.set_type) {
      onPatch({ set_type: next });
      onPersist({ set_type: next });
    }
    setSetMenuOpen(false);
    setButtonRef.current?.focus();
  }

  return (
    <li
      ref={rowRef}
      tabIndex={-1}
      data-set-state={flowState}
      aria-current={active ? "step" : undefined}
      className={`relative flex flex-wrap items-center gap-xs rounded-md transition-colors ${
        isPr ? "animate-pulse-once bg-primary/10 ring-1 ring-inset ring-primary/40" : ""
      } ${active ? "bg-secondary/60" : ""}`}
    >
      {/* Numer otwiera rzadkie akcje zamiast stale pokazywać przełącznik i „usuń". */}
      <button
        ref={setButtonRef}
        type="button"
        onClick={() => {
          onActivate();
          setSetMenuOpen((open) => !open);
        }}
        className={`size-11 shrink-0 rounded-md border text-xs font-medium tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          isWarmup
            ? "border-warning bg-warning/15 text-warning"
            : "border-input text-muted-foreground"
        }`}
        aria-label={isWarmup ? "Opcje serii rozgrzewkowej" : `Opcje serii ${index}`}
        aria-expanded={setMenuOpen}
        aria-haspopup="menu"
      >
        {isWarmup ? "W" : index}
      </button>
      {setMenuOpen && (
        <div
          role="menu"
          aria-label="Opcje serii"
          className="absolute left-0 top-12 z-30 w-52 overflow-hidden rounded-md border border-border bg-popover p-2xs text-popover-foreground shadow-lg"
        >
          <button
            type="button"
            role="menuitemradio"
            aria-checked={!isWarmup}
            onClick={() => changeSetType("working")}
            className="flex min-h-11 w-full items-center justify-between rounded-md px-sm text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Seria robocza
            {!isWarmup && <Check className="size-4" aria-hidden />}
          </button>
          <button
            type="button"
            role="menuitemradio"
            aria-checked={isWarmup}
            onClick={() => changeSetType("warmup")}
            className="flex min-h-11 w-full items-center justify-between rounded-md px-sm text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Seria rozgrzewkowa
            {isWarmup && <Check className="size-4" aria-hidden />}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setSetMenuOpen(false);
              onActivate();
              onDelete();
            }}
            className="flex min-h-11 w-full items-center rounded-md px-sm text-left text-sm text-danger hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Usuń serię
          </button>
        </div>
      )}

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

      {isPr && (
        <span className="absolute -top-2 right-10 z-10 rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
          PR
        </span>
      )}
      <button
        ref={actionRef}
        onClick={() => {
          onActivate();
          if (!edited) onToggle();
        }}
        aria-label={
          edited
            ? "Seria ma niezapisaną zmianę"
            : set.completed
              ? "Cofnij zaliczenie"
              : "Zalicz serię"
        }
        aria-pressed={set.completed}
        disabled={edited}
        className={`flex size-11 shrink-0 items-center justify-center rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          flowState === "ready"
            ? "border-primary bg-primary text-primary-foreground"
            : set.completed
              ? "border-success bg-success text-white"
              : "border-input text-muted-foreground"
        }`}
      >
        <Check className="size-5" aria-hidden />
      </button>
      {edited && (
        <button
          type="button"
          onClick={() => {
            onActivate();
            onSaveEdit();
          }}
          className="order-last flex min-h-11 w-full items-center justify-center rounded-md border border-primary bg-primary px-sm text-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Zapisz zmianę
        </button>
      )}
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
