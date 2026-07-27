-- TRAIN-02A4: controlled point sync of the five reviewed system programs.
--
-- The migration is self-contained and does not require service_role. It only
-- touches the five system slugs below, preserves existing IDs on a rerun, never
-- deletes days or slots, and fails closed on structural drift.

do $train_02a4$
declare
  programs_payload constant jsonb := $programs$
[
  {
    "slug": "beginner-gym-fbw2",
    "name": "Początkujący · Siłownia · Całe ciało · 2× w tygodniu",
    "description": "Dwa naprzemienne treningi całego ciała dla osób, które realnie mogą ćwiczyć dwa razy w tygodniu. Ucz się techniki, zostaw 2 lub 3 powtórzenia w zapasie i zwiększaj ciężar dopiero po osiągnięciu górnego zakresu.",
    "goal": "Siłownia · baza siły i masy",
    "goal_key": "foundation",
    "level": "początkujący",
    "environment": "gym",
    "level_min": 1,
    "level_max": 1,
    "frequency_min": 2,
    "frequency_max": 2,
    "estimated_minutes_min": 45,
    "estimated_minutes_max": 55,
    "required_equipment": ["barbell", "dumbbell", "cable", "machine"],
    "optional_equipment": ["body only"],
    "content_version": 2,
    "days_per_week": 2,
    "days": [
      {
        "label": "Trening A",
        "slots": [
          {"exercise_id":"Barbell_Squat","sets":3,"repsMin":5,"repsMax":8,"rest":150},
          {"exercise_id":"Barbell_Bench_Press_-_Medium_Grip","sets":3,"repsMin":5,"repsMax":8,"rest":150},
          {"exercise_id":"Wide-Grip_Lat_Pulldown","sets":3,"repsMin":8,"repsMax":12,"rest":120},
          {"exercise_id":"Romanian_Deadlift","sets":3,"repsMin":8,"repsMax":10,"rest":150},
          {"exercise_id":"Seated_Dumbbell_Press","sets":2,"repsMin":8,"repsMax":12,"rest":90},
          {"exercise_id":"Plank","sets":3,"repsMin":null,"repsMax":null,"rest":60,"notes":"na czas (stoper)"}
        ]
      },
      {
        "label": "Trening B",
        "slots": [
          {"exercise_id":"Leg_Press","sets":3,"repsMin":8,"repsMax":12,"rest":150},
          {"exercise_id":"Incline_Dumbbell_Press","sets":3,"repsMin":8,"repsMax":12,"rest":120},
          {"exercise_id":"Seated_Cable_Rows","sets":3,"repsMin":8,"repsMax":12,"rest":120},
          {"exercise_id":"Dumbbell_Rear_Lunge","sets":2,"repsMin":8,"repsMax":10,"rest":90,"notes":"na nogę"},
          {"exercise_id":"Lying_Leg_Curls","sets":2,"repsMin":10,"repsMax":15,"rest":90},
          {"exercise_id":"Pullups","sets":2,"repsMin":5,"repsMax":10,"rest":120,"notes":"z asystą, jeśli trzeba"},
          {"exercise_id":"Standing_Calf_Raises","sets":2,"repsMin":10,"repsMax":15,"rest":60},
          {"exercise_id":"Dead_Bug","sets":2,"repsMin":8,"repsMax":12,"rest":45,"notes":"na stronę"}
        ]
      }
    ]
  },
  {
    "slug": "beginner-home-fbw2",
    "name": "Początkujący · Dom z hantlami · Całe ciało · 2× w tygodniu",
    "description": "Dwa naprzemienne treningi całego ciała z hantlami. Ławka i guma pomagają, ale każde ćwiczenie ma prosty wariant możliwy do wykonania w domu bez rozbudowanego sprzętu.",
    "goal": "Dom (hantle) · baza siły i masy",
    "goal_key": "foundation",
    "level": "początkujący",
    "environment": "home",
    "level_min": 1,
    "level_max": 1,
    "frequency_min": 2,
    "frequency_max": 2,
    "estimated_minutes_min": 40,
    "estimated_minutes_max": 55,
    "required_equipment": ["dumbbell"],
    "optional_equipment": ["bands", "body only", "other"],
    "content_version": 1,
    "days_per_week": 2,
    "days": [
      {
        "label": "Trening A",
        "slots": [
          {"exercise_id":"Goblet_Squat","sets":3,"repsMin":8,"repsMax":12,"rest":120},
          {"exercise_id":"Dumbbell_Bench_Press","sets":3,"repsMin":8,"repsMax":12,"rest":120,"notes":"bez ławki: wyciskanie hantli na podłodze"},
          {"exercise_id":"One-Arm_Dumbbell_Row","sets":3,"repsMin":8,"repsMax":12,"rest":120,"notes":"na rękę"},
          {"exercise_id":"Stiff-Legged_Dumbbell_Deadlift","sets":3,"repsMin":8,"repsMax":12,"rest":120},
          {"exercise_id":"Seated_Dumbbell_Press","sets":2,"repsMin":8,"repsMax":12,"rest":90},
          {"exercise_id":"Plank","sets":3,"repsMin":null,"repsMax":null,"rest":60,"notes":"na czas (stoper)"}
        ]
      },
      {
        "label": "Trening B",
        "slots": [
          {"exercise_id":"Dumbbell_Rear_Lunge","sets":3,"repsMin":8,"repsMax":10,"rest":90,"notes":"na nogę"},
          {"exercise_id":"Incline_Dumbbell_Press","sets":3,"repsMin":8,"repsMax":12,"rest":120,"notes":"bez ławki: wyciskanie hantli na podłodze"},
          {"exercise_id":"Band_Lat_Pulldown","sets":3,"repsMin":10,"repsMax":15,"rest":90,"notes":"bez gumy: przenoszenie hantla za głowę"},
          {"exercise_id":"Dumbbell_Hip_Thrust","sets":3,"repsMin":10,"repsMax":15,"rest":90,"notes":"bez ławki: glute bridge z hantlem"},
          {"exercise_id":"Bent_Over_Two-Dumbbell_Row","sets":2,"repsMin":10,"repsMax":12,"rest":90},
          {"exercise_id":"Calf_Raise_On_A_Dumbbell","sets":3,"repsMin":12,"repsMax":15,"rest":60},
          {"exercise_id":"Dead_Bug","sets":2,"repsMin":8,"repsMax":12,"rest":45,"notes":"na stronę"}
        ]
      }
    ]
  },
  {
    "slug": "intermediate-bodyweight-fbw3",
    "name": "Średniozaawansowany · Masa ciała · Całe ciało",
    "description": "Trzy treningi kalisteniczne z drążkiem dla osób, które opanowały podstawowe warianty. Progresuj powtórzeniami, tempem i trudnością dźwigni, zostawiając 1 lub 2 powtórzenia w zapasie.",
    "goal": "Masa ciała (drążek) · siła i sprawność",
    "goal_key": "strength_hypertrophy",
    "level": "średniozaawansowany",
    "environment": "bodyweight",
    "level_min": 2,
    "level_max": 2,
    "frequency_min": 3,
    "frequency_max": 4,
    "estimated_minutes_min": 40,
    "estimated_minutes_max": 55,
    "required_equipment": ["body only", "pull-up bar"],
    "optional_equipment": ["other"],
    "content_version": 2,
    "days_per_week": 3,
    "days": [
      {
        "label": "Trening A · siła",
        "slots": [
          {"exercise_id":"Split_Squats","sets":4,"repsMin":8,"repsMax":15,"rest":120,"notes":"na nogę; tempo 3 sekundy w dół"},
          {"exercise_id":"Pullups","sets":4,"repsMin":5,"repsMax":10,"rest":150},
          {"exercise_id":"Decline_Push-Up","sets":4,"repsMin":8,"repsMax":15,"rest":120},
          {"exercise_id":"Single-Leg_Hip_Thrust","sets":3,"repsMin":10,"repsMax":15,"rest":90,"notes":"na nogę"},
          {"exercise_id":"Pike_Push-Up","sets":3,"repsMin":8,"repsMax":12,"rest":90},
          {"exercise_id":"Hanging_Knee_Raise","sets":3,"repsMin":10,"repsMax":15,"rest":60}
        ]
      },
      {
        "label": "Trening B · kontrola",
        "slots": [
          {"exercise_id":"Bodyweight_Squat","sets":4,"repsMin":12,"repsMax":20,"rest":90,"notes":"pauza 2 sekundy na dole"},
          {"exercise_id":"Inverted_Row","sets":4,"repsMin":8,"repsMax":15,"rest":120,"notes":"unieś stopy, gdy górny zakres jest łatwy"},
          {"exercise_id":"Dips_-_Triceps_Version","sets":4,"repsMin":6,"repsMax":12,"rest":120},
          {"exercise_id":"Nordic_Hamstring_Curl","sets":3,"repsMin":5,"repsMax":10,"rest":120,"notes":"z asystą dłoni, jeśli trzeba"},
          {"exercise_id":"Single_Leg_Calf_Raise","sets":4,"repsMin":12,"repsMax":20,"rest":60,"notes":"na nogę"},
          {"exercise_id":"Hollow_Body_Hold","sets":3,"repsMin":null,"repsMax":null,"rest":45,"notes":"na czas (stoper)"}
        ]
      },
      {
        "label": "Trening C · objętość",
        "slots": [
          {"exercise_id":"Bodyweight_Walking_Lunge","sets":3,"repsMin":12,"repsMax":20,"rest":90,"notes":"na nogę"},
          {"exercise_id":"Chin-Up","sets":3,"repsMin":5,"repsMax":10,"rest":150},
          {"exercise_id":"Push-Ups_With_Feet_Elevated","sets":3,"repsMin":8,"repsMax":15,"rest":120},
          {"exercise_id":"Single_Leg_Glute_Bridge","sets":3,"repsMin":12,"repsMax":20,"rest":90,"notes":"na nogę"},
          {"exercise_id":"Pike_Push-Up","sets":2,"repsMin":10,"repsMax":15,"rest":90},
          {"exercise_id":"Scapular_Pull-Up","sets":2,"repsMin":10,"repsMax":15,"rest":60},
          {"exercise_id":"Copenhagen_Plank","sets":2,"repsMin":null,"repsMax":null,"rest":60,"notes":"na czas, na stronę"}
        ]
      }
    ]
  },
  {
    "slug": "advanced-home-upper-lower4",
    "name": "Zaawansowany · Dom z hantlami · Góra / dół ciała",
    "description": "Czterodniowy plan dla osób z regulowanymi hantlami, ławką i drążkiem. Wykorzystuje ćwiczenia jednostronne, wolne tempo i trudniejsze warianty, żeby obejść ograniczony ciężar domowy.",
    "goal": "Dom (hantle) · hipertrofia zaawansowana",
    "goal_key": "hypertrophy",
    "level": "zaawansowany",
    "environment": "home",
    "level_min": 3,
    "level_max": 3,
    "frequency_min": 4,
    "frequency_max": 5,
    "estimated_minutes_min": 45,
    "estimated_minutes_max": 65,
    "required_equipment": ["dumbbell"],
    "optional_equipment": ["body only", "pull-up bar", "other"],
    "content_version": 3,
    "days_per_week": 4,
    "days": [
      {
        "label": "Upper A · siła",
        "slots": [
          {"exercise_id":"Dumbbell_Bench_Press","sets":4,"repsMin":6,"repsMax":10,"rest":150},
          {"exercise_id":"One-Arm_Dumbbell_Row","sets":4,"repsMin":8,"repsMax":12,"rest":150,"notes":"na rękę"},
          {"exercise_id":"Pullups","sets":4,"repsMin":5,"repsMax":8,"rest":150,"notes":"tempo 3 sekundy w dół lub plecak, gdy zakres jest łatwy"},
          {"exercise_id":"Dumbbell_Shoulder_Press","sets":3,"repsMin":6,"repsMax":10,"rest":120},
          {"exercise_id":"Side_Lateral_Raise","sets":2,"repsMin":12,"repsMax":20,"rest":60},
          {"exercise_id":"Standing_Dumbbell_Triceps_Extension","sets":2,"repsMin":10,"repsMax":15,"rest":60},
          {"exercise_id":"Dumbbell_Bicep_Curl","sets":2,"repsMin":8,"repsMax":12,"rest":60}
        ]
      },
      {
        "label": "Lower A · siła",
        "slots": [
          {"exercise_id":"Bulgarian_Split_Squat","sets":4,"repsMin":6,"repsMax":10,"rest":150,"notes":"na nogę"},
          {"exercise_id":"Stiff-Legged_Dumbbell_Deadlift","sets":4,"repsMin":8,"repsMax":12,"rest":150},
          {"exercise_id":"Dumbbell_Rear_Lunge","sets":3,"repsMin":8,"repsMax":12,"rest":120,"notes":"na nogę"},
          {"exercise_id":"Nordic_Hamstring_Curl","sets":3,"repsMin":5,"repsMax":10,"rest":120,"notes":"z asystą dłoni, jeśli trzeba"},
          {"exercise_id":"Calf_Raise_On_A_Dumbbell","sets":4,"repsMin":12,"repsMax":20,"rest":60},
          {"exercise_id":"Hanging_Leg_Raise","sets":3,"repsMin":10,"repsMax":15,"rest":60}
        ]
      },
      {
        "label": "Upper B · objętość",
        "slots": [
          {"exercise_id":"Handstand_Push-Ups","sets":3,"repsMin":4,"repsMax":10,"rest":150,"notes":"przy ścianie; zamiennie trudny Pike Push-Up"},
          {"exercise_id":"Incline_Dumbbell_Press","sets":3,"repsMin":8,"repsMax":12,"rest":120},
          {"exercise_id":"Chest-Supported_Dumbbell_Row","sets":3,"repsMin":10,"repsMax":15,"rest":120},
          {"exercise_id":"Chin-Up","sets":3,"repsMin":6,"repsMax":10,"rest":120,"notes":"dodaj pauzę u góry lub plecak po dojściu do 10"},
          {"exercise_id":"Reverse_Flyes","sets":2,"repsMin":15,"repsMax":20,"rest":60},
          {"exercise_id":"Lying_Dumbbell_Tricep_Extension","sets":2,"repsMin":10,"repsMax":15,"rest":60},
          {"exercise_id":"Incline_Dumbbell_Curl","sets":2,"repsMin":10,"repsMax":15,"rest":60}
        ]
      },
      {
        "label": "Lower B · objętość",
        "slots": [
          {"exercise_id":"Dumbbell_Step_Ups","sets":3,"repsMin":8,"repsMax":12,"rest":150,"notes":"na nogę"},
          {"exercise_id":"Stiff-Legged_Dumbbell_Deadlift","sets":3,"repsMin":10,"repsMax":15,"rest":150},
          {"exercise_id":"Single-Leg_Hip_Thrust","sets":3,"repsMin":10,"repsMax":15,"rest":120,"notes":"na nogę; hantel na biodrze"},
          {"exercise_id":"Reverse_Nordic_Curl","sets":2,"repsMin":8,"repsMax":15,"rest":90},
          {"exercise_id":"Natural_Glute_Ham_Raise","sets":2,"repsMin":8,"repsMax":15,"rest":90,"notes":"z asystą, jeśli trzeba"},
          {"exercise_id":"Dumbbell_Seated_One-Leg_Calf_Raise","sets":3,"repsMin":15,"repsMax":25,"rest":60,"notes":"na nogę"},
          {"exercise_id":"Copenhagen_Plank","sets":2,"repsMin":null,"repsMax":null,"rest":60,"notes":"na czas, na stronę"}
        ]
      }
    ]
  },
  {
    "slug": "advanced-bodyweight-upper-lower4",
    "name": "Zaawansowany · Masa ciała · Góra / dół ciała",
    "description": "Czterodniowy plan kalisteniczny z drążkiem i stabilnymi podporami. Progresja opiera się na trudniejszej dźwigni, tempie, pauzach i kontrolowanym zakresie, bez dokładania przypadkowej objętości.",
    "goal": "Masa ciała (drążek) · siła zaawansowana",
    "goal_key": "strength_hypertrophy",
    "level": "zaawansowany",
    "environment": "bodyweight",
    "level_min": 3,
    "level_max": 3,
    "frequency_min": 3,
    "frequency_max": 4,
    "estimated_minutes_min": 45,
    "estimated_minutes_max": 65,
    "required_equipment": ["body only", "pull-up bar"],
    "optional_equipment": ["other"],
    "content_version": 3,
    "days_per_week": 4,
    "days": [
      {
        "label": "Upper A · siła",
        "slots": [
          {"exercise_id":"Handstand_Push-Ups","sets":4,"repsMin":4,"repsMax":8,"rest":180,"notes":"przy ścianie"},
          {"exercise_id":"Pullups","sets":4,"repsMin":5,"repsMax":8,"rest":180,"notes":"tempo 3 sekundy w dół lub plecak"},
          {"exercise_id":"Single-Arm_Push-Up","sets":4,"repsMin":4,"repsMax":8,"rest":150,"notes":"na stronę; użyj podwyższenia, jeśli trzeba"},
          {"exercise_id":"Inverted_Row","sets":4,"repsMin":8,"repsMax":12,"rest":120,"notes":"stopy na podwyższeniu"},
          {"exercise_id":"Dips_-_Triceps_Version","sets":3,"repsMin":6,"repsMax":12,"rest":120},
          {"exercise_id":"L-Sit_Hold","sets":3,"repsMin":null,"repsMax":null,"rest":60,"notes":"na czas (stoper)"}
        ]
      },
      {
        "label": "Lower A · siła",
        "slots": [
          {"exercise_id":"Freehand_Jump_Squat","sets":3,"repsMin":3,"repsMax":5,"rest":150,"notes":"zakończ serię przy spadku wysokości skoku lub jakości lądowania"},
          {"exercise_id":"Split_Squats","sets":4,"repsMin":8,"repsMax":12,"rest":150,"notes":"na nogę; wariant z pauzą lub progresja do pistoletu"},
          {"exercise_id":"Nordic_Hamstring_Curl","sets":4,"repsMin":5,"repsMax":10,"rest":150},
          {"exercise_id":"Single-Leg_Hip_Thrust","sets":4,"repsMin":10,"repsMax":15,"rest":120,"notes":"na nogę"},
          {"exercise_id":"Single_Leg_Calf_Raise","sets":4,"repsMin":15,"repsMax":25,"rest":60,"notes":"na nogę; pauza na górze"},
          {"exercise_id":"Copenhagen_Plank","sets":3,"repsMin":null,"repsMax":null,"rest":60,"notes":"na czas, na stronę"}
        ]
      },
      {
        "label": "Upper B · objętość",
        "slots": [
          {"exercise_id":"Chin-Up","sets":4,"repsMin":6,"repsMax":10,"rest":150},
          {"exercise_id":"Push-Ups_With_Feet_Elevated","sets":4,"repsMin":10,"repsMax":20,"rest":120},
          {"exercise_id":"Inverted_Row","sets":4,"repsMin":10,"repsMax":15,"rest":120,"notes":"stopy na podwyższeniu"},
          {"exercise_id":"Pike_Push-Up","sets":3,"repsMin":10,"repsMax":15,"rest":120,"notes":"stopy na podwyższeniu; bez niego wykonaj wersję z podłogi"},
          {"exercise_id":"Scapular_Pull-Up","sets":2,"repsMin":10,"repsMax":15,"rest":60},
          {"exercise_id":"Body_Tricep_Press","sets":2,"repsMin":10,"repsMax":20,"rest":60},
          {"exercise_id":"Hanging_Leg_Raise","sets":2,"repsMin":10,"repsMax":15,"rest":60}
        ]
      },
      {
        "label": "Lower B · objętość",
        "slots": [
          {"exercise_id":"Bodyweight_Walking_Lunge","sets":3,"repsMin":12,"repsMax":20,"rest":90,"notes":"na nogę"},
          {"exercise_id":"Step-up_with_Knee_Raise","sets":3,"repsMin":10,"repsMax":15,"rest":120,"notes":"na nogę"},
          {"exercise_id":"Reverse_Nordic_Curl","sets":3,"repsMin":8,"repsMax":15,"rest":120},
          {"exercise_id":"Natural_Glute_Ham_Raise","sets":3,"repsMin":8,"repsMax":15,"rest":120},
          {"exercise_id":"Single_Leg_Glute_Bridge","sets":3,"repsMin":12,"repsMax":20,"rest":90,"notes":"na nogę"},
          {"exercise_id":"Tibialis_Raise","sets":2,"repsMin":15,"repsMax":25,"rest":60},
          {"exercise_id":"Hollow_Body_Hold","sets":2,"repsMin":null,"repsMax":null,"rest":45,"notes":"na czas (stoper)"}
        ]
      }
    ]
  }
]
$programs$::jsonb;

  alternatives_payload constant jsonb := $alternatives$
