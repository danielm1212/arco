import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BodyForm } from "../BodyForm";
import { PageHeader } from "@/components/navigation/PageHeader";

export const dynamic = "force-dynamic";

/**
 * Dodanie pomiaru jako osobny ekran `focus` (R3a): strona Ciała jest przeglądem
 * trendu, a wpis to świadoma akcja bez bottom navu. Zapis wraca do /body przez
 * replace (terminalne przejście), szkic i dirty guard żyją w `BodyForm`.
 */
export default async function AddBodyMetricPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: settings } = await supabase
    .from("user_settings")
    .select("unit_system")
    .maybeSingle();
  const unit = settings?.unit_system ?? "kg";

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <PageHeader
        title="Dodaj pomiar"
        fallback="/body"
        backLabel="Wróć do postępów"
        sticky
      />
      <main className="flex-1 p-md">
        <BodyForm unit={unit} userId={user.id} />
      </main>
    </div>
  );
}
