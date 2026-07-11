"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getSubstitutes, swapExercise } from "@/app/actions/substitute";
import { ensureOnline } from "@/lib/offlineGuard";
import { ExerciseBrowser, type BrowserHit } from "./ExerciseBrowser";

/**
 * Panel podmiany — kontrolowany z zewnątrz (N2#5: trigger ⇄ mieszka w nagłówku
 * karty ćwiczenia w Loggerze, panel rozwija się pod nagłówkiem).
 * Domyślnie rankowani kandydaci z getSubstitutes; chipy/search = pełny browse.
 */
export function SwapPanel({
  sessionId,
  sessionExerciseId,
  open,
  onClose,
}: {
  sessionId: string;
  sessionExerciseId: string;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loose, setLoose] = useState(false);
  const [candidates, setCandidates] = useState<BrowserHit[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    getSubstitutes(sessionExerciseId).then((res) => {
      if (cancelled) return;
      setLoose(res.loose);
      setCandidates(
        res.items.map((c) => ({ id: c.id, name: c.name, equipment: c.equipment, image: c.image })),
      );
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, sessionExerciseId]);

  function pick(id: string) {
    if (!ensureOnline("podmiana ćwiczenia")) return; // S10: offline-guard
    startTransition(async () => {
      try {
        await swapExercise(sessionId, sessionExerciseId, id);
        onClose();
        router.refresh();
      } catch {
        toast.error("Nie udało się podmienić ćwiczenia.");
      }
    });
  }

  if (!open) return null;

  return (
    <div className="rounded-md border bg-background p-sm">
      <ExerciseBrowser
        onPick={pick}
        pending={pending}
        defaultItems={candidates}
        defaultLoading={loading}
        defaultNote={
          loose
            ? "Brak ścisłego dopasowania — pokazuję najbliższe z dostępnym sprzętem."
            : null
        }
      />
    </div>
  );
}
