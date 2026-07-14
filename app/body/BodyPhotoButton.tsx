"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";

type Photo = { src: string; alt: string };

export function BodyPhotoButton({ photos, date }: { photos: Photo[]; date: string }) {
  const [open, setOpen] = useState(false);
  const first = photos[0];
  if (!first) return null;
  return (
    <BottomSheet
      open={open}
      onOpenChange={setOpen}
      title={photos.length === 1 ? "Zdjęcie postępu" : `Zdjęcia postępu · ${photos.length}`}
      description={`Zdjęcia postępu z ${date}.`}
      trigger={
        <button type="button" aria-label={`Otwórz ${photos.length === 1 ? "zdjęcie" : "zdjęcia"} z ${date}`} className="relative grid size-11 shrink-0 place-items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={first.src} alt="" loading="lazy" decoding="async" width={80} height={80} className="size-10 rounded-md border object-cover" />
          {photos.length > 1 && <span className="absolute -bottom-1 -right-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">2</span>}
        </button>
      }
    >
      <div className="space-y-sm">
        {photos.map((photo) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={photo.src} src={photo.src} alt={photo.alt} className="max-h-[65dvh] w-full rounded-xl object-contain" />
        ))}
      </div>
      <p className="mt-sm text-center text-xs text-muted-foreground">{date}</p>
    </BottomSheet>
  );
}
