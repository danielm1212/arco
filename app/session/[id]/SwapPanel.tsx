"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getSubstitutes, swapExercise } from "@/app/actions/substitute";
import { ExerciseBrowser, type BrowserHit } from "./ExerciseBrowser";

export function SwapPanel({
  sessionId,
  sessionExerciseId,
}: {
  sessionId: string;
  sessionExerciseId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loose, setLoose] = useState(false);
  const [candidates, setCandidates] = useState<BrowserHit[]>([]);
  const [pending, startTransition] = useTransition();

  async function load() {
    setOpen(true);
    setLoading(true);
    const res = await getSubstitutes(sessionExerciseId);
    setLoose(res.loose);
    setCandidates(
      res.items.map((c) => ({ id: c.id, name: c.name, equipment: c.equipment, image: c.image })),
    );
    setLoading(false);
  }

  function pick(id: string) {
    startTransition(async () => {
      try {
        await swapExercise(sessionId, sessionExerciseId, id);
        setOpen(false);
        router.refresh();
      } catch {
        toast.error("Nie udało się podmienić ćwiczenia.");
      }
    });
  }

  return (
    <>
      <button
        onClick={open ? () => setOpen(false) : load}
        className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
        aria-label="Podmień ćwiczenie"
        title="Podmień ćwiczenie"
      >
        ⇄ Podmień
      </button>

      {open && (
        <div className="mt-sm rounded-md border bg-background p-sm">
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
      )}
    </>
  );
}
