/**
 * Analityka produktowa — cienki, typowany wrapper (Faza 0).
 * Taksonomia i zasady: docs/instrumentacja-metryk.md (kanon; nowe eventy TYLKO przez unię niżej + tabelę w doku).
 *
 * Zasady twarde:
 * - ZERO PII we właściwościach (żadnych imion/e-maili/ciężarów) — patrz dok §1.
 * - Fire-and-forget: analityka nigdy nie blokuje UX ani nie rzuca.
 * - Bez adaptera (Faza 0): dev → console.debug, prod → no-op. Zero zależności.
 * - Faza 1 (po decyzji narzędzia): setAnalyticsAdapter(posthogAdapter) w AppChrome.
 */

// ── Taksonomia (jedna lista prawdy — rozszerzaj razem z dokiem) ──────────────
export type AnalyticsEvent =
  // Faza 1 — aktywacja i retencja
  | { name: "onboarding_completed"; props: { level: string; env: string; suggested_program_accepted: boolean } }
  | { name: "onboarding_skipped"; props: { step: number } }
  | { name: "program_activated"; props: { program_slug: string; source: "onboarding" | "library" } }
  | { name: "session_started"; props: { source: "program" | "freestyle" } }
  | { name: "session_finished"; props: { duration_min: number; sets_completed: number; is_first: boolean } }
  | { name: "pwa_install_prompt_shown"; props: { platform: "android" | "ios" | "desktop"; context: string } }
  | { name: "pwa_install_accepted"; props: { platform: "android" | "ios" | "desktop" } }
  | { name: "app_opened"; props: { standalone: boolean } }
  // Faza 2 — monetyzacja (wire w Kroku 3)
  | { name: "trial_started"; props: { variant?: string } }
  | { name: "trial_ended"; props: { variant?: string } }
  | { name: "paywall_viewed"; props: { trigger: "day21" | "stagnation" | "history_lock" | "limit_programs" | "limit_custom" } }
  | { name: "history_lock_hit"; props: { weeks_back_attempted: number } }
  | { name: "limit_hit"; props: { kind: "programs" | "custom" } }
  | { name: "checkout_started"; props: { plan: "monthly" | "yearly" } }
  | { name: "subscription_activated"; props: { plan: "monthly" | "yearly" } }
  | { name: "subscription_churned"; props: { plan: "monthly" | "yearly" } }
  | { name: "guidance_shown"; props: { kind: "progression" | "balance" | "staleness" | "deload"; plan: "free" | "coach" } }
  // Faza 3 — pody (wire w Kroku 4)
  | { name: "pod_created"; props: { pod_size: number } }
  | { name: "pod_joined"; props: { pod_size: number } }
  | { name: "pod_invite_sent"; props: Record<string, never> }
  | { name: "pod_invite_accepted"; props: Record<string, never> }
  | { name: "nudge_sent"; props: { channel: "push" | "inbox" | "email" } }
  | { name: "nudge_delivered"; props: { channel: "push" | "inbox" | "email" } }
  | { name: "reaction_sent"; props: Record<string, never> };

export type AnalyticsAdapter = (name: AnalyticsEvent["name"], props: Record<string, unknown>) => void;

let adapter: AnalyticsAdapter | null = null;

/** Faza 1: podpięcie realnego narzędzia (np. posthog.capture). Wołane raz, w kliencie. */
export function setAnalyticsAdapter(fn: AnalyticsAdapter) {
  adapter = fn;
}

/**
 * Jedyne publiczne wejście. Bezpieczne na serwerze (no-op) i przy braku adaptera.
 * Użycie: track({ name: "session_finished", props: { duration_min: 42, sets_completed: 18, is_first: false } })
 */
export function track(event: AnalyticsEvent): void {
  try {
    if (typeof window === "undefined") return; // eventy tylko z klienta (dok §5)
    if (adapter) {
      adapter(event.name, event.props);
    } else if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.debug("[analytics]", event.name, event.props);
    }
  } catch {
    // analityka nigdy nie psuje UX
  }
}
