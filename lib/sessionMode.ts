/** Zachowanie loggera zależne od kontekstu sesji, niezależne od samego układu ekranu. */
export type SessionInteractionMode = "live" | "finished" | "historical";

/**
 * Sesja historyczna ma pierwszeństwo: po zakończeniu nadal nie staje się treningiem
 * na żywo. `isFinished` pozostaje osobnym faktem na potrzeby nawigacji i akcji UI.
 */
export function sessionInteractionMode({
  isFinished,
  isHistorical,
}: {
  isFinished: boolean;
  isHistorical: boolean;
}): SessionInteractionMode {
  if (isHistorical) return "historical";
  return isFinished ? "finished" : "live";
}

export function modeAllowsRest(mode: SessionInteractionMode): boolean {
  return mode === "live";
}

/** Zwykła edycja zakończonej sesji zachowuje dotychczasowe guidance. */
export function modeShowsProgression(mode: SessionInteractionMode): boolean {
  return mode !== "historical";
}
