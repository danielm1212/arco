"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ExerciseType, SessionSet, UnitSystem } from "@/lib/types";
import { useWakeLock } from "@/lib/useWakeLock";
import { getKeepAwake } from "@/lib/prefs";
import { ChevronLeft, Dumbbell, Timer, MoreVertical, Trash2 } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { reorderExercise } from "@/app/actions/sets";
import { ensureOnline } from "@/lib/offlineGuard";
import { RestTimer } from "./RestTimer";
import { ExercisePicker } from "./ExercisePicker";
import { ExerciseCard } from "./ExerciseCard";
import { FinishSheet } from "./FinishSheet";
import type { PrevSet } from "./SetRow";
import { useRestTimer } from "./useRestTimer";
import { useSessionOutbox } from "./useSessionOutbox";
import { useSessionMutations } from "./useSessionMutations";
import { handleFinish, handleDeleteSession } from "./finish";

export interface LoggerExercise {
  sessionExerciseId: string;
  exerciseId: string;
  name: string;
  type: ExerciseType;
  equipment: string | null;
  slot: {
    default_exercise_id: string;
    target_sets: number;
    target_reps_min: number | null;
    target_reps_max: number | null;
    rest_seconds: number;
    notes: string | null;
  } | null;
  supersetGroup: number | null;
  notes: string | null;
  skipped: boolean;
  sets: SessionSet[];
  previous: {
    weight: number | null;
    reps: number | null;
    duration_seconds: number | null;
    added_weight: number | null;
  } | null;
  previousSets: PrevSet[];
  /** S12: rekordy per liczba powtórzeń (reps → najlepszy ciężar), bez bieżącej sesji. */
  repPRs: Record<number, number>;
}

/**
 * Orkiestracja loggera — S9-cz.2 paczka 3 (split bez zmiany zachowania):
 * karta → ExerciseCard · wiersz → SetRow (oba memo) · przerwa → useRestTimer ·
 * outbox → useSessionOutbox · mutacje → useSessionMutations · finish → finish.ts.
 * Inwariant handlerów (memo pomija funkcje): patrz doc-comment w useSessionMutations.
 */
