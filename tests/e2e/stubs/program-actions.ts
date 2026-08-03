export async function startSession(dayId: string) {
  (globalThis as typeof globalThis & { __startedProgramDay?: string }).__startedProgramDay = dayId;
}

export async function setProgramFavorite(programId: string, favorite: boolean) {
  const testWindow = globalThis as typeof globalThis & {
    __favoriteProgramAction?: { programId: string; favorite: boolean };
    __favoriteProgramActionDelay?: boolean;
    __favoriteProgramActionShouldFail?: boolean;
    __resolveFavoriteProgramAction?: () => void;
  };
  testWindow.__favoriteProgramAction = { programId, favorite };
  if (testWindow.__favoriteProgramActionDelay) {
    await new Promise<void>((resolve) => {
      testWindow.__resolveFavoriteProgramAction = resolve;
    });
  }
  if (testWindow.__favoriteProgramActionShouldFail) throw new Error("test favorite failure");
}
