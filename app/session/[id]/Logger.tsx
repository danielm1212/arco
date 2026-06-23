"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addSet, updateSet, deleteSet, deleteSessionExercise } from "@/app/actions/sets";
import { finishSession, deleteSession } from "@/app/actions/session";
import type { ExerciseType, SessionSet, SetType, UnitSystem } from "@/lib/types";
import { RestTimer } from "./RestTimer";
import { ExercisePicker } from "./ExercisePicker";

export interface LoggerExercise {
  sessionExerciseId: string;
  exerciseId: string;
  name: string;
  type: ExerciseType;
  equipment: string | null;
  slot: {
    target_sets: number;
    target_reps_min: number | null;
    target_reps_max: number | null;
    rest_seconds: number;
    notes: string | null;
  } | null;
  sets: SessionSet[];
  previous: {
    weight: number | null;
    reps: number | null;
    duration_seconds: number | null;
    added_weight: number | null;
  } | null;
}

const parseNum = (v: string): number | null => {
  if (v.trim() === "") return null;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

function formatPrevious(ex: LoggerExercise, unit: UnitSystem): string | null {
  const p = ex.previous;
  if (!p) return null;
  if (ex.type === "timed") return p.duration_seconds != null ? `${p.duration_seconds}s` : null;
  if (ex.type === "bodyweight")
    return [
      p.reps != null ? `${p.reps} powt.` : null,
      p.added_weight ? `+${p.added_weight}${unit}` : null,
    ]
      .filter(Boolean)
      .join(" ") || null;
  return p.weight != null && p.reps != null ? `${p.weight}${unit} × ${p.reps}` : null;
}

export function Logger({
  sessionId,
  title,
  isFinished,
  unit,
  defaultRest,
  initialExercises,
}: {
  sessionId: string;
  title: string;
  isFinished: boolean;
  unit: UnitSystem;
  defaultRest: number;
  initialExercises: LoggerExercise[];
}) {
  const router = useRouter();
  const [exercises, setExercises] = useState(initialExercises);
  const [rest, setRest] = useState<{ endAt: number } | null>(null);
  const [, startTransition] = useTransition();

  function patchSetLocal(seId: string, setId: string, patch: Partial<SessionSet>) {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.sessionExerciseId !== seId
          ? ex
          : { ...ex, sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) },
      ),
    );
  }

  function startRest(ex: LoggerExercise) {
    const seconds = ex.slot?.rest_seconds ?? defaultRest;
    setRest({ endAt: Date.now() + seconds * 1000 });
  }

  async function handleAddSet(ex: LoggerExercise) {
    const last = ex.sets[ex.sets.length - 1];
    const seed = last
      ? {
          weight: last.weight,
          reps: last.reps,
          duration_seconds: last.duration_seconds,
          added_weight: last.added_weight,
          set_type: last.set_type,
        }
      : {
          weight: ex.previous?.weight ?? null,
          reps: ex.previous?.reps ?? null,
          duration_seconds: ex.previous?.duration_seconds ?? null,
          added_weight: ex.previous?.added_weight ?? null,
        };
    const id = await addSet(sessionId, ex.sessionExerciseId, seed);
    const newSet: SessionSet = {
      id,
      session_exercise_id: ex.sessionExerciseId,
      set_index: ex.sets.length,
      set_type: (seed.set_type as SetType) ?? "working",
      weight: seed.weight ?? null,
      reps: seed.reps ?? null,
      duration_seconds: seed.duration_seconds ?? null,
      added_weight: seed.added_weight ?? null,
      rpe: null,
      completed: false,
    };
    setExercises((prev) =>
      prev.map((e) =>
        e.sessionExerciseId === ex.sessionExerciseId ? { ...e, sets: [...e.sets, newSet] } : e,
      ),
    );
  }

  function handleToggle(ex: LoggerExercise, set: SessionSet) {
    const next = !set.completed;
    patchSetLocal(ex.sessionExerciseId, set.id, { completed: next });
    startTransition(() => updateSet(sessionId, set.id, { completed: next }));
    if (next) startRest(ex);
  }

  function handleDeleteSet(seId: string, setId: string) {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.sessionExerciseId !== seId
          ? ex
          : { ...ex, sets: ex.sets.filter((s) => s.id !== setId) },
      ),
    );
    startTransition(() => deleteSet(sessionId, setId));
  }

  function handleDeleteExercise(seId: string) {
    setExercises((prev) => prev.filter((ex) => ex.sessionExerciseId !== seId));
    startTransition(() => deleteSessionExercise(sessionId, seId));
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col pb-28">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-md py-sm backdrop-blur">
        <div className="min-w-0">
          <button onClick={() => router.push("/")} className="text-xs text-muted-foreground">
            ← Trening
          </button>
          <p className="truncate font-semibold">{title}</p>
        </div>
        {!isFinished && (
          <form action={finishSession.bind(null, sessionId)}>
            <Button size="sm" type="submit">
              Zakończ
            </Button>
          </form>
        )}
      </header>

      <main className="flex-1 space-y-md p-md">
        {exercises.map((ex) => {
          const prev = formatPrevious(ex, unit);
          return (
            <section
              key={ex.sessionExerciseId}
              className="space-y-sm rounded-lg border bg-card p-md text-card-foreground"
            >
              <div className="flex items-start justify-between gap-sm">
                <div className="min-w-0">
                  <p className="font-medium">{ex.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {ex.slot
                      ? `${ex.slot.target_sets} × ${
                          ex.slot.target_reps_min ?? ""
                        }${ex.slot.target_reps_max ? `-${ex.slot.target_reps_max}` : ""}${
                          ex.slot.notes ? ` · ${ex.slot.notes}` : ""
                        }`
                      : ex.equipment ?? "freestyle"}
                  </p>
                  {prev && (
                    <p className="mt-2xs text-xs text-muted-foreground">
                      Poprzednio: <span className="font-medium text-foreground">{prev}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteExercise(ex.sessionExerciseId)}
                  className="shrink-0 text-xs text-muted-foreground hover:text-danger"
                  aria-label="Usuń ćwiczenie"
                >
                  Usuń
                </button>
              </div>

              <ul className="space-y-2xs">
                {ex.sets.map((set, i) => (
                  <SetRow
                    key={set.id}
                    index={i + 1}
                    set={set}
                    type={ex.type}
                    unit={unit}
                    onPatch={(patch) => patchSetLocal(ex.sessionExerciseId, set.id, patch)}
                    onPersist={(patch) =>
                      startTransition(() => updateSet(sessionId, set.id, patch))
                    }
                    onToggle={() => handleToggle(ex, set)}
                    onDelete={() => handleDeleteSet(ex.sessionExerciseId, set.id)}
                  />
                ))}
              </ul>

              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => handleAddSet(ex)}
              >
                + seria
              </Button>
            </section>
          );
        })}

        <ExercisePicker sessionId={sessionId} />

        <form
          action={deleteSession.bind(null, sessionId)}
          onSubmit={(e) => {
            if (!confirm("Usunąć całą sesję? Tej operacji nie cofniesz.")) e.preventDefault();
          }}
        >
          <Button variant="ghost" size="sm" type="submit" className="w-full text-danger">
            Usuń sesję
          </Button>
        </form>
      </main>

      {rest && (
        <RestTimer
          endAt={rest.endAt}
          onDone={() => setRest(null)}
          onDismiss={() => setRest(null)}
          onExtend={(s) => setRest((r) => (r ? { endAt: r.endAt + s * 1000 } : r))}
        />
      )}
    </div>
  );
}

