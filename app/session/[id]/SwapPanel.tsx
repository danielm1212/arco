"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  getSubstitutes,
  swapExercise,
  type Candidate,
} from "@/app/actions/substitute";

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
  const [items, setItems] = useState<Candidate[]>([]);
  const [pending, startTransition] = useTransition();

  async function load() {
    setOpen(true);
    setLoading(true);
    const res = await getSubstitutes(sessionExerciseId);
    setLoose(res.loose);
    setItems(res.items);
    setLoading(false);
  }

  function pick(id: string) {
    startTransition(async () => {
      await swapExercise(sessionId, sessionExerciseId, id);
      setOpen(false);
      router.refresh();
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
        <div className="mt-sm space-y-2xs rounded-md border bg-background p-sm">
          {loading && <p className="text-sm text-muted-foreground">Szukam zamienników…</p>}
          {!loading && loose && (
            <p className="text-xs text-warning">
              Brak ścisłego dopasowania — pokazuję najbliższe z dostępnym sprzętem.
            </p>
          )}
          {!loading && items.length === 0 && (
            <p className="text-sm text-muted-foreground">Brak kandydatów.</p>
          )}
          <ul className="max-h-60 space-y-2xs overflow-y-auto">
            {items.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => pick(c.id)}
                  className="flex w-full items-center justify-between rounded-md px-sm py-xs text-left hover:bg-accent disabled:opacity-50"
                >
                  <span className="text-sm">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.equipment ?? "—"}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
