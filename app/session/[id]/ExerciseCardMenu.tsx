"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import {
  ArrowLeftRight,
  ArrowLeft,
  Timer,
  Link2,
  Unlink,
  StickyNote,
  Gauge,
  EyeOff,
  Eye,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import type { LoggerExercise } from "./Logger";

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * R1 (audyt-loggera.md): menu ⋯ per karta ćwiczenia. Zbiera 6 akcji, które
 * dotąd były ZAWSZE widoczne na każdej karcie (Podmień/Pomiń/Superset/Przerwa/
 * notatka/RPE) — używane raz na sesję albo rzadziej, szum ×N kart. Wszystko
 * zostaje dostępne w 2 tapach (⋯ → akcja), zero utraty funkcji.
 * R6b: "Połącz w superset" (gdy niezgrupowane) otwiera 2. widok tego samego
 * arkusza — picker partnera, kierunko-agnostyczny (dowolne ćwiczenie sesji,
 * nie tylko poprzednie), z następnym ćwiczeniem podświetlonym jako sugestia.
 */
export function ExerciseCardMenu({
  ex,
  index,
  open,
  onOpenChange,
  restSeconds,
  rpeOn,
  grouped,
  exerciseSummaries,
  onSwap,
  onSkip,
  onDeleteExercise,
  onLinkWith,
  onUnlink,
  onAdjustRest,
  onOpenNote,
  onToggleRpe,
}: {
  ex: LoggerExercise;
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restSeconds: number;
  rpeOn: boolean;
  grouped: boolean;
  exerciseSummaries: { id: string; name: string; group: number | null }[];
  onSwap: () => void;
  onSkip: () => void;
  onDeleteExercise: () => void;
  onLinkWith: (partnerIndex: number) => void;
  onUnlink: () => void;
  onAdjustRest: (delta: number) => void;
  onOpenNote: () => void;
  onToggleRpe: () => void;
}) {
  const [view, setView] = useState<"menu" | "partner">("menu");

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) setView("menu");
  }

  function act(fn: () => void) {
    fn();
    handleOpenChange(false);
  }

  // R6b: następne ćwiczenie w kolejności = domyślna sugestia partnera;
  // przy ostatniej karcie fallback na poprzednie (brak "następnego" do wskazania).
  const recommendedIdx =
    index + 1 < exerciseSummaries.length ? index + 1 : index - 1 >= 0 ? index - 1 : -1;
  const partners = exerciseSummaries
    .map((e, idx) => ({ ...e, idx }))
    .filter((e) => e.idx !== index)
    .sort((a, b) => {
      if (a.idx === recommendedIdx) return -1;
      if (b.idx === recommendedIdx) return 1;
      return a.idx - b.idx;
    });

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      title={view === "menu" ? ex.name : "Połącz w superset"}
      description={
        view === "menu"
          ? `Akcje dla ćwiczenia ${ex.name}`
          : `Wybierz partnera supersetu dla ${ex.name}`
      }
    >
      {view === "partner" ? (
        <ul className="-mx-md">
          <MenuItem icon={ArrowLeft} label="Wstecz" muted onClick={() => setView("menu")} />
          {partners.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => act(() => onLinkWith(p.idx))}
                className="flex h-11 w-full items-center justify-between gap-sm px-md text-left text-sm"
              >
                <span className="flex items-center gap-sm">
                  {p.group != null && (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                      SS{p.group}
                    </span>
                  )}
                  {p.name}
                </span>
                {p.idx === recommendedIdx && (
                  <span className="text-xs text-muted-foreground">sugerowany</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="-mx-md">
          <MenuItem icon={ArrowLeftRight} label="Podmień ćwiczenie" onClick={() => act(onSwap)} />
          {ex.slot ? (
            <MenuItem
              icon={ex.skipped ? Eye : EyeOff}
              label={ex.skipped ? "Przywróć ćwiczenie" : "Pomiń ćwiczenie"}
              onClick={() => act(onSkip)}
            />
          ) : (
            <MenuItem
              icon={Trash2}
              label="Usuń ćwiczenie"
              danger
              onClick={() => act(onDeleteExercise)}
            />
          )}
          {grouped ? (
            <MenuItem icon={Unlink} label="Rozłącz superset" onClick={() => act(onUnlink)} />
          ) : (
            partners.length > 0 && (
              <MenuItem
                icon={Link2}
                label="Połącz w superset"
                onClick={() => setView("partner")}
              />
            )
          )}
          <li className="flex items-center justify-between px-md py-sm">
            <span className="flex items-center gap-sm text-sm">
              <Timer className="size-4 text-muted-foreground" aria-hidden />
              Przerwa
            </span>
            <span className="flex items-center gap-xs">
              <button
                aria-label="krótsza przerwa"
                onClick={() => onAdjustRest(-15)}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-input"
              >
                −
              </button>
              <span className="w-12 text-center font-mono tabular-nums">{mmss(restSeconds)}</span>
              <button
                aria-label="dłuższa przerwa"
                onClick={() => onAdjustRest(15)}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-input"
              >
                +
              </button>
            </span>
          </li>
          <MenuItem
            icon={StickyNote}
            label="Notatka do ćwiczenia"
            onClick={() => act(onOpenNote)}
          />
          {ex.type !== "timed" && (
            <MenuItem
              icon={Gauge}
              label={rpeOn ? "Ukryj RPE" : "Pokaż RPE"}
              onClick={() => act(onToggleRpe)}
            />
          )}
        </ul>
      )}
    </BottomSheet>
  );
}

function MenuItem({
  icon: Icon,
  label,
  danger,
  muted,
  onClick,
}: {
  icon?: LucideIcon;
  label: string;
  danger?: boolean;
  muted?: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`flex h-11 w-full items-center gap-sm px-md text-left text-sm ${
          danger ? "text-danger" : muted ? "text-muted-foreground" : ""
        }`}
      >
        {Icon && <Icon className="size-4 text-muted-foreground" aria-hidden />}
        {label}
      </button>
    </li>
  );
}
