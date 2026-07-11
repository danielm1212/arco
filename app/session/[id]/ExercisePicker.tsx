"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addSessionExercise } from "@/app/actions/sets";
import { ensureOnline } from "@/lib/offlineGuard";
import { getReorderHintSeen, setReorderHintSeen } from "@/lib/prefs";
import { Button } from "@/components/ui/button";
import { ExerciseBrowser } from "./ExerciseBrowser";

// R7 (audyt-loggera.md §6): jednorazowa edukacja gestu — dodane ćwiczenie ląduje
// na końcu, a reorder (⋯ → Przenieś wyżej/niżej) żyje na karcie, nie tutaj.
function maybeShowReorderHint() {
  if (getReorderHintSeen()) return;
  setReorderHintSeen(true);
  toast("Dodane na końcu — przenieś ⋯, jeśli chcesz wcześniej");
}

export function ExercisePicker({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function pick(id: string) {
    if (!ensureOnline("dodanie ćwiczenia")) return; // S10: offline-guard
    startTransition(async () => {
      try {
        await addSessionExercise(sessionId, id);
        setOpen(false);
        router.refresh();
        maybeShowReorderHint();
      } catch {
        toast.error("Nie udało się dodać ćwiczenia.");
      }
    });
  }

  // S13: multi-select — dodanie kilku naraz (sekwencyjnie: pozycje liczone z count)
  function pickMany(ids: string[]) {
    if (!ensureOnline("dodanie ćwiczeń")) return; // S10: offline-guard
    startTransition(async () => {
      try {
        for (const id of ids) await addSessionExercise(sessionId, id);
        toast.success(`Dodano ${ids.length} ćw.`);
        setOpen(false);
        router.refresh();
        maybeShowReorderHint();
      } catch {
        toast.error("Nie udało się dodać wszystkich ćwiczeń.");
        router.refresh();
      }
    });
  }

  if (!open) {
    return (
      <Button variant="outline" className="w-full" onClick={() => setOpen(true)}>
        + Dodaj ćwiczenie
      </Button>
    );
  }

  return (
    <div className="space-y-sm rounded-lg border bg-card p-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Dodaj ćwiczenie</p>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Anuluj
        </Button>
      </div>
      <ExerciseBrowser onPick={pick} onPickMany={pickMany} multi pending={pending} autoFocus />
    </div>
  );
}
