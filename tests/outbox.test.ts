import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import {
  allOps,
  clearSessionOps,
  enqueueDelete,
  enqueueNotes,
  enqueueUpsert,
  flushOutbox,
  pendingCount,
  quarantineCount,
  quarantineOp,
  quarantinedOps,
  recoverableCount,
  removeOp,
  restoreSessionDraft,
  type OutboxSetRow,
} from "../lib/outbox";

class MemoryStorage implements Storage {
  private data = new Map<string, string>();

  /** Symulacja QuotaExceededError: każdy setItem rzuca. */
  failWrites = false;

  get length() {
    return this.data.size;
  }

  clear() {
    this.data.clear();
  }

  getItem(key: string) {
    return this.data.get(key) ?? null;
  }

  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.data.delete(key);
  }

  setItem(key: string, value: string) {
    if (this.failWrites) throw new Error("QuotaExceededError");
    this.data.set(key, value);
  }
}

const localStorage = new MemoryStorage();
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: { localStorage },
});

const baseSet: OutboxSetRow = {
  id: "set-1",
  session_exercise_id: "exercise-1",
  set_index: 0,
  set_type: "working",
  weight: 50,
  reps: 8,
  duration_seconds: null,
  added_weight: null,
  rpe: null,
  completed: false,
};

beforeEach(() => {
  localStorage.clear();
  localStorage.failWrites = false;
});

test("szkic loggera odzyskuje serie i notatki tylko dla właściwej sesji", () => {
  enqueueUpsert("session-1", { ...baseSet, weight: 55, completed: true });
  enqueueNotes("session-1", "exercise-1", "Pilnuj tempa");
  enqueueUpsert("session-2", { ...baseSet, id: "set-other", weight: 99 });

  const restored = restoreSessionDraft(
    [
      {
        sessionExerciseId: "exercise-1",
        notes: null,
        sets: [baseSet],
      },
    ],
    "session-1",
  );

  assert.equal(restored[0].notes, "Pilnuj tempa");
  assert.equal(restored[0].sets[0].weight, 55);
  assert.equal(restored[0].sets[0].completed, true);
  assert.equal(pendingCount("session-1"), 2);
  assert.equal(pendingCount(), 3);

  enqueueDelete("session-1", "set-1");
  assert.equal(restoreSessionDraft(restored, "session-1")[0].sets.length, 0);

  clearSessionOps("session-1");
  assert.equal(pendingCount("session-1"), 0);
  assert.equal(pendingCount(), 1);
});

test("removeOp nie kasuje operacji nadpisanej w trakcie wysyłki (lost update ✓ serii)", () => {
  // Scenariusz z regresji 2026-07-17: zapis wartości serii wychodzi do serwera,
  // w trakcie await użytkownik tapie ✓ (completed: true) na tej samej serii.
  enqueueUpsert("session-1", { ...baseSet, completed: false });
  const inFlight = allOps()[0]; // snapshot, który flush właśnie wysyła

  enqueueUpsert("session-1", { ...baseSet, completed: true }); // nadpisanie w trakcie
  removeOp(inFlight); // flush kończy wysyłkę starszej wersji

  // Nowsza operacja MUSI zostać w kolejce — inaczej ✓ nigdy nie trafi na serwer.
  assert.equal(pendingCount("session-1"), 1);
  const remaining = allOps()[0];
  assert.equal(remaining.kind, "upsert");
  assert.equal(remaining.kind === "upsert" && remaining.row.completed, true);

  // Wysyłka aktualnej wersji zdejmuje wpis normalnie.
  removeOp(remaining);
  assert.equal(pendingCount("session-1"), 0);
});

test("removeOp usuwa wpisy sprzed wprowadzenia tokenów (kompatybilność wstecz)", () => {
  // Operacja zapisana starą wersją kodu — bez tokenu w localStorage.
  window.localStorage.setItem(
    "arco-outbox-v1",
    JSON.stringify({
      "set-1": { kind: "upsert", sessionId: "session-1", row: { ...baseSet } },
    }),
  );
  assert.equal(pendingCount(), 1);
  removeOp(allOps()[0]);
  assert.equal(pendingCount(), 0);
});

test("uszkodzony JSON nie znika po cichu — backup pod kluczem awaryjnym", () => {
  window.localStorage.setItem("arco-outbox-v1", "{zepsuty json");

  // Odczyt zwraca pustą kolejkę, ale surowa wartość ląduje w backupie,
  // a uszkodzony klucz główny jest czyszczony (jednorazowa ścieżka awaryjna).
  assert.equal(pendingCount(), 0);
  assert.equal(window.localStorage.getItem("arco-outbox-v1-corrupt"), "{zepsuty json");
  assert.equal(window.localStorage.getItem("arco-outbox-v1"), null);

  // Kolejka działa dalej normalnie.
  enqueueUpsert("session-1", baseSet);
  assert.equal(pendingCount(), 1);

  // Kolejna korupcja (poprawny JSON, zły kształt) nie nadpisuje pierwszego dowodu.
  window.localStorage.setItem("arco-outbox-v1", "[1,2,3]");
  assert.equal(pendingCount(), 0);
  assert.equal(window.localStorage.getItem("arco-outbox-v1-corrupt"), "{zepsuty json");
});

