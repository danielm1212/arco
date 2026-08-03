"use client";

import { useRef, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { setProgramFavorite } from "@/app/actions/program";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FavoriteProgramButton({
  programId,
  programName,
  isFavorite,
}: {
  programId: string;
  programName: string;
  isFavorite: boolean;
}) {
  const label = isFavorite
    ? `Usuń plan „${programName}” z ulubionych`
    : `Dodaj plan „${programName}” do ulubionych`;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pending, startTransition] = useTransition();

  function restoreFocus(attempt = 0) {
    requestAnimationFrame(() => {
      if (buttonRef.current?.isConnected) {
        if (buttonRef.current.disabled && attempt < 5) {
          restoreFocus(attempt + 1);
          return;
        }
        buttonRef.current.focus();
        return;
      }

      const matchingButton = [...document.querySelectorAll<HTMLButtonElement>(
        "[data-program-favorite-id]",
      )].find(
        (button) => button.dataset.programFavoriteId === programId && !button.disabled,
      );
      if (matchingButton) {
        matchingButton.focus();
      } else if (attempt < 5) {
        restoreFocus(attempt + 1);
      }
    });
  }

  function toggleFavorite() {
    startTransition(async () => {
      try {
        await setProgramFavorite(programId, !isFavorite);
        toast.success(isFavorite ? "Usunięto z ulubionych." : "Dodano do ulubionych.");
      } catch {
        toast.error("Nie udało się zmienić ulubionych. Spróbuj ponownie.");
      } finally {
        restoreFocus();
      }
    });
  }

  return (
    <Button
      ref={buttonRef}
      type="button"
      variant="ghost"
      size="icon"
      aria-label={pending ? `Zapisuję ulubiony plan „${programName}”` : label}
      aria-pressed={isFavorite}
      aria-busy={pending}
      data-program-favorite-id={programId}
      disabled={pending}
      onClick={toggleFavorite}
      className={cn(
        "text-muted-foreground hover:text-primary",
        isFavorite && "text-primary",
      )}
    >
      <Heart aria-hidden className={cn(isFavorite && "fill-current")} />
    </Button>
  );
}
