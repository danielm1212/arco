export async function startSession(dayId: string) {
  (globalThis as typeof globalThis & { __startedProgramDay?: string }).__startedProgramDay = dayId;
}

export async function setProgramFavorite(programId: string, favorite: boolean) {
  (
    globalThis as typeof globalThis & {
      __favoriteProgramAction?: { programId: string; favorite: boolean };
    }
  ).__favoriteProgramAction = { programId, favorite };
}
