"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getSubstitutes, swapExercise } from "@/app/actions/substitute";
import { ensureOnline } from "@/lib/offlineGuard";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ExerciseBrowser, type BrowserHit } from "./ExerciseBrowser";

/**
 * Panel podmiany — kontrolowany z zewnątrz (N2#5: trigger ⇄ mieszka w nagłówku
 * karty ćwiczenia w Loggerze). Bottom sheet (nie inline panel — feedback
 * 2026-07-11: nie było jak zamknąć bez wyboru); X/przeciągnięcie/tap tła zamykają.
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
  const [result, setResult] = useState<{
    sessionExerciseId: string;
    loose: boolean;
    candidates: BrowserHit[];
  } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    getSubstitutes(sessionExerciseId).then((res) => {
      if (cancelled) return;
      setResult({
        sessionExerciseId,
        loose: res.loose,
        candidates: res.items.map((c) => ({
          id: c.id,
          name: c.name,
          equipment: c.equipment,
          image: c.image,
        })),
      });
    });
    return () => {
      cancelled = true;
    };
  }, [open, sessionExerciseId]);

  const loaded = result?.sessionExerciseId === sessionExerciseId;

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

  return (
    <BottomSheet
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="Podmień ćwiczenie"
      description="Wybierz zamiennik ćwiczenia z listy lub wyszukaj"
    >
      <ExerciseBrowser
        onPick={pick}
        pending={pending}
        defaultItems={loaded ? result.candidates : []}
        defaultLoading={open && !loaded}
        defaultNote={
          loaded && result.loose
            ? "Nie ma dokładnego dopasowania. Pokazuję podobne ćwiczenia na dostępnym sprzęcie."
            : null
        }
      />
    </BottomSheet>
  );
}
