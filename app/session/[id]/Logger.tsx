"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExerciseInfoSheet } from "@/components/ExerciseInfoSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addSet,
  updateSet,
  deleteSet,
  deleteSessionExercise,
  setSupersetGroups,
} from "@/app/actions/sets";
import { finishSession, deleteSession } from "@/app/actions/session";
import type { ExerciseType, SessionSet, SetType, UnitSystem } from "@/lib/types";
import { computePlates, formatPlates } from "@/lib/plates";
import { RestTimer } from "./RestTimer";
import { ExercisePicker } from "./ExercisePicker";
import { SwapPanel } from "./SwapPanel";

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
  supersetGroup: number | null;
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

/** Hint progresji: ostatnio dobity górny zakres powtórzeń → zaproponuj +obciążenie. */
function progressionHint(ex: LoggerExercise, unit: UnitSystem): string | null {
  const top = ex.slot?.target_reps_max;
  const p = ex.previous;
  if (!top || !p) return null;
  if (ex.type === "weighted" && p.weight != null && p.reps != null && p.reps >= top) {
    const inc = unit === "kg" ? 2.5 : 5;
    return `Ostatnio pełny zakres (${p.reps}) → spróbuj ${p.weight + inc}${unit}`;
  }
  if (ex.type === "bodyweight" && p.reps != null && p.reps >= top) {
    return `Ostatnio ${p.reps} powt. → dołóż powtórzeń lub obciążenie`;
  }
  return null;
}

