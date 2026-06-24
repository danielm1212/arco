"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteSession } from "@/app/actions/session";

export function DeleteSessionButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      aria-label="Usuń sesję"
      disabled={pending}
      onClick={() => {
        if (!confirm("Usunąć tę sesję? Tej operacji nie cofniesz.")) return;
        start(async () => {
          try {
            await deleteSession(id);
          } catch (e) {
            if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
            toast.error("Nie udało się usunąć sesji.");
          }
        });
      }}
      className="shrink-0 rounded-md px-2 py-1 text-sm text-muted-foreground hover:text-danger disabled:opacity-50"
    >
      ✕
    </button>
  );
}
