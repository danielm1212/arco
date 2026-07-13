"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { startSession } from "@/app/actions/session";

/**
 * F1 (redesign-home.md §3.2/§3.4): lista dni programu przeniesiona z osobnej
 * sekcji "Program" na home do sheeta pod stopką hero. Start 1 tapem.
 */
export function DayPickerSheet({
  programName,
  days,
}: {
  programName: string;
  days: { id: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <BottomSheet
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button type="button" className="min-h-11 underline-offset-2 hover:underline">
          Inny dzień
        </button>
      }
      title={programName}
      description={`Wybierz dzień treningowy z programu ${programName}`}
    >
      <ul className="space-y-xs">
        {days.map((d) => (
          <li key={d.id}>
            <form action={startSession.bind(null, d.id)}>
              <button
                type="submit"
                className="flex h-11 w-full items-center justify-between rounded-md bg-muted px-md text-sm font-medium"
              >
                <span>{d.label}</span>
                <span className="text-xs text-muted-foreground">Zacznij →</span>
              </button>
            </form>
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}
