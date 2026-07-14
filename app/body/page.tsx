import { createClient } from "@/lib/supabase/server";
import { BodyForm } from "./BodyForm";
import { DeleteBodyMetricButton } from "./DeleteBodyMetricButton";
import { BodyPhotoButton } from "./BodyPhotoButton";
import { Sparkline } from "@/components/Sparkline";

export const dynamic = "force-dynamic";

type MetricPhoto = { id: string; path: string; position: number };
type Metric = {
  id: string;
  date: string;
  weight: number | null;
  body_fat: number | null;
  notes: string | null;
  photo_path: string | null;
  body_metric_photos: MetricPhoto[] | null;
};

export default async function BodyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: metrics }, { data: settings }] = await Promise.all([
    supabase
      .from("body_metrics")
      .select("id, date, weight, body_fat, notes, photo_path, body_metric_photos(id, path, position)")
      .order("date", { ascending: false }),
    supabase.from("user_settings").select("unit_system").maybeSingle(),
  ]);
  const unit = settings?.unit_system ?? "kg";
  const metricRows = (metrics ?? []) as Metric[];
  const pathsFor = (metric: Metric) => {
    const gallery = (metric.body_metric_photos ?? []).slice().sort((a, b) => a.position - b.position).map((photo) => photo.path);
    return gallery.length ? gallery : metric.photo_path ? [metric.photo_path] : [];
  };

  // Podpisane URL-e do miniatur (prywatny bucket)
  const paths = metricRows.flatMap(pathsFor);
  const photoUrls: Record<string, string> = {};
  if (paths.length) {
    const { data: signed } = await supabase.storage
      .from("body-photos")
      .createSignedUrls(paths, 3600);
    (signed ?? []).forEach((s) => {
      if (s.path && s.signedUrl) photoUrls[s.path] = s.signedUrl;
    });
  }

  const withWeight = metricRows.filter((m) => m.weight != null);
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
          {metricRows.length === 0 && (
            <p className="text-sm text-muted-foreground">Dodawaj pomiar mniej więcej raz w tygodniu. Po kilku wpisach zobaczysz trend.</p>
          )}
          <ul className="space-y-2xs">
            {metricRows.map((m) => {
              const date = new Date(m.date).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
              const photoPaths = pathsFor(m);
              const photos = photoPaths.flatMap((path, index) => photoUrls[path] ? [{ src: photoUrls[path], alt: `Zdjęcie postępu ${index + 1} z ${date}` }] : []);
              return (
              <li
                key={m.id}
                className="flex items-center justify-between gap-sm rounded-md bg-muted p-sm text-sm"
              >
                <span className="flex min-w-0 items-center gap-sm">
                  {photos.length > 0 && <BodyPhotoButton photos={photos} date={date} />}
                  <span className="min-w-0">
                    <span className="block truncate text-muted-foreground">{date}</span>
                    {m.notes && <span className="block truncate text-xs text-muted-foreground">{m.notes}</span>}
                  </span>
                </span>
                <span className="flex items-center gap-sm">
                  {m.weight != null && <span className="font-medium">{m.weight} {unit}</span>}
                  {m.body_fat != null && <span className="text-muted-foreground">{m.body_fat}%</span>}
                  <DeleteBodyMetricButton id={m.id} />
                </span>
              </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}
