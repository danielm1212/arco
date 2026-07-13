"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateSessionDate } from "@/app/actions/session";
import { Button } from "@/components/ui/button";

/** S12: „Kiedy" — edycja daty/czasu sesji (logowanie po fakcie, wzorzec Hevy Save Workout). */
export function DateEditor({ sessionId, startedAt }: { sessionId: string; startedAt: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  // datetime-local oczekuje lokalnego czasu bez strefy
  const toLocalInput = (iso: string) => {
    const d = new Date(iso);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };
  const [value, setValue] = useState(() => toLocalInput(startedAt));
  const [pending, startTransition] = useTransition();

  if (!editing) {
    return (
      <p className="text-sm text-muted-foreground">
        {new Date(startedAt).toLocaleString("pl-PL")}
        <button
          onClick={() => setEditing(true)}
          className="ml-1 inline-flex min-h-11 items-center rounded-md px-2 text-sm underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          zmień
        </button>
      </p>
    );
  }

  function save() {
    startTransition(async () => {
      try {
        const res = await updateSessionDate(sessionId, new Date(value).toISOString());
        if (res.error) {
          toast.error(res.error);
          return;
        }
        toast.success("Data sesji zaktualizowana.");
        setEditing(false);
        router.refresh();
      } catch {
        toast.error("Nie udało się zapisać daty.");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-xs">
      <input
        type="datetime-local"
        value={value}
        max={toLocalInput(new Date().toISOString())}
        onChange={(e) => setValue(e.target.value)}
        className="h-11 rounded-md border border-input bg-background px-2 text-sm"
      />
      <Button disabled={pending} onClick={save}>
        {pending ? "Zapisuję…" : "Zapisz"}
      </Button>
      <Button variant="ghost" disabled={pending} onClick={() => setEditing(false)}>
        Anuluj
      </Button>
    </div>
  );
}
