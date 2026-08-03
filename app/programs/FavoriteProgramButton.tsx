"use client";

import { Heart } from "lucide-react";
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

  return (
    <form action={setProgramFavorite.bind(null, programId, !isFavorite)}>
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        aria-label={label}
        aria-pressed={isFavorite}
        className={cn(
          "text-muted-foreground hover:text-primary",
          isFavorite && "text-primary",
        )}
      >
        <Heart aria-hidden className={cn(isFavorite && "fill-current")} />
      </Button>
    </form>
  );
}
