import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteBodyMetric } from "@/app/actions/body";
import { BodyForm } from "./BodyForm";

function Sparkline({ values }: { values: number[] }) {
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
    <svg viewBox={`0 0 ${w} ${h}`} className="h-16 w-full" preserveAspectRatio="none">
      <polyline
        points={pts}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default async function BodyPage() {
  const supabase = createClient();

  const [{ data: metrics }, { data: settings }] = await Promise.all([
    supabase
      .from("body_metrics")
      .select("id, date, weight, body_fat, notes")
      .order("date", { ascending: false }),
    supabase.from("user_settings").select("unit_system").maybeSingle(),
  ]);
  const unit = settings?.unit_system ?? "kg";

  const withWeight = (metrics ?? []).filter((m) => m.weight != null);
  const latest = withWeight[0]?.weight ?? null;
  const prev = withWeight[1]?.weight ?? null;
  const delta = latest != null && prev != null ? Math.round((latest - prev) * 10) / 10 : null;
  const chrono = withWeight
    .slice()
    .reverse()
    .map((m) => Number(m.weight));

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex items-center justify-between border-b px-md py-sm">
        <Link href="/" className="text-xs text-muted-foreground">
          ← Trening
        </Link>
        <span className="font-semibold">Ciało</span>
        <span className="w-12" />
      </header>

      <main className="flex-1 space-y-lg p-md">
        <BodyForm unit={unit} />

        {latest != null && (
          <section className="space-y-sm rounded-lg border bg-card p-md">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold tabular-nums">
                {latest}
                <span className="text-base font-normal text-muted-foreground"> {unit}</span>
              </span>
              {delta != null && (
                <span className={delta < 0 ? "text-success" : delta > 0 ? "text-warning" : "text-muted-foreground"}>
                  {delta > 0 ? "+" : ""}
                  {delta} {unit}
                </span>
              )}
            </div>
            <Sparkline values={chrono} />
          </section>
        )}

        <section className="space-y-sm">
          <h2 className="text-base font-semibold">Historia pomiarów</h2>
          {(!metrics || metrics.length === 0) && (
            <p className="text-sm text-muted-foreground">Brak pomiarów. Dodaj pierwszy powyżej.</p>
          )}
          <ul className="space-y-2xs">
            {metrics?.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-md border bg-card p-sm text-sm"
              >
                <span className="text-muted-foreground">
                  {new Date(m.date).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <span className="flex items-center gap-sm">
                  {m.weight != null && <span className="font-medium">{m.weight} {unit}</span>}
                  {m.body_fat != null && <span className="text-muted-foreground">{m.body_fat}%</span>}
                  <form action={deleteBodyMetric.bind(null, m.id)}>
                    <button className="text-muted-foreground hover:text-danger" aria-label="Usuń">
                      ✕
                    </button>
                  </form>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
