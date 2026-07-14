"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { deleteSession } from "@/app/actions/session";
import { Play, X } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";

interface OpenSession {
  id: string;
  started_at: string;
  label: string | null;
}

const mmss = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * S12: sesja jako obiekt globalny — mini-bar „Trening w toku" nad nawigacją
 * na każdym ekranie poza loggerem. ▶ Wróć / ✕ Porzuć (zawsze z potwierdzeniem).
 */
export function SessionMiniBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState<OpenSession | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Odpytanie przy każdej zmianie trasy — sesja mogła zostać zakończona/porzucona
  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("sessions")
      .select("id, started_at, program_days(label)")
      .is("finished_at", null)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setOpen(
          data
            ? {
                id: data.id,
                started_at: data.started_at,
                label:
                  (data.program_days as unknown as { label: string } | null)?.label ?? null,
              }
            : null,
        );
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const tick = () =>
      setElapsed(Math.max(0, Math.floor((Date.now() - new Date(open.started_at).getTime()) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [open]);

  if (!open) return null;

  function discard() {
    if (!open) return;
    setBusy(true);
    deleteSession(open.id)
      .then(() => {
        setOpen(null);
        setConfirmOpen(false);
        router.refresh();
      })
      .catch((e) => {
        if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) {
          setOpen(null);
          return;
        }
        toast.error("Nie udało się porzucić sesji.");
      })
      .finally(() => setBusy(false));
  }

  return (
    <>
    <div className="fixed inset-x-[var(--floating-nav-gap)] bottom-[calc(var(--floating-nav-height)+var(--floating-nav-gap)+0.25rem)] z-40 mx-auto max-w-[424px]">
      <div className="flex items-center gap-sm rounded-xl bg-volt px-sm py-1.5 text-volt-foreground shadow-lg">
        <Link href={`/session/${open.id}`} className="flex min-h-11 min-w-0 flex-1 flex-col justify-center rounded-md px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt-foreground">
          <p className="flex items-center gap-1 truncate text-sm font-semibold">
            <Play className="size-3.5 shrink-0 fill-current" /> Trening w toku
            {open.label ? ` · ${open.label}` : ""}
          </p>
          <p className="text-xs tabular-nums text-volt-foreground/70">{mmss(elapsed)} · Wróć</p>
        </Link>
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={busy}
          className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-md px-3 text-xs font-medium text-volt-foreground/80 hover:bg-black/10 hover:text-volt-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt-foreground disabled:opacity-50"
          aria-label="Porzuć trening"
        >
          <X className="size-3.5" /> Porzuć
        </button>
      </div>
    </div>
    <BottomSheet open={confirmOpen} onOpenChange={setConfirmOpen} title="Porzucić trening?" description="Usunie trening w toku i zapisane w nim serie">
      <div className="space-y-md">
        <p className="text-sm text-muted-foreground">Trening w toku i zapisane w nim serie zostaną trwale usunięte.</p>
        <Button className="w-full" variant="destructive" disabled={busy} onClick={discard}>{busy ? "Usuwam…" : "Porzuć trening"}</Button>
        <Button className="w-full" variant="ghost" disabled={busy} onClick={() => setConfirmOpen(false)}>Wróć do treningu</Button>
      </div>
    </BottomSheet>
    </>
  );
}
