"use client";

import { toast } from "sonner";
import { finishSession, deleteSession } from "@/app/actions/session";
import { pendingCount } from "@/lib/outbox";
import type { LoggerExercise } from "./Logger";

/**
 * Zakończenie / usunięcie sesji z walidacjami (offline, zaległy outbox).
 * S9-cz.2 paczka 3: przeniesione 1:1 z Logger.tsx (bez zmiany zachowania).
 * R4 (audyt-loggera.md F4): decyzja "są niezaliczone serie, kontynuować?" żyje
 * teraz w FinishSheet (wywoływana PRZED tą funkcją) — tu tylko sam finish.
 */
export async function handleFinish(args: {
  sessionId: string;
  exercises: LoggerExercise[];
  online: boolean;
  flush: () => Promise<void>;
}) {
  const { sessionId, online, flush } = args;
  if (!online) {
    toast.error("Brak internetu. Serie są zapisane na tym urządzeniu. Zakończ trening po powrocie sieci.");
    return;
  }
  await flush(); // dosynchronizuj zaległe serie, żeby PR-y liczyły się z kompletu
  if (pendingCount() > 0) {
    toast.error("Serie nadal się synchronizują. Spróbuj za chwilę.");
    return;
  }
  try {
    await finishSession(sessionId); // redirect do /history/[id]
  } catch (e) {
    // NEXT_REDIRECT to nie błąd
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
    toast.error("Nie udało się zakończyć treningu. Sprawdź internet.");
  }
}

export async function handleDeleteSession(args: { sessionId: string; online: boolean }) {
  const { sessionId, online } = args;
  if (!online) {
    toast.error("Do usunięcia sesji potrzebny jest internet.");
    return;
  }
  try {
    await deleteSession(sessionId);
  } catch (e) {
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
    toast.error("Nie udało się usunąć sesji.");
  }
}
