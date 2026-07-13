"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteSession } from "@/app/actions/session";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";

export function DeleteSessionButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);

  function remove() {
    start(async () => {
      try {
        await deleteSession(id);
        setOpen(false);
      } catch (e) {
        if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
        toast.error("Nie udało się usunąć sesji.");
      }
    });
  }

  return (
    <>
      <button type="button" aria-label="Usuń sesję" disabled={pending} onClick={() => setOpen(true)} className="grid size-11 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"><Trash2 className="size-4" aria-hidden /></button>
      <BottomSheet open={open} onOpenChange={setOpen} title="Usunąć trening?" description="Potwierdzenie trwałego usunięcia treningu.">
        <div className="space-y-md"><p className="text-sm text-muted-foreground">Trening i wszystkie zapisane w nim serie znikną z historii. Tej operacji nie można cofnąć.</p><Button className="w-full" variant="destructive" disabled={pending} onClick={remove}>{pending ? "Usuwam…" : "Usuń trening"}</Button><Button className="w-full" variant="ghost" disabled={pending} onClick={() => setOpen(false)}>Anuluj</Button></div>
      </BottomSheet>
    </>
  );
}
