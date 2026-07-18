"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logBodyMetric } from "@/app/actions/body";
import { createClient } from "@/lib/supabase/client";
import { uuid } from "@/lib/uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clampNum, LIMITS } from "@/lib/format";
import { DraftRecoveryNotice } from "@/components/forms/DraftRecoveryNotice";
import { useDirtyGuard } from "@/components/navigation/DirtyGuard";
import { clearFileDraft, loadFileDraft, saveFileDraft } from "@/lib/blobDrafts";
import { usePersistentFormDraft } from "@/lib/usePersistentFormDraft";

const num = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")));
const decimalInput = (value: string) => value.replace(/[^0-9,.]/g, "").replace(/([,.].*)[,.]/g, "$1");

type BodyDraft = { weight: string; fat: string; notes: string };
const isBodyDraft = (candidate: unknown): candidate is BodyDraft => {
  if (!candidate || typeof candidate !== "object") return false;
  const value = candidate as Partial<BodyDraft>;
  return typeof value.weight === "string" && typeof value.fat === "string" && typeof value.notes === "string";
};

function readPreviews(files: File[]) {
  return Promise.all(
    files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        }),
    ),
  );
}

/** Skaluje formaty obsługiwane przez przeglądarkę do max 1280px i koduje JPEG q0.8. */
async function compress(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("UNSUPPORTED_IMAGE"));
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
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [fileDraftReady, setFileDraftReady] = useState(false);
  const [filesRecovered, setFilesRecovered] = useState(false);
  const textDraftKey = `arco-draft-body-v1:${userId}`;
  const fileDraftKey = `body-photos-v1:${userId}`;
  const textDirty = weight !== "" || fat !== "" || notes !== "";
  const dirty = textDirty || files.length > 0;
  const { recovered: textRecovered, clearDraft: clearTextDraft } = usePersistentFormDraft({
    storageKey: textDraftKey,
    value: { weight, fat, notes },
    enabled: textDirty,
    isValid: isBodyDraft,
    onRestore: (draft) => {
      setWeight(draft.weight);
      setFat(draft.fat);
      setNotes(draft.notes);
    },
  });

  useEffect(() => {
    let active = true;
    loadFileDraft(fileDraftKey)
      .then(async (savedFiles) => {
        if (!active || savedFiles.length === 0) return;
        const savedPreviews = await readPreviews(savedFiles);
        if (!active) return;
        setFiles(savedFiles.slice(0, 2));
        setPreviews(savedPreviews.slice(0, 2));
        setFilesRecovered(true);
      })
      .catch(() => undefined)
      .finally(() => active && setFileDraftReady(true));
    return () => {
      active = false;
    };
  }, [fileDraftKey]);

  useEffect(() => {
    if (!fileDraftReady) return;
    const timer = window.setTimeout(() => {
      saveFileDraft(fileDraftKey, files).catch(() =>
        toast.error("Nie udało się zabezpieczyć zdjęć na tym urządzeniu."),
      );
    }, 250);
    return () => window.clearTimeout(timer);
  }, [fileDraftKey, fileDraftReady, files]);

  const clearDrafts = () => {
    clearTextDraft();
    void clearFileDraft(fileDraftKey).catch(() => undefined);
    setFilesRecovered(false);
  };

  useDirtyGuard({
    dirty,
    onDiscard: clearDrafts,
    message: "Pomiar i zdjęcia są zapisane lokalnie jako szkic. Odrzucenie zmian usunie je z tego urządzenia.",
  });

  function save() {
    const normalizedWeight = clampNum(num(weight), { max: LIMITS.bodyWeight });
    if (normalizedWeight == null || normalizedWeight <= 0) {
      toast.error("Podaj wagę, aby zapisać pomiar.");
      return;
    }
    startTransition(async () => {
      try {
        const storage = createClient().storage.from("body-photos");
        const photoPaths: string[] = [];
        try {
          for (const file of files) {
            const blob = await compress(file);
            const path = `${userId}/${uuid()}.jpg`;
            const { error } = await storage.upload(path, blob, { contentType: "image/jpeg" });
            if (error) throw error;
            photoPaths.push(path);
          }
        } catch (error) {
          if (photoPaths.length) await storage.remove(photoPaths);
          throw error;
        }
        try {
          await logBodyMetric({
            weight: normalizedWeight,
            body_fat: clampNum(num(fat), { max: LIMITS.bodyFat }),
            notes: notes || null,
            photo_paths: photoPaths,
          });
        } catch (error) {
          if (photoPaths.length) await storage.remove(photoPaths);
          throw error;
        }
        // R3a: ekran focus → terminalne przejście do /body przez replace.
        // Czyścimy szkic PRZED nawigacją, żeby recovery nie odpalił na huba.
        clearDrafts();
        router.replace("/body");
        toast.success("Zapisano pomiar.");
      } catch (error) {
        toast.error(error instanceof Error && error.message === "UNSUPPORTED_IMAGE" ? "Ten format zdjęcia nie jest obsługiwany. Wybierz JPG, PNG albo WebP." : "Nie udało się zapisać pomiaru. Spróbuj ponownie.");
      }
    });
  }

  async function addFiles(selected: FileList | null) {
    if (!selected?.length) return;
    const selectedFiles = Array.from(selected);
    const remaining = 2 - files.length;
    if (selectedFiles.length > remaining) toast.error("Do jednego pomiaru możesz dodać maksymalnie 2 zdjęcia.");
    const accepted = selectedFiles.slice(0, remaining);
    const nextPreviews = await readPreviews(accepted);
    setFiles((current) => [...current, ...accepted]);
    setPreviews((current) => [...current, ...nextPreviews]);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-sm rounded-xl bg-card p-md shadow-sm">
      {(textRecovered || filesRecovered) && (
        <DraftRecoveryNotice
          onClear={() => {
            setWeight("");
            setFat("");
            setNotes("");
            setFiles([]);
            setPreviews([]);
            clearDrafts();
          }}
        >
          Przywróciliśmy pola pomiaru{filesRecovered ? " oraz zdjęcia" : ""} zapisane przed przerwaniem.
        </DraftRecoveryNotice>
      )}
      <div className="grid grid-cols-2 gap-sm">
        <div className="flex min-w-0 flex-col gap-xs">
          <label htmlFor="body-weight" className="min-h-12 text-xs leading-5 text-muted-foreground">Waga ({unit}) <span className="text-foreground">*</span></label>
          <Input
            id="body-weight"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={weight}
            onChange={(e) => setWeight(decimalInput(e.target.value))}
            required
          />
        </div>
        <div className="flex min-w-0 flex-col gap-xs">
          <label htmlFor="body-fat" className="min-h-12 text-xs leading-5 text-muted-foreground">Tkanka tłuszczowa % <span className="block">(opcjonalnie)</span></label>
          <Input
            id="body-fat"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={fat}
            onChange={(e) => setFat(decimalInput(e.target.value))}
          />
        </div>
      </div>
      <textarea
        aria-label="Notatka do pomiaru"
        placeholder="Notatka do pomiaru (opcjonalnie)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />

      <div className="space-y-xs rounded-md border border-dashed border-input p-sm">
        <div className="flex items-center justify-between gap-sm">
          <span className="text-sm text-muted-foreground">Zdjęcia postępu · {files.length}/2</span>
          {files.length < 2 && (
            <label htmlFor="body-photos" className="min-h-11 cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 focus-within:ring-2 focus-within:ring-ring">
              Dodaj zdjęcia
            </label>
          )}
        </div>
        <input
          ref={fileRef}
          id="body-photos"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            void addFiles(e.target.files).catch(() => toast.error("Nie udało się odczytać zdjęcia."));
          }}
        />
        {files.length > 0 && (
          <div className="grid grid-cols-2 gap-sm">
            {files.map((file, index) => (
              <div key={`${file.name}-${file.lastModified}-${index}`} className="relative overflow-hidden rounded-md bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previews[index]} alt={`Podgląd zdjęcia ${index + 1}`} className="aspect-[4/3] w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
                    setPreviews((current) => current.filter((_, previewIndex) => previewIndex !== index));
                  }}
                  aria-label={`Usuń zdjęcie ${index + 1}`}
                  className="absolute right-1 top-1 min-h-11 rounded-md bg-background/90 px-3 text-sm font-medium text-danger shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Usuń
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button onClick={save} disabled={pending} className="w-full">
        {pending ? "Zapisuję…" : "Zapisz pomiar"}
      </Button>
    </div>
  );
}
