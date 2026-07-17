import Link from "next/link";
import { UsersRound } from "lucide-react";

// UWAGA: komponent celowo bez importów od R2 (stała karta Ekipy zeszła z Home).
// Zachowany do R3b (Ekipa jako hub) — nie usuwać jako martwy kod.
export function TeamHomeCard({
  name,
  members,
}: {
  name: string | null;
  members: { id: string; name: string; avatar: string; active: boolean }[];
}) {
  return (
    <Link href="/ekipa" className="block rounded-xl bg-card p-md text-card-foreground shadow-sm">
      <div className="flex items-center justify-between gap-sm">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <UsersRound className="size-4 text-primary" aria-hidden />
          {name ?? "Ekipa"}
        </span>
        <span className="text-xs font-semibold text-primary">Otwórz →</span>
      </div>
      <div className="mt-sm flex items-center gap-2">
        <div className="flex -space-x-1.5" aria-label={`${members.length} członków ekipy`}>
          {members.slice(0, 4).map((member) => (
            <span
              key={member.id}
              title={member.name}
              className={`grid size-8 place-items-center rounded-full border-2 border-card text-xs ${
                member.active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              {member.avatar}
            </span>
          ))}
        </div>
        <p className="min-w-0 truncate text-xs text-muted-foreground">
          {members.some((member) => member.active)
            ? "Ktoś z ekipy był ostatnio na treningu."
            : "Zbierz ekipę i trzymajcie wspólny rytm."}
        </p>
      </div>
    </Link>
  );
}
