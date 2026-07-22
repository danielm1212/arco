/**
 * TRAIN-02A2: mapowanie oczekujące na addytywny kontrakt TRAIN-03/05.
 *
 * To nie jest funkcja produkcyjna ani instrukcja do automatycznego swapu. Dane są
 * wersjonowanym wejściem do przyszłej tabeli alternatyw i walidatora prawdy sprzętowej.
 * Notatki kompatybilności pozostają w seedzie do czasu, gdy UI zacznie czytać ten kontrakt.
 */
export type PlannedProgramAlternative = {
  programSlug: string;
  dayLabel: string;
  defaultExerciseId: string;
  alternativeExerciseId: string;
  missingEquipment: string[];
  patternCoverage: "same_pattern" | "partial_pattern";
  notePl: string;
};

export const PLANNED_PROGRAM_ALTERNATIVES: PlannedProgramAlternative[] = [
  {
    programSlug: "beginner-home-fbw2",
    dayLabel: "Trening A",
    defaultExerciseId: "Dumbbell_Bench_Press",
    alternativeExerciseId: "Dumbbell_Floor_Press",
    missingEquipment: ["bench"],
    patternCoverage: "same_pattern",
    notePl: "Pełny zamiennik poziomego wyciskania bez ławki; zakres ruchu jest krótszy.",
  },
  {
    programSlug: "beginner-home-fbw2",
    dayLabel: "Trening B",
    defaultExerciseId: "Incline_Dumbbell_Press",
    alternativeExerciseId: "Dumbbell_Floor_Press",
    missingEquipment: ["bench"],
    patternCoverage: "same_pattern",
    notePl: "Zamiennik poziomego wyciskania bez ławki; nie odtwarza kąta skosu.",
  },
  {
    programSlug: "beginner-home-fbw2",
    dayLabel: "Trening B",
    defaultExerciseId: "Band_Lat_Pulldown",
    alternativeExerciseId: "Straight-Arm_Dumbbell_Pullover",
    missingEquipment: ["bands"],
    patternCoverage: "partial_pattern",
    notePl: "Opcja bez gumy angażująca najszerszy grzbietu; nie zastępuje w pełni pionowego przyciągania.",
  },
];