test("SYNC-01: trwały błąd zachowuje snapshot, a poprawiona wersja wraca do kolejki", () => {
  enqueueUpsert("session-1", { ...baseSet, weight: 1001, completed: true });
  const invalid = allOps()[0];

  assert.equal(quarantineOp(invalid, "Ciężar poza zakresem."), true);
  assert.equal(pendingCount("session-1"), 0);
  assert.equal(quarantineCount("session-1"), 1);
  assert.equal(recoverableCount("session-1"), 1);
  assert.equal(quarantinedOps("session-1")[0].reason, "Ciężar poza zakresem.");

  const restored = restoreSessionDraft(
    [{ sessionExerciseId: "exercise-1", notes: null, sets: [baseSet] }],
    "session-1",
  );
  assert.equal(restored[0].sets[0].weight, 1001, "kwarantanna musi pozostać odzyskiwalna");

  enqueueUpsert("session-1", { ...baseSet, weight: 100, completed: true });
  assert.equal(quarantineCount("session-1"), 0, "poprawiona wersja czyści stary błąd");
  assert.equal(pendingCount("session-1"), 1);
});

test("SYNC-01: stary błąd nie kwarantannuje nowszej wersji zakolejkowanej w trakcie", () => {
  enqueueUpsert("session-1", { ...baseSet, weight: 1001 });
  const inFlight = allOps()[0];
  enqueueUpsert("session-1", { ...baseSet, weight: 100 });

  assert.equal(quarantineOp(inFlight, "stary błąd"), false);
  assert.equal(quarantineCount("session-1"), 0);
  assert.equal(pendingCount("session-1"), 1);
  const current = allOps()[0];
  assert.equal(current.kind === "upsert" && current.row.weight, 100);
});

test("SYNC-01: błąd trwały nie blokuje późniejszych operacji", async () => {
  enqueueUpsert("session-1", { ...baseSet, id: "bad-set", weight: 1001 });
  enqueueUpsert("session-2", { ...baseSet, id: "good-set", weight: 80 });
  const sent: string[] = [];

  const result = await flushOutbox(async (op) => {
    const id = op.kind === "upsert" ? op.row.id : "";
    sent.push(id);
    return id === "bad-set"
      ? { ok: false, retryable: false, message: "Nieprawidłowy ciężar." }
      : { ok: true };
  });

  assert.deepEqual(sent, ["bad-set", "good-set"]);
  assert.equal(result.retryableFailure, false);
  assert.equal(pendingCount(), 0);
  assert.equal(quarantineCount("session-1"), 1);
});

test("SYNC-01: błąd chwilowy zatrzymuje przebieg i zostawia operacje do retry", async () => {
  enqueueUpsert("session-1", { ...baseSet, id: "first-set" });
  enqueueUpsert("session-1", { ...baseSet, id: "second-set" });
  const sent: string[] = [];

  const result = await flushOutbox(async (op) => {
    sent.push(op.kind === "upsert" ? op.row.id : "");
    return { ok: false, retryable: true, message: "Brak sieci." };
  });

  assert.deepEqual(sent, ["first-set"]);
  assert.equal(result.retryableFailure, true);
  assert.equal(pendingCount("session-1"), 2);
  assert.equal(quarantineCount(), 0);
});

test("SYNC-01: flush finishu obejmuje wyłącznie bieżącą sesję", async () => {
  enqueueUpsert("session-1", { ...baseSet, id: "current-set" });
  enqueueUpsert("session-2", { ...baseSet, id: "other-set" });
  const sent: string[] = [];

  const result = await flushOutbox(async (op) => {
    sent.push(op.kind === "upsert" ? op.row.id : "");
    return { ok: true };
  }, "session-1");

  assert.deepEqual(sent, ["current-set"]);
  assert.equal(result.pending, 0);
  assert.equal(pendingCount("session-1"), 0);
  assert.equal(pendingCount("session-2"), 1);
});

test("pełny storage nie gubi operacji w trakcie życia karty (quota fallback)", () => {
  localStorage.failWrites = true;
  enqueueUpsert("session-1", { ...baseSet, weight: 60 });

  // Operacja żyje w pamięci mimo nieudanego zapisu — flush nadal ją widzi.
  assert.equal(pendingCount(), 1);
  const inMemory = allOps()[0];
  assert.equal(inMemory.kind === "upsert" && inMemory.row.weight, 60);
  assert.equal(window.localStorage.getItem("arco-outbox-v1"), null);

  // Gdy miejsce wraca, kolejny zapis utrwala całą kolejkę i czyści fallback.
  localStorage.failWrites = false;
  enqueueNotes("session-1", "exercise-1", "Pilnuj tempa");
  assert.equal(pendingCount(), 2);
  const persisted = JSON.parse(window.localStorage.getItem("arco-outbox-v1")!) as Record<
    string,
    unknown
  >;
  assert.equal(Object.keys(persisted).length, 2);

  // Usunięcie po wysyłce działa trwale (fallback nie wskrzesza operacji).
  const upsert = allOps().find((op) => op.kind === "upsert")!;
  removeOp(upsert);
  assert.equal(pendingCount(), 1);
  assert.equal(allOps()[0].kind, "notes");
});
