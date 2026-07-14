import assert from "node:assert/strict";
import test from "node:test";
import {
  GUIDANCE,
  balanceFlags,
  categoriesForExercise,
  deloadFlags,
  homeGuidance,
  progressionHint,
  progressionTarget,
  stalenessFlags,
  type GuidanceItem,
} from "../lib/guidance";

test("progresja zwiększa ciężar po osiągnięciu górnego zakresu", () => {
  const hint = progressionHint({
    type: "weighted",
    unit: "kg",
    prev: { weight: 100, reps: 8, duration_seconds: null },
    targetRepsMin: 5,
    targetRepsMax: 8,
  });

  assert.match(hint ?? "", /102\.5kg/);
});

test("progresja utrzymuje ciężar poniżej dolnego zakresu", () => {
  const hint = progressionHint({
    type: "weighted",
    unit: "kg",
    prev: { weight: 80, reps: 4, duration_seconds: null },
    targetRepsMin: 6,
    targetRepsMax: 10,
  });

  assert.match(hint ?? "", /utrzymaj 80kg/);
});

test("progresja wskazuje konkretny kolejny cel w środku zakresu", () => {
  const target = progressionTarget({
    type: "weighted",
    unit: "kg",
    prev: { weight: 80, reps: 8, duration_seconds: null },
    targetRepsMin: 6,
    targetRepsMax: 10,
  });

  assert.equal(target?.kind, "add_reps");
  assert.match(target?.message ?? "", /80kg × 9\+/);
});

test("priorytet redukcji chroni jakość zamiast sugerować lżejszy trening", () => {
  const target = progressionTarget({
    type: "weighted",
    unit: "kg",
    prev: { weight: 80, reps: 8, duration_seconds: null },
    targetRepsMin: 6,
    targetRepsMax: 10,
    trainingPriority: "fat_loss",
  });

  assert.match(target?.message ?? "", /utrzymaj jakość i ciężar/);
});

test("progresja nie zwiększa ciężaru, gdy tylko część serii osiągnęła górę zakresu", () => {
  const target = progressionTarget({
    type: "weighted",
    unit: "kg",
    prev: { weight: 80, reps: 10, duration_seconds: null },
    previousSets: [
      { reps: 10, duration_seconds: null },
      { reps: 9, duration_seconds: null },
      { reps: 10, duration_seconds: null },
    ],
    targetRepsMin: 6,
    targetRepsMax: 10,
  });

  assert.equal(target?.kind, "add_reps");
  assert.doesNotMatch(target?.message ?? "", /82\.5kg/);
});

test("progresja zwiększa ciężar dopiero po górze zakresu we wszystkich seriach", () => {
  const target = progressionTarget({
    type: "weighted",
    unit: "kg",
    prev: { weight: 80, reps: 10, duration_seconds: null },
    previousSets: [
      { reps: 10, duration_seconds: null },
      { reps: 10, duration_seconds: null },
      { reps: 10, duration_seconds: null },
    ],
    targetRepsMin: 6,
    targetRepsMax: 10,
  });

  assert.equal(target?.kind, "increase_load");
  assert.match(target?.message ?? "", /82\.5kg/);
});

test("progresja bodyweight podaje następne powtórzenie", () => {
  const target = progressionTarget({
    type: "bodyweight",
    unit: "kg",
    prev: { weight: null, reps: 11, duration_seconds: null },
    targetRepsMin: 8,
    targetRepsMax: 15,
  });

  assert.equal(target?.kind, "add_reps");
  assert.match(target?.message ?? "", /12\+ powt/);
});

test("rekord może wyznaczyć cel bez poprzedniej serii", () => {
  const hint = progressionHint({
    type: "weighted",
    unit: "kg",
    prev: null,
    repPR: { reps: 5, weight: 120 },
  });

  assert.match(hint ?? "", /120kg/);
});

test("balans nie ostrzega za wcześnie, ale wykrywa wyraźną różnicę", () => {
  assert.deepEqual(balanceFlags({ push: GUIDANCE.balanceMinSets - 1, pull: 0 }), []);

  const flags = balanceFlags({ push: 8, pull: 2 });
  assert.equal(flags.length, 1);
  assert.equal(flags[0].id, "balance-pull");
});

test("zaległe partie są filtrowane od progu i sortowane malejąco", () => {
  const flags = stalenessFlags({
    push: GUIDANCE.stalenessDays - 1,
    pull: GUIDANCE.stalenessDays + 2,
    legs: GUIDANCE.stalenessDays,
  });

  assert.deepEqual(flags.map((flag) => flag.id), ["stale-pull", "stale-legs"]);
});

test("deload pojawia się przy stagnacji i znika przy postępie", () => {
  const flags = deloadFlags([{ name: "Przysiad", series: [100, 100, 100] }]);
  assert.equal(flags.length, 1);
  assert.match(flags[0].message, /10%/);
  assert.deepEqual(deloadFlags([{ name: "Przysiad", series: [100, 102.5, 105] }]), []);
});

test("deload dla masy ciała nie zaleca odejmowania ciężaru", () => {
  const flags = deloadFlags([{ name: "Pompki", type: "bodyweight", series: [12, 12, 12] }]);
  assert.match(flags[0].message, /jedną serię mniej/);
  assert.doesNotMatch(flags[0].message, /10% ciężaru/);
});

test("home zachowuje priorytet podpowiedzi i limit", () => {
  const item = (kind: GuidanceItem["kind"]): GuidanceItem => ({
    id: kind,
    kind,
    severity: "info",
    message: kind,
  });

  const result = homeGuidance([
    item("progression"),
    item("balance"),
    item("deload"),
    item("staleness"),
  ]);

  assert.equal(result.length, GUIDANCE.maxHomeFlags);
  assert.deepEqual(result.map((entry) => entry.kind), ["staleness", "deload"]);
});

test("korekty kategorii ćwiczenia zastępują surową kategorię mięśnia", () => {
  assert.deepEqual(categoriesForExercise("Face_Pull", ["shoulders"]), ["pull"]);
  assert.deepEqual(categoriesForExercise("Barbell_Deadlift", ["lower back"]), ["legs"]);
});
