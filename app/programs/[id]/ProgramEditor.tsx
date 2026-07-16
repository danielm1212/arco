"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Plus, Trash2, X } from "lucide-react";
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
  moveDay,
  moveSlot,
} from "@/app/actions/program";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/navigation/PageHeader";
import { ScreenChrome } from "@/components/navigation/ScreenChrome";

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

const ERR = "Nie udało się zapisać. Spróbuj ponownie.";
const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v));

interface DeleteRequest {
  title: string;
  description: string;
  confirmLabel: string;
  action: () => void;
}

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
  const [deleteRequest, setDeleteRequest] = useState<DeleteRequest | null>(null);

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
      <ScreenChrome
        screenType="focus"
        showBottomNav={false}
        activeTab={null}
        showSessionMiniBar={false}
        miniBarPosition="safe-bottom"
      />
      <PageHeader title="Edytor" fallback="/programs" backLabel="Wróć do programów" sticky />

      <main className="flex-1 space-y-lg p-md">
        <div className="space-y-xs">
          <label className="text-sm font-medium text-muted-foreground">Nazwa programu</label>
          <Input
            defaultValue={name}
            onBlur={(e) => run(() => updateProgramName(programId, e.target.value))}
          />
        </div>

        {days.map((day) => (
          <section key={day.id} className="space-y-sm rounded-xl border bg-card p-md">
            <div className="flex items-center gap-sm">
              <Input
                defaultValue={day.label}
                onBlur={(e) => run(() => updateDayLabel(programId, day.id, e.target.value))}
                className="min-w-0 font-medium"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => run(() => moveDay(programId, day.id, "up"), true)}
                className="shrink-0 text-muted-foreground"
                aria-label="Dzień wyżej"
              >
                <ChevronUp />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => run(() => moveDay(programId, day.id, "down"), true)}
                className="shrink-0 text-muted-foreground"
                aria-label="Dzień niżej"
              >
                <ChevronDown />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  setDeleteRequest({
                    title: `Usunąć „${day.label}”?`,
                    description: "Dzień i wszystkie przypisane do niego ćwiczenia znikną z programu.",
                    confirmLabel: "Usuń dzień",
                    action: () => {
                      setDeleteRequest(null);
                      run(() => deleteDay(programId, day.id), true);
                    },
                  })
                }
                className="shrink-0 text-muted-foreground hover:text-danger"
                aria-label={`Usuń ${day.label}`}
              >
                <Trash2 />
              </Button>
            </div>

            <ul className="space-y-xs">
              {day.slots.map((slot) => (
                <SlotRow
                  key={slot.id}
                  slot={slot}
                  onUpdate={(v) => run(() => updateSlot(programId, slot.id, v))}
                  onDelete={() =>
                    setDeleteRequest({
                      title: `Usunąć „${slot.exerciseName}”?`,
                      description: "Ćwiczenie zostanie usunięte tylko z tego dnia programu.",
                      confirmLabel: "Usuń ćwiczenie",
                      action: () => {
                        setDeleteRequest(null);
                        run(() => deleteSlot(programId, slot.id), true);
                      },
                    })
                  }
                  onMoveUp={() => run(() => moveSlot(programId, slot.id, "up"), true)}
                  onMoveDown={() => run(() => moveSlot(programId, slot.id, "down"), true)}
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
          Aby trenować według tego programu, ustaw go jako aktywny na ekranie głównym.
        </p>

        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            setDeleteRequest({
              title: `Usunąć program „${name}”?`,
              description: "Tej operacji nie można cofnąć. Historia wykonanych treningów pozostanie bez zmian.",
              confirmLabel: "Usuń program",
              action: () => run(() => deleteProgram(programId)),
            })
          }
          className="w-full text-danger hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 />
          Usuń program
        </Button>
      </main>

      <BottomSheet
        open={deleteRequest != null}
        onOpenChange={(open) => !open && setDeleteRequest(null)}
        title={deleteRequest?.title ?? "Potwierdź usunięcie"}
        description="Sprawdź, co zostanie usunięte"
      >
        <div className="space-y-md">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {deleteRequest?.description}
          </p>
          <div className="grid grid-cols-2 gap-sm">
            <Button variant="outline" onClick={() => setDeleteRequest(null)}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={() => deleteRequest?.action()}>
              {deleteRequest?.confirmLabel ?? "Usuń"}
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

function SlotRow({
  slot,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  slot: EditorSlot;
  onUpdate: (v: {
    target_sets?: number;
    target_reps_min?: number | null;
    target_reps_max?: number | null;
    rest_seconds?: number;
  }) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <li className="space-y-2xs rounded-md border p-sm">
      <div className="flex items-center justify-between gap-xs">
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{slot.exerciseName}</span>
        <Button type="button" variant="ghost" size="icon" onClick={onMoveUp} className="shrink-0 text-muted-foreground" aria-label="Ćwiczenie wyżej">
          <ChevronUp />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={onMoveDown} className="shrink-0 text-muted-foreground" aria-label="Ćwiczenie niżej">
          <ChevronDown />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={onDelete} className="shrink-0 text-muted-foreground hover:text-danger" aria-label={`Usuń ${slot.exerciseName}`}>
          <Trash2 />
        </Button>
      </div>
      <div className="flex items-center gap-xs text-xs text-muted-foreground">
        <Mini label="serie" def={slot.targetSets} onBlur={(n) => onUpdate({ target_sets: n ?? 3 })} />
        <Mini label="od" def={slot.repsMin} onBlur={(n) => onUpdate({ target_reps_min: n })} />
        <Mini label="do" def={slot.repsMax} onBlur={(n) => onUpdate({ target_reps_max: n })} />
        <Mini label="przerwa s" def={slot.rest} onBlur={(n) => onUpdate({ rest_seconds: n ?? 120 })} />
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
        className="h-11 w-full rounded border border-input bg-background px-1 text-center text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
      <Button variant="ghost" className="w-full" onClick={() => setOpen(true)}>
        <Plus />
        Dodaj ćwiczenie
      </Button>
    );

  return (
    <div className="space-y-2xs rounded-md border p-sm">
      <div className="flex items-center gap-xs">
        <Input autoFocus value={q} onChange={(e) => search(e.target.value)} placeholder="Szukaj ćwiczenia…" />
        <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Anuluj dodawanie ćwiczenia">
          <X />
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
              className="flex min-h-11 w-full items-center justify-between gap-sm rounded px-sm py-xs text-left text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>{h.name}</span>
              <span className="text-xs text-muted-foreground">{h.equipment ?? "Brak danych"}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
