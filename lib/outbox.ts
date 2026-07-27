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

export type SyncOperationResult =
  | { ok: true }
  | { ok: false; retryable: boolean; message: string };

export type QuarantinedOutboxOp = {
  op: OutboxOp;
  failedAt: string;
  reason: string;
};

export type FlushOutboxResult = {
  pending: number;
  quarantined: number;
  retryableFailure: boolean;
};

const newToken = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const KEY = "arco-outbox-v1";
const CORRUPT_KEY = "arco-outbox-v1-corrupt";
const QUARANTINE_KEY = "arco-outbox-v1-quarantine";
const QUARANTINE_CORRUPT_KEY = "arco-outbox-v1-quarantine-corrupt";

export type OutboxAlertKind = "corrupt" | "quota";
export const OUTBOX_ALERT_EVENT = "arco:outbox-alert";

/**
 * Operacje, których nie udało się dopisać do localStorage (np. QuotaExceededError).
 * Żyją do zamknięcia karty — flush wysyła je normalnie, ale nie przetrwają restartu.
 */
let volatileOps: Record<string, OutboxOp> | null = null;
let volatileQuarantine: Record<string, QuarantinedOutboxOp> | null = null;

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

function readQuarantine(): Record<string, QuarantinedOutboxOp> {
  if (typeof window === "undefined") return {};
  let stored: Record<string, QuarantinedOutboxOp> = {};
  const raw = window.localStorage.getItem(QUARANTINE_KEY);
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("zły kształt kwarantanny");
      }
      stored = parsed as Record<string, QuarantinedOutboxOp>;
    } catch {
      try {
        if (window.localStorage.getItem(QUARANTINE_CORRUPT_KEY) === null) {
          window.localStorage.setItem(QUARANTINE_CORRUPT_KEY, raw);
        }
        window.localStorage.removeItem(QUARANTINE_KEY);
      } catch {
        // backup best-effort — brak miejsca jest już obsługiwany przez alert quota
      }
      fireAlert("corrupt");
    }
  }
  return volatileQuarantine ? { ...stored, ...volatileQuarantine } : stored;
}

function writeQuarantine(map: Record<string, QuarantinedOutboxOp>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(QUARANTINE_KEY, JSON.stringify(map));
    volatileQuarantine = null;
  } catch {
    volatileQuarantine = map;
    fireAlert("quota");
  }
}

function clearQuarantinedKey(key: string) {
  const quarantined = readQuarantine();
  if (!(key in quarantined)) return;
  delete quarantined[key];
  writeQuarantine(quarantined);
}

export function enqueueUpsert(sessionId: string, row: OutboxSetRow) {
  clearQuarantinedKey(row.id);
  const map = read();
  map[row.id] = { kind: "upsert", sessionId, row, token: newToken() };
  write(map);
}

export function enqueueDelete(sessionId: string, setId: string) {
  clearQuarantinedKey(setId);
  const map = read();
  map[setId] = { kind: "delete", sessionId, setId, token: newToken() };
  write(map);
}

export function enqueueNotes(sessionId: string, sessionExerciseId: string, notes: string) {
  clearQuarantinedKey(`notes:${sessionExerciseId}`);
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

export function quarantinedOps(sessionId?: string): QuarantinedOutboxOp[] {
  const ops = Object.values(readQuarantine());
  return sessionId ? ops.filter(({ op }) => op.sessionId === sessionId) : ops;
}

export function quarantineCount(sessionId?: string): number {
  return quarantinedOps(sessionId).length;
}

export function recoverableCount(sessionId?: string): number {
  return pendingCount(sessionId) + quarantineCount(sessionId);
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

/**
 * Trwały błąd nie blokuje kolejnych zapisów: dokładny snapshot operacji trafia
 * do odzyskiwalnej kwarantanny. Token chroni nowszą wersję zakolejkowaną w trakcie
 * wysyłki — starego błędu nie wolno przypisać do poprawionych danych.
 */
export function quarantineOp(op: OutboxOp, reason: string): boolean {
  const map = read();
  const key = keyOf(op);
  if (map[key]?.token !== op.token) return false;

  const quarantined = readQuarantine();
  quarantined[key] = {
    op,
    failedAt: new Date().toISOString(),
    reason,
  };
  writeQuarantine(quarantined);

  delete map[key];
  write(map);
  return true;
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

  const quarantined = readQuarantine();
  for (const [key, entry] of Object.entries(quarantined)) {
    if (entry.op.sessionId === sessionId) delete quarantined[key];
  }
  writeQuarantine(quarantined);
}

/**
 * Jeden przebieg synchronizacji. Błąd chwilowy zatrzymuje przebieg i zostawia
 * operację do retry; błąd trwały odkłada snapshot do kwarantanny i przepuszcza
 * późniejsze zapisy. Opcjonalny sessionId ogranicza finish do bieżącej sesji.
 */
export async function flushOutbox(
  send: (op: OutboxOp) => Promise<SyncOperationResult>,
  sessionId?: string,
): Promise<FlushOutboxResult> {
  const ops = sessionId ? sessionOps(sessionId) : allOps();

  for (const op of ops) {
    let result: SyncOperationResult;
    try {
      result = await send(op);
    } catch {
      return {
        pending: pendingCount(sessionId),
        quarantined: quarantineCount(sessionId),
        retryableFailure: true,
      };
    }

    if (result.ok) {
      removeOp(op);
      continue;
    }
    if (result.retryable) {
      return {
        pending: pendingCount(sessionId),
        quarantined: quarantineCount(sessionId),
        retryableFailure: true,
      };
    }
    quarantineOp(op, result.message);
  }

  return {
    pending: pendingCount(sessionId),
    quarantined: quarantineCount(sessionId),
    retryableFailure: false,
  };
}

/**
 * Nakłada lokalny szkic na model otrzymany z serwera/cache. Dzięki temu po
 * ubiciu PWA użytkownik najpierw widzi własne ostatnie dane, a dopiero potem
 * outbox próbuje je dosynchronizować.
 */
export function restoreSessionDraft<
  T extends { sessionExerciseId: string; notes: string | null; sets: OutboxSetRow[] },
>(exercises: T[], sessionId: string): T[] {
  const active = sessionOps(sessionId);
  const quarantined = quarantinedOps(sessionId).map((entry) => entry.op);
  const activeKeys = new Set(active.map(keyOf));
  const ops = [...quarantined.filter((op) => !activeKeys.has(keyOf(op))), ...active];
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
