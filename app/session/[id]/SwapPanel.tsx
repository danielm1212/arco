"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getSubstitutes,
  swapExercise,
  type Candidate,
} from "@/app/actions/substitute";
import { ExerciseInfoSheet } from "@/components/ExerciseInfoSheet";

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
      try {
        await swapExercise(sessionId, sessionExerciseId, id);
        setOpen(false);
        router.refresh();
      } catch {
        toast.error("Nie udało się podmienić ćwiczenia.");
      }
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
          <ul className="max-h-72 space-y-2xs overflow-y-auto">
            {items.map((c) => (
              <li key={c.id} className="flex items-center gap-sm rounded-md py-xs pl-xs pr-sm hover:bg-accent">
                {c.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={c.image}
                    alt=""
                    loading="lazy"
                    className="size-11 shrink-0 rounded-md border bg-muted object-cover"
                  />
                ) : (
                  <div className="size-11 shrink-0 rounded-md border bg-muted" />
                )}
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => pick(c.id)}
                  className="min-w-0 flex-1 text-left disabled:opacity-50"
                >
                  <p className="truncate text-sm">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.equipment ?? "—"}</p>
                </button>
                <ExerciseInfoSheet exerciseId={c.id}>
                  <button
                    type="button"
                    aria-label="Podgląd ćwiczenia"
                    className="shrink-0 rounded-full border border-input px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    ⓘ
                  </button>
                </ExerciseInfoSheet>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
