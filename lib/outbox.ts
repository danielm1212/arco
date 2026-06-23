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
  | { kind: "delete"; sessionId: string; setId: string };

const KEY = "arco-outbox-v1";

const setIdOf = (op: OutboxOp) => (op.kind === "upsert" ? op.row.id : op.setId);

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

export function allOps(): OutboxOp[] {
  return Object.values(read());
}

export function removeOp(op: OutboxOp) {
  const map = read();
  delete map[setIdOf(op)];
  write(map);
}

export function pendingCount(): number {
  return Object.keys(read()).length;
}
