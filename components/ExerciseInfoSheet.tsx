"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { deleteUserExercise } from "@/app/actions/userExercises";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Detail {
  name: string;
  images: string[];
  instructions: string[];
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string | null;
  level: string | null;
  user_id: string | null;
}

/** Bottom sheet "jak wykonać" — leniwie pobiera dane ćwiczenia przy otwarciu. */
export function ExerciseInfoSheet({
  exerciseId,
  children,
}: {
  exerciseId: string;
  children: ReactNode;
}) {
  const [cachedDetail, setCachedDetail] = useState<{ exerciseId: string; detail: Detail } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  // Po podmianie ćwiczenia cache poprzedniego ID jest ignorowany — arkusz nie
  // pokaże opisu starego ćwiczenia, ale nie wymaga synchronizacji stanu w efekcie.
  const detail = cachedDetail?.exerciseId === exerciseId ? cachedDetail.detail : null;

  async function load() {
    if (detail || loading) return;
    setLoading(true);
    setLoadError(false);
    const sb = createClient();
    const { data, error } = await sb
      .from("exercises")
      .select(
        "name, images, instructions, primary_muscles, secondary_muscles, equipment, level, user_id",
      )
      .eq("id", exerciseId)
      .maybeSingle();
    if (data) setCachedDetail({ exerciseId, detail: data as Detail });
    if (error || !data) setLoadError(true);
    setLoading(false);
  }

  function removeExercise() {
    startTransition(async () => {
      try {
        const res = await deleteUserExercise(exerciseId);
        if (res.error) {
          toast.error(res.error);
          return;
        }
        toast.success("Usunięto własne ćwiczenie.");
        setCachedDetail(null);
        setConfirmingDelete(false);
        setOpen(false);
        router.refresh();
      } catch {
        toast.error("Nie udało się usunąć.");
      }
    });
  }

  return (
    <BottomSheet
      open={open}
      trigger={children}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) load();
        else setConfirmingDelete(false);
      }}
      title={detail?.name ?? "Ćwiczenie"}
      description="Instrukcja wykonania ćwiczenia"
    >
      {loading && !detail && <p className="text-sm text-muted-foreground">Wczytuję…</p>}

      {loadError && !detail && (
        <div className="space-y-sm rounded-lg border border-danger/20 bg-danger/5 p-md">
          <p className="text-sm">Nie udało się wczytać opisu ćwiczenia.</p>
          <Button variant="outline" className="w-full" onClick={load}>
            Spróbuj ponownie
          </Button>
        </div>
      )}

      {detail && (
        <div className="space-y-md">
          <p className="text-xs capitalize text-muted-foreground">
            {[detail.equipment, detail.level].filter(Boolean).join(" · ")}
            {detail.primary_muscles?.length ? ` · ${detail.primary_muscles.join(", ")}` : ""}
          </p>

          {detail.images?.length > 0 && (
            <div className="grid grid-cols-2 gap-xs">
              {detail.images.slice(0, 2).map((src) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={src}
                  src={src}
                  alt={detail.name}
                  loading="lazy"
                  decoding="async"
                  width={800}
                  height={600}
                  className="h-auto w-full rounded-md border bg-muted"
                />
              ))}
            </div>
          )}

          {detail.instructions?.length > 0 ? (
            <ol className="list-decimal space-y-xs pl-5 text-sm">
              {detail.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">Brak opisu wykonania.</p>
          )}

          {/* Własne ćwiczenie — usuwanie (guard historii/programu w akcji serwera) */}
          {detail.user_id != null && (
            confirmingDelete ? (
              <div className="space-y-sm rounded-lg border border-danger/20 bg-danger/5 p-md">
                <p className="text-sm font-medium">Usunąć „{detail.name}”?</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Tej operacji nie można cofnąć. Ćwiczenia używanego w historii lub programie nie da się usunąć.
                </p>
                <div className="grid grid-cols-2 gap-sm">
                  <Button variant="outline" disabled={pending} onClick={() => setConfirmingDelete(false)}>
                    Anuluj
                  </Button>
                  <Button variant="destructive" disabled={pending} onClick={removeExercise}>
                    {pending ? "Usuwam…" : "Usuń"}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() => setConfirmingDelete(true)}
                className="w-full text-danger hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 />
                Usuń własne ćwiczenie
              </Button>
            )
          )}
        </div>
      )}
    </BottomSheet>
  );
}
