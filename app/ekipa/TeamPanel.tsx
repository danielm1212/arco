"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Flame, MoreHorizontal, Send, Settings2, Share2, UsersRound } from "lucide-react";
import { toast } from "sonner";
import {
  createTeam,
  joinTeam,
  leaveTeam,
  markTeamInboxRead,
  nudgeTeamMember,
  reactToTeamEvent,
  removeTeamMember,
  renameTeam,
} from "@/app/actions/team";
import { formatTeamInviteCode, normalizeTeamInviteCode, TEAM_AVATARS } from "@/lib/team";
import { formatGoalSentence } from "@/lib/programRecommendation";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MomentIcon3D } from "@/components/MomentIcon3D";

type Team = { id: string; name: string | null; inviteCode: string; createdBy: string | null };
type Member = {
  id: string;
  name: string;
  avatar: string;
  weeklyDone: number;
  weeklyGoal: number;
  lastWorkout: string | null;
  latestEventId: string | null;
  reactionCount: number;
  myReaction: string | null;
  streakWeeks: number;
  canNudge: boolean;
};
type Result = { error?: string; podId?: string };
type EntryMode = "choose" | "create" | "join";

function IdentityFields({
  displayName,
  avatar,
  consent,
  onNameChange,
  onAvatarChange,
  onConsentChange,
}: {
  displayName: string;
  avatar: (typeof TEAM_AVATARS)[number];
  consent: boolean;
  onNameChange: (value: string) => void;
  onAvatarChange: (value: (typeof TEAM_AVATARS)[number]) => void;
  onConsentChange: (value: boolean) => void;
}) {
  return (
    <div className="space-y-sm">
      <label className="block space-y-1 text-sm font-medium">
        <span>Jak ekipa ma Cię widzieć?</span>
        <Input value={displayName} onChange={(event) => onNameChange(event.target.value)} placeholder="np. Ania" maxLength={32} required />
      </label>
      <div>
        <p className="text-sm font-medium">Wybierz awatar</p>
        <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Wybór awatara">
          {TEAM_AVATARS.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={avatar === option}
              onClick={() => onAvatarChange(option)}
              className={`grid size-11 place-items-center rounded-full text-lg transition-colors ${
                avatar === option ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary/15"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <label className="flex min-h-11 items-start gap-3 rounded-lg bg-muted/70 p-3 text-xs leading-relaxed text-muted-foreground">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => onConsentChange(event.target.checked)}
          className="mt-0.5 size-4 accent-primary"
        />
        <span>
          Ekipa zobaczy moją nazwę, awatar, ukończone treningi i serię tygodni. Nie zobaczy ćwiczeń, ciężarów ani notatek.
        </span>
      </label>
    </div>
  );
}

export function TeamPanel({
  teams,
  selected,
  members,
  currentUserId,
  unreadNudge,
}: {
  teams: Team[];
  selected: Team | null;
  members: Member[];
  currentUserId: string;
  unreadNudge: { id: string; fromName: string | null } | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [teamName, setTeamName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState<(typeof TEAM_AVATARS)[number]>(TEAM_AVATARS[0]);
  const [consent, setConsent] = useState(false);
  const [entryMode, setEntryMode] = useState<EntryMode>("choose");
  const [memberAction, setMemberAction] = useState<Member | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(selected?.name ?? "");

  function run(action: () => Promise<Result>, success?: string, onSuccess?: () => void) {
    startTransition(async () => {
      try {
        const result = await action();
        if (result.error) {
          toast.error(result.error);
          return;
        }
        if (success) toast.success(success);
        if (result.podId) router.replace(`/ekipa?pod=${result.podId}`);
        onSuccess?.();
        router.refresh();
      } catch {
        toast.error("Coś poszło nie tak. Sprawdź połączenie i spróbuj ponownie.");
      }
    });
  }

  async function shareInvite() {
    if (!selected) return;
    const code = formatTeamInviteCode(selected.inviteCode);
    const text = `Dołącz do mojej Ekipy w Arco. Kod zaproszenia: ${code}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: selected.name ?? "Ekipa w Arco", text });
        return;
      }
      await navigator.clipboard.writeText(code);
      toast.success("Kod zaproszenia skopiowany.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error(`Nie udało się udostępnić. Kod: ${code}`);
    }
  }

  const identityReady = displayName.trim().length > 0 && consent;

  if (!selected) {
    return (
      <div className="space-y-lg">
        <section className="rounded-2xl bg-card p-lg text-center shadow-sm">
          <MomentIcon3D name="rocket" className="mx-auto -my-sm size-24" priority />
          <h1 className="mt-sm text-2xl font-semibold tracking-tight">Trzymajcie wspólny rytm.</h1>
          <p className="mt-xs text-sm leading-relaxed text-muted-foreground">Prywatna grupa do wspólnego trzymania rytmu. Bez rankingów i porównywania wyników.</p>
        </section>

        {entryMode === "choose" ? (
          <section className="space-y-sm rounded-xl bg-card p-md shadow-sm">
            <Button size="lg" className="w-full" onClick={() => setEntryMode("create")}>Załóż ekipę</Button>
            <Button size="lg" className="w-full" variant="outline" onClick={() => setEntryMode("join")}>Mam kod zaproszenia</Button>
            <p className="px-2 pt-1 text-center text-xs leading-relaxed text-muted-foreground">Profil i zakres udostępnianych danych ustawisz w następnym kroku.</p>
          </section>
        ) : (
          <section className="rounded-xl bg-card p-md shadow-sm">
            <button type="button" onClick={() => setEntryMode("choose")} className="-ml-2 mb-sm inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft className="size-4" />Wróć</button>
            <div className="mb-md">
              <h2 className="font-semibold">{entryMode === "create" ? "Załóż ekipę" : "Dołącz do ekipy"}</h2>
              <p className="mt-1 text-xs text-muted-foreground">Ten profil zobaczą tylko osoby z Twojej ekipy.</p>
            </div>
            <IdentityFields displayName={displayName} avatar={avatar} consent={consent} onNameChange={setDisplayName} onAvatarChange={setAvatar} onConsentChange={setConsent} />
            {entryMode === "create" ? (
              <form className="mt-md space-y-sm" onSubmit={(event) => { event.preventDefault(); run(() => createTeam(teamName, { displayName, avatar, confirmed: consent }), "Ekipa gotowa. Zaproś znajomych."); }}>
                <label className="block space-y-1 text-sm font-medium"><span>Nazwa ekipy</span><Input value={teamName} onChange={(event) => setTeamName(event.target.value)} placeholder="np. Środowe hantle" maxLength={48} /></label>
                <Button size="lg" className="w-full" disabled={pending || !identityReady}>Załóż ekipę</Button>
              </form>
            ) : (
              <form className="mt-md space-y-sm" onSubmit={(event) => { event.preventDefault(); run(() => joinTeam(inviteCode, { displayName, avatar, confirmed: consent }), "Jesteś w ekipie."); }}>
                <label className="block space-y-1 text-sm font-medium"><span>Kod zaproszenia</span><Input value={formatTeamInviteCode(inviteCode)} onChange={(event) => setInviteCode(normalizeTeamInviteCode(event.target.value))} placeholder="ABCD-EFGH" autoCapitalize="characters" autoCorrect="off" /></label>
                <Button size="lg" className="w-full" disabled={pending || !identityReady || inviteCode.length !== 8}>Dołącz do ekipy</Button>
              </form>
            )}
          </section>
        )}
      </div>
    );
  }

  const isOwner = selected.createdBy === currentUserId;

  return (
    <div className="space-y-md">
      {unreadNudge && (
        <section className="rounded-xl border border-primary/20 bg-primary/10 p-md">
          <p className="text-sm font-semibold">{unreadNudge.fromName ?? "Ktoś z ekipy"} trzyma za Ciebie kciuki 💪</p>
          <p className="mt-1 text-xs text-muted-foreground">Ktoś z ekipy wysłał Ci wsparcie.</p>
          <Button className="mt-sm" variant="secondary" size="sm" disabled={pending} onClick={() => run(() => markTeamInboxRead(unreadNudge.id), "Wsparcie odebrane.")}>Dzięki</Button>
        </section>
      )}

      {teams.length > 1 && (
        <div className="flex gap-xs overflow-x-auto pb-1" aria-label="Wybór ekipy">
          {teams.map((team) => (
            <button
              key={team.id}
              type="button"
              onClick={() => router.replace(`/ekipa?pod=${team.id}`)}
              className={`h-11 shrink-0 rounded-full px-4 text-sm font-semibold ${team.id === selected.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground shadow-sm"}`}
            >
              {team.name ?? "Ekipa"}
            </button>
          ))}
        </div>
      )}

      <section className="rounded-2xl bg-card p-md shadow-sm">
        <div className="flex items-start justify-between gap-sm">
          <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Twoja ekipa</p><h1 className="mt-1 truncate text-2xl font-semibold tracking-tight">{selected.name ?? "Ekipa"}</h1><p className="mt-1 text-xs text-muted-foreground">{members.length} z 6 miejsc zajętych</p></div>
          <button type="button" aria-label="Ustawienia ekipy" onClick={() => setSettingsOpen(true)} className="grid size-11 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground hover:bg-primary/15 hover:text-primary"><Settings2 className="size-5" /></button>
        </div>
        <button
          type="button"
          onClick={shareInvite}
          className="mt-md flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        ><Share2 className="size-4" />Zaproś do ekipy</button>
        <p className="mt-2 text-center font-mono text-sm font-semibold tracking-[0.14em] text-muted-foreground">{formatTeamInviteCode(selected.inviteCode)}</p>
      </section>

      <section className="overflow-hidden rounded-xl bg-card shadow-sm">
        <div className="flex items-center justify-between px-md py-md"><div><h2 className="font-semibold">Ten tydzień</h2><p className="mt-0.5 text-xs text-muted-foreground">Widać tylko regularność, bez porównywania wyników.</p></div><UsersRound className="size-5 text-primary" aria-hidden /></div>
        <ul className="divide-y">
          {members.map((member) => {
            const own = member.id === currentUserId;
            // Audyt P0 4.1: "6/5" wygląda jak błąd — nadwyżka to bonus (formatGoalSentence).
            const progressLabel = formatGoalSentence(member.weeklyDone, member.weeklyGoal);
            return (
              <li key={member.id} className="flex items-center gap-sm px-md py-sm">
                <span className={`grid size-11 shrink-0 place-items-center rounded-full text-lg ${member.lastWorkout ? "bg-primary/15" : "bg-muted"}`}>{member.avatar}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{own ? `${member.name} (Ty)` : member.name}</p><p className="truncate text-xs text-muted-foreground">{progressLabel}{member.streakWeeks > 0 ? ` · 🔥 ${member.streakWeeks} tyg.` : ""}{member.reactionCount > 0 ? ` · ${member.reactionCount} reakcje` : ""}</p></div>
                {!own && <button type="button" onClick={() => setMemberAction(member)} className="grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-primary/15 hover:text-primary" aria-label={`Opcje wsparcia dla ${member.name}`}><MoreHorizontal className="size-5" /></button>}
              </li>
            );
          })}
        </ul>
      </section>

      <p className="flex items-center gap-1.5 px-1 text-xs leading-relaxed text-muted-foreground"><Flame className="size-4 shrink-0 text-primary" />Ukończony trening pojawi się tutaj automatycznie.</p>

      <BottomSheet open={memberAction !== null} onOpenChange={(open) => !open && setMemberAction(null)} title={memberAction ? `Wesprzyj: ${memberAction.name}` : "Wsparcie"} description="Wybierz reakcję albo wyślij wsparcie">
        {memberAction && <div className="space-y-md"><p className="text-sm text-muted-foreground">Wybierz mały, życzliwy gest. Druga osoba nie widzi Twoich danych treningowych.</p>
          {memberAction.latestEventId ? <div><p className="mb-2 text-sm font-medium">Reakcja na ostatni trening</p><div className="grid grid-cols-4 gap-2">{(["💪", "🔥", "👏", "🎯"] as const).map((emoji) => <button key={emoji} type="button" disabled={pending} onClick={() => run(() => reactToTeamEvent(memberAction.latestEventId!, emoji), "Reakcja wysłana.", () => setMemberAction(null))} className={`flex h-12 items-center justify-center rounded-lg text-xl ${memberAction.myReaction === emoji ? "bg-primary/20 ring-2 ring-primary" : "bg-muted hover:bg-primary/15"}`} aria-label={`Wyślij reakcję ${emoji}`}>{emoji}</button>)}</div></div> : <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">Ta osoba nie ma jeszcze treningu, na który można zareagować.</p>}
          {memberAction.canNudge && <Button className="w-full" disabled={pending} onClick={() => run(() => nudgeTeamMember(selected.id, memberAction.id), "Wysłano sygnał wsparcia.", () => setMemberAction(null))}><Send className="size-4" />Wyślij sygnał wsparcia</Button>}
          {isOwner && <Button className="w-full" variant="destructive" disabled={pending} onClick={() => { setRemoveTarget(memberAction); setMemberAction(null); }}>Usuń z ekipy</Button>}
        </div>}
      </BottomSheet>

      <BottomSheet open={removeTarget !== null} onOpenChange={(open) => !open && setRemoveTarget(null)} title={removeTarget ? `Usunąć ${removeTarget.name}?` : "Usunąć z ekipy?"} description="Sprawdź, co stanie się po usunięciu tej osoby">
        <div className="space-y-md"><p className="text-sm text-muted-foreground">Ta osoba straci dostęp do aktywności Ekipy. Może wrócić tylko z kodem zaproszenia.</p><Button className="w-full" variant="destructive" disabled={pending || !removeTarget} onClick={() => removeTarget && run(() => removeTeamMember(selected.id, removeTarget.id), "Usunięto z ekipy.", () => setRemoveTarget(null))}>Usuń osobę</Button><Button className="w-full" variant="ghost" onClick={() => setRemoveTarget(null)}>Anuluj</Button></div>
      </BottomSheet>

      <BottomSheet open={settingsOpen} onOpenChange={setSettingsOpen} title="Ustawienia ekipy" description="Zmień nazwę, sprawdź kod lub opuść ekipę">
        <div className="space-y-md">
          {isOwner && <form className="space-y-sm" onSubmit={(event) => { event.preventDefault(); run(() => renameTeam(selected.id, renameValue), "Nazwa ekipy zmieniona.", () => setSettingsOpen(false)); }}><label className="block space-y-1 text-sm font-medium"><span>Nazwa ekipy</span><Input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} maxLength={48} /></label><Button className="w-full" variant="outline" disabled={pending}>Zapisz nazwę</Button></form>}
          <div className="rounded-lg bg-muted p-3 text-xs leading-relaxed text-muted-foreground">Kod zaproszenia jest prywatny. Przekazuj go wyłącznie osobom, które chcesz dodać do tej ekipy.</div>
          {isOwner && members.length > 1 && <p className="text-xs leading-relaxed text-muted-foreground">Aby usunąć ekipę, najpierw usuń pozostałe osoby. Dzięki temu grupa nie zostanie bez właściciela.</p>}
          <Button className="w-full" variant="ghost" disabled={pending || (isOwner && members.length > 1)} onClick={() => { setSettingsOpen(false); setLeaveOpen(true); }}>{isOwner ? "Usuń ekipę" : "Opuść ekipę"}</Button>
        </div>
      </BottomSheet>

      <BottomSheet open={leaveOpen} onOpenChange={setLeaveOpen} title={isOwner ? "Usunąć ekipę?" : "Opuścić ekipę?"} description="Sprawdź, co stanie się dalej">
        <div className="space-y-md"><p className="text-sm text-muted-foreground">{isOwner ? "Ekipa i jej zaproszenie przestaną działać. Tej operacji nie można cofnąć." : "Przestaniesz widzieć aktywność tej ekipy. Możesz dołączyć ponownie kodem zaproszenia."}</p><Button className="w-full" variant="destructive" disabled={pending} onClick={() => run(() => leaveTeam(selected.id), isOwner ? "Ekipa usunięta." : "Wyszedłeś z ekipy.", () => { setLeaveOpen(false); setEntryMode("choose"); router.replace("/ekipa"); })}>{isOwner ? "Usuń ekipę" : "Opuść ekipę"}</Button><Button className="w-full" variant="ghost" onClick={() => setLeaveOpen(false)}>{isOwner ? "Anuluj" : "Zostań"}</Button></div>
      </BottomSheet>
    </div>
  );
}
