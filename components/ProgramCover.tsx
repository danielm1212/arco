"use client";

import Image from "next/image";
import { useState } from "react";
import { MomentIcon3D } from "@/components/MomentIcon3D";
import {
  programCoverGradient,
  programCoverSizeClass,
  type ProgramCoverSize,
} from "@/lib/programCover";
import type { ProgramFocus } from "@/lib/programRecommendation";
import { cn } from "@/lib/utils";

type ProgramCoverProps = {
  coverImageUrl: string | null;
  focusKey: ProgramFocus | null;
  programName: string;
  size: ProgramCoverSize;
  className?: string;
};

/**
 * PLAN-05B: wspólna okładka dla karty szczegółu i miniatury na liście.
 * Fallback pozostaje pod obrazem również podczas ładowania, dlatego realne
 * zdjęcie nie powoduje pustego błysku, a błąd pobierania odsłania świadomy stan.
 */
export function ProgramCover({
  coverImageUrl,
  focusKey,
  programName,
  size,
  className,
}: ProgramCoverProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const showImage = Boolean(coverImageUrl) && failedImageUrl !== coverImageUrl;

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden",
        programCoverSizeClass(size),
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn("absolute inset-0 flex items-center justify-center", programCoverGradient(focusKey))}
      >
        <MomentIcon3D name="plan" className={size === "hero" ? "size-24" : "size-12"} />
      </div>

      {showImage && (
        <Image
          src={coverImageUrl!}
          alt={`Okładka planu: ${programName}`}
          fill
          sizes={size === "hero" ? "(max-width: 448px) 100vw, 448px" : "64px"}
          className="object-cover"
          onError={() => setFailedImageUrl(coverImageUrl)}
        />
      )}
    </div>
  );
}
