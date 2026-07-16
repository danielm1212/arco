"use client";

import { Button } from "@/components/ui/button";

export function DraftRecoveryNotice({
  children = "Przywróciliśmy niewysłane dane zapisane na tym urządzeniu.",
  onClear,
}: {
  children?: React.ReactNode;
  onClear?: () => void;
}) {
  return (
    <aside
      className="flex items-start justify-between gap-sm rounded-xl border border-primary/30 bg-primary/10 p-sm"
      role="status"
    >
      <div>
        <p className="text-sm font-semibold text-primary">Szkic został odzyskany</p>
        <p className="mt-2xs text-xs leading-relaxed text-muted-foreground">{children}</p>
      </div>
      {onClear && (
        <Button type="button" size="sm" variant="ghost" className="shrink-0" onClick={onClear}>
          Wyczyść
        </Button>
      )}
    </aside>
  );
}
