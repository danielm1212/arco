"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizeTeamInviteCode, type TeamAvatar } from "@/lib/team";

const REACTIONS = ["💪", "🔥", "👏", "🎯"] as const;
type TeamIdentity = { displayName: string; avatar: TeamAvatar; confirmed: boolean };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Zaloguj się, aby korzystać z Ekipy." } as const;
  return { supabase, user } as const;
}

function refreshTeamPaths() {
  revalidatePath("/");
  revalidatePath("/ekipa");
}

/** Dev-v0: tworzenie Ekipy dostępne wyłącznie dla istniejących, zalogowanych kont. */
export async function createTeam(
  name: string,
  identity: TeamIdentity,
): Promise<{ podId?: string; error?: string }> {
  const auth = await requireUser();
  if ("error" in auth) return auth;
  const cleaned = name.trim();
  if (cleaned.length > 48) return { error: "Nazwa ekipy może mieć maksymalnie 48 znaków." };

  const { data, error } = await auth.supabase
    .rpc("create_pod", {
      p_name: cleaned,
      p_display_name: identity.displayName.trim(),
      p_avatar: identity.avatar,
      p_confirmed: identity.confirmed,
    })
    .single();
  if (error || !data) return { error: error?.message ?? "Nie udało się utworzyć ekipy." };
  refreshTeamPaths();
  return { podId: data.pod_id };
}

/** Dev-v0: dołączenie kodem między ręcznie utworzonymi kontami testowymi. */
export async function joinTeam(
  inviteCode: string,
  identity: TeamIdentity,
): Promise<{ podId?: string; error?: string }> {
  const auth = await requireUser();
  if ("error" in auth) return auth;
  const code = normalizeTeamInviteCode(inviteCode);
  if (code.length !== 8) return { error: "Wpisz pełny 8-znakowy kod zaproszenia." };
  const { data, error } = await auth.supabase.rpc("join_pod_by_invite", {
    p_invite_code: code,
    p_display_name: identity.displayName.trim(),
    p_avatar: identity.avatar,
    p_confirmed: identity.confirmed,
  });
  if (error || !data) return { error: error?.message ?? "Nie udało się dołączyć do ekipy." };
  refreshTeamPaths();
  return { podId: data };
}

export async function leaveTeam(podId: string): Promise<{ error?: string }> {
  const auth = await requireUser();
  if ("error" in auth) return auth;
  const { data: pod, error: podError } = await auth.supabase
    .from("pods")
    .select("created_by")
    .eq("id", podId)
    .maybeSingle();
  if (podError || !pod) return { error: "Nie znaleziono tej ekipy." };

  if (pod.created_by === auth.user.id) {
    const { count, error: countError } = await auth.supabase
      .from("pod_members")
      .select("*", { count: "exact", head: true })
      .eq("pod_id", podId);
    if (countError) return { error: "Nie udało się sprawdzić składu ekipy." };
    if ((count ?? 0) > 1) {
      return { error: "Jako właściciel najpierw usuń pozostałe osoby z ekipy." };
    }
    const { error: deleteError } = await auth.supabase.from("pods").delete().eq("id", podId);
    if (deleteError) return { error: "Nie udało się usunąć ekipy." };
    refreshTeamPaths();
    return {};
  }
  const { error } = await auth.supabase
    .from("pod_members")
    .delete()
    .eq("pod_id", podId)
    .eq("user_id", auth.user.id);
  if (error) return { error: "Nie udało się opuścić ekipy." };
  refreshTeamPaths();
  return {};
}

export async function removeTeamMember(podId: string, userId: string): Promise<{ error?: string }> {
  const auth = await requireUser();
  if ("error" in auth) return auth;
  const { error } = await auth.supabase.rpc("remove_pod_member", {
    p_pod_id: podId,
    p_user_id: userId,
  });
  if (error) return { error: error.message };
  refreshTeamPaths();
  return {};
}

export async function renameTeam(podId: string, name: string): Promise<{ error?: string }> {
  const auth = await requireUser();
  if ("error" in auth) return auth;
  const { error } = await auth.supabase.rpc("rename_pod", { p_pod_id: podId, p_name: name.trim() });
  if (error) return { error: error.message };
  refreshTeamPaths();
  return {};
}

export async function markTeamInboxRead(itemId: string): Promise<{ error?: string }> {
  const auth = await requireUser();
  if ("error" in auth) return auth;
  const { error } = await auth.supabase
    .from("inbox_items")
    .update({ read_at: new Date().toISOString() })
    .eq("id", itemId)
    .eq("user_id", auth.user.id);
  if (error) return { error: "Nie udało się oznaczyć powiadomienia." };
  refreshTeamPaths();
  return {};
}

export async function reactToTeamEvent(
  eventId: string,
  emoji: (typeof REACTIONS)[number],
): Promise<{ error?: string }> {
  const auth = await requireUser();
  if ("error" in auth) return auth;
  if (!REACTIONS.includes(emoji)) return { error: "Ta reakcja nie jest dostępna." };

  const { data: event } = await auth.supabase
    .from("activity_events")
    .select("user_id")
    .eq("id", eventId)
    .maybeSingle();
  if (!event || event.user_id === auth.user.id) return { error: "Nie możesz zareagować na ten trening." };

  const { error } = await auth.supabase
    .from("reactions")
    .upsert({ activity_event_id: eventId, user_id: auth.user.id, emoji }, { onConflict: "activity_event_id,user_id" });
  if (error) return { error: "Nie udało się zapisać reakcji." };
  refreshTeamPaths();
  return {};
}

export async function nudgeTeamMember(podId: string, userId: string): Promise<{ error?: string }> {
  const auth = await requireUser();
  if ("error" in auth) return auth;
  const { error } = await auth.supabase.rpc("send_pod_nudge", {
    p_pod_id: podId,
    p_to_user_id: userId,
  });
  if (error) return { error: error.message };
  refreshTeamPaths();
  return {};
}