function SetRow({
  index,
  set,
  type,
  unit,
  onPatch,
  onPersist,
  onToggle,
  onDelete,
}: {
  index: number;
  set: SessionSet;
  type: ExerciseType;
  unit: UnitSystem;
  onPatch: (patch: Partial<SessionSet>) => void;
  onPersist: (patch: Partial<SessionSet>) => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const isWarmup = set.set_type === "warmup";

  return (
    <li className="flex items-center gap-xs">
      <button
        onClick={() => {
          const next: SetType = isWarmup ? "working" : "warmup";
          onPatch({ set_type: next });
          onPersist({ set_type: next });
        }}
        className="w-6 shrink-0 text-center text-xs font-medium text-muted-foreground"
        title={isWarmup ? "rozgrzewkowa" : "robocza"}
      >
        {isWarmup ? "W" : index}
      </button>

      {type === "timed" ? (
        <Field
          value={set.duration_seconds}
          suffix="s"
          onPatch={(n) => onPatch({ duration_seconds: n })}
          onPersist={(n) => onPersist({ duration_seconds: n })}
        />
      ) : type === "bodyweight" ? (
        <>
          <Field
            value={set.reps}
            suffix="powt."
            onPatch={(n) => onPatch({ reps: n })}
            onPersist={(n) => onPersist({ reps: n })}
          />
          <Field
            value={set.added_weight}
            suffix={`+${unit}`}
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
            onPatch={(n) => onPatch({ weight: n })}
            onPersist={(n) => onPersist({ weight: n })}
          />
          <Field
            value={set.reps}
            suffix="powt."
            onPatch={(n) => onPatch({ reps: n })}
            onPersist={(n) => onPersist({ reps: n })}
          />
        </>
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
  onPatch,
  onPersist,
}: {
  value: number | null;
  suffix: string;
  step?: string;
  onPatch: (n: number | null) => void;
  onPersist: (n: number | null) => void;
}) {
  return (
    <div className="relative flex-1">
      <Input
        type="number"
        inputMode="decimal"
        step={step}
        value={value ?? ""}
        onChange={(e) => onPatch(parseNum(e.target.value))}
        onBlur={(e) => onPersist(parseNum(e.target.value))}
        className="h-9 pr-10 text-center"
      />
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
        {suffix}
      </span>
    </div>
  );
}
