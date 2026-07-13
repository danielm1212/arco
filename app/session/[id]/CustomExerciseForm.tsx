"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createUserExercise } from "@/app/actions/userExercises";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EQUIPMENT_DB_OPTIONS,
  MOVEMENT_PATTERNS,
  MUSCLE_OPTIONS,
} from "@/lib/exerciseFilters";
import type { ExerciseType } from "@/lib/types";

const TYPES: { id: ExerciseType; label: string }[] = [
  { id: "weighted", label: "Ciężar" },
  { id: "bodyweight", label: "Masa ciała" },
  { id: "timed", label: "Na czas" },
];

/**
 * Formularz własnego ćwiczenia (Sprint 6) — inline w przeglądarce ćwiczeń.
 * Wymagane: nazwa, typ, sprzęt, partia. Opcjonalne: wzorzec, opis, zdjęcie.
 */
export function CustomExerciseForm({
  initialName,
  onCreated,
  onCancel,
}: {
  initialName?: string;
  onCreated: (id: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialName ?? "");
  const [type, setType] = useState<ExerciseType>("weighted");
  const [equipment, setEquipment] = useState("dumbbell");
  const [muscle, setMuscle] = useState("chest");
  const [pattern, setPattern] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (name.trim().length < 2) {
      toast.error("Nazwa musi mieć co najmniej 2 znaki.");
      return;
    }
    const fd = new FormData();
    fd.set("name", name.trim());
    fd.set("exercise_type", type);
    fd.set("equipment", equipment);
    fd.set("primary_muscle", muscle);
    fd.set("movement_pattern", pattern);
    fd.set("description", description);
    if (photo) fd.set("photo", photo);
    startTransition(async () => {
      try {
        const res = await createUserExercise(fd);
        if (res.error || !res.id) {
          toast.error(res.error ?? "Nie udało się dodać ćwiczenia.");
          return;
        }
        toast.success(`Dodano „${res.name}"`);
        onCreated(res.id);
      } catch {
        toast.error("Nie udało się dodać ćwiczenia.");
      }
    });
  }

  const selectCls =
    "h-11 w-full rounded-md border border-input bg-background px-2 text-sm";

  return (
    <div className="space-y-sm rounded-md border bg-muted/40 p-sm">
      <p className="text-sm font-medium">Własne ćwiczenie</p>

      <Input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={80}
        placeholder="Nazwa, np. hip thrust z hantlem"
      />

      {/* Typ — steruje polami serii w loggerze (kg×powt. / powt. / stoper) */}
      <div className="flex gap-xs" role="radiogroup" aria-label="Typ ćwiczenia">
        {TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={type === t.id}
            onClick={() => setType(t.id)}
            className={`min-h-11 flex-1 rounded-md border px-2 text-sm font-medium ${
              type === t.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-xs">
        <label className="space-y-2xs">
          <span className="text-xs text-muted-foreground">Sprzęt</span>
          <select value={equipment} onChange={(e) => setEquipment(e.target.value)} className={selectCls}>
            {EQUIPMENT_DB_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2xs">
          <span className="text-xs text-muted-foreground">Partia główna</span>
          <select value={muscle} onChange={(e) => setMuscle(e.target.value)} className={selectCls}>
            {MUSCLE_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-2xs">
        <span className="text-xs text-muted-foreground">Wzorzec ruchu (opcjonalnie)</span>
        <select value={pattern} onChange={(e) => setPattern(e.target.value)} className={selectCls}>
          <option value="">Nie wybrano</option>
          {MOVEMENT_PATTERNS.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
      </label>

      <label className="block space-y-2xs">
        <span className="text-xs text-muted-foreground">Opis techniki (opcjonalnie). Każda linia to osobny krok.</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={2000}
          className="w-full rounded-md border border-input bg-background px-sm py-xs text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={"Biodra na ławce, stopy na szerokość bioder…"}
        />
      </label>

      <label className="block space-y-2xs">
        <span className="text-xs text-muted-foreground">Zdjęcie (opcjonalnie, do 5 MB)</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          className="block min-h-11 w-full text-sm text-muted-foreground file:mr-2 file:h-11 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:text-sm"
        />
      </label>

      <div className="flex gap-sm">
        <Button className="flex-1" disabled={pending} onClick={submit}>
          {pending ? "Zapisuję…" : "Dodaj ćwiczenie"}
        </Button>
        <Button variant="ghost" disabled={pending} onClick={onCancel}>
          Anuluj
        </Button>
      </div>
    </div>
  );
}
