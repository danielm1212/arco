import { PROGRAMS } from "./seed";
import {
  EQUIPMENT_BY_ENVIRONMENT,
  recommendProgram,
  type ProgramCandidate,
  type TrainingEnvironment,
  type TrainingLevel,
} from "../lib/programRecommendation";

const levels: TrainingLevel[] = ["beginner", "intermediate", "advanced"];
const environments: TrainingEnvironment[] = ["gym", "home", "bodyweight"];
const goals = [2, 3, 4, 5];

const candidates: ProgramCandidate[] = PROGRAMS.map((program) => ({
  id: program.slug,
  slug: program.slug,
  name: program.name,
  cycle_days: program.days.length,
  environment: program.environment,
  level_min: program.level_min,
  level_max: program.level_max,
  frequency_min: program.frequency_min,
  frequency_max: program.frequency_max,
  estimated_minutes_min: program.estimated_minutes_min,
  estimated_minutes_max: program.estimated_minutes_max,
  required_equipment: program.required_equipment,
  optional_equipment: program.optional_equipment,
}));

const failures: string[] = [];
const rows: { profile: string; result: string; match: string }[] = [];

for (const level of levels) {
  for (const environment of environments) {
    for (const weeklyGoal of goals) {
      const recommendation = recommendProgram({
        programs: candidates,
        level,
        environment,
        weeklyGoal,
        availableEquipment: EQUIPMENT_BY_ENVIRONMENT[environment],
      });
      const profile = `${level}/${environment}/${weeklyGoal}`;
      if (!recommendation) {
        failures.push(`${profile}: brak rekomendacji`);
        continue;
      }
      if (recommendation.program.environment !== environment) {
        failures.push(`${profile}: plan z innego środowiska (${recommendation.program.environment})`);
      }

      const expectedBeginnerTwoDaySlug =
        level === "beginner" && weeklyGoal === 2
          ? environment === "gym"
            ? "beginner-gym-fbw2"
            : environment === "home"
              ? "beginner-home-fbw2"
              : null
          : null;
      if (
        expectedBeginnerTwoDaySlug &&
        recommendation.program.slug !== expectedBeginnerTwoDaySlug
      ) {
        failures.push(
          `${profile}: wybrano ${recommendation.program.slug}, oczekiwano ${expectedBeginnerTwoDaySlug}`,
        );
      }

      const exactExpected =
        (level === "beginner" && weeklyGoal <= 3) ||
        (level === "intermediate" && environment !== "bodyweight" && weeklyGoal <= 4) ||
        (level === "intermediate" && environment === "bodyweight" && weeklyGoal >= 3 && weeklyGoal <= 4) ||
        (level === "advanced" && environment === "home" && weeklyGoal >= 4) ||
        (level === "advanced" && environment === "bodyweight" && weeklyGoal >= 3 && weeklyGoal <= 4);
      if (recommendation.exact !== exactExpected) {
        failures.push(
          `${profile}: match=${recommendation.exact ? "exact" : "fallback"}, oczekiwano ${exactExpected ? "exact" : "fallback"}`,
        );
      }

      if (
        level === "advanced" &&
        environment === "gym" &&
        weeklyGoal <= 5 &&
        recommendation.program.slug === "advanced-gym-ppl6"
      ) {
        failures.push(`${profile}: plan 6-dniowy przekracza realistyczny cel z onboardingu`);
      }

      const hasPlanWithinGoal = candidates.some(
        (candidate) =>
          candidate.environment === environment &&
          candidate.frequency_min !== null &&
          candidate.frequency_min <= weeklyGoal,
      );
      if (
        hasPlanWithinGoal &&
        recommendation.program.frequency_min !== null &&
        recommendation.program.frequency_min > weeklyGoal
      ) {
        failures.push(`${profile}: rekomendacja przekracza cel mimo dostępnego krótszego planu`);
      }

      rows.push({
        profile,
        result: recommendation.program.slug ?? recommendation.program.name,
        match: recommendation.exact ? "exact" : "fallback",
      });
    }
  }
}

console.table(rows);
if (failures.length > 0) {
  console.error(`❌ Macierz rekomendacji: ${failures.length} błędów`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`✅ Macierz rekomendacji: ${rows.length}/${levels.length * environments.length * goals.length} profili poprawnych.`);
