/**
 * MOMENT-01 — model cząstki wystrzału konfetti po pobitym rekordzie.
 *
 * Czysta funkcja (RNG wstrzykiwany), żeby zakresy dało się przetestować bez DOM
 * i żeby losowanie dało się wywołać wyłącznie po stronie klienta — `Math.random()`
 * w renderze komponentu SSR-owanego to hydration mismatch.
 *
 * Fizyka (research 2026-07-24, patrz koordynacja-agentow.md):
 * - tor = parabola z rozdzielenia osi: X osobno (opór → ease-out), Y osobno
 *   (wznoszenie ease-out → opadanie ease-in). Tak samo rozkłada się rzut ukośny;
 * - opadanie kończy się prędkością GRANICZNĄ, nie przyspieszaniem bez końca —
 *   confetti jest lekkie i ma duży opór (canvas-confetti modeluje to jako
 *   `velocity *= 0.9` co klatkę);
 * - obrót w dwóch osiach o NIEWSPÓŁMIERNYCH okresach (patrz `confetti-tumble`
 *   w globals.css) — spadające kartki mają różne reżimy (flutter/tumble)
 *   jednocześnie, więc jeden wspólny rytm od razu czyta się jako sztuczny.
 */

/**
 * Ile cząstek leci w wystrzale.
 *
 * Pierwotne 34 z progiem „powyżej ~40 robi się szum" opierało się na krótszym
 * locie: przy 2,9 s cząstki schodziły z ekranu razem i gęstość faktycznie
 * męczyła. Po wydłużeniu lotu rozkładają się w czasie, więc 60 czyta się jako
 * pełniejszy wystrzał, a nie ściana papieru (dogfood 2026-07-27).
 */
export const CONFETTI_COUNT = 60;

/** Lot jest dłuższy, żeby moment zdążył wybrzmieć, a nie tylko mrugnąć. */
const CONFETTI_MIN_BASE_DURATION_SECONDS = 2.8;
const CONFETTI_MAX_BASE_DURATION_SECONDS = 4.3;
const CONFETTI_FAR_DURATION_MULTIPLIER = 1.15;
/** Rozrzut startu rośnie z liczbą cząstek, ale wystrzał ma zostać JEDNYM zdarzeniem. */
export const CONFETTI_MAX_DELAY_SECONDS = 0.26;

/**
 * Po tym czasie komponent znika z DOM. Wartość wynika z najdłuższego lotu
 * (łącznie z opóźnieniem) i ma 100 ms zapasu na zaokrąglenie/timer przeglądarki.
 */
export const CONFETTI_LIFETIME_MS =
  Math.ceil(
    (CONFETTI_MAX_BASE_DURATION_SECONDS * CONFETTI_FAR_DURATION_MULTIPLIER +
      CONFETTI_MAX_DELAY_SECONDS) *
      1000,
  ) + 100;

/** Pięć barw momentu: rust + violet + amber (świadomy wyjątek od reguły v1.4). */
export const CONFETTI_COLOR_COUNT = 5;

export interface ConfettiParticle {
  id: number;
  /** Indeks 1..5 → `var(--confetti-N)`; zmienne przełączają się z motywem. */
  color: number;
  /** Dryf poziomy w px (opór wygasza prędkość boczną). */
  dx: number;
  /**
   * Szczyt paraboli w `vh` (ujemny = w górę), liczony od punktu startu (`top: 32%`).
   *
   * Było w px, przez co na wyższych ekranach wystrzał wyglądał na coraz niższy —
   * przy 812 px sięgał ledwie okolic liczby-bohatera. `vh` (jak `floor`) trzyma tę
   * samą wysokość na każdym urządzeniu: -36vh od startu 32vh to lekkie wyjście nad
   * krawędź, czyli wystrzał dobija do topbara.
   */
  peak: number;
  /** Gdzie kończy lot — w `vh`, żeby zejść z ekranu niezależnie od urządzenia. */
  floor: number;
  widthPx: number;
  heightPx: number;
  /** Pełny obrót w tej liczbie sekund; różny per cząstka = brak wspólnego rytmu. */
  spinSeconds: number;
  /** Ile obrotów zmieści się w locie — zamiast `infinite`, żeby ruch kończył się sam. */
  spinIterations: number;
  durationSeconds: number;
  delaySeconds: number;
  /** Cząstki „dalsze" są mniejsze, wolniejsze i przygaszone — daje głębię. */
  opacity: number;
}

const round = (value: number, decimals = 2) => Number(value.toFixed(decimals));

export function buildConfettiParticles(
  count: number = CONFETTI_COUNT,
  random: () => number = Math.random,
): ConfettiParticle[] {
  const between = (min: number, max: number) => min + random() * (max - min);

  return Array.from({ length: count }, (_, id) => {
    // Część cząstek leci „dalej" — mniejsze i wolniejsze, żeby wystrzał miał głębię.
    const far = random() < 0.35;
    const scale = far ? between(0.62, 0.82) : between(0.95, 1.25);
    const duration =
      between(
        CONFETTI_MIN_BASE_DURATION_SECONDS,
        CONFETTI_MAX_BASE_DURATION_SECONDS,
      ) * (far ? CONFETTI_FAR_DURATION_MULTIPLIER : 1);
    // Wysokość WYNIKA z szerokości, a nie z osobnego losowania: przy niezależnych
    // zakresach skalowanie potrafiło dać kwadrat (11×11), a kwadrat w obrocie 3D
    // czyta się jak migający piksel, nie jak pasek papieru. Proporcja 1:1,5–1:2,4.
    const widthPx = Math.max(4, Math.round(between(6, 10) * scale));
    const spinSeconds = round(between(0.55, 1.5));

    return {
      id,
      color: Math.floor(random() * CONFETTI_COLOR_COUNT) + 1,
      dx: Math.round(between(-150, 150)),
      peak: Math.round(between(-36, -15)),
      floor: Math.round(between(70, 95)),
      widthPx,
      heightPx: Math.round(widthPx * between(1.5, 2.4)),
      spinSeconds,
      // +1, żeby obrót trwał do końca lotu, a nie zastygał tuż przed zniknięciem.
      spinIterations: Math.ceil(duration / spinSeconds) + 1,
      durationSeconds: round(duration),
      // Krótki rozrzut startu: wystrzał ma być jednym zdarzeniem, nie kapaniem.
      delaySeconds: round(between(0, CONFETTI_MAX_DELAY_SECONDS)),
      opacity: far ? 0.8 : 1,
    };
  });
}
