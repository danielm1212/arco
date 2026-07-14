"use client";

import {
  cloneElement,
  isValidElement,
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
 * Stabilny arkusz modalny dla PWA.
 *
 * Vaul w trybie standalone modyfikował scroll dokumentu przy montowaniu
 * dialogu. To powodowało widoczny skok tła. Ten komponent celowo nie dotyka
 * `body`, `html` ani pozycji scrolla: warstwa blokująca leży nad stroną, a
 * fokus dialogu dostaje `preventScroll`.
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
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  const close = () => onOpenChange?.(false);

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

    // iOS nie respektuje `overscroll-behavior` dla documentu. Bez fizycznego
    // unieruchomienia body gest z krótkiego albo przewiniętego do końca sheeta
    // przechodzi na ekran pod nim. Ujemny top zachowuje pikselową pozycję tła.
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const previousBodyStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };
    Object.assign(document.body.style, {
      position: "fixed",
      top: `${-scrollY}px`,
      left: `${-scrollX}px`,
      right: "0",
      width: "100%",
      overflow: "hidden",
    });

    const focusDialog = window.requestAnimationFrame(() => {
      dialogRef.current?.focus({ preventScroll: true });
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange?.(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusDialog);
      document.removeEventListener("keydown", onKeyDown);
      Object.assign(document.body.style, previousBodyStyles);
      window.requestAnimationFrame(() => window.scrollTo(scrollX, scrollY));
    };
  }, [open, onOpenChange]);

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
