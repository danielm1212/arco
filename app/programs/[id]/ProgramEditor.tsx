"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  updateProgramName,
  addDay,
  updateDayLabel,
  deleteDay,
  addSlot,
  updateSlot,
  deleteSlot,
  deleteProgram,
} from "@/app/actions/program";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface EditorSlot {
  id: string;
  exerciseId: string;
  exerciseName: string;
  position: number;
  targetSets: number;
  repsMin: number | null;
  repsMax: number | null;
  rest: number;
  notes: string | null;
}
export interface EditorDay {
  id: string;
  label: string;
  position: number;
  slots: EditorSlot[];
}

const ERR = "Nie zapisano — spróbuj ponownie.";
const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v));

export function ProgramEditor({
  programId,
  name,
  days,
}: {
  programId: string;
  name: string;
  days: EditorDay[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const run = (fn: () => Promise<unknown>, refresh = false) =>
    startTransition(async () => {
      try {
        await fn();
        if (refresh) router.refresh();
      } catch {
        toast.error(ERR);
      }
    });

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex items-center justify-between border-b px-md py-sm">
        <Link href="/programs" className="text-xs text-muted-foreground">
          ← Programy
        </Link>
        <span className="font-semibold">Edytor</span>
        <span className="w-12" />
      </header>

      <main className="flex-1 space-y-lg p-md">
        <div className="space-y-xs">
          <label className="text-sm font-medium text-muted-foreground">Nazwa programu</label>
          <Input
            defaultValue={name}
            onBlur={(e) => run(() => updateProgramName(programId, e.target.value))}
          />
        </div>

        {days.map((day) => (
          <section key={day.id} className="space-y-sm rounded-lg border bg-card p-md">
            <div className="flex items-center gap-sm">
              <Input
                defaultValue={day.label}
                onBlur={(e) => run(() => updateDayLabel(programId, day.id, e.target.value))}
                className="h-9 font-medium"
              />
              <button
                onClick={() => run(() => deleteDay(programId, day.id), true)}
                className="shrink-0 text-xs text-muted-foreground hover:text-danger"
              >
                Usuń dzień
              </button>
            </div>

            <ul className="space-y-xs">
              {day.slots.map((slot) => (
                <SlotRow
                  key={slot.id}
                  slot={slot}
                  onUpdate={(v) => run(() => updateSlot(programId, slot.id, v))}
                  onDelete={() => run(() => deleteSlot(programId, slot.id), true)}
                />
              ))}
            </ul>

            <AddSlot
              onPick={(exId) => run(() => addSlot(programId, day.id, exId), true)}
            />
          </section>
        ))}

        <Button variant="outline" className="w-full" onClick={() => run(() => addDay(programId), true)}>
          + Dodaj dzień
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Aby trenować wg tego programu — ustaw go jako aktywny na ekranie głównym.
        </p>

        <button
          onClick={() => {
            if (confirm("Usunąć cały program?")) run(() => deleteProgram(programId));
          }}
          className="w-full py-sm text-sm text-danger"
        >
          Usuń program
        </button>
      </main>
    </div>
  );
}

function SlotRow({
  slot,
  onUpdate,
  onDelete,
}: {
  slot: EditorSlot;
  onUpdate: (v: {
    target_sets?: number;
    target_reps_min?: number | null;
    target_reps_max?: number | null;
    rest_seconds?: number;
  }) => void;
  onDelete: () => void;
}) {
  return (
    <li className="space-y-2xs rounded-md border p-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{slot.exerciseName}</span>
        <button onClick={onDelete} className="text-xs text-muted-foreground hover:text-danger">
          ✕
        </button>
      </div>
      <div className="flex items-center gap-xs text-xs text-muted-foreground">
        <Mini label="serie" def={slot.targetSets} onBlur={(n) => onUpdate({ target_sets: n ?? 3 })} />
        <Mini label="od" def={slot.repsMin} onBlur={(n) => onUpdate({ target_reps_min: n })} />
        <Mini label="do" def={slot.repsMax} onBlur={(n) => onUpdate({ target_reps_max: n })} />
        <Mini label="rest s" def={slot.rest} onBlur={(n) => onUpdate({ rest_seconds: n ?? 120 })} />
      </div>
    </li>
  );
}

function Mini({
  label,
  def,
  onBlur,
}: {
  label: string;
  def: number | null;
  onBlur: (n: number | null) => void;
}) {
  return (
    <label className="flex flex-1 flex-col items-center gap-px">
      <input
        type="number"
        inputMode="numeric"
        defaultValue={def ?? ""}
        onBlur={(e) => onBlur(numOrNull(e.target.value))}
        className="w-full rounded border border-input bg-background px-1 py-1 text-center text-sm"
      />
      <span>{label}</span>
    </label>
  );
}

function AddSlot({ onPick }: { onPick: (exerciseId: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<{ id: string; name: string; equipment: string | null }[]>([]);

  async function search(value: string) {
    setQ(value);
    if (value.trim().length < 2) return setHits([]);
    const sb = createClient();
    const { data } = await sb
      .from("exercises")
      .select("id, name, equipment")
      .ilike("name", `%${value.trim()}%`)
      .order("name")
      .limit(20);
    setHits(data ?? []);
  }

  if (!open)
    return (
      <Button variant="ghost" size="sm" className="w-full" onClick={() => setOpen(true)}>
        + ćwiczenie
      </Button>
    );

  return (
    <div className="space-y-2xs rounded-md border p-sm">
      <div className="flex items-center gap-xs">
        <Input autoFocus value={q} onChange={(e) => search(e.target.value)} placeholder="Szukaj…" className="h-9" />
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Anuluj
        </Button>
      </div>
      <ul className="max-h-56 space-y-px overflow-y-auto">
        {hits.map((h) => (
          <li key={h.id}>
            <button
              onClick={() => {
                onPick(h.id);
                setOpen(false);
                setQ("");
                setHits([]);
              }}
              className="flex w-full items-center justify-between rounded px-sm py-xs text-left text-sm hover:bg-accent"
            >
              <span>{h.name}</span>
              <span className="text-xs text-muted-foreground">{h.equipment ?? "—"}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
