import { createClient } from "@/lib/supabase/server";
import { BodyForm } from "./BodyForm";
import { DeleteBodyMetricButton } from "./DeleteBodyMetricButton";
import { BodyPhotoButton } from "./BodyPhotoButton";
import { Sparkline } from "@/components/Sparkline";

export const dynamic = "force-dynamic";

export default async function BodyPage() {
  const supabase = await createClient();
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
      <header className="border-b px-md py-md text-center">
        <h1 className="font-semibold">Ciało</h1>
      </header>

      <main className="flex-1 space-y-lg p-md">
        <BodyForm unit={unit} userId={user?.id ?? ""} />

        {latest != null && (
          <section className="space-y-sm rounded-xl bg-card p-md shadow-sm">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-3xl tabular-nums">
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
            <p className="text-sm text-muted-foreground">Dodawaj pomiar mniej więcej raz w tygodniu. Po kilku wpisach zobaczysz trend.</p>
          )}
          <ul className="space-y-2xs">
            {metrics?.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-sm rounded-md bg-muted p-sm text-sm"
              >
                <span className="flex min-w-0 items-center gap-sm">
                  {m.photo_path && photoUrls[m.photo_path] && <BodyPhotoButton src={photoUrls[m.photo_path]} date={new Date(m.date).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })} />}
                  <span className="truncate text-muted-foreground">
                    {new Date(m.date).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </span>
                <span className="flex items-center gap-sm">
                  {m.weight != null && <span className="font-medium">{m.weight} {unit}</span>}
                  {m.body_fat != null && <span className="text-muted-foreground">{m.body_fat}%</span>}
                  <DeleteBodyMetricButton id={m.id} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
