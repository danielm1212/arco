"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Scale, Hourglass, TrendingDown, Lightbulb } from "lucide-react";
import type { GuidanceItem } from "@/lib/guidance";

const ICON = {
  balance: Scale,
  staleness: Hourglass,
  deload: TrendingDown,
} as const;

function GuidanceIcon({ kind }: { kind: GuidanceItem["kind"] }) {
  const Icon = ICON[kind as keyof typeof ICON] ?? Lightbulb;
  return <Icon className="size-4" aria-hidden />;
}

/**
 * F1 (redesign-home.md §3.3): pełna karta Wskazówek → jedna linia z najwyższym
 * priorytetem (homeGuidance już sortuje); tap otwiera sheet z resztą.
 */
export function GuidanceChip({ items }: { items: GuidanceItem[] }) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) {
    return (
      <p className="px-2xs text-sm text-muted-foreground">Wszystko na torze 💪</p>
    );
  }

  const top = items[0];

  return (
    <BottomSheet
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button
          type="button"
          className="flex w-full items-start gap-sm px-2xs text-left text-sm"
        >
          <span className="mt-0.5 shrink-0 text-muted-foreground">
            <GuidanceIcon kind={top.kind} />
          </span>
          <span className="min-w-0 flex-1 truncate">{top.message}</span>
          {items.length > 1 && (
            <span className="shrink-0 text-xs text-muted-foreground">+{items.length - 1}</span>
          )}
        </button>
      }
      title="Wskazówki"
      description="Pełna lista podpowiedzi z Twoich danych"
    >
      <ul className="space-y-sm">
        {items.map((g) => (
          <li key={g.id} className="flex items-start gap-sm text-sm">
            <span className="mt-0.5 shrink-0 text-muted-foreground">
              <GuidanceIcon kind={g.kind} />
            </span>
            <span className="leading-6">{g.message}</span>
          </li>
        ))}
      </ul>
      <p className="mt-md text-[10px] text-muted-foreground">
        Podpowiedzi z Twoich danych — sugestia, nie nakaz. Pełny bilans na{" "}
        <Link href="/progress" className="underline" onClick={() => setOpen(false)}>
          Postępach
        </Link>
        .
      </p>
    </BottomSheet>
  );
}