[
  {"programSlug":"beginner-home-fbw2","dayLabel":"Trening A","defaultExerciseId":"Dumbbell_Bench_Press","alternativeExerciseId":"Dumbbell_Floor_Press","missingEquipment":["bench"],"alternativeEquipment":["dumbbell"],"patternCoverage":"same_pattern","notePl":"Pełny zamiennik poziomego wyciskania bez ławki; zakres ruchu jest krótszy."},
  {"programSlug":"beginner-home-fbw2","dayLabel":"Trening B","defaultExerciseId":"Incline_Dumbbell_Press","alternativeExerciseId":"Dumbbell_Floor_Press","missingEquipment":["bench"],"alternativeEquipment":["dumbbell"],"patternCoverage":"same_pattern","notePl":"Zamiennik poziomego wyciskania bez ławki; nie odtwarza kąta skosu."},
  {"programSlug":"beginner-home-fbw2","dayLabel":"Trening B","defaultExerciseId":"Band_Lat_Pulldown","alternativeExerciseId":"Straight-Arm_Dumbbell_Pullover","missingEquipment":["bands"],"alternativeEquipment":["dumbbell"],"patternCoverage":"partial_pattern","notePl":"Opcja bez gumy angażująca najszerszy grzbietu; nie zastępuje w pełni pionowego przyciągania."},
  {"programSlug":"advanced-home-upper-lower4","dayLabel":"Upper A · siła","defaultExerciseId":"Dumbbell_Bench_Press","alternativeExerciseId":"Dumbbell_Floor_Press","missingEquipment":["bench"],"alternativeEquipment":["dumbbell"],"patternCoverage":"same_pattern","notePl":"Poziome wyciskanie bez ławki; krótszy zakres ruchu chroni barki przy kontakcie ramienia z podłogą."},
  {"programSlug":"advanced-home-upper-lower4","dayLabel":"Upper A · siła","defaultExerciseId":"Pullups","alternativeExerciseId":"Bent_Over_Two-Dumbbell_Row","missingEquipment":["pull-up bar"],"alternativeEquipment":["dumbbell"],"patternCoverage":"partial_pattern","notePl":"Zapewnia ciężkie przyciąganie bez drążka, ale nie odtwarza pionowego toru podciągania."},
  {"programSlug":"advanced-home-upper-lower4","dayLabel":"Lower A · siła","defaultExerciseId":"Bulgarian_Split_Squat","alternativeExerciseId":"Dumbbell_Rear_Lunge","missingEquipment":["stable rear-foot support"],"alternativeEquipment":["dumbbell"],"patternCoverage":"same_pattern","notePl":"Jednostronny wzorzec kolanowy bez podparcia tylnej stopy."},
  {"programSlug":"advanced-home-upper-lower4","dayLabel":"Lower A · siła","defaultExerciseId":"Nordic_Hamstring_Curl","alternativeExerciseId":"Platform_Hamstring_Slides","missingEquipment":["hamstring anchor"],"alternativeEquipment":["smooth floor","towel or sliders"],"patternCoverage":"same_pattern","notePl":"Zgięcie kolana bez kotwicy; utrzymuj biodra wysoko i kontroluj fazę ekscentryczną."},
  {"programSlug":"advanced-home-upper-lower4","dayLabel":"Lower A · siła","defaultExerciseId":"Hanging_Leg_Raise","alternativeExerciseId":"Hollow_Body_Hold","missingEquipment":["pull-up bar"],"alternativeEquipment":["body only"],"patternCoverage":"partial_pattern","notePl":"Opcja core bez zwisu; zachowuje kontrolę miednicy, ale nie obciąża chwytu ani zginaczy biodra w tym samym zakresie."},
  {"programSlug":"advanced-home-upper-lower4","dayLabel":"Upper B · objętość","defaultExerciseId":"Handstand_Push-Ups","alternativeExerciseId":"Pike_Push-Up","missingEquipment":["stable wall"],"alternativeEquipment":["body only"],"patternCoverage":"same_pattern","notePl":"Bezpieczniejsza regresja pionowego pchania bez oparcia o ścianę."},
  {"programSlug":"advanced-home-upper-lower4","dayLabel":"Upper B · objętość","defaultExerciseId":"Incline_Dumbbell_Press","alternativeExerciseId":"Dumbbell_Floor_Press","missingEquipment":["bench"],"alternativeEquipment":["dumbbell"],"patternCoverage":"same_pattern","notePl":"Poziome wyciskanie bez ławki; nie odtwarza kąta skosu."},
  {"programSlug":"advanced-home-upper-lower4","dayLabel":"Upper B · objętość","defaultExerciseId":"Chest-Supported_Dumbbell_Row","alternativeExerciseId":"One-Arm_Dumbbell_Row","missingEquipment":["bench"],"alternativeEquipment":["dumbbell"],"patternCoverage":"same_pattern","notePl":"Poziome przyciąganie bez podparcia klatki; wymaga aktywnej stabilizacji tułowia."},
  {"programSlug":"advanced-home-upper-lower4","dayLabel":"Upper B · objętość","defaultExerciseId":"Chin-Up","alternativeExerciseId":"Bent_Over_Two-Dumbbell_Row","missingEquipment":["pull-up bar"],"alternativeEquipment":["dumbbell"],"patternCoverage":"partial_pattern","notePl":"Zapewnia przyciąganie bez drążka, ale nie zastępuje w pełni pionowego toru chin-up."},
  {"programSlug":"advanced-home-upper-lower4","dayLabel":"Upper B · objętość","defaultExerciseId":"Incline_Dumbbell_Curl","alternativeExerciseId":"Dumbbell_Bicep_Curl","missingEquipment":["bench"],"alternativeEquipment":["dumbbell"],"patternCoverage":"same_pattern","notePl":"Uginanie bez ławki; ustaw ramię nieruchomo przy tułowiu."},
  {"programSlug":"advanced-home-upper-lower4","dayLabel":"Lower B · objętość","defaultExerciseId":"Dumbbell_Step_Ups","alternativeExerciseId":"Dumbbell_Rear_Lunge","missingEquipment":["stable step"],"alternativeEquipment":["dumbbell"],"patternCoverage":"same_pattern","notePl":"Jednostronny wzorzec kolanowy bez podwyższenia."},
  {"programSlug":"advanced-home-upper-lower4","dayLabel":"Lower B · objętość","defaultExerciseId":"Single-Leg_Hip_Thrust","alternativeExerciseId":"Single_Leg_Glute_Bridge","missingEquipment":["bench"],"alternativeEquipment":["body only"],"patternCoverage":"same_pattern","notePl":"Wyprost biodra bez ławki, z krótszym zakresem ruchu."},
  {"programSlug":"advanced-home-upper-lower4","dayLabel":"Lower B · objętość","defaultExerciseId":"Natural_Glute_Ham_Raise","alternativeExerciseId":"Platform_Hamstring_Slides","missingEquipment":["hamstring anchor"],"alternativeEquipment":["smooth floor","towel or sliders"],"patternCoverage":"same_pattern","notePl":"Zgięcie kolana bez kotwicy lub partnera; progresuj zakresem i kontrolą."},
  {"programSlug":"advanced-home-upper-lower4","dayLabel":"Lower B · objętość","defaultExerciseId":"Copenhagen_Plank","alternativeExerciseId":"Side_Bridge","missingEquipment":["stable elevated support"],"alternativeEquipment":["body only"],"patternCoverage":"partial_pattern","notePl":"Boczna stabilizacja bez podpory; nie odtwarza pełnego bodźca przywodzicieli."},
  {"programSlug":"advanced-bodyweight-upper-lower4","dayLabel":"Upper A · siła","defaultExerciseId":"Handstand_Push-Ups","alternativeExerciseId":"Pike_Push-Up","missingEquipment":["stable wall"],"alternativeEquipment":["body only"],"patternCoverage":"same_pattern","notePl":"Regresja pionowego pchania bez podparcia o ścianę."},
  {"programSlug":"advanced-bodyweight-upper-lower4","dayLabel":"Upper A · siła","defaultExerciseId":"Inverted_Row","alternativeExerciseId":"Pullups","missingEquipment":["low bar"],"alternativeEquipment":["pull-up bar"],"patternCoverage":"partial_pattern","notePl":"Wykorzystuje dostępny drążek, ale zmienia przyciąganie poziome na pionowe."},
  {"programSlug":"advanced-bodyweight-upper-lower4","dayLabel":"Upper A · siła","defaultExerciseId":"Dips_-_Triceps_Version","alternativeExerciseId":"Push-Ups_-_Close_Triceps_Position","missingEquipment":["parallel bars"],"alternativeEquipment":["body only"],"patternCoverage":"partial_pattern","notePl":"Opcja tricepsowa bez poręczy; nie odtwarza pionowego toru dipów."},
  {"programSlug":"advanced-bodyweight-upper-lower4","dayLabel":"Upper A · siła","defaultExerciseId":"L-Sit_Hold","alternativeExerciseId":"Hollow_Body_Hold","missingEquipment":["parallel bars or stable supports"],"alternativeEquipment":["body only"],"patternCoverage":"partial_pattern","notePl":"Napięcie core bez podpór; nie odtwarza podporu na prostych ramionach."},
  {"programSlug":"advanced-bodyweight-upper-lower4","dayLabel":"Lower A · siła","defaultExerciseId":"Nordic_Hamstring_Curl","alternativeExerciseId":"Platform_Hamstring_Slides","missingEquipment":["hamstring anchor"],"alternativeEquipment":["smooth floor","towel or sliders"],"patternCoverage":"same_pattern","notePl":"Zgięcie kolana bez kotwicy; utrzymuj biodra wysoko i progresuj zakresem."},
  {"programSlug":"advanced-bodyweight-upper-lower4","dayLabel":"Lower A · siła","defaultExerciseId":"Single-Leg_Hip_Thrust","alternativeExerciseId":"Single_Leg_Glute_Bridge","missingEquipment":["bench"],"alternativeEquipment":["body only"],"patternCoverage":"same_pattern","notePl":"Wyprost biodra bez podwyższenia, z krótszym zakresem ruchu."},
  {"programSlug":"advanced-bodyweight-upper-lower4","dayLabel":"Lower A · siła","defaultExerciseId":"Copenhagen_Plank","alternativeExerciseId":"Side_Bridge","missingEquipment":["stable elevated support"],"alternativeEquipment":["body only"],"patternCoverage":"partial_pattern","notePl":"Boczna stabilizacja bez podpory; bodziec przywodzicieli jest mniejszy."},
  {"programSlug":"advanced-bodyweight-upper-lower4","dayLabel":"Upper B · objętość","defaultExerciseId":"Push-Ups_With_Feet_Elevated","alternativeExerciseId":"Pushups","missingEquipment":["stable elevated support"],"alternativeEquipment":["body only"],"patternCoverage":"same_pattern","notePl":"Poziome pchanie bez podwyższenia; zwiększ kontrolę tempa zamiast ryzykownego podparcia."},
  {"programSlug":"advanced-bodyweight-upper-lower4","dayLabel":"Upper B · objętość","defaultExerciseId":"Inverted_Row","alternativeExerciseId":"Pullups","missingEquipment":["low bar","stable foot support"],"alternativeEquipment":["pull-up bar"],"patternCoverage":"partial_pattern","notePl":"Wykorzystuje dostępny drążek, ale nie zachowuje poziomego toru przyciągania."},
  {"programSlug":"advanced-bodyweight-upper-lower4","dayLabel":"Upper B · objętość","defaultExerciseId":"Body_Tricep_Press","alternativeExerciseId":"Push-Ups_-_Close_Triceps_Position","missingEquipment":["low bar"],"alternativeEquipment":["body only"],"patternCoverage":"same_pattern","notePl":"Prostowanie łokcia bez niskiego drążka; trudność reguluj ustawieniem dłoni i tempem."},
  {"programSlug":"advanced-bodyweight-upper-lower4","dayLabel":"Lower B · objętość","defaultExerciseId":"Step-up_with_Knee_Raise","alternativeExerciseId":"Bodyweight_Walking_Lunge","missingEquipment":["stable step"],"alternativeEquipment":["body only"],"patternCoverage":"same_pattern","notePl":"Jednostronny wzorzec kolanowy bez podwyższenia."},
  {"programSlug":"advanced-bodyweight-upper-lower4","dayLabel":"Lower B · objętość","defaultExerciseId":"Natural_Glute_Ham_Raise","alternativeExerciseId":"Platform_Hamstring_Slides","missingEquipment":["hamstring anchor"],"alternativeEquipment":["smooth floor","towel or sliders"],"patternCoverage":"same_pattern","notePl":"Zgięcie kolana bez kotwicy lub partnera; progresuj kontrolą i zakresem."}
]
$alternatives$::jsonb;

  program_value jsonb;
  day_value jsonb;
  slot_value jsonb;
  alternative_value jsonb;
  program_id_value uuid;
  day_id_value uuid;
  slot_id_value uuid;
  day_position_value integer;
  slot_position_value integer;
  match_count integer;
  missing_exercise_ids text[];
