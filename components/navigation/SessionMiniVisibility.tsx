"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Czy `SessionMiniBar` jest aktualnie widoczny na ekranie — samo `AppChrome`
 * już to wie (`sessionMiniVisible`), ale nie przekazywało tego w dół. Bez tego
 * kontekstu każdy floating element chcący ustąpić miejsca mini-barowi
 * musiałby sam odpytywać `getOpenSessionMini()` — drugi fetch tego samego,
 * co robi już `SessionMiniBar` wyżej w drzewie.
 */
const SessionMiniVisibilityContext = createContext<boolean | null>(null);

export function SessionMiniVisibilityProvider({
  visible,
  children,
}: {
  visible: boolean;
  children: ReactNode;
}) {
  return (
    <SessionMiniVisibilityContext.Provider value={visible}>
      {children}
    </SessionMiniVisibilityContext.Provider>
  );
}

export function useSessionMiniVisible(): boolean {
  const value = useContext(SessionMiniVisibilityContext);
  if (value === null) throw new Error("useSessionMiniVisible wymaga SessionMiniVisibilityProvider");
  return value;
}
