"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { deleteSession } from "@/app/actions/session";

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
    if (!confirm("Porzucić trening w toku? Zapisane serie zostaną usunięte.")) return;
    setBusy(true);
    deleteSession(open.id)
      .then(() => {
        setOpen(null);
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
    <div className="fixed inset-x-0 bottom-[calc(3.25rem+env(safe-area-inset-bottom))] z-40">
      <div className="mx-auto flex max-w-md items-center gap-sm border-t bg-volt px-md py-2 text-volt-foreground">
        <Link href={`/session/${open.id}`} className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            ▶ Trening w toku{open.label ? ` · ${open.label}` : ""}
          </p>
          <p className="text-xs tabular-nums text-volt-foreground/70">{mmss(elapsed)} — wróć</p>
        </Link>
        <button
          onClick={discard}
          disabled={busy}
          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-volt-foreground/80 hover:text-volt-foreground disabled:opacity-50"
          aria-label="Porzuć trening"
        >
          ✕ Porzuć
        </button>
      </div>
    </div>
  );
}
