import test from "node:test";
import assert from "node:assert/strict";
import { PROGRAMS } from "@/scripts/seed";
import rawExercises from "@/scripts/data/exercises.json";

const BEGINNER = [
  "beginner-gym-fbw2",
  "beginner-gym-fbw3",
  "beginner-home-fbw2",
  "beginner-home-fbw3",
  "beginner-bodyweight-fbw3",
];

const byId = new Map(
  (rawExercises as { id: string; primaryMuscles?: string[] }[]).map((item) => [item.id, item]),
);

function program(slug: string) {
  const result = PROGRAMS.find((item) => item.slug === slug);
  assert.ok(result, `Brak programu ${slug}`);
  return result;
}

/** Estymata z audytu: 40 s pracy na serię + przerwy w ćwiczeniu + 60 s na zmianę stanowiska. */
function minutyDnia(slots: { sets: number; rest: number }[]) {
  const praca = slots.reduce((sum, slot) => sum + slot.sets * 40, 0);
  const przerwy = slots.reduce((sum, slot) => sum + (slot.sets - 1) * slot.rest, 0);
  return (praca + przerwy + slots.length * 60) / 60;
}

test("PLAN-C2: każdy plan dla początkujących ma bezpośrednią pracę ramion", () => {
  for (const slug of BEGINNER) {
    const direct = new Map<string, number>();
    for (const day of program(slug).days) {
      for (const slot of day.slots) {
        for (const muscle of byId.get(slot.exercise_id)?.primaryMuscles ?? []) {
          direct.set(muscle, (direct.get(muscle) ?? 0) + slot.sets);
        }
      }
    }
    const ramiona = (direct.get("biceps") ?? 0) + (direct.get("triceps") ?? 0);
    assert.ok(ramiona >= 6, `${slug}: tylko ${ramiona} serii na ramiona w cyklu`);
    // Masa ciała nie ma sensownej izolacji bicepsa — tam biceps niosą podciąganie i wiosłowanie.
    if (slug !== "beginner-bodyweight-fbw3") {
      assert.ok((direct.get("biceps") ?? 0) >= 3, `${slug}: brak bezpośredniego bicepsa`);
      assert.ok((direct.get("triceps") ?? 0) >= 3, `${slug}: brak bezpośredniego tricepsa`);
    }
  }
});

test("PLAN-C2: deklarowany czas sesji nie kłamie", () => {
  for (const slug of BEGINNER) {
    const p = program(slug);
    for (const day of p.days) {
      const minuty = minutyDnia(day.slots) + 6; // 6 min przygotowania i serii narastających
      assert.ok(
        minuty >= p.estimated_minutes_min - 6 && minuty <= p.estimated_minutes_max,
        `${slug} / ${day.label}: ~${minuty.toFixed(0)} min poza deklaracją ${p.estimated_minutes_min}-${p.estimated_minutes_max}`,
      );
    }
  }
});

test("PLAN-C2: sesja początkującego nie zamienia się w listę dziesięciu ćwiczeń", () => {
  for (const slug of BEGINNER) {
    for (const day of program(slug).days) {
      assert.ok(
        day.slots.length <= 9,
        `${slug} / ${day.label}: ${day.slots.length} pozycji to za dużo na start`,
      );
    }
  }
});
