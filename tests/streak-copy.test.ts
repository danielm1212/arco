import assert from "node:assert/strict";
import { test } from "node:test";
import {
  streakBadgeLabel,
  streakHeadline,
  streakStatusText,
  streakWeeksText,
  trainingWord,
  weekWord,
} from "../lib/streakCopy";

/** HOME-01: wybór copy karty passy dla 0/1/N tygodni (spec-home-i-nawigacja.md §HOME-01). */

test("streakHeadline: streak=0 nie pokazuje nagłówka liczbowego (zakaz '0. tydzień passy')", () => {
  assert.equal(streakHeadline(0), null);
});

test("streakHeadline: streak=1 pokazuje '1. tydzień passy'", () => {
  assert.equal(streakHeadline(1), "1. tydzień passy");
});

test("streakHeadline: streak=N pokazuje 'N. tydzień passy' (liczebnik porządkowy nie odmienia rzeczownika)", () => {
  assert.equal(streakHeadline(5), "5. tydzień passy");
});

test("streakStatusText: cel tygodnia osiągnięty", () => {
  assert.equal(streakStatusText(3, 3), "Cel tygodnia zrobiony.");
});

test("streakStatusText: cel przekroczony (bonus) liczy się jako zrobiony", () => {
  assert.equal(streakStatusText(4, 3), "Cel tygodnia zrobiony.");
});

test("streakStatusText: brakuje jednego treningu (liczba pojedyncza)", () => {
  assert.equal(streakStatusText(2, 3), "Jeszcze jeden trening domyka ten tydzień.");
});

test("streakStatusText: brakuje N treningów (liczba mnoga)", () => {
  assert.equal(streakStatusText(0, 3), "Jeszcze 3 treningi domykają ten tydzień.");
});

test("trainingWord: poprawnie odmienia 22, 102 i 112", () => {
  assert.equal(trainingWord(22), "treningi");
  assert.equal(trainingWord(102), "treningi");
  assert.equal(trainingWord(112), "treningów");
});

test("streakStatusText: pięć brakujących treningów nie daje błędnego „5 treningi”", () => {
  // HOME-05b: poprawione też orzeczenie — dopełniacz („5 treningów") wymusza
  // „domyka", nie „domykają". Wcześniejsza wersja zamrażała błąd w teście.
  assert.equal(streakStatusText(0, 5), "Jeszcze 5 treningów domyka ten tydzień.");
});

test("streakStatusText: dwa brakujące treningi zostają w liczbie mnogiej orzeczenia", () => {
  assert.equal(streakStatusText(1, 3), "Jeszcze 2 treningi domykają ten tydzień.");
});

/** HOME-05b: passa dostała własne copy — badge w headerze (skrót) + zdanie pełne. */

test("weekWord: 1/2–4/5+ oraz pułapka 12–14 i 22", () => {
  assert.equal(weekWord(1), "tydzień");
  assert.equal(weekWord(3), "tygodnie");
  assert.equal(weekWord(5), "tygodni");
  assert.equal(weekWord(12), "tygodni");
  assert.equal(weekWord(13), "tygodni");
  // Regresja z `WeeklyGoalBadge`: `streak < 5 ? "tygodnie" : "tygodni"` dawało
  // tu „22 tygodni".
  assert.equal(weekWord(22), "tygodnie");
  assert.equal(weekWord(24), "tygodnie");
  assert.equal(weekWord(25), "tygodni");
});

test("streakWeeksText: pełne zdanie dla czytnika ekranu i szerokich powierzchni", () => {
  assert.equal(streakWeeksText(1), "1 tydzień z rzędu");
  assert.equal(streakWeeksText(4), "4 tygodnie z rzędu");
  assert.equal(streakWeeksText(7), "7 tygodni z rzędu");
});

test("streakBadgeLabel: skrót do headera, a przy streak=0 brak etykiety (zakaz „0 tyg.”)", () => {
  assert.equal(streakBadgeLabel(0), null);
  assert.equal(streakBadgeLabel(1), "1 tyg.");
  assert.equal(streakBadgeLabel(12), "12 tyg.");
});
