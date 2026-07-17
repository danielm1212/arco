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

  // Userflows §3: puste wskazówki znikają z domyślnego home — cisza zamiast
  // wypełniacza „wszystko gra".
  if (items.length === 0) return null;

  const top = items[0];

  return (
    <BottomSheet
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button
          type="button"
          className="flex min-h-11 w-full items-center gap-sm rounded-md px-2xs text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
      description="Podpowiedzi na podstawie Twoich treningów"
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
      <p className="mt-md text-xs text-muted-foreground">
        To sugestie, nie sztywne zasady. Pełny bilans znajdziesz w zakładce{" "}
        <Link href="/progress" className="underline" onClick={() => setOpen(false)}>
          Postępy
        </Link>
        .
      </p>
    </BottomSheet>
  );
}
