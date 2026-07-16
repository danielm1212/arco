"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { upsertSet, deleteSet, updateSessionExerciseNotes } from "@/app/actions/sets";
import {
  allOps,
  enqueueDelete,
  enqueueNotes,
  enqueueUpsert,
  pendingCount,
  removeOp,
  type OutboxSetRow,
} from "@/lib/outbox";

/**
 * Silnik synchronizacji offline dla loggera.
 * Mutacje serii lądują w outboxie i są odtwarzane gdy jest sieć.
 */
export function useSync() {
  const online = useSyncExternalStore(
    (notify) => {
      window.addEventListener("online", notify);
      window.addEventListener("offline", notify);
      return () => {
        window.removeEventListener("online", notify);
        window.removeEventListener("offline", notify);
      };
    },
    () => navigator.onLine,
    () => true,
  );
  const [pending, setPending] = useState(() => (typeof window === "undefined" ? 0 : pendingCount()));
  const [syncing, setSyncing] = useState(false);
  const flushing = useRef(false);

  const flush = useCallback(async () => {
    if (flushing.current) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    const ops = allOps();
    if (ops.length === 0) return;

    flushing.current = true;
    setSyncing(true);
    try {
      for (const op of ops) {
        try {
          if (op.kind === "upsert") await upsertSet(op.sessionId, op.row);
          else if (op.kind === "delete") await deleteSet(op.sessionId, op.setId);
          else await updateSessionExerciseNotes(op.sessionId, op.sessionExerciseId, op.notes);
          removeOp(op);
          setPending(pendingCount());
        } catch {
          break; // brak sieci / błąd — spróbujemy ponownie później
        }
      }
    } finally {
      flushing.current = false;
      setSyncing(false);
      setPending(pendingCount());
    }
  }, []);

  useEffect(() => {
    const kickoff = window.setTimeout(() => void flush(), 0);

    const onOnline = () => void flush();
    window.addEventListener("online", onOnline);
    const iv = window.setInterval(() => {
      if (navigator.onLine && pendingCount() > 0) void flush();
    }, 15000);

    return () => {
      window.clearTimeout(kickoff);
      window.removeEventListener("online", onOnline);
      window.clearInterval(iv);
    };
  }, [flush]);

  const queueUpsert = useCallback(
    (sessionId: string, row: OutboxSetRow) => {
      enqueueUpsert(sessionId, row);
      setPending(pendingCount());
      void flush();
    },
    [flush],
  );

  const queueDelete = useCallback(
    (sessionId: string, setId: string) => {
      enqueueDelete(sessionId, setId);
      setPending(pendingCount());
      void flush();
    },
    [flush],
  );

  const queueNotes = useCallback(
    (sessionId: string, sessionExerciseId: string, notes: string) => {
      enqueueNotes(sessionId, sessionExerciseId, notes);
      setPending(pendingCount());
      void flush();
    },
    [flush],
  );

  return { online, pending, syncing, queueUpsert, queueDelete, queueNotes, flush };
}
