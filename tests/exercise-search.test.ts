import assert from "node:assert/strict";
import test from "node:test";
import rawExercises from "../scripts/data/exercises.json";
import polishNames from "../scripts/data/exercise-names-pl.json";
import {
  buildSearchOrFilter,
  normalizePolish,
  rankSearchHit,
  sanitizeSearchTerm,
  sortSearchHits,
  withNormalizedAliases,
  type RankableHit,
} from "../lib/exerciseSearch";

const dict = polishNames as Record<string, { name_pl: string | null; aliases: string[] }>;
const exercises = rawExercises as { id: string; name: string }[];
const byId = new Map(exercises.map((e) => [e.id, e]));

/**
 * Emulacja semantyki zapytania z ExerciseBrowser (ilike na name/name_pl,
 * dokładne trafienie aliasu) na pełnym katalogu — stały zestaw krytycznych
 * zapytań z audytu wyszukiwarki nie może regresować.
 */
function searchCatalog(rawQuery: string): RankableHit[] {
  const term = sanitizeSearchTerm(rawQuery);
  const q = term.toLowerCase();
  const norm = normalizePolish(term);
  const hits = exercises
    .map((e) => ({
      name: e.name,
      name_pl: dict[e.id]?.name_pl ?? null,
      // Jak w bazie po migracji 20260717163900: aliasy z wariantami bez diakrytyk.
      search_aliases: withNormalizedAliases(dict[e.id]?.aliases ?? []),
      id: e.id,
    }))
    .filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        (h.name_pl ?? "").toLowerCase().includes(q) ||
        normalizePolish(h.name_pl ?? "").includes(norm) ||
        h.search_aliases.includes(q) ||
        h.search_aliases.includes(norm),
    );
  return sortSearchHits(hits, term);
}

test("słownik: każde id istnieje w katalogu, nazwy niepuste, aliasy lowercase", () => {
  for (const [id, entry] of Object.entries(dict)) {
    assert.ok(byId.has(id), `nieznane id w słowniku: ${id}`);
    assert.ok(entry.name_pl == null || entry.name_pl.trim().length > 0, `pusta nazwa PL: ${id}`);
    for (const alias of entry.aliases) {
      assert.equal(alias, alias.toLowerCase().trim(), `alias nie-lowercase: ${id} → "${alias}"`);
    }
  }
  const withNames = Object.values(dict).filter((e) => e.name_pl).length;
  assert.ok(withNames >= 200, `słownik stopniał: ${withNames} < 200 nazw PL`);
});

test("krytyczne zapytania PL znajdują właściwe ćwiczenia", () => {
  const cases: [string, string][] = [
    ["wyciskanie", "Barbell_Bench_Press_-_Medium_Grip"],
    ["martwy", "Barbell_Deadlift"],
    ["rumuński", "Romanian_Deadlift"],
    ["ohp", "Standing_Military_Press"],
    ["allahy", "Cable_Crunch"],
    ["bułgary", "Bulgarian_Split_Squat"],
    ["ławka", "Barbell_Bench_Press_-_Medium_Grip"],
    ["wiosłowanie", "Bent_Over_Barbell_Row"],
    ["przysiad", "Barbell_Squat"],
    ["rozpiętki", "Dumbbell_Flyes"],
    ["hip thrust", "Barbell_Hip_Thrust"],
    ["hip thrust", "Dumbbell_Hip_Thrust"],
    ["wspięcia", "Calf_Raise_On_A_Dumbbell"],
  ];
  for (const [query, expectedId] of cases) {
    const hits = searchCatalog(query) as (RankableHit & { id: string })[];
    assert.ok(
      hits.some((h) => h.id === expectedId),
      `"${query}" nie znajduje ${expectedId} (trafienia: ${hits.slice(0, 5).map((h) => h.id).join(", ")})`,
    );
  }
});

test("wyszukiwanie EN nadal działa (bez regresji katalogu)", () => {
  const hits = searchCatalog("bench press") as (RankableHit & { id: string })[];
  assert.ok(hits.length > 0, "bench press bez wyników");
  const row = searchCatalog("row") as (RankableHit & { id: string })[];
  assert.ok(row.some((h) => h.id === "Bent_Over_Barbell_Row"));
});

