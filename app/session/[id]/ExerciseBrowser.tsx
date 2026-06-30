"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { ExerciseInfoSheet } from "@/components/ExerciseInfoSheet";
import {
  BODY_PART_GROUPS,
  EQUIPMENT_GROUPS,
  MOVEMENT_PATTERNS,
  equipmentForGroups,
  musclesForBodyParts,
} from "@/lib/exerciseFilters";
import type { MovementPattern } from "@/lib/types";

export interface BrowserHit {
  id: string;
  name: string;
  equipment: string | null;
  image: string | null;
}

/**
 * Wspólny przeglądacz ćwiczeń (wyszukiwarka + chipy partia/sprzęt/wzorzec + lista).
 * Używany w dodawaniu (ExercisePicker) i podmianie (SwapPanel).
 * `defaultItems` = lista pokazywana, gdy brak query i filtrów (w swapie: rankowani kandydaci);
 * gdy user szuka/filtruje → wynik leci z Supabase.
 */
export function ExerciseBrowser({
  onPick,
  pending,
  defaultItems,
  defaultLoading,
  defaultNote,
  autoFocus,
}: {
  onPick: (id: string) => void;
  pending: boolean;
  defaultItems?: BrowserHit[];
  defaultLoading?: boolean;
  defaultNote?: string | null;
  autoFocus?: boolean;
}) {
  const [q, setQ] = useState("");
  const [parts, setParts] = useState<string[]>([]);
  const [equip, setEquip] = useState<string[]>([]);
  const [patterns, setPatterns] = useState<MovementPattern[]>([]);
  const [moreEquip, setMoreEquip] = useState(false);
  const [hits, setHits] = useState<BrowserHit[]>([]);
  const [loading, setLoading] = useState(false);

  const queryTerm = q.trim();
  const filtersActive =
    queryTerm.length >= 2 || parts.length > 0 || equip.length > 0 || patterns.length > 0;

  // Zapytanie odpala się przy zmianie wyszukiwarki/filtrów (debounce na tekst).
  useEffect(() => {
    if (!filtersActive) {
      setHits([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = window.setTimeout(async () => {
      const supabase = createClient();
      let req = supabase
        .from("exercises")
        .select("id, name, equipment, images")
        .order("name")
        .limit(30);
      if (queryTerm.length >= 2) req = req.ilike("name", `%${queryTerm}%`);
      if (parts.length) req = req.overlaps("primary_muscles", musclesForBodyParts(parts));
      if (equip.length) req = req.in("equipment", equipmentForGroups(equip));
      if (patterns.length) req = req.in("movement_pattern", patterns);
      const { data } = await req;
      if (cancelled) return;
      setHits(
        (data ?? []).map((r) => ({
          id: r.id,
          name: r.name,
          equipment: r.equipment,
          image: (r.images as string[] | null)?.[0] ?? null,
        })),
      );
      setLoading(false);
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [queryTerm, parts, equip, patterns, filtersActive]);

  const toggle = <T,>(set: React.Dispatch<React.SetStateAction<T[]>>, val: T) =>
    set((cur) => (cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val]));

  const shownEquip = EQUIPMENT_GROUPS.filter((g) => g.primary || moreEquip || equip.includes(g.id));
  const showDefault = !filtersActive;
  const items = showDefault ? (defaultItems ?? []) : hits;
  const busy = showDefault ? !!defaultLoading : loading;

  return (
    <div className="space-y-sm">
      <Input
        autoFocus={autoFocus}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Szukaj ćwiczenia…"
      />

      <div className="space-y-xs">
        <ChipRow>
          {BODY_PART_GROUPS.map((g) => (
            <Chip key={g.id} active={parts.includes(g.id)} onClick={() => toggle(setParts, g.id)}>
              {g.label}
            </Chip>
          ))}
        </ChipRow>
        <ChipRow>
          {shownEquip.map((g) => (
            <Chip key={g.id} active={equip.includes(g.id)} onClick={() => toggle(setEquip, g.id)}>
              {g.label}
            </Chip>
          ))}
          {!moreEquip && (
            <Chip active={false} onClick={() => setMoreEquip(true)}>
              więcej…
            </Chip>
          )}
        </ChipRow>
        <ChipRow>
          {MOVEMENT_PATTERNS.map((p) => (
            <Chip
              key={p.id}
              active={patterns.includes(p.id)}
              onClick={() => toggle(setPatterns, p.id)}
            >
              {p.label}
            </Chip>
          ))}
        </ChipRow>
      </div>

      {showDefault && defaultNote && (
        <p className="text-xs text-warning">{defaultNote}</p>
      )}
      {busy && <p className="text-sm text-muted-foreground">Szukam…</p>}
      {!busy && items.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {filtersActive ? "Brak wyników." : "Brak kandydatów."}
        </p>
      )}

      <ul className="max-h-72 space-y-2xs overflow-y-auto">
        {items.map((h) => (
          <li
            key={h.id}
            className="flex items-center gap-sm rounded-md py-xs pl-xs pr-sm hover:bg-accent"
          >
            {h.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={h.image}
                alt=""
                loading="lazy"
                className="size-11 shrink-0 rounded-md border bg-muted object-cover"
              />
            ) : (
              <div className="size-11 shrink-0 rounded-md border bg-muted" />
            )}
            <button
              type="button"
              disabled={pending}
              onClick={() => onPick(h.id)}
              className="min-w-0 flex-1 text-left disabled:opacity-50"
            >
              <p className="truncate text-sm">{h.name}</p>
              <p className="truncate text-xs text-muted-foreground">{h.equipment ?? "—"}</p>
            </button>
            <ExerciseInfoSheet exerciseId={h.id}>
              <button
                type="button"
                aria-label="Podgląd ćwiczenia"
                className="shrink-0 rounded-full border border-input px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                ⓘ
              </button>
            </ExerciseInfoSheet>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-xs">{children}</div>;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
