"use client";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import {
  ArrowLeftRight,
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
 */
export function ExerciseCardMenu({
  ex,
  index,
  open,
  onOpenChange,
  restSeconds,
  rpeOn,
  grouped,
  onSwap,
  onSkip,
  onDeleteExercise,
  onLink,
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
  onSwap: () => void;
  onSkip: () => void;
  onDeleteExercise: () => void;
  onLink: () => void;
  onUnlink: () => void;
  onAdjustRest: (delta: number) => void;
  onOpenNote: () => void;
  onToggleRpe: () => void;
}) {
  function act(fn: () => void) {
    fn();
    onOpenChange(false);
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={ex.name}
      description={`Akcje dla ćwiczenia ${ex.name}`}
    >
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
          index > 0 && (
            <MenuItem
              icon={Link2}
              label="Superset z poprzednim"
              onClick={() => act(onLink)}
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
        <MenuItem icon={StickyNote} label="Notatka do ćwiczenia" onClick={() => act(onOpenNote)} />
        {ex.type !== "timed" && (
          <MenuItem
            icon={Gauge}
            label={rpeOn ? "Ukryj RPE" : "Pokaż RPE"}
            onClick={() => act(onToggleRpe)}
          />
        )}
      </ul>
    </BottomSheet>
  );
}

function MenuItem({
  icon: Icon,
  label,
  danger,
  onClick,
}: {
  icon?: LucideIcon;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`flex h-11 w-full items-center gap-sm px-md text-left text-sm ${
          danger ? "text-danger" : ""
        }`}
      >
        {Icon && <Icon className="size-4 text-muted-foreground" aria-hidden />}
        {label}
      </button>
    </li>
  );
}
