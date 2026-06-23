"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logBodyMetric } from "@/app/actions/body";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const num = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")));

export function BodyForm({ unit }: { unit: string }) {
  const router = useRouter();
  const [weight, setWeight] = useState("");
  const [fat, setFat] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();

  function save() {
    if (!weight && !fat) {
      toast.error("Podaj wagę lub % tkanki.");
      return;
    }
    startTransition(async () => {
      try {
        await logBodyMetric({ weight: num(weight), body_fat: num(fat), notes: notes || null });
        setWeight("");
        setFat("");
        setNotes("");
        router.refresh();
        toast.success("Zapisano pomiar.");
      } catch {
        toast.error("Nie zapisano — spróbuj ponownie.");
      }
    });
  }

  return (
    <div className="space-y-sm rounded-lg border bg-card p-md">
      <div className="grid grid-cols-2 gap-sm">
        <div className="space-y-xs">
          <label className="text-xs text-muted-foreground">Waga ({unit})</label>
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <div className="space-y-xs">
          <label className="text-xs text-muted-foreground">% tkanki (opcjonalnie)</label>
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
          />
        </div>
      </div>
      <Input placeholder="Notatka (opcjonalnie)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <Button onClick={save} disabled={pending} className="w-full">
        {pending ? "Zapisuję…" : "Zapisz pomiar"}
      </Button>
    </div>
  );
}
