import type { ExerciseType, SessionSet } from "@/lib/types";
import { getCompletionBlockReason } from "@/lib/setValidation";

export type LoggerSetState = "draft" | "ready" | "completed" | "edited";
export type LoggerSessionState =
  | LoggerSetState
  | "resting"
  | "minimized"
  | "finishing";

export type SessionDraftPatch = Partial<
  Pick<
    SessionSet,
    "weight" | "reps" | "duration_seconds" | "added_weight" | "rpe" | "set_type"
  >
>;

export interface SessionContinuity {
  activeSetId: string | null;
  scrollY: number;
  minimized: boolean;
  rest: { endAt: number; label: string | null } | null;
  edits: Record<string, SessionDraftPatch>;
}

type FlowExercise = {
  skipped: boolean;
  sets: Array<Pick<SessionSet, "id" | "completed">>;
};

const STORAGE_PREFIX = "arco-session-flow-v1:";

export const EMPTY_SESSION_CONTINUITY: SessionContinuity = {
  activeSetId: null,
  scrollY: 0,
  minimized: false,
  rest: null,
  edits: {},
};

export function loggerSetState(
  exerciseType: ExerciseType,
  set: Pick<SessionSet, "completed" | "weight" | "reps" | "duration_seconds">,
  edited = false,
): LoggerSetState {
  if (set.completed) return edited ? "edited" : "completed";
  return getCompletionBlockReason(exerciseType, set) ? "draft" : "ready";
}

export function loggerSessionState({
  setState,
  resting,
  minimized,
  finishing,
}: {
  setState: LoggerSetState;
  resting: boolean;
  minimized: boolean;
  finishing: boolean;
}): LoggerSessionState {
  if (finishing) return "finishing";
  if (minimized) return "minimized";
  if (resting) return "resting";
  return setState;
}

function availableSets(exercises: FlowExercise[]) {
  return exercises.flatMap((exercise) => (exercise.skipped ? [] : exercise.sets));
}

export function firstIncompleteSetId(exercises: FlowExercise[]): string | null {
  return availableSets(exercises).find((set) => !set.completed)?.id ?? null;
}

export function nextIncompleteSetId(
  exercises: FlowExercise[],
  currentSetId: string,
): string | null {
  const sets = availableSets(exercises);
  const currentIndex = sets.findIndex((set) => set.id === currentSetId);
  const after = sets.slice(Math.max(0, currentIndex + 1)).find((set) => !set.completed);
  if (after) return after.id;
  return sets.find((set) => !set.completed && set.id !== currentSetId)?.id ?? null;
}

export function applySessionEdits<T extends { sets: SessionSet[] }>(
  exercises: T[],
  edits: Record<string, SessionDraftPatch>,
): T[] {
  if (Object.keys(edits).length === 0) return exercises;
  return exercises.map((exercise) => ({
    ...exercise,
    sets: exercise.sets.map((set) =>
      set.completed && edits[set.id] ? { ...set, ...edits[set.id] } : set,
    ),
  }));
}

function storageKey(sessionId: string) {
  return `${STORAGE_PREFIX}${sessionId}`;
}

function finiteNonNegative(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;
}

export function readSessionContinuity(
  sessionId: string,
  now = Date.now(),
): SessionContinuity {
  if (typeof window === "undefined") return { ...EMPTY_SESSION_CONTINUITY };
  try {
    const raw = window.localStorage.getItem(storageKey(sessionId));
    if (!raw) return { ...EMPTY_SESSION_CONTINUITY };
    const parsed = JSON.parse(raw) as Partial<SessionContinuity>;
    const rest =
      parsed.rest &&
      finiteNonNegative(parsed.rest.endAt) > now &&
      (parsed.rest.label == null || typeof parsed.rest.label === "string")
        ? { endAt: parsed.rest.endAt, label: parsed.rest.label ?? null }
        : null;
    return {
      activeSetId: typeof parsed.activeSetId === "string" ? parsed.activeSetId : null,
      scrollY: finiteNonNegative(parsed.scrollY),
      minimized: parsed.minimized === true,
      rest,
      edits:
        parsed.edits && typeof parsed.edits === "object"
          ? (parsed.edits as Record<string, SessionDraftPatch>)
          : {},
    };
  } catch {
    return { ...EMPTY_SESSION_CONTINUITY };
  }
}

export function writeSessionContinuity(
  sessionId: string,
  continuity: SessionContinuity,
) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(sessionId), JSON.stringify(continuity));
  } catch {
    // Outbox pozostaje źródłem prawdy dla danych serii. Brak miejsca w storage
    // nie może zablokować loggera; traci się wyłącznie wygoda odtworzenia UI.
  }
}

export function clearSessionContinuity(sessionId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(sessionId));
  } catch {
    // jw. — brak możliwości sprzątnięcia metadanych UI nie blokuje sesji.
  }
}
