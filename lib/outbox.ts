/**
 * Outbox synchronizacji offline (Phase 2.5).
 * Trwała kolejka operacji na seriach (localStorage). Koalescencja per setId:
 * ostatnia operacja na danej serii wygrywa (upsert najnowszych wartości albo delete).
 *
 * Założenie: jedna aktywna karta/okno PWA. Druga karta na tym samym kluczu
 * działa last-writer-wins (bez nasłuchu `storage`/BroadcastChannel) — świadoma
 * decyzja z audytu 2026-07; do rewizji, gdyby multi-window okazał się realny.
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

export type OutboxOp = (
  | { kind: "upsert"; sessionId: string; row: OutboxSetRow }
  | { kind: "delete"; sessionId: string; setId: string }
  | {
      kind: "notes";
      sessionId: string;
      sessionExerciseId: string;
      notes: string;
    }
) & {
  /**
   * Znacznik wersji operacji. `removeOp` usuwa wpis tylko gdy token się zgadza —
   * inaczej nowsza operacja zakolejkowana w trakcie wysyłki starszej zostałaby
   * skasowana bez wysłania (utrata np. `completed: true` ostatniej serii).
   */
  token?: string;
};

const newToken = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const KEY = "arco-outbox-v1";
const CORRUPT_KEY = "arco-outbox-v1-corrupt";

export type OutboxAlertKind = "corrupt" | "quota";
export const OUTBOX_ALERT_EVENT = "arco:outbox-alert";

/**
 * Operacje, których nie udało się dopisać do localStorage (np. QuotaExceededError).
 * Żyją do zamknięcia karty — flush wysyła je normalnie, ale nie przetrwają restartu.
 */
let volatileOps: Record<string, OutboxOp> | null = null;

const firedAlerts = new Set<OutboxAlertKind>();

/** Zgłasza problem trwałości raz na życie karty; UI (useSync) zamienia go na toast. */
function fireAlert(kind: OutboxAlertKind) {
  if (firedAlerts.has(kind)) return;
  firedAlerts.add(kind);
  if (typeof window.dispatchEvent === "function" && typeof CustomEvent === "function") {
    window.dispatchEvent(new CustomEvent(OUTBOX_ALERT_EVENT, { detail: { kind } }));
  }
}

/** Alerty zgłoszone zanim UI zdążyło podpiąć nasłuch (np. przy pierwszym renderze). */
export function pendingOutboxAlerts(): OutboxAlertKind[] {
  return [...firedAlerts];
}

const keyOf = (op: OutboxOp) =>
  op.kind === "notes"
    ? `notes:${op.sessionExerciseId}`
    : op.kind === "upsert"
      ? op.row.id
      : op.setId;

function read(): Record<string, OutboxOp> {
  if (typeof window === "undefined") return {};
  let stored: Record<string, OutboxOp> = {};
  const raw = window.localStorage.getItem(KEY);
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("zły kształt kolejki");
      }
      stored = parsed as Record<string, OutboxOp>;
    } catch {
      // Nie porzucamy kolejki po cichu: surowa wartość zostaje pod kluczem
      // backupowym (pierwszy backup wygrywa — nie nadpisujemy dowodu kolejną
      // korupcją), a uszkodzony klucz główny jest czyszczony, żeby każdy
      // kolejny odczyt nie ponawiał ścieżki awaryjnej.
      try {
        if (window.localStorage.getItem(CORRUPT_KEY) === null) {
          window.localStorage.setItem(CORRUPT_KEY, raw);
        }
        window.localStorage.removeItem(KEY);
      } catch {
        // backup best-effort — brak miejsca nie może zablokować odczytu
      }
      fireAlert("corrupt");
    }
  }
  return volatileOps ? { ...stored, ...volatileOps } : stored;
}

function write(map: Record<string, OutboxOp>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map));
    volatileOps = null;
  } catch {
    // Pełny storage: operacje zostają w pamięci karty, flush dalej je wysyła.
    volatileOps = map;
    fireAlert("quota");
  }
}

export function enqueueUpsert(sessionId: string, row: OutboxSetRow) {
  const map = read();
  map[row.id] = { kind: "upsert", sessionId, row, token: newToken() };
  write(map);
}

export function enqueueDelete(sessionId: string, setId: string) {
  const map = read();
  map[setId] = { kind: "delete", sessionId, setId, token: newToken() };
  write(map);
}

export function enqueueNotes(sessionId: string, sessionExerciseId: string, notes: string) {
  const map = read();
  map[`notes:${sessionExerciseId}`] = {
    kind: "notes",
    sessionId,
    sessionExerciseId,
    notes,
    token: newToken(),
  };
  write(map);
}

export function allOps(): OutboxOp[] {
  return Object.values(read());
}

export function sessionOps(sessionId: string): OutboxOp[] {
  return allOps().filter((op) => op.sessionId === sessionId);
}

/**
 * Usuwa operację z kolejki tylko jeśli wpis nie został w międzyczasie nadpisany
 * nowszą wersją (porównanie tokenów). Wpisy sprzed wprowadzenia tokenów
 * (`undefined === undefined`) są usuwane jak dotychczas.
 */
export function removeOp(op: OutboxOp) {
  const map = read();
  const key = keyOf(op);
  if (map[key]?.token !== op.token) return;
  delete map[key];
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
