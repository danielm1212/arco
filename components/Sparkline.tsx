/** Prosty wykres liniowy (SVG) — trend wartości w czasie. Zwraca null dla < 2 punktów. */
export function Sparkline({
  values,
  className = "h-16 w-full",
}: {
  values: number[];
  className?: string;
}) {
  if (values.length < 2) return null;
  const w = 320;
  const h = 64;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none">
      <polyline
        points={pts}
        fill="none"
        stroke="hsl(var(--color-chart-primary))"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
