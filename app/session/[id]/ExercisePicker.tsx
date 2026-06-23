"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { addSessionExercise } from "@/app/actions/sets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Hit {
  id: string;
  name: string;
  equipment: string | null;
  exercise_type: string;
}

export function ExercisePicker({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  async function search(value: string) {
    setQ(value);
    if (value.trim().length < 2) {
      setHits([]);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("exercises")
      .select("id, name, equipment, exercise_type")
      .ilike("name", `%${value.trim()}%`)
      .order("name")
      .limit(20);
    setHits(data ?? []);
    setLoading(false);
  }

  function pick(id: string) {
    startTransition(async () => {
      await addSessionExercise(sessionId, id);
      setOpen(false);
      setQ("");
      setHits([]);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <Button variant="outline" className="w-full" onClick={() => setOpen(true)}>
        + Dodaj ćwiczenie
      </Button>
    );
  }

  return (
    <div className="space-y-sm rounded-lg border bg-card p-md">
      <div className="flex items-center gap-sm">
        <Input
          autoFocus
          value={q}
          onChange={(e) => search(e.target.value)}
          placeholder="Szukaj ćwiczenia…"
        />
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Anuluj
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Szukam…</p>}
      {!loading && q.trim().length >= 2 && hits.length === 0 && (
        <p className="text-sm text-muted-foreground">Brak wyników.</p>
      )}

      <ul className="max-h-72 space-y-2xs overflow-y-auto">
        {hits.map((h) => (
          <li key={h.id}>
            <button
              type="button"
              disabled={pending}
              onClick={() => pick(h.id)}
              className="flex w-full items-center justify-between rounded-md px-sm py-xs text-left hover:bg-accent disabled:opacity-50"
            >
              <span className="text-sm">{h.name}</span>
              <span className="text-xs text-muted-foreground">{h.equipment ?? "—"}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
