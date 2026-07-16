/**
 * Outbox synchronizacji offline (Phase 2.5).
 * Trwała kolejka operacji na seriach (localStorage). Koalescencja per setId:
 * ostatnia operacja na danej serii wygrywa (upsert najnowszych wartości albo delete).
 */

export interface OutboxSetRow {
  id: string;
  session_exercise_id: string;
  set_index: number;
  set_type: "warmup" | "working" | "drop";
  weight: number | null;
  reps: number | null;
  duration_seconds: number | null;
  added_weight: number | null;
  rpe: number | null;
  completed: boolean;
}

export type OutboxOp =
  | { kind: "upsert"; sessionId: string; row: OutboxSetRow }
  | { kind: "delete"; sessionId: string; setId: string }
  | {
      kind: "notes";
      sessionId: string;
      sessionExerciseId: string;
      notes: string;
    };

const KEY = "arco-outbox-v1";

const keyOf = (op: OutboxOp) =>
  op.kind === "notes"
    ? `notes:${op.sessionExerciseId}`
    : op.kind === "upsert"
      ? op.row.id
      : op.setId;

function read(): Record<string, OutboxOp> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function write(map: Record<string, OutboxOp>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(map));
}

export function enqueueUpsert(sessionId: string, row: OutboxSetRow) {
  const map = read();
  map[row.id] = { kind: "upsert", sessionId, row };
  write(map);
}

export function enqueueDelete(sessionId: string, setId: string) {
  const map = read();
  map[setId] = { kind: "delete", sessionId, setId };
  write(map);
}

export function enqueueNotes(sessionId: string, sessionExerciseId: string, notes: string) {
  const map = read();
  map[`notes:${sessionExerciseId}`] = { kind: "notes", sessionId, sessionExerciseId, notes };
  write(map);
}

export function allOps(): OutboxOp[] {
  return Object.values(read());
}

export function sessionOps(sessionId: string): OutboxOp[] {
  return allOps().filter((op) => op.sessionId === sessionId);
}

export function removeOp(op: OutboxOp) {
  const map = read();
  delete map[keyOf(op)];
  write(map);
}

export function pendingCount(sessionId?: string): number {
  return sessionId ? sessionOps(sessionId).length : Object.keys(read()).length;
}

export function clearSessionOps(sessionId: string) {
  const map = read();
  for (const [key, op] of Object.entries(map)) {
    if (op.sessionId === sessionId) delete map[key];
  }
  write(map);
}

/**
 * Nakłada lokalny szkic na model otrzymany z serwera/cache. Dzięki temu po
 * ubiciu PWA użytkownik najpierw widzi własne ostatnie dane, a dopiero potem
 * outbox próbuje je dosynchronizować.
 */
export function restoreSessionDraft<
  T extends { sessionExerciseId: string; notes: string | null; sets: OutboxSetRow[] },
>(exercises: T[], sessionId: string): T[] {
  const ops = sessionOps(sessionId);
  if (ops.length === 0) return exercises;

  return exercises.map((exercise) => {
    let notes = exercise.notes;
    const sets = new Map(exercise.sets.map((set) => [set.id, set]));

    for (const op of ops) {
      if (op.kind === "notes" && op.sessionExerciseId === exercise.sessionExerciseId) {
        notes = op.notes;
      } else if (op.kind === "upsert" && op.row.session_exercise_id === exercise.sessionExerciseId) {
        sets.set(op.row.id, op.row);
      } else if (op.kind === "delete") {
        sets.delete(op.setId);
      }
    }

    return {
      ...exercise,
      notes,
      sets: [...sets.values()].sort((a, b) => a.set_index - b.set_index),
    };
  });
}
