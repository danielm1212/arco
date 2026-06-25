"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logBodyMetric } from "@/app/actions/body";
import { createClient } from "@/lib/supabase/client";
import { uuid } from "@/lib/uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const num = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")));

/** Skaluje zdjęcie do max 1280px i koduje JPEG q0.8 (mniejszy upload, normalizuje HEIC). */
async function compress(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const max = 1280;
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/jpeg", 0.8),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function BodyForm({ unit, userId }: { unit: string; userId: string }) {
  const router = useRouter();
  const [weight, setWeight] = useState("");
  const [fat, setFat] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setWeight("");
    setFat("");
    setNotes("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function save() {
    if (!weight && !fat && !file) {
      toast.error("Podaj wagę, % tkanki albo dodaj zdjęcie.");
      return;
    }
    startTransition(async () => {
      try {
        let photo_path: string | null = null;
        if (file) {
          const blob = await compress(file);
          const path = `${userId}/${uuid()}.jpg`;
          const { error } = await createClient()
            .storage.from("body-photos")
            .upload(path, blob, { contentType: "image/jpeg" });
          if (error) throw error;
          photo_path = path;
        }
        await logBodyMetric({
          weight: num(weight),
          body_fat: num(fat),
          notes: notes || null,
          photo_path,
        });
        reset();
        router.refresh();
        toast.success("Zapisano pomiar.");
      } catch {
        toast.error("Nie zapisano — spróbuj ponownie.");
      }
    });
  }

  return (
    <div className="space-y-sm rounded-xl bg-card p-md shadow-sm">
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
      <Input
        placeholder="Notatka (opcjonalnie)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <label className="flex cursor-pointer items-center justify-between rounded-md border border-dashed border-input px-sm py-2 text-sm text-muted-foreground">
        <span>{file ? `📷 ${file.name}` : "📷 Dodaj zdjęcie (opcjonalnie)"}</span>
        {file && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setFile(null);
              if (fileRef.current) fileRef.current.value = "";
            }}
            className="text-xs text-danger"
          >
            usuń
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <Button onClick={save} disabled={pending} className="w-full">
        {pending ? "Zapisuję…" : "Zapisz pomiar"}
      </Button>
    </div>
  );
}
