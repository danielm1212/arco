"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Info, LineChart } from "lucide-react";
import { ExerciseInfoSheet } from "@/components/ExerciseInfoSheet";
import { CustomExerciseForm } from "./CustomExerciseForm";
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
  isCustom?: boolean;
}

/**
 * Wspólny przeglądacz ćwiczeń (wyszukiwarka + chipy partia/sprzęt/wzorzec + lista).
 * Używany w dodawaniu (ExercisePicker) i podmianie (SwapPanel).
 * `defaultItems` = lista pokazywana, gdy brak query i filtrów (w swapie: rankowani kandydaci);
 * gdy user szuka/filtruje → wynik leci z Supabase.
 */
export function ExerciseBrowser({
  onPick,
  onPickMany,
  multi = false,
  pending,
  defaultItems,
  defaultLoading,
  defaultNote,
  autoFocus,
}: {
  onPick: (id: string) => void;
  /** S13: tryb multi-select — sticky „Dodaj N ćwiczeń" zamiast add-per-tap */
  onPickMany?: (ids: string[]) => void;
  multi?: boolean;
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
  const [customOpen, setCustomOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  // S13: „Ostatnio używane" — default lista w trybie add (gdy brak defaultItems z zewnątrz)
  const [recent, setRecent] = useState<BrowserHit[]>([]);
  const [recentLoading, setRecentLoading] = useState(defaultItems === undefined);
  const wantRecent = defaultItems === undefined;
  useEffect(() => {
    if (!wantRecent) return;
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("session_exercises")
      .select("exercise_id, exercises(name, equipment, images, user_id), sessions!inner(started_at)")
      .order("started_at", { ascending: false, referencedTable: "sessions" })
      .limit(40)
      .then(({ data }) => {
        if (cancelled) return;
        const seen = new Set<string>();
        const out: BrowserHit[] = [];
        (data ?? []).forEach((r) => {
          if (seen.has(r.exercise_id) || out.length >= 8) return;
          seen.add(r.exercise_id);
          const ex = r.exercises as unknown as {
            name: string;
            equipment: string | null;
            images: string[] | null;
            user_id: string | null;
          } | null;
          if (!ex) return;
          out.push({
            id: r.exercise_id,
            name: ex.name,
            equipment: ex.equipment,
            image: ex.images?.[0] ?? null,
            isCustom: ex.user_id != null,
          });
        });
        setRecent(out);
        setRecentLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [wantRecent]);

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
        .select("id, name, equipment, images, user_id")
        .order("name")
        .limit(30);
      // Stopień 1 kuracji (audyt S8 + trenerski 2026-07-08): browse po chipach ukrywa
      // hidden (stretching/cardio/przestarzałe); search po nazwie NADAL znajduje wszystko.
      if (queryTerm.length >= 2) req = req.ilike("name", `%${queryTerm}%`);
      else req = req.eq("hidden", false);
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
          isCustom: r.user_id != null,
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
  const items = showDefault ? (wantRecent ? recent : (defaultItems ?? [])) : hits;
  const busy = showDefault ? (wantRecent ? recentLoading : !!defaultLoading) : loading;
  const toggleSelect = (id: string) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

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
      {showDefault && wantRecent && items.length > 0 && (
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Ostatnio używane
        </p>
      )}
      {busy && <p className="text-sm text-muted-foreground">Szukam…</p>}
      {!busy && items.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {filtersActive
            ? queryTerm.length >= 2
              ? `Nie ma „${queryTerm}" w bazie? Dodaj jako własne ćwiczenie — z opisem i zdjęciem.`
              : "Brak wyników dla tych filtrów."
            : wantRecent
              ? "Szukaj albo filtruj chipami powyżej."
              : "Brak kandydatów."}
        </p>
      )}

      <ul className="max-h-72 space-y-2xs overflow-y-auto">
        {items.map((h) => (
          <li
            key={h.id}
            className={`flex items-center gap-sm rounded-md py-xs pl-xs pr-sm hover:bg-accent ${
              multi && selected.includes(h.id) ? "bg-primary/10 ring-1 ring-inset ring-primary/40" : ""
            }`}
          >
            {h.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={h.image}
                alt=""
                loading="lazy"
                decoding="async"
                width={88}
                height={88}
                className="size-11 shrink-0 rounded-md border bg-muted object-cover"
              />
            ) : (
              <div className="size-11 shrink-0 rounded-md border bg-muted" />
            )}
            <button
              type="button"
              disabled={pending}
              onClick={() => (multi ? toggleSelect(h.id) : onPick(h.id))}
              className="min-w-0 flex-1 text-left disabled:opacity-50"
            >
              <p className="truncate text-sm">
                {h.name}
                {h.isCustom && (
                  <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    własne
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-muted-foreground">{h.equipment ?? "—"}</p>
            </button>
            {/* S13: skok do progresu ćwiczenia */}
            <a
              href={`/exercise/${encodeURIComponent(h.id)}`}
              aria-label="Progres ćwiczenia"
              className="shrink-0 rounded-full border border-input px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <LineChart className="size-4" />
            </a>
            <ExerciseInfoSheet exerciseId={h.id}>
              <button
                type="button"
                aria-label="Podgląd ćwiczenia"
                className="shrink-0 rounded-full border border-input px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Info className="size-4" />
              </button>
            </ExerciseInfoSheet>
          </li>
        ))}
      </ul>

      {multi && selected.length > 0 && (
        <div className="sticky bottom-0 z-10 -mx-1 bg-card/95 p-1 backdrop-blur">
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              onPickMany?.(selected);
              setSelected([]);
            }}
            className="w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {pending ? "Dodaję…" : `Dodaj ${selected.length} ćw.`}
          </button>
        </div>
      )}

      {/* Własne ćwiczenie — gdy brak w katalogu (Sprint 6). Po dodaniu od razu wybiera. */}
      {customOpen ? (
        <CustomExerciseForm
          initialName={queryTerm}
          onCreated={(id) => {
            setCustomOpen(false);
            onPick(id);
          }}
          onCancel={() => setCustomOpen(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setCustomOpen(true)}
          className={
            /* S14 #6: przy pustym wyniku CTA awansuje na primary */
            !busy && items.length === 0 && filtersActive
              ? "w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground"
              : "w-full rounded-md border border-dashed border-input py-1.5 text-xs text-muted-foreground hover:text-foreground"
          }
        >
          + Własne ćwiczenie{queryTerm.length >= 2 ? ` („${queryTerm}")` : ""}
        </button>
      )}
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
