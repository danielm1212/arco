import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteBodyMetric } from "@/app/actions/body";
import { BodyForm } from "./BodyForm";
import { Sparkline } from "@/components/Sparkline";

export const dynamic = "force-dynamic";

export default async function BodyPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: metrics }, { data: settings }] = await Promise.all([
    supabase
      .from("body_metrics")
      .select("id, date, weight, body_fat, notes, photo_path")
      .order("date", { ascending: false }),
    supabase.from("user_settings").select("unit_system").maybeSingle(),
  ]);
  const unit = settings?.unit_system ?? "kg";

  // Podpisane URL-e do miniatur (prywatny bucket)
  const paths = (metrics ?? []).map((m) => m.photo_path).filter((p): p is string => !!p);
  const photoUrls: Record<string, string> = {};
  if (paths.length) {
    const { data: signed } = await supabase.storage
      .from("body-photos")
      .createSignedUrls(paths, 3600);
    (signed ?? []).forEach((s) => {
      if (s.path && s.signedUrl) photoUrls[s.path] = s.signedUrl;
    });
  }

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
        <BodyForm unit={unit} userId={user?.id ?? ""} />

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
                className="flex items-center justify-between gap-sm rounded-md border bg-card p-sm text-sm"
              >
                <span className="flex min-w-0 items-center gap-sm">
                  {m.photo_path && photoUrls[m.photo_path] && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <a href={photoUrls[m.photo_path]} target="_blank" rel="noreferrer">
                      <img
                        src={photoUrls[m.photo_path]}
                        alt="zdjęcie postępu"
                        className="size-10 shrink-0 rounded-md border object-cover"
                      />
                    </a>
                  )}
                  <span className="truncate text-muted-foreground">
                    {new Date(m.date).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
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
