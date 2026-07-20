"use client";

import { useState } from "react";
import { ArrowRight, Dumbbell } from "lucide-react";
import { startFreestyle } from "@/app/actions/session";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";

/**
 * Własny trening jest równoprawnym, lecz świadomym wyjściem z hero planu.
 * Zamiast niejasnego tekstu „Bez planu” użytkownik widzi, co się wydarzy,
 * a jeden lekki sheet chroni przed przypadkowym startem nowej sesji.
 */
export function FreestyleStartButton({ variant }: { variant: "inline" | "card" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={
          variant === "inline"
            ? "ml-auto flex min-h-11 items-center gap-1.5 font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            : "flex w-full items-center gap-sm rounded-xl bg-card p-md text-left text-sm font-semibold shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        }
      >
        <Dumbbell className="size-4 shrink-0" aria-hidden />
        <span>
          Własny trening
          {variant === "card" && (
            <span className="mt-2xs block text-xs font-normal text-muted-foreground">
              Dobierz ćwiczenia samodzielnie
            </span>
          )}
        </span>
        {variant === "inline" && <ArrowRight className="size-3.5" aria-hidden />}
      </button>

      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="Zacząć własny trening?"
        description="Trening bez gotowego planu"
      >
        <div className="space-y-md">
          <p className="text-sm text-muted-foreground">
            Samodzielnie dodasz ćwiczenia i serie. Twój aktywny plan pozostanie bez zmian.
          </p>
          <form action={startFreestyle}>
            <Button type="submit" className="w-full">
              Zacznij własny trening
            </Button>
          </form>
          <Button variant="ghost" className="w-full" onClick={() => setOpen(false)}>
            Wróć do planu
          </Button>
        </div>
      </BottomSheet>
    </>
  );
}
