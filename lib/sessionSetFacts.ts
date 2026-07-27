import type { SessionSet } from "@/lib/types";

type SetFact = Pick<SessionSet, "completed" | "set_type">;

export function isCompletedWorkingSet(set: SetFact) {
  return set.completed && set.set_type === "working";
}

export function isIncompleteWorkingSet(set: SetFact) {
  return !set.completed && set.set_type === "working";
}
