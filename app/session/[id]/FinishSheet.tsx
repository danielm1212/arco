"use client";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";

/**
 * R4 (audyt-loggera.md F4): sheet zamiast natywnego confirm() — tylko gdy sesja
 * ma niezaliczone serie (czysta sesja kończy się od razu, bez dodatkowego tapu).
 */
export function FinishSheet({
  open,
  onOpenChange,
  doneSets,
  incompleteSets,
  minutes,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doneSets: number;
  incompleteSets: number;
  minutes: number;
  onConfirm: () => void;
}) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Zakończyć trening?"
      description="Podsumowanie przed zakończeniem sesji"
    >
      <p className="text-sm text-muted-foreground">
        ✓ {doneSets} serii · {incompleteSets} niezaliczonych · {minutes} min
      </p>
      <div className="mt-md flex flex-col gap-sm">
        <Button
          onClick={() => {
            onOpenChange(false);
            onConfirm();
          }}
        >
          Zakończ trening
        </Button>
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Wróć do treningu
        </Button>
      </div>
    </BottomSheet>
  );
}
