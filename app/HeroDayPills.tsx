/**
 * Pigułki dni planu na zdjęciu hero: ile treningów ma cykl i który jest następny.
 *
 * To WSKAŹNIK, nie kontrolka — nie da się w nie kliknąć. Zmiana następnego treningu
 * żyje pod „⋯" (`HeroWorkoutMenu`) i tylko tam. Gdyby pigułki też startowały dzień,
 * byłyby drugą, równorzędną drogą do tej samej akcji — dokładnie tym, co F1 §3.2
 * świadomie likwidowało w stopce hero. Przy okazji znika napięcie z progiem dotyku:
 * element nieinteraktywny nie musi mieć 44 px, więc może mieć 32 px z projektu.
 *
 * Litera pochodzi z POZYCJI w cyklu, nie z etykiety dnia. Etykiety w bazie bywają
 * opisowe („Dół A · siła", „Góra + pośladki", „Legs B · ciężki"), więc wyciąganie
 * z nich litery działałoby dla „Dzień A/B/C" i rozsypywało się na reszcie katalogu.
 *
 * Dla czytnika ekranu same litery są bezwartościowe, więc grupa niesie JEDNO zdanie
 * przez `aria-label`, a pigułki są `aria-hidden`. Inaczej użytkownik dostałby
 * „A B C" bez informacji, co to znaczy ani który jest bieżący.
 */
const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export function HeroDayPills({
  days,
  activeDayId,
}: {
  days: { id: string; label: string }[];
  activeDayId: string | null;
}) {
  if (days.length < 2) return null;

  const activeLabel = days.find((day) => day.id === activeDayId)?.label ?? null;

  return (
    <div
      role="img"
      aria-label={
        activeLabel
          ? `Plan ma ${days.length} treningów, następny to ${activeLabel}`
          : `Plan ma ${days.length} treningów`
      }
      className="relative inline-flex max-w-full"
    >
      {/* Obrys gradientowy jako OSOBNA warstwa: maska (`mask-composite: exclude`)
          wycina wnętrze elementu, na którym siedzi, więc nałożona na listę
          skasowałaby też same pigułki. Samo `background … border-box` wypełniłoby
          je gradientem, a `border-image` ignoruje `border-radius`. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          border: "1px solid transparent",
          background:
            "linear-gradient(135deg, hsl(var(--color-accent)) 0%, hsl(var(--color-support)) 100%) border-box",
          WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
        }}
      />
      <ul
        aria-hidden
        /* Powyżej czterech dni (PPL ma sześć) rząd nie mieści się w 358 px,
           więc przewija się poziomo zamiast zawijać. */
        /* Wymiary z Figmy: kafelek 24, gap 4, padding 4 → grupa 3 dni = 88×32
           (24×3 + 4×2 gapów + 4×2 paddingu). */
        className="inline-flex max-w-full list-none items-center gap-2xs overflow-x-auto rounded-full p-2xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {days.map((day, index) => (
          <li key={day.id}>
            <span
              className={
                /* 24×24 i `Typography/Caption` (12/16 Regular) — bez pogrubienia:
                   w projekcie litera jest zwykłej wagi, a przy 24 px kółku
                   semibold robił się cięższy niż reszta karty. */
                "grid size-6 place-items-center rounded-full text-xs " +
                (day.id === activeDayId
                  ? /* Para STAŁA, nie `support` — ta w `.dark` odwraca się i dawała
                       CZARNĄ literę na jasnym violecie. Chip leży na zdjęciu, więc
                       nie ma powodu, żeby zmieniał się razem z motywem aplikacji. */
                    "bg-media-chip text-media-chip-foreground"
                  : "text-foreground/90")
              }
            >
              {LETTERS[index] ?? String(index + 1)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
