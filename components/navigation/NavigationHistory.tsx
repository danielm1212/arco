"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

type NavigationMode = "push" | "replace" | "pop";

interface NavigationHistoryValue {
  goBack: (fallback: string) => void;
  markNextNavigation: (mode: NavigationMode) => void;
  push: (href: string) => void;
  replace: (href: string) => void;
}

const NavigationHistoryContext = createContext<NavigationHistoryValue | null>(null);

/**
 * Lekki, sesyjny stos Arco. Nie korzysta z history.length, więc po deep linku nie
 * cofnie użytkownika poza aplikację. Pełne osobne stosy tabów nie są tu symulowane.
 */
export function NavigationHistoryProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const stack = useRef<string[]>([]);
  const nextMode = useRef<NavigationMode | null>(null);

  useEffect(() => {
    const onPopState = () => {
      nextMode.current = "pop";
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const mode = nextMode.current;
    nextMode.current = null;
    const current = stack.current;

    if (current.length === 0) {
      current.push(pathname);
      return;
    }
    if (current.at(-1) === pathname) return;

    if (mode === "replace") {
      current[current.length - 1] = pathname;
      return;
    }

    if (mode === "pop") {
      const previousIndex = current.lastIndexOf(pathname);
      stack.current = previousIndex >= 0 ? current.slice(0, previousIndex + 1) : [pathname];
      return;
    }

    current.push(pathname);
  }, [pathname]);

  const markNextNavigation = useCallback((mode: NavigationMode) => {
    nextMode.current = mode;
  }, []);

  const replace = useCallback(
    (href: string) => {
      const targetPathname = new URL(href, window.location.href).pathname;
      if (targetPathname !== pathname) nextMode.current = "replace";
      router.replace(href);
    },
    [pathname, router],
  );

  const push = useCallback(
    (href: string) => {
      nextMode.current = "push";
      router.push(href);
    },
    [router],
  );

  const goBack = useCallback(
    (fallback: string) => {
      if (stack.current.length > 1) {
        nextMode.current = "pop";
        router.back();
        return;
      }
      nextMode.current = "replace";
      router.replace(fallback);
    },
    [router],
  );

  return (
    <NavigationHistoryContext.Provider value={{ goBack, markNextNavigation, push, replace }}>
      {children}
    </NavigationHistoryContext.Provider>
  );
}

export function useNavigationHistory() {
  const value = useContext(NavigationHistoryContext);
  if (!value) throw new Error("useNavigationHistory wymaga NavigationHistoryProvider");
  return value;
}
