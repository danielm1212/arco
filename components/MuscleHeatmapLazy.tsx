"use client";

import dynamic from "next/dynamic";

/**
 * S9-cz.2 paczka 4: react-body-highlighter (vendor) poza initial JS trasy /progress.
 * ssr:false — heatmapa jest czysto wizualna; fallback trzyma wysokość (zero CLS).
 */
export const MuscleHeatmapLazy = dynamic(
  () => import("./MuscleHeatmap").then((m) => m.MuscleHeatmap),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse rounded-xl bg-muted" aria-hidden />,
  },
);
