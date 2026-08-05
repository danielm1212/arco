"use client";

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { acquireBodyScrollLock, releaseBodyScrollLock } from "@/lib/bodyScrollLock";
import { focusableWithin, inertOutside } from "@/lib/inertBackground";

type TriggerProps = {
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

/**
 * Stabilny arkusz modalny dla PWA.
 *
 * Vaul w trybie standalone modyfikował scroll dokumentu przy montowaniu
 * dialogu, powodując widoczny skok tła — stąd własny komponent. Tło jest
 * unieruchamiane współdzieloną blokadą body (patrz wyżej), która przywraca
 * pikselową pozycję strony przy zamknięciu; fokus dostaje `preventScroll`.
 */
export function BottomSheet({
  open = false,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  contentClassName,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Pomiń, gdy arkusz jest w pełni kontrolowany z zewnątrz (bez triggera). */
  trigger?: ReactNode;
  title: ReactNode;
  /** Opis dla czytników ekranu. */
  description: string;
  children: ReactNode;
  contentClassName?: string;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  /** Element, który realnie otworzył arkusz — ustawiany w sklonowanym `onClick`. */
  const invokerRef = useRef<HTMLElement | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  // Referencja pozostaje stabilna, więc inline callback rodzica nie może
  // przeinicjalizować scroll-locka w trakcie otwartego sheeta.
  const close = useCallback(() => onOpenChangeRef.current?.(false), []);

  // Ten sam wzorzec co wyżej, z tego samego powodu: handler triggera musi być
  // STABILNY, bo trafia do `cloneElement` w trakcie renderu. Domknięcie tworzone
  // per render, dotykające refów, `react-hooks/refs` odrzuca — i słusznie, bo nie
  // jest w stanie odróżnić zapisu w zdarzeniu od zapisu podczas renderu.
  const triggerClickRef = useRef<((event: MouseEvent<HTMLElement>) => void) | undefined>(undefined);
  useEffect(() => {
    triggerClickRef.current = isValidElement<TriggerProps>(trigger)
      ? trigger.props.onClick
      : undefined;
  }, [trigger]);

  const handleTriggerClick = useCallback((event: MouseEvent<HTMLElement>) => {
    // `currentTarget` to zawsze sam trigger, nawet gdy klik trafił w ikonę w jego
    // wnętrzu — i jest odczytany, zanim cokolwiek zdąży ruszyć fokus.
    invokerRef.current = event.currentTarget;
    triggerClickRef.current?.(event);
    if (!event.defaultPrevented) onOpenChangeRef.current?.(true);
  }, []);

  function beginDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragStartY.current = event.clientY;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    if (dragStartY.current == null) return;
    setDragOffset(Math.max(0, event.clientY - dragStartY.current));
  }

  function endDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    if (dragStartY.current == null) return;
    const offset = Math.max(0, event.clientY - dragStartY.current);
    dragStartY.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragOffset(0);
    // 88 px to świadome przesunięcie, ale bez wymogu przeciągania połowy ekranu.
    if (offset >= 88) close();
  }

  useEffect(() => {
    if (!open) return;

    acquireBodyScrollLock();
    /**
     * Fokus po zamknięciu wraca do elementu, który arkusz OTWORZYŁ (WAI-ARIA
     * Dialog). `document.activeElement` był tylko przybliżeniem tej reguły —
     * trafnym dopóki nikt nie rusza fokusu asynchronicznie.
     *
     * Przybliżenie pękło na parze „ulubione + start dnia": `FavoriteProgramButton`
     * po akcji serwerowej przywraca sobie fokus łańcuchem `rAF` (React przemontowuje
     * przycisk, więc fokus spada na `<body>`). Gdy ten łańcuch domknie się między
     * kliknięciem triggera a tym efektem, arkusz zapamiętuje SERDUSZKO zamiast
     * triggera i po Escape lojalnie oddaje fokus tam — wyrzucając użytkownika
     * z interakcji, którą właśnie prowadził. Wyścig rozstrzygał się losowo, więc
     * `tests/e2e/program-plan-actions.test.ts` („F1/F2") przez dwa dni przechodził
     * na tym samym kodzie, a potem zaczął padać bez żadnej zmiany w repo.
     *
     * Trigger klonujemy niżej i sami podpinamy mu `onClick`, więc znamy go dokładnie
     * — nie ma powodu zgadywać. `activeElement` zostaje wyłącznie fallbackiem dla
     * arkuszy otwieranych programowo, bez triggera.
     */
    const activeElement = document.activeElement;
    const activeFallback =
      activeElement instanceof HTMLElement && activeElement !== document.body
        ? activeElement
        : null;
    const invoker = invokerRef.current;
    returnFocusRef.current = invoker?.isConnected ? invoker : activeFallback;

    const focusDialog = window.requestAnimationFrame(() => {
      dialogRef.current?.focus({ preventScroll: true });
    });

    const restoreBackground = inertOutside(overlayRef.current);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const items = focusableWithin(root);
      const active = document.activeElement;
      if (items.length === 0) {
        event.preventDefault();
        root.focus({ preventScroll: true });
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (!root.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus({ preventScroll: true });
      } else if (event.shiftKey && (active === first || active === root)) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusDialog);
      document.removeEventListener("keydown", onKeyDown);
      restoreBackground();
      releaseBodyScrollLock();
      // preventScroll: fokus nie może walczyć z przywróceniem pozycji z locka.
      // Gdy od razu otwiera się kolejny sheet, jego własny rAF (focusDialog)
      // jest zaplanowany później, więc i tak wygrywa fokus dialogu.
      const focusTarget = returnFocusRef.current;
      window.requestAnimationFrame(() => {
        if (focusTarget?.isConnected) focusTarget.focus({ preventScroll: true });
      });
    };
  }, [close, open]);

  const triggerElement = isValidElement<TriggerProps>(trigger)
    ? // `react-hooks/refs` flaguje przekazanie do `cloneElement` funkcji, która
      // dotyka refów — nie potrafi udowodnić, że zapis nie zajdzie w renderze.
      // Tutaj zajść nie może: `handleTriggerClick` to stabilny `useCallback`
      // wywoływany wyłącznie ze zdarzenia `click`, a jedyny zapis (`invokerRef`)
      // dzieje się w jego ciele. Reguły nie da się spełnić strukturalnie — próba
      // z osobnym callbackiem na sam zapis też jest odrzucana, bo heurystyka
      // patrzy tranzytywnie. Wyłączenie jest punktowe, na jedną linię.
      // eslint-disable-next-line react-hooks/refs
      cloneElement(trigger as ReactElement<TriggerProps>, { onClick: handleTriggerClick })
    : trigger;

  return (
    <>
      {triggerElement}
      {open &&
        createPortal(
          <div ref={overlayRef} className="fixed inset-0 z-50 overscroll-none">
            <div
              aria-hidden
              className="absolute inset-0 touch-none animate-in fade-in-0 bg-black/50 duration-200"
              // Zamknięcie następuje dopiero po pełnym kliknięciu. `pointerdown`
              // odmontowywał overlay za wcześnie, więc kolejny event trafiał do
              // elementu znajdującego się pod nim.
              onClick={close}
              onWheel={(event) => event.preventDefault()}
            />
            <section
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              tabIndex={-1}
              style={{
                transform: dragOffset ? `translate3d(0, ${dragOffset}px, 0)` : undefined,
                transition: dragging ? undefined : "transform 180ms ease-out",
              }}
              className={`absolute inset-x-0 bottom-0 mx-auto flex max-h-[85dvh] max-w-md touch-pan-y animate-in slide-in-from-bottom-8 flex-col rounded-t-2xl border-t bg-card text-card-foreground outline-none duration-200 ${contentClassName ?? ""}`}
            >
              <button
                type="button"
                aria-label="Przeciągnij w dół, aby zamknąć"
                onPointerDown={beginDrag}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                className="mx-auto mt-1 grid h-9 w-16 shrink-0 touch-none cursor-grab place-items-center active:cursor-grabbing"
              >
                <span className="h-1.5 w-10 rounded-full bg-muted-foreground/30" aria-hidden />
              </button>
              <div className="flex shrink-0 items-center justify-between px-md pt-sm">
                <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
                <button
                  type="button"
                  aria-label="Zamknij"
                  onClick={close}
                  className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>
              <p id={descriptionId} className="sr-only">{description}</p>
              <div className="overflow-y-auto overscroll-contain p-md pt-xs pb-[calc(2rem+var(--safe-area-bottom))]">{children}</div>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}
