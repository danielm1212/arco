import assert from "node:assert/strict";
import { test } from "node:test";
import { streakHeadline, streakStatusText } from "../lib/streakCopy";

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
