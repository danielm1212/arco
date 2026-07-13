/**
 * Tworzy lokalne konto do testów Ekipy — bez włączania publicznego signupu.
 *
 * Użycie:
 * TEST_USER_EMAIL=ania@example.test TEST_USER_PASSWORD=bezpiecznehaslo \
 * TEST_USER_NAME=Ania npm run bootstrap:test-user
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.TEST_USER_EMAIL;
const password = process.env.TEST_USER_PASSWORD;
const displayName = process.env.TEST_USER_NAME?.trim() || null;

if (!url || !serviceRole) throw new Error("Brak URL/service-role w .env.local");
if (!email || !password) throw new Error("Ustaw TEST_USER_EMAIL i TEST_USER_PASSWORD.");
if (password.length < 8) throw new Error("TEST_USER_PASSWORD musi mieć min. 8 znaków.");

const admin = createClient(url, serviceRole, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const { data: list, error: listError } = await admin.auth.admin.listUsers();
  if (listError) throw new Error(`listUsers: ${listError.message}`);
  const existing = list.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());

  const userId = existing?.id ?? (
    await admin.auth.admin.createUser({ email, password, email_confirm: true })
  ).data.user?.id;
  if (!userId) throw new Error("Nie udało się utworzyć konta testowego.");
  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(userId, { password });
    if (error) throw new Error(`updateUser: ${error.message}`);
  }

  const { error: settingsError } = await admin
    .from("user_settings")
    .upsert({ user_id: userId, display_name: displayName }, { onConflict: "user_id" });
  if (settingsError) throw new Error(`user_settings: ${settingsError.message}`);
  console.log(`✓ konto testowe gotowe: ${email}`);
}

main().catch((error: unknown) => {
  console.error("❌ bootstrap testowego konta nie powiódł się:", error);
  process.exit(1);
});
