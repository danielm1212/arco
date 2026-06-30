"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addSessionExercise } from "@/app/actions/sets";
import { Button } from "@/components/ui/button";
import { ExerciseBrowser } from "./ExerciseBrowser";

export function ExercisePicker({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function pick(id: string) {
    startTransition(async () => {
      try {
        await addSessionExercise(sessionId, id);
        setOpen(false);
        router.refresh();
      } catch {
        toast.error("Nie udało się dodać ćwiczenia.");
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
      <ExerciseBrowser onPick={pick} pending={pending} autoFocus />
    </div>
  );
}
