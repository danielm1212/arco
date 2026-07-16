"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigationHistory } from "./NavigationHistory";

export function CloseButton({
  fallback,
  label = "Zamknij",
  className,
}: {
  fallback: string;
  label?: string;
  className?: string;
}) {
  const { goBack } = useNavigationHistory();

  return (
    <button
      type="button"
      onClick={() => goBack(fallback)}
      aria-label={label}
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <X className="size-5" aria-hidden />
    </button>
  );
}
