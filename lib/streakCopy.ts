import { pluralPl, WORDS } from "@/lib/plural";

/** HOME-01: wybór copy karty passy — wydzielone z komponentu, żeby dało się
 *  przetestować bez renderowania (wzorzec jak `formatGoalSentence` w
 *  `lib/programRecommendation.ts`). Zasada z `tone-of-voice.md`: nigdy przez
 *  stratę — streak=0 nie pokazuje "0. tydzień passy", tylko brak nagłówka
 *  liczbowego (komponent renderuje wtedy neutralny fallback). Liczebnik
 *  porządkowy ("1.", "5.") nie odmienia rzeczownika w polskim, więc jeden
 *  wzorzec obsługuje 1 i N bez osobnej liczby mnogiej. */
export function streakHeadline(streak: number): string | null {
  return streak > 0 ? `${streak}. tydzień passy` : null;
}

/** Polska odmiana „tydzień" po liczbie: 1 tydzień, 2–4/22–24 tygodnie,
 *  5–21/25+ tygodni. HOME-05b: wcześniej ta odmiana żyła inline w
 *  `WeeklyGoalBadge` jako `streak < 5 ? "tygodnie" : "tygodni"` i była BŁĘDNA od
 *  22 („22 tygodni" zamiast „22 tygodnie"). Ta sama reguła co `trainingWord`,
 *  tylko inny rzeczownik — dlatego siedzi obok, nie w komponencie. */
export function weekWord(n: number): "tydzień" | "tygodnie" | "tygodni" {
  return pluralPl(n, WORDS.week) as "tydzień" | "tygodnie" | "tygodni";
}

/** Copy zerowego stanu passy — jedno zdanie dla wszystkich powierzchni, żeby
 *  „jeszcze nie zaczęta" nie miało trzech wariantów. */
export const STREAK_NOT_STARTED = "Passa startuje w tym tygodniu";

/** Pełne zdanie o passie — dla czytnika ekranu i dla powierzchni, które mają
 *  miejsce na tekst (`/postępy`, sheet, kalendarz historii). Zawsze pozytywnie,
 *  nigdy przez stratę (tone-of-voice.md §„czego nie robimy").
 *
 *  `null` przy 0 — tak samo jak `streakHeadline` i `streakBadgeLabel`. Wcześniej
 *  ta funkcja jako jedyna z trójki zwracała przy zerze zdanie („0 tygodni z
 *  rzędu"), czyli dokładnie komunikat przez stratę, przed którym ostrzega jej
 *  własny komentarz. Dwa z trzech miejsc wywołania miały własnego strażnika,
 *  trzecie (`/postępy`) nie — i to jest argument za tym, żeby strażnik siedział
 *  TUTAJ, a nie w każdym komponencie z osobna. */
export function streakWeeksText(streak: number): string | null {
  return streak > 0 ? `${streak} ${weekWord(streak)} z rzędu` : null;
}

/** Skrót passy do badge'a w headerze: „4 tyg.". Skrót, bo obok stoi awatar i na
 *  320 px nie ma miejsca na „4 tygodnie z rzędu" — pełne zdanie idzie w
 *  `aria-label` i w sheecie. `null` przy 0: passy jeszcze nie ma, a „0 tyg."
 *  komunikowałoby stratę (ta sama zasada co `streakHeadline`). */
export function streakBadgeLabel(streak: number): string | null {
  return streak > 0 ? `${streak} tyg.` : null;
}

/** Polska odmiana „seria" po liczbie: 1 seria, 2–4/22–24 serie, 5–21/25+ serii.
 *  AUDIT-A1: dodane, bo licznik niezsynchronizowanych serii przy wylogowaniu
 *  potrzebował odmiany, a repo miało ją tylko dla „trening" i „tydzień" —
 *  i za każdym razem, gdy jej brakowało, powstawał sklejony literał („1 serie"). */
export function setWord(n: number): "seria" | "serie" | "serii" {
  return pluralPl(n, WORDS.set) as "seria" | "serie" | "serii";
}

/** Polska odmiana po liczbie: 1 trening, 2/22/102 treningi, 5/12/112 treningów. */
export function trainingWord(n: number): "trening" | "treningi" | "treningów" {
  return pluralPl(n, WORDS.training) as "trening" | "treningi" | "treningów";
}

/** Jedno zdanie stanu tygodnia dla karty passy. `trening` odmienia się
 *  (1 vs N), inaczej niż porządkowy "tydzień" powyżej. */
export function streakStatusText(weeklyDone: number, weeklyGoal: number): string {
  if (weeklyDone >= weeklyGoal) return "Cel tygodnia zrobiony.";
  const remaining = weeklyGoal - weeklyDone;
  if (remaining === 1) return "Jeszcze jeden trening domyka ten tydzień.";
  const word = trainingWord(remaining);
  // HOME-05b: orzeczenie musi iść za przypadkiem, nie za samą liczebnością —
  // „2 treningi domykają", ale „5 treningów domyka" (dopełniacz wymusza liczbę
  // pojedynczą czasownika). Wcześniej było „5 treningów domykają ten tydzień",
  // zamrożone w teście. Karta „Ten tydzień" pokazuje to zdanie na Home, a cele
  // 5–6 treningów są w zasięgu ustawień (`clampWeeklyGoal`), więc to nie był
  // przypadek teoretyczny.
  const verb = word === "treningi" ? "domykają" : "domyka";
  return `Jeszcze ${remaining} ${word} ${verb} ten tydzień.`;
}
