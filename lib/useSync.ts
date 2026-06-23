"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { upsertSet, deleteSet } from "@/app/actions/sets";
import {
  allOps,
  enqueueDelete,
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
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
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
          else await deleteSet(op.sessionId, op.setId);
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
    setOnline(navigator.onLine);
    setPending(pendingCount());
    void flush();

    const onOnline = () => {
      setOnline(true);
      void flush();
    };
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    const iv = window.setInterval(() => {
      if (navigator.onLine && pendingCount() > 0) void flush();
    }, 15000);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
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

  return { online, pending, syncing, queueUpsert, queueDelete, flush };
}
