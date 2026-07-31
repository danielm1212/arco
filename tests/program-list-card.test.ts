import assert from "node:assert/strict";
import { test } from "node:test";
import {
  formatProgramCardTitle,
  formatProgramEnvironmentTag,
  formatProgramShortName,
  formatProgramSplitTag,
} from "../lib/programListCard";
import { PROGRAMS } from "../scripts/seed";
import { buildLevelMeter } from "../lib/levelMeter";
import { formatProgramLevelLabel } from "../lib/programDetail";

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

/* PLAN-05F: tytuł ze `short_name`, metoda ze `split_key` — dane strukturalne
   zamiast parsowania nazwy. Parser zostaje wyłącznie jako awaryjne wyjście. */

test("formatProgramCardTitle: short_name wygrywa z parsowaniem nazwy", () => {
  assert.equal(
    formatProgramCardTitle("Spokojny start", "Początkujący · Siłownia · Całe ciało · 2× w tygodniu"),
    "Spokojny start",
  );
});

test("formatProgramCardTitle: brak short_name spada do parsera, nie do pustego tytułu", () => {
  assert.equal(
    formatProgramCardTitle(null, "Początkujący · Siłownia · Całe ciało · 2× w tygodniu"),
    "Całe ciało",
  );
  assert.equal(formatProgramCardTitle("   ", "Mój własny plan"), "Mój własny plan");
});

test("formatProgramSplitTag: FBW dostaje notację liczby RÓŻNYCH treningów", () => {
  assert.equal(formatProgramSplitTag("fbw", 2), "FBW A/B");
  assert.equal(formatProgramSplitTag("fbw", 3), "FBW A/B/C");
});

test("formatProgramSplitTag: pozostałe metody mają stałą etykietę w języku siłowni", () => {
  assert.equal(formatProgramSplitTag("upper_lower", 4), "Upper/Lower");
  assert.equal(formatProgramSplitTag("ppl", 6), "Push/Pull/Legs");
  assert.equal(formatProgramSplitTag("lower_body_focus", 3), "Pośladki i nogi");
});

test("formatProgramSplitTag: brak metody nie renderuje taga (własny plan użytkownika)", () => {
  assert.equal(formatProgramSplitTag(null, 3), null);
  assert.equal(formatProgramSplitTag("nieznane", 3), null);
});

test("formatProgramSplitTag: absurdalna liczba treningów degraduje się do samego FBW", () => {
  assert.equal(formatProgramSplitTag("fbw", 0), "FBW");
  assert.equal(formatProgramSplitTag("fbw", 99), "FBW");
});

/**
 * Sedno PLAN-05F. Zgłoszenie właściciela brzmiało „te nazwy są praktycznie takie same";
 * pomiar przed zmianą: 14/15 kart dzieliło tytuł z inną kartą. Strona grupuje plany po
 * `level_min`, więc liczy się rozróżnialność WEWNĄTRZ widocznej grupy — dwie karty
 * o tym samym opisie nigdy nie mogą stanąć obok siebie.
 */
test("katalog: tytuł + środowisko + metoda są unikalne wewnątrz każdej grupy poziomu", () => {
  const groups = new Map<number, string[]>();
  for (const program of PROGRAMS) {
    const key = [
      formatProgramCardTitle(program.short_name, program.name),
      formatProgramEnvironmentTag(program.environment),
      formatProgramSplitTag(program.split_key, program.days.length),
    ].join(" | ");
    groups.set(program.level_min, [...(groups.get(program.level_min) ?? []), key]);
  }

  assert.ok(groups.size > 0, "brak programów w seedzie");
  for (const [level, keys] of groups) {
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
    assert.deepEqual(duplicates, [], `grupa poziomu ${level} ma nierozróżnialne karty`);
  }
});

test("katalog: realne plany używają tylko trzech nazw poziomu", () => {
  const allowed = new Set(["Początkujący", "Średniozaawansowany", "Zaawansowany"]);
  for (const program of PROGRAMS) {
    const meter = buildLevelMeter(
      program.level_min,
      program.level_max,
      formatProgramLevelLabel(program.level),
    );
    assert.ok(meter, `${program.slug}: miernik się nie zbudował`);
    assert.ok(
      allowed.has(meter.label),
      `${program.slug} (${program.level_min}-${program.level_max}): etykieta spoza trójki — „${meter.label}”`,
    );
  }
});

test("katalog: każdy preset ma uzupełnione short_name i split_key", () => {
  for (const program of PROGRAMS) {
    assert.ok(program.short_name?.trim(), `${program.slug}: brak short_name`);
    assert.ok(
      formatProgramSplitTag(program.split_key, program.days.length),
      `${program.slug}: split_key nie daje taga`,
    );
  }
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
