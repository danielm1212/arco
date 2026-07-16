import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BackButton } from "./BackButton";
import { CloseButton } from "./CloseButton";

export function PageHeader({
  title,
  fallback,
  backLabel,
  action,
  mode = fallback ? "back" : "none",
  sticky = false,
  className,
}: {
  title: ReactNode;
  fallback?: string;
  backLabel?: string;
  action?: ReactNode;
  mode?: "back" | "close" | "none";
  sticky?: boolean;
  className?: string;
}) {
  if (mode !== "none" && !fallback) {
    throw new Error(`PageHeader w trybie ${mode} wymaga fallbacku`);
  }

  return (
    <header
      className={cn(
        "grid min-h-[60px] grid-cols-[minmax(2.75rem,1fr)_minmax(0,auto)_minmax(2.75rem,1fr)] items-center border-b bg-background px-sm",
        sticky && "sticky top-[var(--safe-area-top)] z-30",
        className,
      )}
    >
      <div className="flex justify-start">
        {mode === "back" && fallback ? <BackButton fallback={fallback} label={backLabel} /> : null}
        {mode === "close" && fallback ? <CloseButton fallback={fallback} label={backLabel} /> : null}
      </div>
      <h1 className="truncate px-xs text-center font-semibold">{title}</h1>
      <div className="flex min-h-11 items-center justify-end">{action}</div>
    </header>
  );
}
