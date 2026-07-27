import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildConfettiParticles,
  CONFETTI_COUNT,
  CONFETTI_COLOR_COUNT,
} from "../lib/confetti";

/** Deterministyczny RNG — te same cząstki w każdym przebiegu testu. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

test("MOMENT-01: wystrzał ma domyślną liczbę cząstek i stabilne ID", () => {
  const particles = buildConfettiParticles(undefined, seeded(7));
  assert.equal(particles.length, CONFETTI_COUNT);
  assert.deepEqual(
    particles.map((p) => p.id),
    Array.from({ length: CONFETTI_COUNT }, (_, i) => i),
  );
});

test("MOMENT-01: każda cząstka mieści się w zakresach modelu fizycznego", () => {
  for (const p of buildConfettiParticles(200, seeded(42))) {
    // Kolor musi trafiać w istniejące zmienne --confetti-1..5
    assert.ok(p.color >= 1 && p.color <= CONFETTI_COLOR_COUNT, `kolor ${p.color}`);
    // Szczyt paraboli jest ZAWSZE ujemny — inaczej wystrzał leci w dół
    assert.ok(p.peak < 0, `peak ${p.peak} powinien być ujemny (w górę)`);
    // Lot kończy się poza ekranem, żeby nic nie zawisło w kadrze
    assert.ok(p.floor >= 70, `floor ${p.floor}vh za nisko`);
    assert.ok(p.dx >= -150 && p.dx <= 150, `dx ${p.dx}`);
    // Papierek jest wyższy niż szerszy — proporcja paska, nie kwadratu
    assert.ok(p.widthPx > 0 && p.heightPx > p.widthPx, `${p.widthPx}×${p.heightPx}`);
    assert.ok(p.spinSeconds > 0, `spin ${p.spinSeconds}`);
    assert.ok(p.durationSeconds > 0, `dur ${p.durationSeconds}`);
    // Obrót musi kończyć się SAM (bez `infinite`), ale dopiero po całym locie —
    // inaczej papierek zastyga w powietrzu przed zniknięciem.
    assert.ok(Number.isInteger(p.spinIterations), `iteracje ${p.spinIterations}`);
    assert.ok(
      p.spinIterations * p.spinSeconds > p.durationSeconds,
      `obrót kończy się przed lotem: ${p.spinIterations}×${p.spinSeconds}s < ${p.durationSeconds}s`,
    );
    // Wystrzał to jedno zdarzenie: rozrzut startu zostaje krótki
    assert.ok(p.delaySeconds >= 0 && p.delaySeconds <= 0.18, `delay ${p.delaySeconds}`);
    assert.ok(p.opacity > 0 && p.opacity <= 1, `opacity ${p.opacity}`);
  }
});

test("MOMENT-01: cząstki nie są identyczne — brak wspólnego rytmu obrotu", () => {
  const particles = buildConfettiParticles(40, seeded(11));
  const spins = new Set(particles.map((p) => p.spinSeconds));
  const drifts = new Set(particles.map((p) => p.dx));
  assert.ok(spins.size > 10, `zbyt mało różnych prędkości obrotu: ${spins.size}`);
  assert.ok(drifts.size > 10, `zbyt mało różnych torów: ${drifts.size}`);
  // Głębia: część cząstek musi być przygaszona, inaczej wystrzał jest płaski
  assert.ok(particles.some((p) => p.opacity < 1), "brak cząstek „dalszych”");
  assert.ok(particles.some((p) => p.opacity === 1), "brak cząstek „bliższych”");
});
