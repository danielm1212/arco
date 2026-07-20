"use client";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";

/** Pusta sesja nie jest treningiem: dajemy prostą drogę powrotu albo usunięcia. */
export function EmptySessionSheet({
  open,
  onOpenChange,
  deleting,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Nie zaliczyłeś żadnej serii"
      description="Pusty trening nie powinien trafiać do historii"
    >
      <div className="space-y-md">
        <p className="text-sm text-muted-foreground">
          Prawdopodobnie to przypadkowo rozpoczęta sesja. Wróć, aby wpisać serię, albo usuń ją teraz.
        </p>
        <Button className="w-full" onClick={() => onOpenChange(false)} disabled={deleting}>
          Wróć do treningu
        </Button>
        <Button variant="destructive" className="w-full" onClick={onDelete} disabled={deleting}>
          {deleting ? "Usuwam…" : "Usuń pusty trening"}
        </Button>
      </div>
    </BottomSheet>
  );
}
