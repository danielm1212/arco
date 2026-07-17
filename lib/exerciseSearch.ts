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
 * R4 audytu: normalizacja polskich diakrytyk — „lawka" ma znaleźć „ławkę".
 * NFD zdejmuje ogonki/kreski (ą→a, ś→s…), ale ł/Ł nie ma dekompozycji Unicode,
 * stąd jawna zamiana. Lustrzana funkcja po stronie DB: translate() w kolumnie
 * generowanej `name_pl_norm` (migracja 20260717163900) — obie strony MUSZĄ
 * normalizować identycznie.
 */
export function normalizePolish(s: string): string {
  return s
    .toLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Warianty aliasów bez diakrytyk do zapisania w `search_aliases` obok
 * oryginałów („żołnierskie" + „zolnierskie"). Jedno źródło dla seeda i testów;
 * migracja robi to samo w SQL.
 */
export function withNormalizedAliases(aliases: string[]): string[] {
  const out = new Set(aliases);
  for (const a of aliases) out.add(normalizePolish(a));
  return [...out];
}

/**
 * Jedno źródło warunku wyszukiwania: nazwa EN, nazwa PL (substring, ilike),
 * nazwa PL bez diakrytyk (kolumna generowana) oraz alias potoczny (dokładne
 * trafienie w tablicę — aliasy są zapisane razem z wariantami bez diakrytyk).
 */
export function buildSearchOrFilter(term: string): string {
  const pattern = `%${term}%`;
  const norm = normalizePolish(term);
  const arms = [
    `name.ilike."${pattern}"`,
    `name_pl.ilike."${pattern}"`,
    `name_pl_norm.ilike."%${norm}%"`,
    `search_aliases.cs.{"${norm}"}`,
  ];
  if (norm !== term.toLowerCase()) arms.push(`search_aliases.cs.{"${term.toLowerCase()}"}`);
  return arms.join(",");
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
  // Ranking porównuje po normalizacji diakrytyk — „lawka" i „ławka" rankują tak samo.
  const q = normalizePolish(term);
  const names = [hit.name_pl, hit.name]
    .filter((n): n is string => !!n)
    .map((n) => normalizePolish(n));
  if (names.some((n) => n === q)) return 0;
  if (names.some((n) => n.startsWith(q))) return 1;
  if ((hit.search_aliases ?? []).some((a) => normalizePolish(a).startsWith(q))) return 2;
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
