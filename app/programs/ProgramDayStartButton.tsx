"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { startSession } from "@/app/actions/session";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";

export function ProgramDayStartButton({
  dayId,
  dayLabel,
  programName,
  alongsideActivePlan,
}: {
  dayId: string;
  dayLabel: string;
  programName: string;
  alongsideActivePlan: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <BottomSheet
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button type="button" variant="outline" className="w-full">
          <Play aria-hidden />
          Zacznij ten trening
        </Button>
      }
      title={`Zacząć „${dayLabel}”?`}
      description={`Potwierdzenie rozpoczęcia dnia ${dayLabel} z planu ${programName}`}
    >
      <div className="space-y-md">
        <div className="space-y-xs text-sm leading-relaxed text-muted-foreground">
          {alongsideActivePlan && (
            <p>
              To trening obok planu. Twój aktywny plan i jego rotacja zostają bez zmian.
            </p>
          )}
          <p>
            Jeśli masz już trening w toku, wrócisz do niego — nie utworzymy drugiej sesji.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-sm">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Anuluj
          </Button>
          <form action={startSession.bind(null, dayId)}>
            <Button type="submit" className="w-full">
              Zacznij
            </Button>
          </form>
        </div>
      </div>
    </BottomSheet>
  );
}
