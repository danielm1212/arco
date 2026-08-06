"use client";

import { useState } from "react";
import { ChevronRight, MoreHorizontal, Plus, Repeat2 } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { startFreestyle, startSession } from "@/app/actions/session";

/**
 * POC: alternatywy startu schowane pod „⋯" w hero (zamiast trzech tekst-linków
 * w stopce). Kontynuacja kierunku z F1 §3.2 — tam stopka przejęła wszystkie
 * alternatywy jako ciche linki, żeby nie konkurowały z CTA; tu schodzą o poziom
 * niżej i zostaje jedno wypełnione CTA plus jedno „⋯".
 *
 * ── Dlaczego jeden arkusz z dwoma widokami, a nie dwa arkusze ──────────────
 * Checklista §6: „Max 1 poziom modality". Wariant „⋯ → arkusz opcji → arkusz
 * wyboru dnia" łamałby to wprost, a `BottomSheet` przy łańcuchu arkuszy musi
 * jeszcze żonglować fokusem między nimi. Dlatego wybór dnia podmienia ZAWARTOŚĆ
 * tego samego arkusza — modalność zostaje jedna, a powrót jest jednym tapnięciem.
 *
 * ── Dlaczego freestyle startuje od razu ───────────────────────────────────
 * `FreestyleStartButton` ma własny arkusz potwierdzenia („Zacząć własny trening?").
 * Miał sens, gdy freestyle startował z jednego tapnięcia w stopce — chronił przed
 * przypadkowym rozpoczęciem sesji obok planu. Tutaj użytkownik przeszedł już przez
 * „⋯" i świadomie wybrał pozycję z listy, więc drugie pytanie o to samo jest
 * tarciem bez wartości.
 */
export function HeroWorkoutMenu({
  programName,
  dayLabel,
  days,
}: {
  programName: string;
  /** Sugerowany dzień — podtytuł arkusza, żeby menu wiedziało, czego dotyczy. */
  dayLabel: string;
  days: { id: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"options" | "days">("options");

  // Wybór dnia ma sens tylko przy rotacji — przy planie jednodniowym
  // „zmień następny trening" nie ma czego zmieniać.
  const canPickDay = days.length > 1;

  function close(next: boolean) {
    setOpen(next);
    // Reset dopiero przy zamykaniu: gdyby zejść do „options" od razu, użytkownik
    // zobaczyłby przeskok widoku w trakcie animacji wyjazdu arkusza.
    if (!next) setView("options");
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={close}
      trigger={
        <button
          type="button"
          aria-label="Opcje treningu"
          /* 44×44 zaokrąglony kwadrat z własną podkładką — nie okrąg. Podkładka
             nie jest dekoracją: ⋯ leży na zdjęciu, a to jedyny sposób, żeby
             glif trzymał kontrast niezależnie od tego, co akurat jest pod nim. */
          className="grid size-11 shrink-0 place-items-center rounded-lg bg-background/60 text-foreground backdrop-blur-sm transition-colors hover:bg-background/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          <MoreHorizontal className="size-5" aria-hidden />
        </button>
      }
      title={view === "options" ? "Opcje treningu" : programName}
      description={
        view === "options"
          ? `Alternatywy dla treningu ${dayLabel} z planu ${programName}`
          : `Wybierz dzień treningowy z planu ${programName}`
      }
    >
      {view === "options" ? (
        <ul className="space-y-xs">
          {canPickDay && (
            <li>
              <MenuRow
                icon={<Repeat2 className="size-5" aria-hidden />}
                tone="accent"
                title="Zmień następny trening"
                hint="Bez zmiany aktywnego planu"
                onClick={() => setView("days")}
              />
            </li>
          )}
          <li>
            {/* Server Action zamiast onClick: start sesji musi działać bez JS
                i przejść przez tę samą ścieżkę, co reszta startów. */}
            <form action={startFreestyle}>
              <MenuRow
                icon={<Plus className="size-5" aria-hidden />}
                tone="support"
                title="Rozpocznij własny trening"
                hint="Pusty trening poza planem"
                type="submit"
              />
            </form>
          </li>
        </ul>
      ) : (
        <ul className="space-y-xs">
          {days.map((day) => (
            <li key={day.id}>
              <form action={startSession.bind(null, day.id)}>
                <button
                  type="submit"
                  className="flex min-h-11 w-full items-center justify-between rounded-md bg-muted px-md py-sm text-left text-sm font-medium"
                >
                  <span>{day.label}</span>
                  <span className="text-xs text-muted-foreground">Zacznij →</span>
                </button>
              </form>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => setView("options")}
              className="min-h-11 w-full text-sm font-medium text-muted-foreground underline-offset-2 hover:underline"
            >
              Wróć do opcji
            </button>
          </li>
        </ul>
      )}
    </BottomSheet>
  );
}

/**
 * Wiersz opcji: kwadrat z ikoną + tytuł/podpowiedź + chevron.
 *
 * `tone` steruje wyłącznie tintem pod ikoną i trzyma oś kolorów z wytycznych §7:
 * rust = działanie na planie, violet = prowadzenie/dane. Jeden kolor chromatyczny
 * na wiersz — chevron i tekst zostają neutralne.
 */
function MenuRow({
  icon,
  tone,
  title,
  hint,
  onClick,
  type = "button",
}: {
  icon: React.ReactNode;
  tone: "accent" | "support";
  title: string;
  hint: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="flex w-full items-center gap-sm rounded-md bg-muted p-sm text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        className={
          tone === "accent"
            ? "grid size-11 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"
            : "grid size-11 shrink-0 place-items-center rounded-md bg-support/10 text-support"
        }
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </button>
  );
}
