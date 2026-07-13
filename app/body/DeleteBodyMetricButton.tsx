"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteBodyMetric } from "@/app/actions/body";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";

export function DeleteBodyMetricButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      try {
        await deleteBodyMetric(id);
        setOpen(false);
        toast.success("Pomiar usunięty.");
      } catch {
        toast.error("Nie udało się usunąć pomiaru.");
      }
    });
  }

  return (
    <>
      <button type="button" aria-label="Usuń pomiar" disabled={pending} onClick={() => setOpen(true)} className="grid size-11 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"><Trash2 className="size-4" aria-hidden /></button>
      <BottomSheet open={open} onOpenChange={setOpen} title="Usunąć pomiar?" description="Potwierdzenie trwałego usunięcia pomiaru ciała.">
        <div className="space-y-md"><p className="text-sm text-muted-foreground">Pomiar i przypisane do niego zdjęcie zostaną trwale usunięte.</p><Button className="w-full" variant="destructive" disabled={pending} onClick={remove}>{pending ? "Usuwam…" : "Usuń pomiar"}</Button><Button className="w-full" variant="ghost" disabled={pending} onClick={() => setOpen(false)}>Anuluj</Button></div>
      </BottomSheet>
    </>
  );
}
