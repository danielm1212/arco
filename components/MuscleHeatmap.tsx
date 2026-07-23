"use client";

import Model from "react-body-highlighter";
import { musclesToSlugCounts, heatmapData } from "@/lib/muscleMap";

/** Heatmapa-sylwetka (anatomiczna, react-body-highlighter) — front + tył,
 *  mięśnie kolorowane chart-primary (violet = dane) wg liczby serii (3 poziomy). */
export function MuscleHeatmap({
  setsPerMuscle,
}: {
  setsPerMuscle: [string, number][];
}) {
  const data = heatmapData(musclesToSlugCounts(setsPerMuscle));
  const bodyColor = "hsl(var(--muted-foreground) / 0.22)";
  const highlightedColors = [
    "hsl(var(--color-chart-primary) / 0.45)",
    "hsl(var(--color-chart-primary) / 0.72)",
    "hsl(var(--color-chart-primary))",
  ];
  const svgStyle = { width: "100%", height: "auto" } as const;

  return (
    <div className="space-y-md">
      <div className="flex items-start justify-center gap-lg">
        <figure className="flex w-1/2 max-w-[150px] flex-col items-center">
          <Model
            type="anterior"
            data={data}
            bodyColor={bodyColor}
            highlightedColors={highlightedColors}
            svgStyle={svgStyle}
          />
          <figcaption className="mt-xs text-xs text-muted-foreground">Przód</figcaption>
        </figure>
        <figure className="flex w-1/2 max-w-[150px] flex-col items-center">
          <Model
            type="posterior"
            data={data}
            bodyColor={bodyColor}
            highlightedColors={highlightedColors}
            svgStyle={svgStyle}
          />
          <figcaption className="mt-xs text-xs text-muted-foreground">Tył</figcaption>
        </figure>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>mniej</span>
        <span className="h-2 w-6 rounded-full bg-chart-primary/45" />
        <span className="h-2 w-6 rounded-full bg-chart-primary/70" />
        <span className="h-2 w-6 rounded-full bg-chart-primary" />
        <span>więcej serii</span>
      </div>
    </div>
  );
}
