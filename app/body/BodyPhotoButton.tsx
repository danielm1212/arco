"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";

export function BodyPhotoButton({ src, date }: { src: string; date: string }) {
  const [open, setOpen] = useState(false);
  return (
    <BottomSheet
      open={open}
      onOpenChange={setOpen}
      title="Zdjęcie postępu"
      description={`Zdjęcie postępu z ${date}.`}
      trigger={
        <button type="button" aria-label={`Otwórz zdjęcie z ${date}`} className="grid size-11 shrink-0 place-items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" loading="lazy" decoding="async" width={80} height={80} className="size-10 rounded-md border object-cover" />
        </button>
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`Zdjęcie postępu z ${date}`} className="max-h-[65dvh] w-full rounded-xl object-contain" />
      <p className="mt-sm text-center text-xs text-muted-foreground">{date}</p>
    </BottomSheet>
  );
}
