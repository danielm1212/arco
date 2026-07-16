"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";

type GuardRegistration = {
  id: string;
  message: string;
  onDiscard: () => void;
};

type PendingNavigation = {
  proceed: () => void;
  cancel?: () => void;
  guard: GuardRegistration;
  autoProceedOnClean: boolean;
};

type DirtyGuardContextValue = {
  register: (guard: GuardRegistration) => void;
  unregister: (id: string) => void;
  requestNavigation: (proceed: () => void, cancel?: () => void) => void;
};

const DirtyGuardContext = createContext<DirtyGuardContextValue | null>(null);

export function DirtyGuardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const guardRef = useRef<GuardRegistration | null>(null);
  const pendingRef = useRef<PendingNavigation | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const register = useCallback((guard: GuardRegistration) => {
    guardRef.current = guard;
  }, []);

  const unregister = useCallback((id: string) => {
    if (guardRef.current?.id === id) guardRef.current = null;
    const pending = pendingRef.current;
    if (pending?.guard.id === id && pending.autoProceedOnClean) {
      pendingRef.current = null;
      setOpen(false);
      queueMicrotask(pending.proceed);
    }
  }, []);

  const requestNavigation = useCallback((proceed: () => void, cancel?: () => void) => {
    const guard = guardRef.current;
    if (!guard) {
      proceed();
      return;
    }
    pendingRef.current = { proceed, cancel, guard, autoProceedOnClean: true };
    setMessage(guard.message);
    setOpen(true);
  }, []);

  const stay = useCallback(() => {
    const pending = pendingRef.current;
    pendingRef.current = null;
    setOpen(false);
    pending?.cancel?.();
  }, []);

  const discard = useCallback(() => {
    const pending = pendingRef.current;
    guardRef.current = null;
    pendingRef.current = null;
    setOpen(false);
    pending?.guard.onDiscard();
    // Pozwala Reactowi odpiąć guard przed zmianą trasy.
    queueMicrotask(() => pending?.proceed());
  }, []);

  // Systemowego Back przeglądarka nie pozwala anulować. Zachowujemy więc
  // globalny modal nad nową trasą: „Zostań” wykonuje Forward, „Odrzuć” pozostaje
  // na ekranie wybranym przez Back. Nie dokładamy sztucznych wpisów historii.
  useEffect(() => {
    const onPopState = () => {
      const guard = guardRef.current;
      if (!guard) return;
      pendingRef.current = {
        guard,
        proceed: () => undefined,
        cancel: () => window.history.forward(),
        autoProceedOnClean: false,
      };
      setMessage(guard.message);
      setOpen(true);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Next Link nie przechodzi przez NavigationHistory. Przechwytujemy wyłącznie
  // zwykłe, wewnętrzne kliknięcia, pozostawiając nowe karty, download i linki zewnętrzne.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!guardRef.current || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash === window.location.hash
      ) return;

      event.preventDefault();
      event.stopPropagation();
      const href = `${url.pathname}${url.search}${url.hash}`;
      const replace = anchor.dataset.navigationMode === "replace";
      requestNavigation(() => (replace ? router.replace(href) : router.push(href)));
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [requestNavigation, router]);

  return (
    <DirtyGuardContext.Provider value={{ register, unregister, requestNavigation }}>
      {children}
      <BottomSheet
        open={open}
        onOpenChange={(nextOpen) => !nextOpen && stay()}
        title="Odrzucić zmiany?"
        description="Potwierdź opuszczenie formularza z niezapisanymi zmianami"
      >
        <div className="space-y-md">
          <p className="text-sm leading-relaxed text-muted-foreground">{message}</p>
          <div className="grid grid-cols-2 gap-sm">
            <Button type="button" variant="outline" onClick={stay}>
              Zostań
            </Button>
            <Button type="button" variant="destructive" onClick={discard}>
              Odrzuć zmiany
            </Button>
          </div>
        </div>
      </BottomSheet>
    </DirtyGuardContext.Provider>
  );
}

export function useDirtyNavigation() {
  const value = useContext(DirtyGuardContext);
  if (!value) throw new Error("useDirtyNavigation wymaga DirtyGuardProvider");
  return value;
}

export function useDirtyGuard({
  dirty,
  message = "Masz niezapisane zmiany. Jeśli wyjdziesz teraz, usuniemy lokalny szkic.",
  onDiscard,
}: {
  dirty: boolean;
  message?: string;
  onDiscard: () => void;
}) {
  const id = useId();
  const { register, unregister } = useDirtyNavigation();
  const onDiscardRef = useRef(onDiscard);

  useEffect(() => {
    onDiscardRef.current = onDiscard;
  }, [onDiscard]);

  useEffect(() => {
    if (!dirty) return;
    const guardId = `dirty-${id}`;

    register({ id: guardId, message, onDiscard: () => onDiscardRef.current() });

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      unregister(guardId);
    };
  }, [dirty, id, message, register, unregister]);
}

// Pomocniczy typ dla komponentów, które chcą przepuścić własny handler kliknięcia.
export type GuardedClick = ReactMouseEvent<HTMLElement>;
