-- CONTENT-01A: wycofanie niezatwierdzonego materiału Barbell Hip Thrust.
-- Seed i punktowy sync czytają tę samą decyzję z exercise-content-reviews.json.
-- Historia i już utworzone session_exercises pozostają bez zmian.

alter table public.exercises
  add column if not exists content_blocked boolean not null default false;

comment on column public.exercises.content_blocked is
  'Twarda blokada publikacji: rekord może pozostać w historii, ale nie trafia do browse/search/swap.';

do $content01a$
begin
  if not exists (select 1 from public.exercises) then
    raise notice 'CONTENT-01A pominięte: baza referencyjna jest jeszcze pusta.';
    return;
  end if;

  if not exists (
    select 1 from public.exercises where id = 'Barbell_Glute_Bridge' and user_id is null
  ) then
    raise exception 'CONTENT-01A: brak systemowego Barbell_Glute_Bridge; przerywam bez podmiany.';
  end if;

  update public.exercises
  set hidden = true,
      content_blocked = true,
      images = array['/exercise-placeholder.svg']::text[],
      instructions = array[
        'Oprzyj łopatki o krawędź stabilnej ławki, a stopy ustaw płasko na szerokość bioder. Ułóż zabezpieczoną miękką osłoną sztangę nad zgięciem bioder i trzymaj ją oburącz.',
        'Lekko schowaj brodę, napnij brzuch i utrzymaj żebra nad miednicą.',
        'Wciśnij całe stopy w podłogę i unieś biodra. Kolana prowadź w kierunku palców stóp.',
        'Zakończ ruch, gdy barki, biodra i kolana utworzą prostą linię — bez odchylania głowy i wyginania dolnych pleców. Opuść biodra spokojnie.'
      ]::text[]
  where id = 'Barbell_Hip_Thrust' and user_id is null;

  update public.exercises
  set hidden = false,
      content_blocked = false,
      name_pl = 'Mostek biodrowy ze sztangą',
      search_aliases = array['mostek', 'mostek biodrowy', 'glute bridge']::text[],
      movement_pattern = 'hinge',
      instructions = array[
        'Połóż się na plecach z ugiętymi kolanami i stopami na szerokość bioder. Ułóż zabezpieczoną miękką osłoną sztangę nad zgięciem bioder i trzymaj ją oburącz.',
        'Napnij brzuch, utrzymaj żebra nad miednicą i wciśnij całe stopy w podłogę.',
        'Unieś biodra do chwili, gdy barki, biodra i kolana utworzą prostą linię. Kolana prowadź w kierunku palców stóp.',
        'Zatrzymaj ruch przed wygięciem dolnych pleców, napnij pośladki i opuść biodra pod kontrolą.'
      ]::text[]
  where id = 'Barbell_Glute_Bridge' and user_id is null;

  update public.exercises
  set instructions = array[
    'Oprzyj łopatki o krawędź stabilnej ławki, a stopy ustaw płasko na szerokość bioder. Ułóż hantel poziomo nad zgięciem bioder i trzymaj go oburącz.',
    'Lekko schowaj brodę, napnij brzuch i utrzymaj żebra nad miednicą.',
    'Wciśnij całe stopy w podłogę i unieś biodra, prowadząc kolana w kierunku palców.',
    'Zatrzymaj ruch, gdy barki, biodra i kolana utworzą prostą linię. Nie wyginaj dolnych pleców; opuść biodra pod kontrolą. Bez ławki wykonaj most biodrowy na podłodze.'
  ]::text[]
  where id = 'Dumbbell_Hip_Thrust' and user_id is null;

  update public.exercises
  set instructions = array[
    'Oprzyj łopatki o krawędź stabilnej ławki. Jedną stopę ustaw płasko pod kolanem, a drugą nogę unieś z ugiętym kolanem.',
    'Lekko schowaj brodę, napnij brzuch i ustaw miednicę równo, bez skręcania na bok.',
    'Wciśnij stopę podporową w podłogę i unieś biodra, aż bark, biodro i kolano nogi podporowej utworzą prostą linię.',
    'Zatrzymaj ruch przed wygięciem dolnych pleców lub skręceniem miednicy. Opuść biodra spokojnie i po serii zmień stronę.'
  ]::text[]
  where id = 'Single-Leg_Hip_Thrust' and user_id is null;

  update public.program_day_slots as slot
  set default_exercise_id = 'Barbell_Glute_Bridge'
  from public.program_days as day
  join public.programs as program on program.id = day.program_id
  where slot.program_day_id = day.id
    and program.user_id is null
    and program.slug in ('lower-body-gym3', 'advanced-gym-ppl6')
    and slot.default_exercise_id = 'Barbell_Hip_Thrust';

  update public.programs
  set content_version = case slug
    when 'lower-body-gym3' then greatest(content_version, 2)
    when 'advanced-gym-ppl6' then greatest(content_version, 4)
    else content_version
  end
  where user_id is null
    and slug in ('lower-body-gym3', 'advanced-gym-ppl6');

  if exists (
    select 1
    from public.program_day_slots as slot
    join public.program_days as day on day.id = slot.program_day_id
    join public.programs as program on program.id = day.program_id
    where program.user_id is null
      and program.slug in ('lower-body-gym3', 'advanced-gym-ppl6')
      and slot.default_exercise_id = 'Barbell_Hip_Thrust'
  ) then
    raise exception 'CONTENT-01A: nie wszystkie systemowe sloty zostały podmienione.';
  end if;
end
$content01a$;