export function Logger({
  sessionId,
  title,
  isFinished,
  unit,
  defaultRest,
  barWeight,
  plates,
  initialExercises,
}: {
  sessionId: string;
  title: string;
  isFinished: boolean;
  unit: UnitSystem;
  defaultRest: number;
  barWeight: number;
  plates: number[];
  initialExercises: LoggerExercise[];
}) {
  const router = useRouter();
  const [exercises, setExercises] = useState(initialExercises);
  const [rest, setRest] = useState<{ endAt: number } | null>(null);

  const SAVE_ERR = "Nie zapisano — sprawdź połączenie i spróbuj ponownie.";

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
    let id: string;
    try {
      id = await addSet(sessionId, ex.sessionExerciseId, seed);
    } catch {
      toast.error(SAVE_ERR);
      return;
    }
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

  async function handleToggle(ex: LoggerExercise, set: SessionSet) {
    const next = !set.completed;
    patchSetLocal(ex.sessionExerciseId, set.id, { completed: next });
    if (next) startRest(ex);
    try {
      await updateSet(sessionId, set.id, { completed: next });
    } catch {
      patchSetLocal(ex.sessionExerciseId, set.id, { completed: !next }); // revert
      if (next) setRest(null);
      toast.error(SAVE_ERR);
    }
  }

  async function handlePersist(setId: string, patch: Partial<SessionSet>) {
    try {
      await updateSet(sessionId, setId, patch);
    } catch {
      toast.error(SAVE_ERR);
    }
  }

  async function handleDeleteSet(seId: string, setId: string) {
    const snapshot = exercises;
    setExercises((prev) =>
      prev.map((ex) =>
        ex.sessionExerciseId !== seId
          ? ex
          : { ...ex, sets: ex.sets.filter((s) => s.id !== setId) },
      ),
    );
    try {
      await deleteSet(sessionId, setId);
    } catch {
      setExercises(snapshot); // revert
      toast.error(SAVE_ERR);
    }
  }

  async function handleDeleteExercise(seId: string) {
    const snapshot = exercises;
    setExercises((prev) => prev.filter((ex) => ex.sessionExerciseId !== seId));
    try {
      await deleteSessionExercise(sessionId, seId);
    } catch {
      setExercises(snapshot); // revert
      toast.error(SAVE_ERR);
    }
  }

  async function setGroups(updates: { id: string; group: number | null }[]) {
    const snapshot = exercises;
    setExercises((prev) =>
      prev.map((ex) => {
        const u = updates.find((x) => x.id === ex.sessionExerciseId);
        return u ? { ...ex, supersetGroup: u.group } : ex;
      }),
    );
    try {
      await setSupersetGroups(sessionId, updates);
    } catch {
      setExercises(snapshot);
      toast.error(SAVE_ERR);
    }
  }

  function linkWithPrevious(i: number) {
    if (i <= 0) return;
    const prev = exercises[i - 1];
    const cur = exercises[i];
    if (prev.supersetGroup != null) {
      setGroups([{ id: cur.sessionExerciseId, group: prev.supersetGroup }]);
    } else {
      const g = Math.max(0, ...exercises.map((e) => e.supersetGroup ?? 0)) + 1;
      setGroups([
        { id: prev.sessionExerciseId, group: g },
        { id: cur.sessionExerciseId, group: g },
      ]);
    }
  }

  function unlink(i: number) {
    const cur = exercises[i];
    const g = cur.supersetGroup;
    const updates: { id: string; group: number | null }[] = [
      { id: cur.sessionExerciseId, group: null },
    ];
    if (g != null) {
      const others = exercises.filter(
        (e) => e.supersetGroup === g && e.sessionExerciseId !== cur.sessionExerciseId,
      );
      if (others.length === 1) updates.push({ id: others[0].sessionExerciseId, group: null });
    }
    setGroups(updates);
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
        {exercises.map((ex, i) => {
          const prev = formatPrevious(ex, unit);
          const grouped = ex.supersetGroup != null;
          return (
            <section
              key={ex.sessionExerciseId}
              className={`space-y-sm rounded-lg border bg-card p-md text-card-foreground ${
                grouped ? "border-l-4 border-l-primary" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-sm">
                <div className="min-w-0">
                  <p className="font-medium">
                    <ExerciseInfoSheet exerciseId={ex.exerciseId}>
                      <button
                        type="button"
                        className="text-left underline-offset-2 hover:underline"
                        title="Jak wykonać"
                      >
                        {ex.name} <span className="text-muted-foreground">ⓘ</span>
                      </button>
                    </ExerciseInfoSheet>
                    {grouped && (
                      <span className="ml-xs rounded-full bg-primary/15 px-2 py-0.5 align-middle text-xs font-medium text-primary">
                        SS{ex.supersetGroup}
                      </span>
                    )}
                  </p>
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

              <div className="flex items-center gap-md text-xs">
                {grouped ? (
                  <button
                    onClick={() => unlink(i)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ⛓ Rozłącz superset
                  </button>
                ) : (
                  i > 0 && (
                    <button
                      onClick={() => linkWithPrevious(i)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ⛓ Superset z poprzednim
                    </button>
                  )
                )}
              </div>

              <SwapPanel sessionId={sessionId} sessionExerciseId={ex.sessionExerciseId} />

              {(() => {
                const hint = progressionHint(ex, unit);
                return hint ? (
                  <p className="rounded-md bg-success/10 px-sm py-xs text-xs text-success">
                    💡 {hint}
                  </p>
                ) : null;
              })()}

              {ex.type === "weighted" &&
                barWeight > 0 &&
                (() => {
                  const ref =
                    ex.sets[ex.sets.length - 1]?.weight ?? ex.previous?.weight ?? null;
                  if (ref == null) return null;
                  const load = computePlates(ref, barWeight, plates);
                  if (!load.loadable) return null;
                  return (
                    <p className="text-xs text-muted-foreground">
                      🏋 {ref}
                      {unit} → talerze/str.: {formatPlates(load)}
                    </p>
                  );
                })()}

              <ul className="space-y-2xs">
                {ex.sets.map((set, i) => (
                  <SetRow
                    key={set.id}
                    index={i + 1}
                    set={set}
                    type={ex.type}
                    unit={unit}
                    onPatch={(patch) => patchSetLocal(ex.sessionExerciseId, set.id, patch)}
                    onPersist={(patch) => handlePersist(set.id, patch)}
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
    <li className="flex flex-wrap items-center gap-xs">
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

      {type !== "timed" && (
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
  onPatch,
  onPersist,
}: {
  value: number | null;
  suffix: string;
  step?: string;
  grow?: boolean;
  onPatch: (n: number | null) => void;
  onPersist: (n: number | null) => void;
}) {
  return (
    <div className={`relative ${grow ? "flex-1" : "w-16"}`}>
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
