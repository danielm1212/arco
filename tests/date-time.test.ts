import assert from "node:assert/strict";
import test from "node:test";
import { formatWarsawDate, formatWarsawDateTime } from "../lib/dateTime";
import { localDayKey } from "../lib/week";

test("Historia: data ma ten sam tekst na serwerze i w przeglądarce", () => {
  assert.equal(
    formatWarsawDateTime("2026-07-19T10:38:56.000Z"),
    "19.07.2026, 12:38:56",
  );
});

test("Historia: formatowanie respektuje zmianę czasu Europe/Warsaw", () => {
  assert.equal(
    formatWarsawDateTime("2026-01-19T10:38:56.000Z"),
    "19.01.2026, 11:38:56",
  );
});

test("Logger historyczny: sam dzień jest stabilny blisko północy UTC", () => {
  assert.equal(formatWarsawDate("2026-07-19T22:30:00.000Z"), "20.07.2026");
});

/**
 * D6 (audyt 2026-07-31): Historia, karta ćwiczenia i Ciało formatowały daty
 * przez `toLocaleDateString("pl-PL", {…})` BEZ `timeZone`, czyli w strefie
 * procesu. Na Vercelu proces stoi w UTC, więc trening zapisany wieczorem czasu
 * polskiego dostawał na liście dzień wcześniejszy — a kalendarz nad tą samą
 * listą liczy przez `lib/week.ts`, jawnie w Europe/Warsaw. Dwie różne daty tego
 * samego treningu, na jednym ekranie.
 */

/** 1 sierpnia 2026, 23:30 czasu polskiego = 21:30 UTC (CEST, UTC+2). */
const EVENING_CEST = "2026-08-01T21:30:00.000Z";
/** 1 stycznia 2027, 00:30 czasu polskiego = 31 grudnia 23:30 UTC (CET, UTC+1). */
const NEW_YEAR_CET = "2026-12-31T23:30:00.000Z";

test("D6: wieczorny trening nie przeskakuje na poprzedni dzień", () => {
  // Bez jawnej strefy proces w UTC pokazywał tu 1 sierpnia w każdym wariancie.
  assert.equal(formatWarsawDate(EVENING_CEST), "01.08.2026");
  assert.match(formatWarsawDate(EVENING_CEST, "weekdayDayMonth"), /1 sie/);
  assert.match(formatWarsawDate(EVENING_CEST, "dayMonthYear"), /1 sie 2026/);
});

test("D6: data po północy czasu polskiego należy już do nowego dnia", () => {
  // W UTC to wciąż 31 grudnia — i taki dzień pokazywała Historia.
  assert.equal(formatWarsawDate(NEW_YEAR_CET), "01.01.2027");
  assert.match(formatWarsawDate(NEW_YEAR_CET, "weekdayDayMonthYear"), /1 sty 2027/);
});

test("D6: format daty i klucz dnia kalendarza mówią o tym samym dniu", () => {
  // To jest ta sprzeczność, którą widział użytkownik: lista i kalendarz nad nią.
  for (const instant of [EVENING_CEST, NEW_YEAR_CET, "2026-03-29T00:30:00.000Z"]) {
    const [year, month, day] = localDayKey(new Date(instant)).split("-");
    assert.equal(
      formatWarsawDate(instant),
      `${day}.${month}.${year}`,
      `rozjazd formatu z localDayKey dla ${instant}`,
    );
  }
});
