-- TRAIN-02A4 prerequisite: two reviewed exercises absent from the production
-- catalog. This point sync runs through the database connection and does not
-- require service_role.
--
-- On a fresh local reset the exercise catalog is loaded after migrations by the
-- TypeScript seed, so this migration intentionally performs a no-op there.

do $train_02a4_required_exercises$
begin
  if not exists (select 1 from public.exercises) then
    raise notice 'Skipping TRAIN-02A4 required exercises: catalog is empty; seed will load them.';
    return;
  end if;

  insert into public.exercises (
    id,
    name,
    force,
    level,
    mechanic,
    equipment,
    primary_muscles,
    secondary_muscles,
    category,
    instructions,
    images,
    movement_pattern,
    exercise_type,
    hidden,
    content_blocked,
    name_pl,
    search_aliases,
    user_id
  )
  values
    (
      'Band_Lat_Pulldown',
      'Band Lat Pulldown',
      'pull',
      'beginner',
      'compound',
      'bands',
      array['lats']::text[],
      array['biceps', 'middle back']::text[],
      'strength',
      array[
        'Anchor a resistance band securely above head height and kneel or sit facing the anchor.',
        'Grip the band slightly wider than shoulder width, brace the torso and keep the ribs down.',
        'Drive the elbows down toward the sides until the hands reach upper-chest level.',
        'Return slowly until the arms are straight and the lats are lengthened; do not shrug.'
      ]::text[],
      array['/exercise-placeholder.svg']::text[],
      'pull',
      'weighted',
      false,
      false,
      'Ściąganie gumy szerokim chwytem',
      array[]::text[],
      null
    ),
    (
      'Single_Leg_Calf_Raise',
      'Single-Leg Calf Raise',
      'push',
      'beginner',
      'isolation',
      'body only',
      array['calves']::text[],
      array[]::text[],
      'strength',
      array[
        'Stand on one leg near a wall or stable support, keeping the working knee straight but not locked.',
        'Lower the heel under control until you feel a stretch in the calf.',
        'Press through the ball of the foot and rise as high as possible without rolling the ankle outward.',
        'Pause briefly at the top, complete all repetitions, then switch legs.'
      ]::text[],
      array['/exercise-placeholder.svg']::text[],
      'squat',
      'bodyweight',
      false,
      false,
      'Wspięcia na palce jednonóż',
      array[]::text[],
      null
    )
  on conflict (id)
  do update
  set
    name = excluded.name,
    force = excluded.force,
    level = excluded.level,
    mechanic = excluded.mechanic,
    equipment = excluded.equipment,
    primary_muscles = excluded.primary_muscles,
    secondary_muscles = excluded.secondary_muscles,
    category = excluded.category,
    instructions = excluded.instructions,
    images = excluded.images,
    movement_pattern = excluded.movement_pattern,
    exercise_type = excluded.exercise_type,
    hidden = excluded.hidden,
    content_blocked = excluded.content_blocked,
    name_pl = excluded.name_pl,
    search_aliases = excluded.search_aliases
  where public.exercises.user_id is null;

  if (
    select count(*)
    from public.exercises
    where user_id is null
      and id in ('Band_Lat_Pulldown', 'Single_Leg_Calf_Raise')
  ) <> 2 then
    raise exception 'TRAIN-02A4 required exercise point sync did not produce exactly two system rows.';
  end if;
end
$train_02a4_required_exercises$;
