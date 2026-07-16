import type { Database } from "@/lib/database.types";

type Tables = Database["public"]["Tables"];

export type Exercise = Tables["exercises"]["Row"];
export type Program = Tables["programs"]["Row"];
export type ProgramDay = Tables["program_days"]["Row"];
export type ProgramDaySlot = Tables["program_day_slots"]["Row"];
export type WorkoutSession = Tables["sessions"]["Row"];
export type SessionExercise = Tables["session_exercises"]["Row"];
export type SessionSet = Tables["session_sets"]["Row"];
export type UserSettings = Tables["user_settings"]["Row"];

export type ExerciseType = Database["public"]["Enums"]["exercise_type"];
export type SetType = Database["public"]["Enums"]["set_type"];
export type MovementPattern = Database["public"]["Enums"]["movement_pattern"];
export type UnitSystem = Database["public"]["Enums"]["unit_system"];
export type TrainingPriority = Database["public"]["Enums"]["training_priority"];
export type ProgramFocus = Database["public"]["Enums"]["program_focus"];
