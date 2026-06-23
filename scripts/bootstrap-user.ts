/**
 * Arco — bootstrap jedynego konta (brief sekcja 6: jedno konto, login bez signup).
 * Tworzy usera przez Admin API (service-role) z ADMIN_EMAIL / ADMIN_PASSWORD.
 * Idempotentny: jeśli user istnieje, aktualizuje hasło.
 *
 * Uruchom: npm run bootstrap:user
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const EMAIL = process.env.ADMIN_EMAIL!;
const PASSWORD = process.env.ADMIN_PASSWORD!;

if (!SUPABASE_URL || !SERVICE_ROLE) throw new Error("Brak URL/service-role w .env.local");
if (!EMAIL || !PASSWORD) throw new Error("Ustaw ADMIN_EMAIL i ADMIN_PASSWORD w .env.local");
if (PASSWORD.length < 8) throw new Error("ADMIN_PASSWORD musi mieć min. 8 znaków");

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  // Znajdź istniejącego usera po emailu
  const { data: list, error: listErr } = await admin.auth.admin.listUsers();
  if (listErr) throw new Error(`listUsers: ${listErr.message}`);
  const existing = list.users.find((u) => u.email?.toLowerCase() === EMAIL.toLowerCase());

  let userId: string;
  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, { password: PASSWORD });
    if (error) throw new Error(`updateUser: ${error.message}`);
    userId = existing.id;
    console.log(`✓ konto istnieje — zaktualizowano hasło (${EMAIL})`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
    });
    if (error || !data.user) throw new Error(`createUser: ${error?.message}`);
    userId = data.user.id;
    console.log(`✓ utworzono konto (${EMAIL})`);
  }

  // Domyślne ustawienia (idempotentnie)
  const { error: settingsErr } = await admin
    .from("user_settings")
    .upsert({ user_id: userId }, { onConflict: "user_id" });
  if (settingsErr) throw new Error(`user_settings: ${settingsErr.message}`);
  console.log("✓ user_settings (domyślne: kg, rest 120s, gryf 20kg)");

  console.log("✅ Bootstrap zakończony.");
}

main().catch((e) => {
  console.error("❌ Bootstrap failed:", e.message);
  process.exit(1);
});
