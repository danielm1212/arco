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
export function useSync(scopeSessionId?: string) {
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
  // Pierwszy render klienta musi być identyczny z HTML-em z serwera.
  // Liczniki z localStorage odczytujemy dopiero po zamontowaniu komponentu.
  const [pending, setPending] = useState(0);
  const [quarantined, setQuarantined] = useState(0);
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
        setPending(pendingCount(scopeSessionId));
        setQuarantined(quarantineCount(scopeSessionId));
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
      setPending(pendingCount(scopeSessionId));
      setQuarantined(quarantineCount(scopeSessionId));
    }
  }, [scopeSessionId]);

  // Problemy trwałości outboxa (korupcja JSON, pełny storage) → toast.
  // Oprócz nasłuchu konsumujemy też zaległe zgłoszenia, które mogły
  // powstać przed zamontowaniem komponentu.
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
    const hydrateCounts = window.requestAnimationFrame(() => {
      setPending(pendingCount(scopeSessionId));
      setQuarantined(quarantineCount(scopeSessionId));
    });
    return () => window.cancelAnimationFrame(hydrateCounts);
  }, [scopeSessionId]);

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
      setPending(pendingCount(scopeSessionId));
      setQuarantined(quarantineCount(scopeSessionId));
      void flush();
    },
    [flush, scopeSessionId],
  );

  const queueDelete = useCallback(
    (sessionId: string, setId: string) => {
      enqueueDelete(sessionId, setId);
      setPending(pendingCount(scopeSessionId));
      setQuarantined(quarantineCount(scopeSessionId));
      void flush();
    },
    [flush, scopeSessionId],
  );

  const queueNotes = useCallback(
    (sessionId: string, sessionExerciseId: string, notes: string) => {
      enqueueNotes(sessionId, sessionExerciseId, notes);
      setPending(pendingCount(scopeSessionId));
      setQuarantined(quarantineCount(scopeSessionId));
      void flush();
    },
    [flush, scopeSessionId],
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
