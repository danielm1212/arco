"use client";

import type { ReactNode } from "react";
import { Drawer } from "vaul";
import { X } from "lucide-react";

/**
 * Bottom sheet wspólny dla całej apki (vaul).
 *
 * `handleOnly` + `<Drawer.Handle>`: BEZ tego cały `Drawer.Content` nasłuchuje
 * gestu przeciągnij-zamknij, co koliduje z natywnym scrollem długiej treści
 * (feedback 2026-07-11 — sheet zamykał się przy próbie scrollowania). Z
 * `handleOnly` przeciąganie działa TYLKO za uchwyt na górze, reszta arkusza to
 * zwykły, przewijalny content bez ingerencji vaul w gesty dotykowe.
 */
export function BottomSheet({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  contentClassName,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Pomiń, gdy sheet jest w pełni kontrolowany z zewnątrz (bez własnego triggera). */
  trigger?: ReactNode;
  title: ReactNode;
  /** sr-only opis dla czytników ekranu (Drawer.Description wymaga treści). */
  description: string;
  children: ReactNode;
  contentClassName?: string;
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} handleOnly fixed noBodyStyles>
      {trigger && <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>}
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Drawer.Content
          className={`fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85dvh] max-w-md flex-col rounded-t-2xl border-t bg-card text-card-foreground outline-none ${contentClassName ?? ""}`}
        >
          <Drawer.Handle className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/30" />
          <div className="flex shrink-0 items-center justify-between px-md pt-sm">
            <Drawer.Title className="text-lg font-semibold">{title}</Drawer.Title>
            <Drawer.Close
              aria-label="Zamknij"
              className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </Drawer.Close>
          </div>
          <Drawer.Description className="sr-only">{description}</Drawer.Description>
          <div className="overflow-y-auto p-md pt-xs pb-[calc(2rem+var(--safe-area-bottom))]">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
