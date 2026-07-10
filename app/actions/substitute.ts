"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Exercise } from "@/lib/types";

export interface Candidate {
  id: string;
  name: string;
  equipment: string | null;
  mechanic: string | null;
  level: string | null;
  image: string | null;
}

export interface SubstituteResult {
  loose: boolean; // true = brak ścisłego dopasowania (rozluźniony filtr)
  items: Candidate[];
}

const overlap = (a: string[] | null, b: string[] | null) => {
  const setB = new Set(b ?? []);
  return (a ?? []).filter((x) => setB.has(x)).length;
};

/**
 * Kandydaci do podmiany dla danego session_exercise (brief sekcja 4).
 * Ranking: mechanic match > pokrycie primary > pokrycie secondary > poziom.
 * Fallback przy zero: pattern-only → primary-only → wszystko z dostępnym sprzętem (loose).
 */
export async function getSubstitutes(
  sessionExerciseId: string,
): Promise<SubstituteResult> {
  const supabase = createClient();

  const { data: se } = await supabase
    .from("session_exercises")
    .select("exercise_id")
    .eq("id", sessionExerciseId)
    .single();
  if (!se) return { loose: false, items: [] };

  const { data: current } = await supabase
    .from("exercises")
    // wąski select (optymalizacja.md §2.3) — "*" ciągnęło instructions+images niepotrzebnie
    .select("id, name, mechanic, level, movement_pattern, primary_muscles, secondary_muscles")
    .eq("id", se.exercise_id)
    .single();
  if (!current) return { loose: false, items: [] };

  const { data: settings } = await supabase
    .from("user_settings")
    .select("available_equipment")
    .maybeSingle();
  const equipment = settings?.available_equipment ?? [];

  const cur = current as Pick<
    Exercise,
    "id" | "name" | "mechanic" | "level" | "movement_pattern" | "primary_muscles" | "secondary_muscles"
  >;

  async function query(opts: { pattern: boolean; muscles: boolean }) {
    let q = supabase
      .from("exercises")
      .select("id, name, equipment, mechanic, level, images, primary_muscles, secondary_muscles, movement_pattern")
      .neq("id", cur.id)
      .eq("hidden", false) // kuracja 2026-07-08: swap nie proponuje stretching/cardio/przestarzałych
      .limit(60);
    if (equipment.length) q = q.in("equipment", equipment);
    if (opts.pattern && cur.movement_pattern)
      q = q.eq("movement_pattern", cur.movement_pattern);
    if (opts.muscles && (cur.primary_muscles?.length ?? 0) > 0)
      q = q.overlaps("primary_muscles", cur.primary_muscles);
    const { data } = await q;
    return data ?? [];
  }

  // Tier 1 (ścisły): pattern + primary overlap. Fallbacki rozluźniają.
  let rows = await query({ pattern: true, muscles: true });
  let loose = false;
  if (rows.length === 0) {
    rows = await query({ pattern: true, muscles: false });
    loose = true;
  }
  if (rows.length === 0) {
    rows = await query({ pattern: false, muscles: true });
    loose = true;
  }
  if (rows.length === 0) {
    rows = await query({ pattern: false, muscles: false });
    loose = true;
  }

  const ranked = rows
    .map((r) => ({
      row: r,
      score:
        (r.mechanic === cur.mechanic ? 1000 : 0) +
        overlap(r.primary_muscles, cur.primary_muscles) * 100 +
        overlap(r.secondary_muscles, cur.secondary_muscles) * 10 +
        (r.level === cur.level ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.row.name.localeCompare(b.row.name))
    .slice(0, 5)
    .map(({ row }) => ({
      id: row.id,
      name: row.name,
      equipment: row.equipment,
      mechanic: row.mechanic,
      level: row.level,
      image: (row.images as string[] | null)?.[0] ?? null,
    }));

  return { loose, items: ranked };
}

/** Podmiana ćwiczenia w sesji — exercise_id zmienia się, slot_id zostaje (progres slotu). */
export async function swapExercise(
  sessionId: string,
  sessionExerciseId: string,
  newExerciseId: string,
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("session_exercises")
    .update({ exercise_id: newExerciseId })
    .eq("id", sessionExerciseId);
  if (error) throw new Error(error.message);
  revalidatePath(`/session/${sessionId}`);
}
