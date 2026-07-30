import assert from "node:assert/strict";
import { test } from "node:test";
import {
  formatProgramEnvironmentTag,
  formatProgramShortName,
} from "../lib/programListCard";

/** PLAN-05E: nazwa prezentacyjna wiersza biblioteki. Wejścia to realne nazwy
 *  z migracji `20260716160000_program_names_and_rotation_copy.sql` — jeśli
 *  katalog zmieni konwencję nazw, ten test ma paść, a nie tytuł na liście. */

test("formatProgramShortName: zdejmuje poziom, środowisko i częstotliwość", () => {
  assert.equal(
    formatProgramShortName("Początkujący · Siłownia · Całe ciało · 2× w tygodniu"),
    "Całe ciało",
  );
  assert.equal(
    formatProgramShortName("Początkujący · Dom z hantlami · Całe ciało · 2–3× w tygodniu"),
    "Całe ciało",
  );
});

test("formatProgramShortName: zakres poziomów też znika z tytułu", () => {
  assert.equal(
    formatProgramShortName("Początkujący–średniozaawansowany · Siłownia · Pośladki i nogi"),
    "Pośladki i nogi",
  );
});

test("formatProgramShortName: ukośnik w nazwie fokusu nie jest myląco czytany jako zakres poziomu", () => {
  assert.equal(
    formatProgramShortName("Zaawansowany · Siłownia · Push / Pull / Legs"),
    "Push / Pull / Legs",
  );
  assert.equal(
    formatProgramShortName("Średniozaawansowany · Dom z hantlami · Góra / dół ciała"),
    "Góra / dół ciała",
  );
});

test("formatProgramShortName: nazwa bez członów zostaje bez zmian (własny plan użytkownika)", () => {
  assert.equal(formatProgramShortName("Mój plan"), "Mój plan");
  assert.equal(
    formatProgramShortName("Mój własny plan z bardzo długą nazwą"),
    "Mój własny plan z bardzo długą nazwą",
  );
});

test("formatProgramShortName: gdy zostałby pusty tytuł, wraca pełna nazwa", () => {
  assert.equal(formatProgramShortName("Początkujący · Siłownia"), "Początkujący · Siłownia");
});

test("formatProgramShortName: zachowuje wiele członów treściowych", () => {
  assert.equal(
    formatProgramShortName("Początkujący · Siłownia · Całe ciało · Mobilność"),
    "Całe ciało · Mobilność",
  );
});

test("formatProgramEnvironmentTag: tag jest krótszy niż etykieta filtra", () => {
  assert.equal(formatProgramEnvironmentTag("gym"), "Siłownia");
  assert.equal(formatProgramEnvironmentTag("home"), "Dom");
  assert.equal(formatProgramEnvironmentTag("bodyweight"), "Masa ciała");
});

test("formatProgramEnvironmentTag: brak środowiska nie renderuje taga", () => {
  assert.equal(formatProgramEnvironmentTag(null), null);
  assert.equal(formatProgramEnvironmentTag("nieznane"), null);
});

test("formatProgramShortName: pełne 15 nazw katalogu daje krótkie, niepuste tytuły", () => {
  const catalog = [
    "Początkujący · Siłownia · Całe ciało · 2× w tygodniu",
    "Początkujący · Siłownia · Całe ciało · 2–3× w tygodniu",
    "Początkujący · Dom z hantlami · Całe ciało · 2× w tygodniu",
    "Początkujący · Dom z hantlami · Całe ciało · 2–3× w tygodniu",
    "Początkujący–średniozaawansowany · Siłownia · Pośladki i nogi",
    "Początkujący–średniozaawansowany · Dom z hantlami · Pośladki i nogi",
    "Początkujący · Masa ciała · Całe ciało",
    "Średniozaawansowany · Masa ciała · Całe ciało",
    "Średniozaawansowany · Siłownia · Góra / dół ciała",
    "Średniozaawansowany · Dom z hantlami · Góra / dół ciała",
    "Zaawansowany · Dom z hantlami · Góra / dół ciała",
    "Zaawansowany · Masa ciała · Góra / dół ciała",
    "Zaawansowany · Siłownia · Push / Pull / Legs",
    "Średniozaawansowany · Siłownia · Całe ciało",
    "Średniozaawansowany · Dom z hantlami · Całe ciało",
  ];

  for (const name of catalog) {
    const short = formatProgramShortName(name);
    assert.ok(short.length > 0, `pusty tytuł dla „${name}”`);
    assert.ok(
      short.length < name.length,
      `tytuł nie został skrócony dla „${name}” (wynik: „${short}”)`,
    );
    assert.ok(
      !short.includes("w tygodniu"),
      `częstotliwość została w tytule „${short}”`,
    );
  }
});
