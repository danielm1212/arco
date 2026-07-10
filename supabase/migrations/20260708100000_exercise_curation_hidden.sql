-- Kuracja bazy ćwiczeń (audyt trenerski 2026-07-08 = wdrożenie Stopnia 1 z docs/audyt-bazy-cwiczen.md).
-- hidden = ukryte w browse/chipach pickera i w swap engine; search po nazwie nadal znajduje wszystko.
-- Źródłem prawdy dla flagi jest seed.ts (deriveHidden) — ten UPDATE to backfill dla baz bez re-seedu.

alter table exercises
  add column if not exists hidden boolean not null default false;

comment on column exercises.hidden is
  'Kuracja: poza domyślnym browse w pickerze (stretching/cardio/przestarzałe). Search po nazwie znajduje wszystko.';

update exercises
set hidden = true
where user_id is null -- nigdy nie ruszamy custom ćwiczeń usera
  and (
    category in ('stretching', 'cardio')
    or id in (
      -- przestarzałe/kontuzjogenne: behind-the-neck, guillotine, ładowana rotacja kręgosłupa
      'Barbell_Guillotine_Bench_Press',
      'Neck_Press',
      'Standing_Barbell_Press_Behind_Neck',
      'Push_Press_-_Behind_the_Neck',
      'Wide-Grip_Pulldown_Behind_The_Neck',
      'Rocky_Pull-Ups_Pulldowns',
      'Bradford_Rocky_Presses',
      'Seated_Barbell_Twist'
    )
  )
  -- błędna kategoria upstream (stretching), realnie logowalne
  and id not in ('Superman', 'Crossover_Reverse_Lunge', 'Split_Squats', 'Pelvic_Tilt_Into_Bridge', 'Scissor_Kick')
  -- whitelista bezpieczeństwa: nic, co jest w programach, historii lub PR-ach
  and id not in (select default_exercise_id from program_day_slots)
  and id not in (select exercise_id from session_exercises)
  and id not in (select exercise_id from personal_records);
