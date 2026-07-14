"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function uid() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Brak sesji");
  return { supabase, userId: user.id };
}

export async function logBodyMetric(values: {
  weight: number | null;
  body_fat: number | null;
  notes: string | null;
  photo_paths?: string[];
  date?: string;
}) {
  const { supabase, userId } = await uid();
  if (values.weight == null || !Number.isFinite(values.weight) || values.weight <= 0) {
    throw new Error("Waga jest wymagana do zapisania pomiaru");
  }
  const photoPaths = values.photo_paths ?? [];
  if (photoPaths.length > 2 || photoPaths.some((path) => !path.startsWith(`${userId}/`))) {
    throw new Error("Nieprawidłowe zdjęcia pomiaru");
  }

  const { data: metric, error } = await supabase
    .from("body_metrics")
    .insert({
    user_id: userId,
    weight: values.weight,
    body_fat: values.body_fat,
    notes: values.notes,
    photo_path: null,
    ...(values.date ? { date: values.date } : {}),
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  if (photoPaths.length) {
    const { error: photosError } = await supabase.from("body_metric_photos").insert(
      photoPaths.map((path, position) => ({
        body_metric_id: metric.id,
        user_id: userId,
        path,
        position: position + 1,
      })),
    );
    if (photosError) {
      // Nie zostawiaj częściowo utworzonego pomiaru ani przesłanych plików.
      await Promise.all([
        supabase.from("body_metrics").delete().eq("id", metric.id),
        supabase.storage.from("body-photos").remove(photoPaths),
      ]);
      throw new Error(photosError.message);
    }
  }
  revalidatePath("/body");
}

export async function deleteBodyMetric(id: string) {
  const { supabase } = await uid();
  // Posprzątaj galerię oraz ewentualny legacy path przed skasowaniem rekordu.
  const [{ data: row }, { data: photos }] = await Promise.all([
    supabase.from("body_metrics").select("photo_path").eq("id", id).maybeSingle(),
    supabase.from("body_metric_photos").select("path").eq("body_metric_id", id),
  ]);
  const paths = [...new Set([...(photos ?? []).map((photo) => photo.path), row?.photo_path].filter(Boolean))] as string[];
  if (paths.length) {
    await supabase.storage.from("body-photos").remove(paths);
  }
  const { error } = await supabase.from("body_metrics").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/body");
}
