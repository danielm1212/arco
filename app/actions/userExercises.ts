"use server";

import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";
import type { ExerciseType, MovementPattern } from "@/lib/types";

/** Dozwolone wartości (sprzężone z seedem/free-exercise-db — jak lib/exerciseFilters). */
const EQUIPMENT_VALUES = [
  "dumbbell",
  "barbell",
  "cable",
  "machine",
  "kettlebells",
  "bands",
  "body only",
  "other",
] as const;
const TYPE_VALUES: ExerciseType[] = ["weighted", "bodyweight", "timed"];
const PATTERN_VALUES: MovementPattern[] = [
  "push",
  "pull",
  "squat",
  "hinge",
  "lunge",
  "carry",
  "core",
];
const MUSCLE_VALUES = [
  "chest",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "abdominals",
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "adductors",
  "abductors",
  "lats",
  "middle back",
  "lower back",
  "traps",
  "neck",
] as const;

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

export interface CreateUserExerciseResult {
  id?: string;
  name?: string;
  /** Komunikat dla usera — zwracany zamiast throw (Next maskuje message w prod). */
  error?: string;
}

/**
 * Tworzy własne ćwiczenie usera (Sprint 6). Zdjęcie (opc.) → publiczny bucket
 * `exercise-photos/<uid>/<uuid>` — pełny URL w images[] (spójnie z seedem).
 */
export async function createUserExercise(
  formData: FormData,
): Promise<CreateUserExerciseResult> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Sesja wygasła. Zaloguj się ponownie." };

  const name = String(formData.get("name") ?? "").trim();
  const exerciseType = String(formData.get("exercise_type") ?? "");
  const equipment = String(formData.get("equipment") ?? "");
  const muscle = String(formData.get("primary_muscle") ?? "");
  const pattern = String(formData.get("movement_pattern") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const photo = formData.get("photo");

  if (name.length < 2 || name.length > 80)
    return { error: "Nazwa musi mieć od 2 do 80 znaków." };
  if (!TYPE_VALUES.includes(exerciseType as ExerciseType))
    return { error: "Nieprawidłowy typ ćwiczenia." };
  if (!(EQUIPMENT_VALUES as readonly string[]).includes(equipment))
    return { error: "Nieprawidłowy sprzęt." };
  if (!(MUSCLE_VALUES as readonly string[]).includes(muscle))
    return { error: "Nieprawidłowa partia." };
  if (pattern && !PATTERN_VALUES.includes(pattern as MovementPattern))
    return { error: "Nieprawidłowy wzorzec ruchu." };

  // Zdjęcie (opcjonalne)
  const images: string[] = [];
  if (photo instanceof File && photo.size > 0) {
    if (photo.size > MAX_PHOTO_BYTES) return { error: "Zdjęcie może mieć maksymalnie 5 MB." };
    if (!photo.type.startsWith("image/")) return { error: "Plik nie jest obrazkiem." };
    const ext = photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
    const path = `${auth.user.id}/${randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("exercise-photos")
      .upload(path, photo, { contentType: photo.type });
    if (upErr) return { error: "Nie udało się przesłać zdjęcia. Spróbuj ponownie." };
    const { data: pub } = supabase.storage.from("exercise-photos").getPublicUrl(path);
    images.push(pub.publicUrl);
  }

  const id = `custom-${randomUUID()}`;
  const { error } = await supabase.from("exercises").insert({
    id,
    user_id: auth.user.id,
    name,
    exercise_type: exerciseType as ExerciseType,
    equipment,
    primary_muscles: [muscle],
    secondary_muscles: [],
    movement_pattern: (pattern || null) as MovementPattern | null,
    instructions: description
      ? description.split("\n").map((s) => s.trim()).filter(Boolean)
      : [],
    images,
  });
  if (error) return { error: error.message };

  return { id, name };
}

/**
 * Usuwa własne ćwiczenie. Guard: jeśli użyte w historii (session_exercises)
 * lub w programie — odmowa (integralność danych > sprzątanie).
 */
export async function deleteUserExercise(exerciseId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Sesja wygasła. Zaloguj się ponownie." };

  const { data: ex } = await supabase
    .from("exercises")
    .select("id, user_id, images")
    .eq("id", exerciseId)
    .maybeSingle();
  if (!ex || ex.user_id !== auth.user.id)
    return { error: "To nie jest Twoje własne ćwiczenie." };

  const { count: used } = await supabase
    .from("session_exercises")
    .select("id", { count: "exact", head: true })
    .eq("exercise_id", exerciseId);
  if (used && used > 0)
    return { error: "Nie można usunąć ćwiczenia zapisanego w historii treningów." };

  const { count: inProgram } = await supabase
    .from("program_day_slots")
    .select("id", { count: "exact", head: true })
    .eq("default_exercise_id", exerciseId);
  if (inProgram && inProgram > 0)
    return { error: "Najpierw usuń to ćwiczenie z programu." };

  // Zdjęcie ze Storage (ścieżka = część URL po nazwie bucketa)
  for (const url of ex.images ?? []) {
    const m = url.split("/exercise-photos/")[1];
    if (m) await supabase.storage.from("exercise-photos").remove([m]);
  }

  const { error } = await supabase.from("exercises").delete().eq("id", exerciseId);
  if (error) return { error: error.message };
  return {};
}