export function Logger({
  sessionId,
  title,
  programName,
  isFinished,
  startedAt,
  unit,
  defaultRest,
  initialExercises,
}: {
  sessionId: string;
  /** Etykieta dnia ("Trening A") — tytuł główny; jedyna część odróżniająca sesje,
   *  program w trakcie treningu jest bezwartościowy (wiadomo, co się kliknęło). */
  title: string;
  programName: string | null;
  isFinished: boolean;
  startedAt: string;
  unit: UnitSystem;
  defaultRest: number;
  initialExercises: LoggerExercise[];
}) {
  const router = useRouter();
  const [exercises, setExercises] = useState(initialExercises);
  // Re-sync z serwera po router.refresh() (podmiana / dodanie / usunięcie ćwiczenia).
  // Prop zmienia referencję tylko przy odświeżeniu server-componentu, więc nie
  // kasuje optymistycznych edycji serii między odświeżeniami.
  useEffect(() => {
    setExercises(initialExercises);
  }, [initialExercises]);
  // Najświeższy stan dostępny w handlerach (do złożenia pełnego wiersza przy zapisie)
  const exercisesRef = useRef(exercises);
  exercisesRef.current = exercises;

  const { rest, restFor, startRest, adjustRest, dismissRest, extendRest } =
    useRestTimer(defaultRest);
  const { online, pending, syncing, flush, saveSet, removeSet } = useSessionOutbox(sessionId);
  const {
    prSets,
    patchSetLocal,
    persistNotes,
    handleAddSet,
    handleToggle,
    handleTimedComplete,
    persistSet,
    handleDeleteSet,
    handleDeleteExercise,
    handleSkip,
    linkWithPartner,
    unlink,
  } = useSessionMutations({ sessionId, setExercises, exercisesRef, saveSet, removeSet, startRest });

  // R6b: lista nazw+grup dla pickera "Połącz w superset" w ⋯ karty. Referencyjnie
  // stabilna między toggle'ami serii (klucz = id+nazwa+grupa, nie cały `exercises`)
  // — inaczej każdy tap ✓ złamałby memo na WSZYSTKICH kartach (patrz komparator
  // w ExerciseCard.tsx).
  const summaryKey = exercises
    .map((e) => `${e.sessionExerciseId}:${e.name}:${e.supersetGroup}`)
    .join("|");
  const exerciseSummaries = useMemo(
    () => exercises.map((e) => ({ id: e.sessionExerciseId, name: e.name, group: e.supersetGroup })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [summaryKey],
  );

  // R7 (audyt-loggera.md §6): przenieś ⋯ wyżej/niżej — serwer przenumerowuje
  // `position` (jednostka = ćwiczenie LUB cała grupa SS), router.refresh()
  // dociąga nowy porządek. Reorder idzie przez sieć (jak swap/skip) — offline-guard.
  function moveExercise(seId: string, direction: "up" | "down") {
    if (!ensureOnline("zmiana kolejności ćwiczeń")) return;
    reorderExercise(sessionId, seId, direction)
      .then(() => router.refresh())
      .catch(() => toast.error("Nie zapisano — sprawdź połączenie i spróbuj ponownie."));
  }

  // RPE domyślnie ukryte (opcjonalne) — odsłaniane per ćwiczenie na czas sesji
  const [rpeOn, setRpeOn] = useState<Record<string, boolean>>({});
  // Notatka zwinięta domyślnie (odgracenie karty) — otwarta gdy już jest treść
  const [noteOpen, setNoteOpen] = useState<Record<string, boolean>>({});
  // Panel podmiany per ćwiczenie — trigger ⇄ w nagłówku karty (N2#5)
  const [swapOpen, setSwapOpen] = useState<Record<string, boolean>>({});
  // R1 (audyt-loggera.md): ⋯ sesji w headerze — dziś tylko "Usuń sesję",
  // docelowo edycja daty/reorder trafią tu też
  const [sessionMenuOpen, setSessionMenuOpen] = useState(false);
  // R4: finish-sheet zamiast confirm() — otwierany tylko gdy są niezaliczone serie
  const [finishSheetOpen, setFinishSheetOpen] = useState(false);
  // Blokada wygaszania ekranu na czas aktywnego treningu (jeśli włączona w ustawieniach)
  useWakeLock(!isFinished && getKeepAwake());

  // Licznik czasu trwania sesji (na żywo)
  const [elapsed, setElapsed] = useState(() =>
    Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)),
  );
  useEffect(() => {
    if (isFinished) return;
    const id = window.setInterval(
      () => setElapsed(Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000))),
      1000,
    );
    return () => window.clearInterval(id);
  }, [startedAt, isFinished]);

  // Live podsumowanie z lokalnego stanu
  const doneSets = exercises.reduce((n, ex) => n + ex.sets.filter((s) => s.completed).length, 0);
  // R4: seria niezaliczone = kandydat do finish-sheeta zamiast confirm()
  const incompleteSets = exercises.reduce(
    (n, ex) => n + ex.sets.filter((s) => !s.completed).length,
    0,
  );
  const volume = exercises.reduce(
    (n, ex) =>
      n +
      ex.sets.reduce(
        (m, s) => m + (s.completed && s.weight != null && s.reps != null ? s.weight * s.reps : 0),
        0,
      ),
    0,
  );
  const hh = Math.floor(elapsed / 3600);
  const mm = Math.floor((elapsed % 3600) / 60);
  const ss = elapsed % 60;
  const elapsedStr =
    (hh > 0 ? `${hh}:${String(mm).padStart(2, "0")}` : `${mm}`) + `:${String(ss).padStart(2, "0")}`;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col pb-28">
      <header className="sticky top-0 z-10 border-b bg-background/95 px-md py-sm backdrop-blur">
        <div className="flex items-center justify-between gap-sm">
          <div className="flex min-w-0 items-center gap-2xs">
            {/* 44px pełnowymiarowy target (było: mikro-tekst "← Trening") */}
            <button
              onClick={() => router.push("/")}
              aria-label="Wróć do treningu"
              className="flex h-11 w-11 shrink-0 -ml-2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="min-w-0">
              {/* Nazwa dnia = tytuł: jedyna część odróżniająca sesję, program
                  w trakcie treningu jest bezwartościowy — zostaje podpisem */}
              <p className="truncate font-semibold leading-tight">{title}</p>
              {programName && (
                <p className="truncate text-xs text-muted-foreground">{programName}</p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-sm">
            {(!online || pending > 0) && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  !online ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground"
                }`}
                title={
                  !online
                    ? "Offline — zmiany zapiszą się po powrocie sieci"
                    : `${pending} zmian(y) do synchronizacji`
                }
              >
                {!online ? "● offline" : syncing ? "synchronizuję…" : `↑ ${pending}`}
              </span>
            )}
            {!isFinished && (
              // Nie wypełniony rust — akcją główną ekranu jest logowanie serii,
              // nie kończenie treningu (ten sam argument co V4 hero na home).
              // Siatka bezpieczeństwa na przypadkowy tap: R4 (finish-sheet).
              <Button
                size="sm"
                variant="outline"
                className="text-primary"
                onClick={() =>
                  incompleteSets > 0
                    ? setFinishSheetOpen(true)
                    : handleFinish({ sessionId, exercises, online, flush })
                }
              >
                Zakończ
              </Button>
            )}
            <button
              onClick={() => setSessionMenuOpen(true)}
              aria-label="Więcej akcji dla sesji"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="size-5" />
            </button>
          </div>
        </div>
        <div className="mt-xs flex items-center gap-lg text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Timer className="size-3.5" />
            <span className="font-mono tabular-nums text-foreground">{elapsedStr}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Dumbbell className="size-3.5" />
            <span className="font-medium text-foreground">
              {Math.round(volume).toLocaleString("pl-PL")}
              {unit}
            </span>
          </span>
          <span>
            ✓ <span className="font-medium text-foreground">{doneSets}</span> serii
          </span>
        </div>
      </header>

      {/* pb przy aktywnej przerwie — rest-bar (fixed bottom) nie zasłania dolnych wierszy (N2#9) */}
      <main className={`flex-1 space-y-md p-md ${rest ? "pb-28" : ""}`}>
        {exercises.map((ex, i) => (
          <ExerciseCard
            key={ex.sessionExerciseId}
            ex={ex}
            index={i}
            sessionId={sessionId}
            unit={unit}
            restSeconds={restFor(ex)}
            swapOpen={!!swapOpen[ex.sessionExerciseId]}
            noteOpen={noteOpen[ex.sessionExerciseId]}
            rpeOn={!!rpeOn[ex.sessionExerciseId]}
            prSets={prSets}
            exerciseSummaries={exerciseSummaries}
            onToggleSwap={(id) => setSwapOpen((o) => ({ ...o, [id]: !o[id] }))}
            onCloseSwap={(id) => setSwapOpen((o) => ({ ...o, [id]: false }))}
            onSkip={handleSkip}
            onDeleteExercise={handleDeleteExercise}
            onLinkPartner={linkWithPartner}
            onUnlink={unlink}
            onMove={moveExercise}
            onAdjustRest={adjustRest}
            onOpenNote={(id) => setNoteOpen((o) => ({ ...o, [id]: true }))}
            onPersistNotes={persistNotes}
            onAddSet={handleAddSet}
            onToggleRpe={(id) => setRpeOn((o) => ({ ...o, [id]: !o[id] }))}
            onToggleSet={handleToggle}
            onTimedComplete={handleTimedComplete}
            onPatchSet={patchSetLocal}
            onPersistSet={persistSet}
            onDeleteSet={handleDeleteSet}
          />
        ))}

        <ExercisePicker sessionId={sessionId} />
      </main>

      {/* R1: "Usuń sesję" — akcja raz-na-miesiąc, dawniej zawsze widoczna
          tuż pod pickerem (strefa eksploracji); teraz w ⋯ sesji z headera */}
      <BottomSheet
        open={sessionMenuOpen}
        onOpenChange={setSessionMenuOpen}
        title="Sesja"
        description="Akcje dla całej sesji"
      >
        <button
          type="button"
          onClick={() => {
            setSessionMenuOpen(false);
            handleDeleteSession({ sessionId, online });
          }}
          className="flex h-11 w-full items-center gap-sm px-0 text-left text-sm text-danger"
        >
          <Trash2 className="size-4" aria-hidden />
          Usuń sesję
        </button>
      </BottomSheet>

      <FinishSheet
        open={finishSheetOpen}
        onOpenChange={setFinishSheetOpen}
        doneSets={doneSets}
        incompleteSets={incompleteSets}
        minutes={Math.floor(elapsed / 60)}
        onConfirm={() => handleFinish({ sessionId, exercises, online, flush })}
      />

      {rest && (
        <RestTimer
          endAt={rest.endAt}
          label={rest.label}
          onDone={dismissRest}
          onDismiss={dismissRest}
          onExtend={extendRest}
        />
      )}
    </div>
  );
}
