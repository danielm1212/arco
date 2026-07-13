"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Flame, Send, UsersRound } from "lucide-react";
import { toast } from "sonner";
import {
  createTeam,
  joinTeam,
  leaveTeam,
  nudgeTeamMember,
  reactToTeamEvent,
} from "@/app/actions/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Team = { id: string; name: string | null; inviteCode: string; createdBy: string | null };
type Member = {
  id: string;
  name: string;
  weeklyDone: number;
  lastWorkout: string | null;
  latestEventId: string | null;
  streakWeeks: number;
};

export function TeamPanel({
  teams,
  selected,
  members,
  currentUserId,
  today,
}: {
  teams: Team[];
  selected: Team | null;
  members: Member[];
  currentUserId: string;
  today: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  function run(action: () => Promise<{ error?: string; podId?: string }>, success?: string) {
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (success) toast.success(success);
      if (result.podId) router.push(`/ekipa?pod=${result.podId}`);
      router.refresh();
    });
  }

  if (!selected) {
    return (
      <div className="space-y-lg">
        <section className="rounded-xl bg-card p-lg text-center shadow-sm">
          <UsersRound className="mx-auto size-8 text-primary" aria-hidden />
          <h1 className="mt-sm text-xl font-semibold">Zbierz ekipę.</h1>
          <p className="mt-xs text-sm text-muted-foreground">
            Paru znajomych. Widzicie tylko, kto był i kto ciągnie serię.
          </p>
        </section>

        <form
          className="space-y-sm rounded-xl bg-card p-md shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            run(() => createTeam(name), "Ekipa gotowa. Wyślij kod znajomym.");
          }}
        >
          <h2 className="font-semibold">Załóż ekipę</h2>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="np. Środowe hantle" maxLength={48} />
          <Button className="w-full" disabled={pending}>
            Załóż ekipę
          </Button>
        </form>

        <form
          className="space-y-sm rounded-xl bg-card p-md shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            run(() => joinTeam(inviteCode), "Jesteś w ekipie.");
          }}
        >
          <h2 className="font-semibold">Dołącz kodem</h2>
          <Input value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} placeholder="Wklej kod zaproszenia" minLength={12} />
          <Button className="w-full" variant="outline" disabled={pending}>
            Dołącz do ekipy
          </Button>
        </form>
      </div>
    );
  }

  const daysSince = (date: string | null) => {
    if (!date) return Infinity;
    return Math.floor(
      (new Date(`${today}T12:00:00`).getTime() - new Date(`${date}T12:00:00`).getTime()) / 86_400_000,
    );
  };

  return (
    <div className="space-y-md">
      {teams.length > 1 && (
        <div className="flex gap-xs overflow-x-auto pb-1">
          {teams.map((team) => (
            <button
              key={team.id}
              type="button"
              onClick={() => router.push(`/ekipa?pod=${team.id}`)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                team.id === selected.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground shadow-sm"
              }`}
            >
              {team.name ?? "Ekipa"}
            </button>
          ))}
        </div>
      )}

      <section className="rounded-xl bg-card p-md shadow-sm">
        <div className="flex items-start justify-between gap-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Twoja ekipa</p>
            <h1 className="mt-1 text-xl font-semibold">{selected.name ?? "Ekipa"}</h1>
          </div>
          <button
            type="button"
            aria-label="Skopiuj kod zaproszenia"
            onClick={() => {
              void navigator.clipboard.writeText(selected.inviteCode);
              toast.success("Kod zaproszenia skopiowany.");
            }}
            className="flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary"
          >
            <Copy className="size-3.5" /> Zaproś
          </button>
        </div>
        <p className="mt-sm break-all rounded-md bg-muted px-sm py-xs font-mono text-xs text-muted-foreground">
          {selected.inviteCode}
        </p>
      </section>

      <section className="overflow-hidden rounded-xl bg-card shadow-sm">
        <div className="flex items-center justify-between px-md py-sm">
          <h2 className="font-semibold">W tym tygodniu</h2>
          <span className="text-xs text-muted-foreground">{members.length}/6 osób</span>
        </div>
        <ul className="divide-y">
          {members.map((member) => {
            const own = member.id === currentUserId;
            const canNudge = !own && daysSince(member.lastWorkout) >= 3;
            return (
              <li key={member.id} className="flex items-center gap-sm px-md py-sm">
                <span className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold ${member.lastWorkout ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {member.name.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{own ? `${member.name} (Ty)` : member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.weeklyDone} trening{member.weeklyDone === 1 ? "" : "i"} w tym tygodniu
                    {member.streakWeeks > 0 ? ` · 🔥 ${member.streakWeeks} tyg.` : ""}
                  </p>
                </div>
                {!own && member.latestEventId && (
                  <div className="flex shrink-0 gap-1">
                    {(["💪", "🔥", "👏", "🎯"] as const).map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => reactToTeamEvent(member.latestEventId!, emoji), "Reakcja wysłana.")}
                        className="grid size-8 place-items-center rounded-full bg-muted text-sm hover:bg-primary/15 disabled:opacity-50"
                        aria-label={`Wyślij reakcję ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
                {canNudge && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => nudgeTeamMember(selected.id, member.id), "Szturchnięcie zapisane.")}
                    className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
                    aria-label={`Szturchnij ${member.name}`}
                  >
                    <Send className="size-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex justify-between gap-sm">
        <p className="flex items-center gap-1 text-xs text-muted-foreground"><Flame className="size-3.5 text-primary" /> Check-in pojawia się automatycznie po treningu.</p>
        <Button variant="ghost" size="sm" disabled={pending} onClick={() => run(() => leaveTeam(selected.id), "Wyszedłeś z ekipy.")}>Opuść</Button>
      </div>
    </div>
  );
}
