"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { BottomSheet } from "@/components/ui/bottom-sheet";

interface CoverOption {
  id: string;
  name: string;
  cover_thumbnail_url: string | null;
}

/**
 * Wybór okładki własnego programu spośród 15 okładek systemowych.
 *
 * Lista pobierana leniwie przy otwarciu (wzorzec `AddSlot`/`ExerciseInfoSheet` w tym
 * repo) — `programs where user_id is null` jest jedynym źródłem prawdy o dostępnych
 * okładkach (RLS `programs_select` już to pozwala każdemu zalogowanemu), więc nie
 * duplikujemy tej listy w osobnym pliku, który mógłby się z bazą rozjechać.
 *
 * Rodzic wykonuje faktyczny zapis (`updateProgramCover` + `router.refresh()`) —
 * ten komponent tylko zwraca wybór przez `onPick`, tak jak `AddSlot.onPick`.
 */
export function ProgramCoverPicker({
  coverThumbnailUrl,
  onPick,
}: {
  coverThumbnailUrl: string | null;
  onPick: (sourceProgramId: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<CoverOption[] | null>(null);

  async function load() {
    if (options || loading) return;
    setLoading(true);
    const sb = createClient();
    const { data } = await sb
      .from("programs")
      .select("id, name, cover_thumbnail_url")
      .is("user_id", null)
      .order("name");
    setOptions(data ?? []);
    setLoading(false);
  }

  function pick(sourceProgramId: string | null) {
    onPick(sourceProgramId);
    setOpen(false);
  }

  return (
    <div className="space-y-xs">
      <label className="text-sm font-medium text-muted-foreground">Okładka</label>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          load();
        }}
        className="flex min-h-11 w-full items-center gap-sm rounded-md border p-xs text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="relative block size-14 shrink-0 overflow-hidden rounded-md bg-muted">
          {coverThumbnailUrl && (
            <Image src={coverThumbnailUrl} alt="" fill sizes="56px" className="object-cover" />
          )}
        </span>
        <span className="text-sm">
          {coverThumbnailUrl ? "Zmień okładkę" : "Wybierz okładkę"}
        </span>
      </button>

      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="Wybierz okładkę"
        description="Okładka z biblioteki programów Arco"
      >
        <div className="space-y-md">
          {loading && <p className="text-sm text-muted-foreground">Wczytuję…</p>}
          <div className="grid grid-cols-3 gap-xs">
            <button
              type="button"
              onClick={() => pick(null)}
              className="flex aspect-square items-center justify-center rounded-md border text-xs text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Brak
            </button>
            {options?.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => pick(opt.id)}
                aria-label={opt.name}
                className="relative aspect-square overflow-hidden rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {opt.cover_thumbnail_url ? (
                  <Image src={opt.cover_thumbnail_url} alt="" fill sizes="120px" className="object-cover" />
                ) : (
                  <span className="absolute inset-0 bg-muted" />
                )}
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
