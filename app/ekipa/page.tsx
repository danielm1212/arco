import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TeamPanel } from "./TeamPanel";
import { PageHeader } from "@/components/navigation/PageHeader";

export const dynamic = "force-dynamic";

export default async function TeamPage(props: { searchParams: Promise<{ pod?: string }> }) {
  const { pod: requestedPod } = await props.searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: pods } = await supabase
    .from("pods")
    .select("id, name, invite_code, created_by")
    .order("created_at");
  const teams = (pods ?? []).map((pod) => ({
    id: pod.id,
    name: pod.name,
    inviteCode: pod.invite_code,
    createdBy: pod.created_by,
  }));
  const selected = teams.find((team) => team.id === requestedPod) ?? teams[0] ?? null;
  const { data: overview } = selected
    ? await supabase.rpc("get_pod_members", { p_pod_id: selected.id })
    : { data: [] };
  const members = (overview ?? []).map((member) => ({
    id: member.member_id,
    name: member.display_name,
    avatar: member.avatar,
    weeklyDone: Number(member.weekly_done),
    weeklyGoal: Number(member.weekly_goal),
    lastWorkout: member.last_workout,
    latestEventId: member.latest_event_id,
    reactionCount: Number(member.reaction_count),
    myReaction: member.my_reaction,
    streakWeeks: member.streak_weeks,
    canNudge: member.can_nudge,
  }));
  const { data: unreadItems } = await supabase
    .from("inbox_items")
    .select("id, kind, payload")
    .is("read_at", null)
    .order("created_at", { ascending: false })
    .limit(1);
  const unreadNudge = unreadItems?.find((item) => item.kind === "nudge") ?? null;
  const payload = unreadNudge?.payload as { from_name?: string } | null;

  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <PageHeader title="Ekipa" mode="none" />
      <main className="p-md">
        <TeamPanel
          teams={teams}
          selected={selected}
          members={members}
          currentUserId={user.id}
          unreadNudge={unreadNudge ? { id: unreadNudge.id, fromName: payload?.from_name ?? null } : null}
        />
      </main>
    </div>
  );
}
