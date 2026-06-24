import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: s } = await supabase
    .from("user_settings")
    .select("unit_system, default_rest_seconds, bar_weight, available_equipment, available_plates")
    .maybeSingle();

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex items-center justify-between border-b px-md py-sm">
        <Link href="/" className="text-xs text-muted-foreground">
          ← Trening
        </Link>
        <span className="font-semibold">Ustawienia</span>
        <span className="w-12" />
      </header>
      <main className="flex-1 p-md">
        <SettingsForm
          unit={s?.unit_system ?? "kg"}
          rest={s?.default_rest_seconds ?? 120}
          bar={Number(s?.bar_weight ?? 20)}
          equipment={s?.available_equipment ?? []}
          plates={(s?.available_plates ?? []).map(Number)}
        />
      </main>
    </div>
  );
}
