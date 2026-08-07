import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArcoSygnet } from "@/components/ArcoSygnet";
import { STICKY_HEADER_SAFE_AREA } from "@/components/navigation/stickyHeader";

/**
 * Header przestrzeni Trening (userflows §3): sygnet po lewej, powitanie obok
 * niego, slot badge'a i awatar po prawej. Na Dziś w slocie stoi interaktywna
 * passa (`StreakBadge` — tap otwiera szczegół tygodnia); Plany świadomie nie
 * pokazują nic (decyzja P2 audytu R2 — badge odpowiada na pytanie ekranu Dziś).
 * Awatar zastępuje koło zębate; do czasu pełnego ekranu profilu prowadzi
 * do /settings.
 *
 * HOME-05b: prop nazywał się `goalSlot`, gdy w slocie stał cel tygodnia. Nazwa
 * jest teraz neutralna — slot opisuje MIEJSCE w headerze, nie treść, więc kolejna
 * zmiana symbolu nie wymaga ruszania headera.
 *
 * ── Powitanie w belce zamiast nad kartą (zmiana wobec D-39) ────────────────
 * D-39 mówiła: „powitanie jako JEDNA LINIA nad kartą startu — nigdy blok ani
 * karta", z uzasadnieniem „personalizacja bez kosztu hierarchii; karta startu
 * pozostaje pierwszym modułem (D-03)". Przeniesienie do belki idzie DALEJ w tym
 * samym kierunku, nie przeciw niemu: linia nad kartą znika zupełnie, więc widget
 * treningu staje się dosłownie pierwszym elementem treści. Personalizacja
 * przenosi się do chrome'u, gdzie nic nie kosztuje hierarchii.
 * Warunek z D-39 zostaje w mocy: brak imienia = węzeł w ogóle nie istnieje,
 * nie pusty placeholder.
 *
 * ── Sticky i brak obramowania ─────────────────────────────────────────────
 * `STICKY_HEADER_SAFE_AREA` to jedno źródło prawdy (F0.4) — NIE powtarzamy tu
 * łańcucha klas, tylko dokładamy z-index i tło, dokładnie jak `PageHeader`.
 * `cn()` jest tu obowiązkowe i UWAGA: nie wolno dopisać `relative`, bo
 * tailwind-merge wypchnie wtedy `sticky` (regresja 2026-07-22, kontrola
 * negatywna w `tests/sticky-header.test.ts`).
 *
 * Obramowanie zdjęte, bo przy sticky nie jest już potrzebne jako separator:
 * treść wjeżdża POD nieprzezroczyste `bg-background` i po prostu znika, zamiast
 * kończyć się kreską. Kreska przy przewijaniu czytałaby się jak krawędź karty,
 * a nie granica chrome'u.
 */
export function TrainingHeader({
  badgeSlot,
  displayName,
  greeting = false,
}: {
  /** Interaktywny badge (Dziś: passa) albo nic (Plany). */
  badgeSlot?: ReactNode;
  displayName: string | null;
  /** Powitanie obok sygnetu — dziś tylko Dziś; Plany zostają bez niego. */
  greeting?: boolean;
}) {
  const name = displayName?.trim() || null;
  const monogram = name?.charAt(0).toUpperCase() ?? null;

  return (
    <header
      className={cn(
        STICKY_HEADER_SAFE_AREA,
        "z-30 flex items-center gap-xs bg-background px-sm py-sm",
      )}
    >
      {/* SYGNET, nie wordmark — wzorzec z InPostu: znak marki oddaje miejsce
          powitaniu. Wordmark ma ~70 px szerokości przy tej wysokości, sygnet 32,
          więc same te 38 px decydują o tym, czy powitanie mieści się na wąskich
          ekranach. Pełna nazwa zostaje tam, gdzie jest na nią miejsce (logowanie).

          `shrink-0`: sygnet nigdy nie ustępuje — to on identyfikuje aplikację,
          a powitanie jest dodatkiem. */}
      <ArcoSygnet className="size-8 shrink-0" />

      {/* Powitanie zjada całą wolną przestrzeń i USTĘPUJE jako pierwsze:
          `min-w-0` + `truncate` sprawiają, że przy 320 px skraca się ono,
          zamiast wypychać badge passy i awatar poza ekran. Bez `min-w-0`
          flexbox nie pozwoliłby mu zejść poniżej szerokości treści — to
          najczęstsza przyczyna poziomego overflow w takich belkach.
          Gdy powitania nie ma, pusty `div` nadal rozpycha układ, więc badge
          i awatar zostają przy prawej krawędzi.

          Był tu `max-[359px]:hidden` — powitanie znikało poniżej 360 px, bo przy
          wordmarku zostawało na nie 93 px, czyli „Cześć, Al…". Sygnet oddał 24 px
          i przy 320 px jest ich 117: „Cześć, Aleksandra" mieści się w CAŁOŚCI
          (zmierzone, nie oszacowane). Reguła broniła progu, którego już nie ma,
          więc znika razem z nim — samo `truncate` wystarcza dla nazw skrajnych
          („Aleksandra-Katarzyna" skraca się przy 320 px o 52 px i to jest w porządku,
          bo zostaje czytelny kawałek imienia). */}
      <div className="min-w-0 flex-1">
        {greeting && name && (
          <p className="truncate text-sm font-semibold tracking-tight">Cześć, {name}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-xs">
        {badgeSlot}
        <Link
          href="/settings"
          aria-label="Profil i ustawienia"
          className="grid size-11 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {/* Monogram identyfikuje konto, nie zachęca do działania — rust na
              `primary/15` dawał 4.13:1 (light) i 3.89:1 (dark). */}
          <span className="grid size-8 place-items-center rounded-full bg-support-surface text-sm font-semibold text-support-surface-text">
            {monogram ?? <span aria-hidden>•</span>}
          </span>
        </Link>
      </div>
    </header>
  );
}
