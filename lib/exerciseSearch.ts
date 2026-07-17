/**
 * R5a (audyt wyszukiwarki R1–R3): wspólna logika wyszukiwania ćwiczeń.
 * Czyste funkcje — testowane w tests/exercise-search.test.ts na zatwierdzonym
 * słowniku, żeby krytyczne frazy (martwy, ohp, wyciskanie…) nie regresowały.
 */

/**
 * W6 z audytu: `%`/`_` psują wzorzec ilike, a `"` i `,` składnię or() PostgREST.
 * Zamieniamy je na spacje zamiast odrzucać całą frazę.
 */
export function sanitizeSearchTerm(raw: string): string {
  return raw.replace(/[%_",]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Jedno źródło warunku wyszukiwania: nazwa EN, nazwa PL (substring, ilike)
 * oraz alias potoczny (dokładne trafienie w tablicę, stąd lowercase).
 */
export function buildSearchOrFilter(term: string): string {
  const pattern = `%${term}%`;
  return `name.ilike."${pattern}",name_pl.ilike."${pattern}",search_aliases.cs.{"${term.toLowerCase()}"}`;
}

export interface RankableHit {
  name: string;
  name_pl: string | null;
  search_aliases: string[] | null;
}

/**
 * R3: ranking trafności zamiast alfabetu — exact > prefix > alias > początek
 * słowa > substring. Remis rozstrzyga alfabet polski (w sortSearchHits).
 */
export function rankSearchHit(hit: RankableHit, term: string): number {
  const q = term.toLowerCase();
  const names = [hit.name_pl, hit.name]
    .filter((n): n is string => !!n)
    .map((n) => n.toLowerCase());
  if (names.some((n) => n === q)) return 0;
  if (names.some((n) => n.startsWith(q))) return 1;
  if ((hit.search_aliases ?? []).some((a) => a.startsWith(q))) return 2;
  if (names.some((n) => n.split(/\s+/).some((w) => w.startsWith(q)))) return 3;
  return 4;
}

export function sortSearchHits<T extends RankableHit>(hits: T[], term: string): T[] {
  return hits
    .slice()
    .sort(
      (a, b) =>
        rankSearchHit(a, term) - rankSearchHit(b, term) ||
        (a.name_pl ?? a.name).localeCompare(b.name_pl ?? b.name, "pl"),
    );
}

/** Wyświetlanie: polska nazwa, gdy jest; katalogowa EN jako fallback. */
export function exerciseDisplayName(e: { name: string; name_pl?: string | null }): string {
  return e.name_pl ?? e.name;
}
