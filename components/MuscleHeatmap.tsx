import type { Region } from "@/lib/muscleMap";

/** Heatmapa-sylwetka: front + tył, regiony kolorowane volt wg liczby serii (sets-per-muscle). */
export function MuscleHeatmap({
  setsPerRegion,
}: {
  setsPerRegion: Record<Region, number>;
}) {
  const max = Math.max(1, ...Object.values(setsPerRegion));
  const fill = (r?: Region) => {
    const n = r ? setsPerRegion[r] ?? 0 : 0;
    if (n === 0) return "hsl(var(--muted-foreground) / 0.22)";
    return `hsl(var(--volt) / ${(0.35 + 0.65 * (n / max)).toFixed(2)})`;
  };
  const sw = 1;
  const stroke = "hsl(var(--border))";

  // Jedna sylwetka — geometria wspólna, regiony różne dla front/tył
  const Figure = ({
    cx,
    torsoUpper,
    torsoLower,
    arm,
    thigh,
    glutes,
  }: {
    cx: number;
    torsoUpper: Region;
    torsoLower: Region;
    arm: Region;
    thigh: Region;
    glutes?: Region;
  }) => (
    <g stroke={stroke} strokeWidth={sw} strokeLinejoin="round">
      {/* głowa (neutralna) */}
      <circle cx={cx} cy={16} r={11} fill="hsl(var(--muted-foreground) / 0.22)" />
      {/* barki */}
      <ellipse cx={cx - 19} cy={39} rx={10} ry={7} fill={fill("shoulders")} />
      <ellipse cx={cx + 19} cy={39} rx={10} ry={7} fill={fill("shoulders")} />
      {/* tułów górny / dolny */}
      <rect x={cx - 17} y={33} width={34} height={27} rx={7} fill={fill(torsoUpper)} />
      <rect x={cx - 14} y={60} width={28} height={26} rx={6} fill={fill(torsoLower)} />
      {/* pośladki (tylko tył) albo biodro neutralne */}
      <rect
        x={cx - 14}
        y={86}
        width={28}
        height={13}
        rx={6}
        fill={glutes ? fill(glutes) : "hsl(var(--muted-foreground) / 0.22)"}
      />
      {/* ramiona (biceps/triceps) */}
      <rect x={cx - 35} y={38} width={12} height={28} rx={6} fill={fill(arm)} />
      <rect x={cx + 23} y={38} width={12} height={28} rx={6} fill={fill(arm)} />
      {/* przedramiona */}
      <rect x={cx - 38} y={68} width={11} height={28} rx={5} fill={fill("forearms")} />
      <rect x={cx + 27} y={68} width={11} height={28} rx={5} fill={fill("forearms")} />
      {/* uda (quads/hamstrings) */}
      <rect x={cx - 16} y={100} width={14} height={48} rx={7} fill={fill(thigh)} />
      <rect x={cx + 2} y={100} width={14} height={48} rx={7} fill={fill(thigh)} />
      {/* łydki */}
      <rect x={cx - 15} y={150} width={12} height={42} rx={5} fill={fill("calves")} />
      <rect x={cx + 3} y={150} width={12} height={42} rx={5} fill={fill("calves")} />
    </g>
  );

  return (
    <div className="space-y-sm">
      <svg viewBox="0 0 300 210" className="mx-auto w-full max-w-[280px]" role="img" aria-label="Heatmapa mięśni — przód i tył">
        <Figure cx={75} torsoUpper="chest" torsoLower="core" arm="biceps" thigh="quads" />
        <Figure
          cx={225}
          torsoUpper="upperBack"
          torsoLower="lowerBack"
          arm="triceps"
          thigh="hamstrings"
          glutes="glutes"
        />
        <text x={75} y={206} textAnchor="middle" className="fill-muted-foreground text-[9px]">
          Przód
        </text>
        <text x={225} y={206} textAnchor="middle" className="fill-muted-foreground text-[9px]">
          Tył
        </text>
      </svg>
      <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
        <span>mniej</span>
        <span className="h-2 w-6 rounded-full bg-muted" />
        <span className="h-2 w-6 rounded-full bg-volt/50" />
        <span className="h-2 w-6 rounded-full bg-volt" />
        <span>więcej serii</span>
      </div>
    </div>
  );
}
