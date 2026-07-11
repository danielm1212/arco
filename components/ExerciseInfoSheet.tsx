"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { deleteUserExercise } from "@/app/actions/userExercises";
import { BottomSheet } from "@/components/ui/bottom-sheet";

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
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  // Po podmianie ćwiczenia (exerciseId się zmienia) unieważnij cache — inaczej
  // arkusz pokazuje opis poprzedniego ćwiczenia (bug ze swapem).
  useEffect(() => {
    setDetail(null);
  }, [exerciseId]);

  async function load() {
    if (detail || loading) return;
    setLoading(true);
    const sb = createClient();
    const { data } = await sb
      .from("exercises")
      .select(
        "name, images, instructions, primary_muscles, secondary_muscles, equipment, level, user_id",
      )
      .eq("id", exerciseId)
      .maybeSingle();
    if (data) setDetail(data as Detail);
    setLoading(false);
  }

  return (
    <BottomSheet
      trigger={children}
      onOpenChange={(open) => open && load()}
      title={detail?.name ?? "Ćwiczenie"}
      description="Instrukcja wykonania ćwiczenia"
    >
      {loading && !detail && <p className="text-sm text-muted-foreground">Wczytuję…</p>}

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
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!confirm(`Usunąć własne ćwiczenie „${detail.name}"?`)) return;
                startTransition(async () => {
                  try {
                    const res = await deleteUserExercise(exerciseId);
                    if (res.error) {
                      toast.error(res.error);
                      return;
                    }
                    toast.success("Usunięto własne ćwiczenie.");
                    setDetail(null);
                    router.refresh();
                  } catch {
                    toast.error("Nie udało się usunąć.");
                  }
                });
              }}
              className="text-xs text-muted-foreground hover:text-danger disabled:opacity-50"
            >
              {pending ? "Usuwam…" : "Usuń własne ćwiczenie"}
            </button>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
