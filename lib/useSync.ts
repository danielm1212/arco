"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { syncOutboxOperation } from "@/app/actions/sets";
import {
  enqueueDelete,
  enqueueNotes,
  enqueueUpsert,
  flushOutbox,
  OUTBOX_ALERT_EVENT,
  pendingCount,
  pendingOutboxAlerts,
  quarantineCount,
  type FlushOutboxResult,
  type OutboxAlertKind,
  type OutboxSetRow,
} from "@/lib/outbox";

const ALERT_MESSAGES: Record<OutboxAlertKind, string> = {
  corrupt:
    "Nie udało się odczytać zapisów offline. Kopia danych została zachowana na urządzeniu.",
  quota:
    "Pamięć urządzenia jest pełna — zapisy offline mogą nie przetrwać zamknięcia aplikacji.",
};

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
  const [quarantined, setQuarantined] = useState(() =>
    typeof window === "undefined" ? 0 : quarantineCount(),
  );
  const [syncing, setSyncing] = useState(false);
  const activeFlush = useRef<Promise<FlushOutboxResult> | null>(null);

  const flush = useCallback(async (sessionId?: string): Promise<FlushOutboxResult> => {
    // Finish może wejść, gdy automatyczny flush już trwa. Czekamy na ten przebieg,
    // a potem wykonujemy własny, ograniczony do bieżącej sesji — bez wyścigu.
    while (activeFlush.current) await activeFlush.current;

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return {
        pending: pendingCount(sessionId),
        quarantined: quarantineCount(sessionId),
        retryableFailure: true,
      };
    }

    const run = async () => {
      setSyncing(true);
      const quarantinedBefore = quarantineCount();
      let result: FlushOutboxResult;
      do {
        result = await flushOutbox(syncOutboxOperation, sessionId);
        setPending(pendingCount());
        setQuarantined(quarantineCount());
      } while (!result.retryableFailure && pendingCount(sessionId) > 0);

      if (quarantineCount() > quarantinedBefore) {
        toast.error(
          "Jedna zmiana wymaga poprawy. Zachowaliśmy ją na tym urządzeniu; pozostałe zapisują się normalnie.",
        );
      }
      return result;
    };

    const request = run();
    activeFlush.current = request;
    try {
      return await request;
    } finally {
      if (activeFlush.current === request) activeFlush.current = null;
      setSyncing(false);
      setPending(pendingCount());
      setQuarantined(quarantineCount());
    }
  }, []);

  // Problemy trwałości outboxa (korupcja JSON, pełny storage) → toast.
  // Alert może odpalić przed montażem (odczyt w inicjalizatorze stanu),
  // więc oprócz nasłuchu konsumujemy też zaległe zgłoszenia.
  const notifiedAlerts = useRef(new Set<OutboxAlertKind>());
  useEffect(() => {
    const notify = (kind: OutboxAlertKind) => {
      if (notifiedAlerts.current.has(kind)) return;
      notifiedAlerts.current.add(kind);
      toast.error(ALERT_MESSAGES[kind]);
    };
    const onAlert = (event: Event) => {
      const kind = (event as CustomEvent<{ kind: OutboxAlertKind }>).detail?.kind;
      if (kind) notify(kind);
    };
    window.addEventListener(OUTBOX_ALERT_EVENT, onAlert);
    for (const kind of pendingOutboxAlerts()) notify(kind);
    return () => window.removeEventListener(OUTBOX_ALERT_EVENT, onAlert);
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
      setQuarantined(quarantineCount());
      void flush();
    },
    [flush],
  );

  const queueDelete = useCallback(
    (sessionId: string, setId: string) => {
      enqueueDelete(sessionId, setId);
      setPending(pendingCount());
      setQuarantined(quarantineCount());
      void flush();
    },
    [flush],
  );

  const queueNotes = useCallback(
    (sessionId: string, sessionExerciseId: string, notes: string) => {
      enqueueNotes(sessionId, sessionExerciseId, notes);
      setPending(pendingCount());
      setQuarantined(quarantineCount());
      void flush();
    },
    [flush],
  );

  return {
    online,
    pending,
    quarantined,
    syncing,
    queueUpsert,
    queueDelete,
    queueNotes,
    flush,
  };
}
