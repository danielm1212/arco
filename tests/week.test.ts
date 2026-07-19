import assert from "node:assert/strict";
import { test } from "node:test";
import { computeStreak, localDayKey, weekStart, addWarsawDays } from "../lib/week";

/**
 * F0.5 (audyt 2026-07-18): testy budują daty przez `Date.UTC(...)` (instant
 * niezależny od strefy procesu), NIE przez konstruktor lokalny `new Date(y,m,d,...)`
 * (którego znaczenie zależy od `TZ` środowiska). Dzięki temu ten sam test daje
 * ten sam wynik na maszynie developera (Europe/Warsaw) i na CI/Vercel (UTC) —
 * dokładnie ten rozjazd był źródłem buga, który F0.5 naprawia.
 */

test("localDayKey: formatuje instant jako YYYY-MM-DD w Europe/Warsaw", () => {
  // 17.07.2026 12:00 UTC = 14:00 CEST (lato, UTC+2) — bez dwuznaczności.
  assert.equal(localDayKey(new Date(Date.UTC(2026, 6, 17, 12, 0))), "2026-07-17");
  // 5.01.2026 12:00 UTC = 13:00 CET (zima, UTC+1).
  assert.equal(localDayKey(new Date(Date.UTC(2026, 0, 5, 12, 0))), "2026-01-05");
});

test("localDayKey: północ w Warszawie wygrywa z dniem kalendarzowym UTC (bug 2026-07-03 / UTC-po-deployu)", () => {
  // 21:00 UTC 17.07 = 23:00 CEST 17.07 — jeszcze ten sam dzień w Warszawie.
  assert.equal(localDayKey(new Date(Date.UTC(2026, 6, 17, 21, 0))), "2026-07-17");
  // 22:30 UTC 17.07 = 00:30 CEST 18.07 — trening "po północy" w PL, ale dzień
  // kalendarzowy UTC to wciąż 17. Stara implementacja (gettery zależne od TZ
  // procesu) na Vercel/UTC zwróciłaby tu błędnie "2026-07-17".
  assert.equal(localDayKey(new Date(Date.UTC(2026, 6, 17, 22, 30))), "2026-07-18");
});

test("weekStart: cofa do poniedziałku 00:00 czasu Warszawy", () => {
  // Piątek 17.07.2026 15:30 CEST = 13:30 UTC → poniedziałek 13.07.2026 00:00 CEST = 12.07 22:00 UTC.
  const friday = new Date(Date.UTC(2026, 6, 17, 13, 30));
  assert.equal(weekStart(friday), Date.UTC(2026, 6, 12, 22, 0, 0));
  assert.equal(localDayKey(new Date(weekStart(friday))), "2026-07-13");
});

test("weekStart: niedziela należy do tygodnia, który się kończy, nie zaczyna", () => {
  const sunday = new Date(Date.UTC(2026, 6, 19, 10, 0)); // niedziela, 12:00 CEST
  assert.equal(localDayKey(new Date(weekStart(sunday))), "2026-07-13");
});

test("weekStart: poniedziałek jest swoim własnym startem", () => {
  const mondayMorning = new Date(Date.UTC(2026, 6, 13, 7, 0)); // 09:00 CEST
  const mondayMidnight = new Date(Date.UTC(2026, 6, 13, 0, 0));
  assert.equal(weekStart(mondayMorning), weekStart(mondayMidnight));
});

test("weekStart + addWarsawDays: stabilne w tygodniu z końcem czasu letniego (25.10.2026)", () => {
  // Cały tydzień pon 19.10–niedz 25.10 ma ten sam start, mimo że w jego trakcie
  // zmienia się offset CEST→CET (ten tydzień trwa 169h, nie 168h).
  const monday = weekStart(new Date(Date.UTC(2026, 9, 19, 10, 0)));
  for (const day of [19, 20, 21, 22, 23, 24, 25]) {
    assert.equal(
      weekStart(new Date(Date.UTC(2026, 9, day, 10, 0))),
      monday,
      `dzień ${day}.10 powinien należeć do tygodnia zaczynającego się ${new Date(monday).toISOString()}`,
    );
  }
  // Kolejny poniedziałek (26.10, już w CET) liczony przez przesunięcie kalendarzowe
  // musi trafić dokładnie w realny weekStart tego dnia — nie o godzinę obok.
  assert.equal(addWarsawDays(monday, 7), weekStart(new Date(Date.UTC(2026, 9, 26, 10, 0))));
});

test("weekStart + addWarsawDays: stabilne w tygodniu z początkiem czasu letniego (29.03.2026)", () => {
  // Tydzień pon 23.03–niedz 29.03 trwa 167h (traci godzinę przy CET→CEST).
  const monday = weekStart(new Date(Date.UTC(2026, 2, 23, 10, 0)));
  for (const day of [23, 24, 25, 26, 27, 28, 29]) {
    assert.equal(weekStart(new Date(Date.UTC(2026, 2, day, 10, 0))), monday);
  }
  assert.equal(addWarsawDays(monday, 7), weekStart(new Date(Date.UTC(2026, 2, 30, 10, 0))));
});

test("computeStreak: pusty zbiór to zero", () => {
  assert.equal(computeStreak(new Set()), 0);
});

test("computeStreak: liczy kolejne tygodnie wstecz od bieżącego", () => {
  // `addWarsawDays` (nie stały WEEK_MS) — zgodnie z implementacją computeStreak,
  // poprawne również dla tygodni bieżących w okolicy zmiany czasu.
  const thisWeek = weekStart(new Date());
  const lastWeek = addWarsawDays(thisWeek, -7);
  const twoWeeksAgo = addWarsawDays(thisWeek, -14);
  assert.equal(computeStreak(new Set([thisWeek, lastWeek, twoWeeksAgo])), 3);
});

test("computeStreak: bieżący pusty tydzień nie zeruje passy", () => {
  const thisWeek = weekStart(new Date());
  const lastWeek = addWarsawDays(thisWeek, -7);
  const twoWeeksAgo = addWarsawDays(thisWeek, -14);
  // Brak treningu w tym tygodniu — licz od poprzedniego.
  assert.equal(computeStreak(new Set([lastWeek, twoWeeksAgo])), 2);
});

test("computeStreak: dziura przerywa passę", () => {
  const thisWeek = weekStart(new Date());
  const twoWeeksAgo = addWarsawDays(thisWeek, -14);
  // Brak tygodnia -1 — passa liczy tylko bieżący.
  assert.equal(computeStreak(new Set([thisWeek, twoWeeksAgo])), 1);
});