begin
  if jsonb_array_length(programs_payload) <> 5
    or (
      select count(*)
      from jsonb_array_elements(programs_payload) as program
      cross join lateral jsonb_array_elements(program->'days') as day
    ) <> 15
    or (
      select count(*)
      from jsonb_array_elements(programs_payload) as program
      cross join lateral jsonb_array_elements(program->'days') as day
      cross join lateral jsonb_array_elements(day->'slots') as slot
    ) <> 99
    or jsonb_array_length(alternatives_payload) <> 29
  then
    raise exception 'TRAIN-02A4 payload cardinality drifted from 5 programs / 15 days / 99 slots / 29 alternatives.';
  end if;

  if not exists (select 1 from public.exercises) then
    raise notice 'Skipping TRAIN-02A4 data sync: exercise catalog is empty; seed will create all programs.';
    return;
  end if;

  with referenced_exercises as (
    select distinct slot->>'exercise_id' as exercise_id
    from jsonb_array_elements(programs_payload) as program
    cross join lateral jsonb_array_elements(program->'days') as day
    cross join lateral jsonb_array_elements(day->'slots') as slot
    union
    select distinct alternative->>'alternativeExerciseId'
    from jsonb_array_elements(alternatives_payload) as alternative
  )
  select array_agg(reference.exercise_id order by reference.exercise_id)
  into missing_exercise_ids
  from referenced_exercises as reference
  left join public.exercises as exercise on exercise.id = reference.exercise_id
  where exercise.id is null;

  if cardinality(missing_exercise_ids) > 0 then
    raise exception 'TRAIN-02A4 missing exercises: %', array_to_string(missing_exercise_ids, ', ');
  end if;

  if exists (
    select 1
    from public.programs as program
    join public.program_days as day on day.program_id = program.id
    where program.user_id is null
      and program.slug in (
        'beginner-gym-fbw2',
        'beginner-home-fbw2',
        'intermediate-bodyweight-fbw3',
        'advanced-home-upper-lower4',
        'advanced-bodyweight-upper-lower4'
      )
    group by day.program_id, day.position
    having count(*) > 1
  ) then
    raise exception 'TRAIN-02A4 found duplicate day positions in a target program.';
  end if;

  if exists (
    select 1
    from public.programs as program
    join public.program_days as day on day.program_id = program.id
    join public.program_day_slots as slot on slot.program_day_id = day.id
    where program.user_id is null
      and program.slug in (
        'beginner-gym-fbw2',
        'beginner-home-fbw2',
        'intermediate-bodyweight-fbw3',
        'advanced-home-upper-lower4',
        'advanced-bodyweight-upper-lower4'
      )
    group by slot.program_day_id, slot.position
    having count(*) > 1
  ) then
    raise exception 'TRAIN-02A4 found duplicate slot positions in a target program day.';
  end if;

  for program_value in
    select value from jsonb_array_elements(programs_payload)
  loop
    select id
    into program_id_value
    from public.programs
    where user_id is null
      and slug = program_value->>'slug';

    if program_id_value is null then
      program_id_value := md5('arco:system-program:' || (program_value->>'slug'))::uuid;

      insert into public.programs (
        id,
        slug,
        name,
        description,
        goal,
        goal_key,
        focus_key,
        level,
        environment,
        level_min,
        level_max,
        frequency_min,
        frequency_max,
        cycle_days,
        estimated_minutes_min,
        estimated_minutes_max,
        required_equipment,
        optional_equipment,
        content_version,
        days_per_week,
        is_default,
        user_id
      )
      values (
        program_id_value,
        program_value->>'slug',
        program_value->>'name',
        program_value->>'description',
        program_value->>'goal',
        program_value->>'goal_key',
        coalesce(program_value->>'focus_key', 'balanced')::public.program_focus,
        program_value->>'level',
        program_value->>'environment',
        (program_value->>'level_min')::smallint,
        (program_value->>'level_max')::smallint,
        (program_value->>'frequency_min')::smallint,
        (program_value->>'frequency_max')::smallint,
        jsonb_array_length(program_value->'days')::smallint,
        (program_value->>'estimated_minutes_min')::smallint,
        (program_value->>'estimated_minutes_max')::smallint,
        array(select jsonb_array_elements_text(program_value->'required_equipment')),
        array(select jsonb_array_elements_text(program_value->'optional_equipment')),
        (program_value->>'content_version')::integer,
        (program_value->>'days_per_week')::integer,
        true,
        null
      );
    else
      update public.programs
      set
        name = program_value->>'name',
        description = program_value->>'description',
        goal = program_value->>'goal',
        goal_key = program_value->>'goal_key',
        focus_key = coalesce(program_value->>'focus_key', 'balanced')::public.program_focus,
        level = program_value->>'level',
        environment = program_value->>'environment',
        level_min = (program_value->>'level_min')::smallint,
        level_max = (program_value->>'level_max')::smallint,
        frequency_min = (program_value->>'frequency_min')::smallint,
        frequency_max = (program_value->>'frequency_max')::smallint,
        cycle_days = jsonb_array_length(program_value->'days')::smallint,
        estimated_minutes_min = (program_value->>'estimated_minutes_min')::smallint,
        estimated_minutes_max = (program_value->>'estimated_minutes_max')::smallint,
        required_equipment = array(
          select jsonb_array_elements_text(program_value->'required_equipment')
        ),
        optional_equipment = array(
          select jsonb_array_elements_text(program_value->'optional_equipment')
        ),
        content_version = (program_value->>'content_version')::integer,
        days_per_week = (program_value->>'days_per_week')::integer,
        is_default = true
      where id = program_id_value;
    end if;

    select count(*)
    into match_count
    from public.program_days
    where program_id = program_id_value
      and (
        position < 0
        or position >= jsonb_array_length(program_value->'days')
      );

    if match_count > 0 then
      raise exception 'TRAIN-02A4 refuses to delete % extra days from %.',
        match_count,
        program_value->>'slug';
    end if;

    day_position_value := 0;
    for day_value in
      select value from jsonb_array_elements(program_value->'days')
    loop
      select id
      into day_id_value
      from public.program_days
      where program_id = program_id_value
        and position = day_position_value;

      if day_id_value is null then
        day_id_value := md5(
          'arco:system-program-day:'
          || (program_value->>'slug')
          || ':'
          || day_position_value::text
        )::uuid;

        insert into public.program_days (id, program_id, label, position)
        values (
          day_id_value,
          program_id_value,
          day_value->>'label',
          day_position_value
        );
      else
        update public.program_days
        set label = day_value->>'label'
        where id = day_id_value;
      end if;

      select count(*)
      into match_count
      from public.program_day_slots
      where program_day_id = day_id_value
        and (
          position < 0
          or position >= jsonb_array_length(day_value->'slots')
        );

      if match_count > 0 then
        raise exception 'TRAIN-02A4 refuses to delete % extra slots from % / %.',
          match_count,
          program_value->>'slug',
          day_value->>'label';
      end if;

      slot_position_value := 0;
      for slot_value in
        select value from jsonb_array_elements(day_value->'slots')
      loop
        select id
        into slot_id_value
        from public.program_day_slots
        where program_day_id = day_id_value
          and position = slot_position_value;

        if slot_id_value is null then
          slot_id_value := md5(
            'arco:system-program-slot:'
            || (program_value->>'slug')
            || ':'
            || day_position_value::text
            || ':'
            || slot_position_value::text
          )::uuid;

          insert into public.program_day_slots (
            id,
            program_day_id,
            default_exercise_id,
            position,
            target_sets,
            target_reps_min,
            target_reps_max,
            rest_seconds,
            superset_group,
            notes
          )
          values (
            slot_id_value,
            day_id_value,
            slot_value->>'exercise_id',
            slot_position_value,
            (slot_value->>'sets')::integer,
            case
              when slot_value->'repsMin' = 'null'::jsonb then null
              else (slot_value->>'repsMin')::integer
            end,
            case
              when slot_value->'repsMax' = 'null'::jsonb then null
              else (slot_value->>'repsMax')::integer
            end,
            (slot_value->>'rest')::integer,
            null,
            slot_value->>'notes'
          );
        else
          update public.program_day_slots
          set
            default_exercise_id = slot_value->>'exercise_id',
            target_sets = (slot_value->>'sets')::integer,
            target_reps_min = case
              when slot_value->'repsMin' = 'null'::jsonb then null
              else (slot_value->>'repsMin')::integer
            end,
            target_reps_max = case
              when slot_value->'repsMax' = 'null'::jsonb then null
              else (slot_value->>'repsMax')::integer
            end,
            rest_seconds = (slot_value->>'rest')::integer,
            superset_group = null,
            notes = slot_value->>'notes'
          where id = slot_id_value;
        end if;

        slot_position_value := slot_position_value + 1;
      end loop;

      day_position_value := day_position_value + 1;
    end loop;
  end loop;

  for alternative_value in
    select value from jsonb_array_elements(alternatives_payload)
  loop
    select count(*)
    into match_count
    from public.program_day_slots as slot
    join public.program_days as day on day.id = slot.program_day_id
    join public.programs as program on program.id = day.program_id
    where program.user_id is null
      and program.slug = alternative_value->>'programSlug'
      and day.label = alternative_value->>'dayLabel'
      and slot.default_exercise_id = alternative_value->>'defaultExerciseId';

    if match_count <> 1 then
      raise exception 'TRAIN-02A4 alternative source resolves to % slots: % / % / %.',
        match_count,
        alternative_value->>'programSlug',
        alternative_value->>'dayLabel',
        alternative_value->>'defaultExerciseId';
    end if;

    select slot.id
    into slot_id_value
    from public.program_day_slots as slot
    join public.program_days as day on day.id = slot.program_day_id
    join public.programs as program on program.id = day.program_id
    where program.user_id is null
      and program.slug = alternative_value->>'programSlug'
      and day.label = alternative_value->>'dayLabel'
      and slot.default_exercise_id = alternative_value->>'defaultExerciseId';

    insert into public.program_slot_alternatives (
      id,
      program_day_slot_id,
      alternative_exercise_id,
      position,
      missing_equipment,
      alternative_equipment,
      pattern_coverage,
      note_pl,
      content_version
    )
    values (
      md5(
        'arco:program-slot-alternative:'
        || slot_id_value::text
        || ':'
        || (alternative_value->>'alternativeExerciseId')
      )::uuid,
      slot_id_value,
      alternative_value->>'alternativeExerciseId',
      0,
      array(select jsonb_array_elements_text(alternative_value->'missingEquipment')),
      array(select jsonb_array_elements_text(alternative_value->'alternativeEquipment')),
      alternative_value->>'patternCoverage',
      alternative_value->>'notePl',
      1
    )
    on conflict (program_day_slot_id, alternative_exercise_id)
    do update
    set
      position = excluded.position,
      missing_equipment = excluded.missing_equipment,
      alternative_equipment = excluded.alternative_equipment,
      pattern_coverage = excluded.pattern_coverage,
      note_pl = excluded.note_pl,
      content_version = excluded.content_version,
      updated_at = now();
  end loop;

  select count(*)
  into match_count
  from public.programs
  where user_id is null
    and slug in (
      'beginner-gym-fbw2',
      'beginner-home-fbw2',
      'intermediate-bodyweight-fbw3',
      'advanced-home-upper-lower4',
      'advanced-bodyweight-upper-lower4'
    );

  if match_count <> 5 then
    raise exception 'TRAIN-02A4 expected 5 target programs, found %.', match_count;
  end if;

  select count(*)
  into match_count
  from public.program_days as day
  join public.programs as program on program.id = day.program_id
  where program.user_id is null
    and program.slug in (
      'beginner-gym-fbw2',
      'beginner-home-fbw2',
      'intermediate-bodyweight-fbw3',
      'advanced-home-upper-lower4',
      'advanced-bodyweight-upper-lower4'
    );

  if match_count <> 15 then
    raise exception 'TRAIN-02A4 expected 15 target days, found %.', match_count;
  end if;

  select count(*)
  into match_count
  from public.program_day_slots as slot
  join public.program_days as day on day.id = slot.program_day_id
  join public.programs as program on program.id = day.program_id
  where program.user_id is null
    and program.slug in (
      'beginner-gym-fbw2',
      'beginner-home-fbw2',
      'intermediate-bodyweight-fbw3',
      'advanced-home-upper-lower4',
      'advanced-bodyweight-upper-lower4'
    );

  if match_count <> 99 then
    raise exception 'TRAIN-02A4 expected 99 target slots, found %.', match_count;
  end if;

  select count(*)
  into match_count
  from public.program_slot_alternatives as alternative
  join public.program_day_slots as slot on slot.id = alternative.program_day_slot_id
  join public.program_days as day on day.id = slot.program_day_id
  join public.programs as program on program.id = day.program_id
  where program.user_id is null
    and program.slug in (
      'beginner-home-fbw2',
      'advanced-home-upper-lower4',
      'advanced-bodyweight-upper-lower4'
    );

  if match_count <> 29 then
    raise exception 'TRAIN-02A4 expected 29 alternatives, found %.', match_count;
  end if;
end
$train_02a4$;
