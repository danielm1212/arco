"use client";

import { toast } from "sonner";
import { finishSession, deleteSession } from "@/app/actions/session";
import { pendingCount } from "@/lib/outbox";
import type { LoggerExercise } from "./Logger";

/**
 * Zakończenie / usunięcie sesji z walidacjami (offline, zaległy outbox).
 * S9-cz.2 paczka 3: przeniesione 1:1 z Logger.tsx (bez zmiany zachowania).
 */
export async function handleFinish(args: {
  sessionId: string;
  exercises: LoggerExercise[];
  online: boolean;
  flush: () => Promise<void>;
}) {
  const { sessionId, exercises, online, flush } = args;
  const incomplete = exercises.some((ex) => ex.sets.some((s) => !s.completed));
  if (incomplete && !confirm("Masz niezaznaczone serie. Zakończyć trening mimo to?")) return;
  if (!online) {
    toast.error("Jesteś offline. Serie są zapisane lokalnie — zakończ, gdy wróci sieć.");
    return;
  }
  await flush(); // dosynchronizuj zaległe serie, żeby PR-y liczyły się z kompletu
  if (pendingCount() > 0) {
    toast.error("Trwa synchronizacja serii — spróbuj za chwilę.");
    return;
  }
  try {
    await finishSession(sessionId); // redirect do /history/[id]
  } catch (e) {
    // NEXT_REDIRECT to nie błąd
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
    toast.error("Nie udało się zakończyć — sprawdź połączenie.");
  }
}

export function handleDeleteSession(args: { sessionId: string; online: boolean }) {
  const { sessionId, online } = args;
  if (!confirm("Usunąć całą sesję? Tej operacji nie cofniesz.")) return;
  if (!online) {
    toast.error("Jesteś offline — usuwanie sesji wymaga sieci.");
    return;
  }
  deleteSession(sessionId).catch((e) => {
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
    toast.error("Nie udało się usunąć sesji.");
  });
}