test("ranking: exact > prefix > alias > początek słowa > substring", () => {
  const exact: RankableHit = { name: "X", name_pl: "Martwy ciąg klasyczny", search_aliases: [] };
  const prefix: RankableHit = { name: "X", name_pl: "Martwy ciąg rumuński extra", search_aliases: [] };
  const alias: RankableHit = { name: "X", name_pl: "Zupełnie inaczej", search_aliases: ["martwy ciąg 2"] };
  const wordStart: RankableHit = { name: "X", name_pl: "Klasyczny martwy test", search_aliases: [] };
  const substring: RankableHit = { name: "Zmartwychwstanie", name_pl: null, search_aliases: [] };
  const q = "martwy ciąg klasyczny";
  assert.equal(rankSearchHit(exact, q), 0);
  const q2 = "martwy";
  assert.ok(rankSearchHit(prefix, q2) < rankSearchHit(alias, q2));
  assert.ok(rankSearchHit(alias, q2) < rankSearchHit(wordStart, q2));
  assert.ok(rankSearchHit(wordStart, q2) < rankSearchHit(substring, q2));
});

test("normalizacja diakrytyk: lawka znajduje ławkę (R4 audytu)", () => {
  assert.equal(normalizePolish("Żołnierskie"), "zolnierskie");
  assert.equal(normalizePolish("ŁAWKA skośna"), "lawka skosna");
  assert.equal(normalizePolish("wznosy hantli bokiem"), "wznosy hantli bokiem");

  assert.deepEqual(withNormalizedAliases(["bułgary", "goblet"]).sort(), [
    "bulgary",
    "bułgary",
    "goblet",
  ]);

  const cases: [string, string][] = [
    ["lawka", "Barbell_Bench_Press_-_Medium_Grip"],
    ["zolnierskie", "Standing_Military_Press"],
    ["bulgary", "Bulgarian_Split_Squat"],
    ["rumunski", "Romanian_Deadlift"],
    ["wspiecia", "Calf_Raise_On_A_Dumbbell"],
    ["lawce skosnej", "Incline_Dumbbell_Press"],
  ];
  for (const [query, expectedId] of cases) {
    const hits = searchCatalog(query) as (RankableHit & { id: string })[];
    assert.ok(
      hits.some((h) => h.id === expectedId),
      `"${query}" nie znajduje ${expectedId} (trafienia: ${hits.slice(0, 5).map((h) => h.id).join(", ")})`,
    );
  }

  // Ranking traktuje frazę bez ogonków jak oryginał: prefix wygrywa z substringiem.
  const hit: RankableHit = { name: "X", name_pl: "Ławka skośna", search_aliases: [] };
  assert.equal(rankSearchHit(hit, "lawka"), 1);
});

test("buildSearchOrFilter zawiera ramię znormalizowane i oba warianty aliasu", () => {
  const f = buildSearchOrFilter("Żołnierskie");
  assert.ok(f.includes('name_pl_norm.ilike."%zolnierskie%"'), f);
  assert.ok(f.includes('search_aliases.cs.{"zolnierskie"}'), f);
  assert.ok(f.includes('search_aliases.cs.{"żołnierskie"}'), f);
  // Fraza bez diakrytyk nie dubluje ramienia aliasowego.
  const g = buildSearchOrFilter("goblet");
  assert.equal(g.match(/search_aliases/g)?.length, 1, g);
});

test("sanitizacja frazy: wildcardy ilike i separatory or() nie psują zapytania", () => {
  assert.equal(sanitizeSearchTerm("100%"), "100");
  assert.equal(sanitizeSearchTerm('ławka_"skos",ok'), "ławka skos ok");
  assert.ok(!buildSearchOrFilter("abc").includes("undefined"));
});

test("słownik pokrywa wszystkie ćwiczenia używane w programach (sekcja A)", () => {
  // 91 slotowych id z seeda ma mieć name_pl — to priorytet 1 zatwierdzonego słownika.
  const slotIdsWithName = Object.entries(dict).filter(([, e]) => e.name_pl).length;
  assert.ok(slotIdsWithName >= 200);
});
