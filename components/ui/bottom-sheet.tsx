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

type TriggerProps = {
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

/**
 * Współdzielona blokada scrolla body — JEDNA na wszystkie instancje BottomSheet.
 *
 * Sheet-w-sheecie („Podmień ćwiczenie": menu karty zamyka się i w tym samym
 * commicie Reacta otwiera się SwapPanel) to dwie różne instancje. Blokada per
 * instancja gubiła pozycję strony: cleanup pierwszego sheeta przywracał scroll
 * w rAF, a efekt drugiego czytał `window.scrollY` ZANIM ten rAF się wykonał —
 * zapamiętywał 0 i po zamknięciu drugiego arkusza strona skakała na górę.
 * Licznik referencji + jedna zapamiętana pozycja rozwiązują wyścig niezależnie
 * od kolejności montowania instancji.
 */
let bodyLockCount = 0;
let lockedScroll: { x: number; y: number } | null = null;
let lockedBodyStyles: Record<string, string> | null = null;
let restoreScrollFrame: number | null = null;

function acquireBodyScrollLock() {
  bodyLockCount += 1;
  if (bodyLockCount > 1) return;
  if (restoreScrollFrame !== null) {
    // Poprzednia instancja dopiero co zwolniła blokadę; jej przywrócenie scrolla
    // wciąż wisi w rAF, a `window.scrollY` jest chwilowo wyzerowane. Przejmujemy
    // zapamiętaną pozycję zamiast utrwalić zero.
    window.cancelAnimationFrame(restoreScrollFrame);
    restoreScrollFrame = null;
  } else {
    lockedScroll = { x: window.scrollX, y: window.scrollY };
  }
  const scroll = lockedScroll ?? { x: 0, y: 0 };
  lockedBodyStyles = {
    position: document.body.style.position,
    top: document.body.style.top,
    left: document.body.style.left,
    right: document.body.style.right,
    width: document.body.style.width,
    overflow: document.body.style.overflow,
  };
  // iOS nie respektuje `overscroll-behavior` dla documentu. Bez fizycznego
  // unieruchomienia body gest z krótkiego albo przewiniętego do końca sheeta
  // przechodzi na ekran pod nim. Ujemny top zachowuje pikselową pozycję tła.
  Object.assign(document.body.style, {
    position: "fixed",
    top: `${-scroll.y}px`,
    left: `${-scroll.x}px`,
    right: "0",
    width: "100%",
    overflow: "hidden",
  });
}

function releaseBodyScrollLock() {
  if (bodyLockCount === 0) return;
  bodyLockCount -= 1;
  if (bodyLockCount > 0) return;
  if (lockedBodyStyles) {
    Object.assign(document.body.style, lockedBodyStyles);
    lockedBodyStyles = null;
  }
  restoreScrollFrame = window.requestAnimationFrame(() => {
    restoreScrollFrame = null;
    const scroll = lockedScroll;
    lockedScroll = null;
    if (scroll) window.scrollTo(scroll.x, scroll.y);
  });
}

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
  const dragStartY = useRef<number | null>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  // Referencja pozostaje stabilna, więc inline callback rodzica nie może
  // przeinicjalizować scroll-locka w trakcie otwartego sheeta.
  const close = useCallback(() => onOpenChangeRef.current?.(false), []);

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
    const activeElement = document.activeElement;
    returnFocusRef.current = activeElement instanceof HTMLElement && activeElement !== document.body
      ? activeElement
      : null;

    const focusDialog = window.requestAnimationFrame(() => {
      dialogRef.current?.focus({ preventScroll: true });
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusDialog);
      document.removeEventListener("keydown", onKeyDown);
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
    ? cloneElement(trigger as ReactElement<TriggerProps>, {
        onClick: (event: MouseEvent<HTMLElement>) => {
          trigger.props.onClick?.(event);
          if (!event.defaultPrevented) onOpenChange?.(true);
        },
      })
    : trigger;

  return (
    <>
      {triggerElement}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 overscroll-none">
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
