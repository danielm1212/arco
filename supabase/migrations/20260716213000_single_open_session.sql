-- R1b: jedna otwarta sesja jest niezmiennikiem bazy, a nie umową interfejsu.
-- Migracja celowo zatrzymuje deploy przy zastanych duplikatach zamiast po cichu
-- usuwać lub kończyć trening użytkownika. Audyt przed migracją wskazuje rekordy
-- do świadomego uzgodnienia.
do $$
begin
  if exists (
    select 1
    from sessions
    where finished_at is null
    group by user_id
    having count(*) > 1
  ) then
    raise exception using
      errcode = '23505',
      message = 'Nie można włączyć niezmiennika jednej otwartej sesji: istnieją duplikaty.';
  end if;
end
$$;

create unique index if not exists sessions_one_open_per_user_idx
  on sessions (user_id)
  where finished_at is null;

-- Atomowy start obejmuje także skopiowanie ćwiczeń i pustych serii z planu.
-- Blokada per użytkownik domyka wyścig między dwoma kartami/PWA, a indeks
-- zabezpiecza także bezpośrednie inserty poza tą funkcją.
create or replace function start_or_resume_session(
  p_program_day_id uuid default null,
  p_started_at timestamptz default null,
  p_date date default null,
  p_is_historical boolean default false,
  p_recorded_duration_seconds integer default null
)
returns table (session_id uuid, created boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_session_id uuid;
  v_started_at timestamptz;
  v_date date;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'Wymagane jest zalogowanie.';
  end if;

  -- Serializuje starty tego samego użytkownika, również zanim istnieje wiersz
  -- możliwy do zablokowania przez SELECT FOR UPDATE.
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  select s.id
  into v_session_id
  from sessions s
  where s.user_id = v_user_id
    and s.finished_at is null
  limit 1;

  if v_session_id is not null then
    return query select v_session_id, false;
    return;
  end if;

  if p_program_day_id is not null and not exists (
    select 1
    from program_days d
    join programs p on p.id = d.program_id
    where d.id = p_program_day_id
      and (p.user_id is null or p.user_id = v_user_id)
  ) then
    raise exception using errcode = '42501', message = 'Ten dzień planu nie jest dostępny.';
  end if;

  if p_is_historical then
    if p_started_at is null or p_date is null then
      raise exception using errcode = '22023', message = 'Trening po fakcie wymaga daty i godziny.';
    end if;
    if p_started_at > now() then
      raise exception using errcode = '22023', message = 'Data treningu nie może być w przyszłości.';
    end if;
    if p_started_at < now() - interval '366 days' then
      raise exception using errcode = '22023', message = 'Trening może pochodzić maksymalnie sprzed roku.';
    end if;
    if p_recorded_duration_seconds is null
      or p_recorded_duration_seconds not between 60 and 28800 then
      raise exception using errcode = '22023', message = 'Czas treningu musi wynosić od 1 do 480 minut.';
    end if;
  elsif p_recorded_duration_seconds is not null then
    raise exception using errcode = '22023', message = 'Czas po fakcie dotyczy tylko treningu historycznego.';
  end if;

  v_started_at := coalesce(p_started_at, now());
  v_date := coalesce(p_date, current_date);

  insert into sessions (
    user_id,
    program_day_id,
    date,
    started_at,
    is_historical,
    recorded_duration_seconds
  )
  values (
    v_user_id,
    p_program_day_id,
    v_date,
    v_started_at,
    p_is_historical,
    p_recorded_duration_seconds
  )
  returning id into v_session_id;

  if p_program_day_id is not null then
    with created_exercises as (
      insert into session_exercises (
        session_id,
        slot_id,
        exercise_id,
        position,
        superset_group
      )
      select
        v_session_id,
        slot.id,
        slot.default_exercise_id,
        slot.position,
        slot.superset_group
      from program_day_slots slot
      where slot.program_day_id = p_program_day_id
      order by slot.position
      returning id, slot_id
    )
    insert into session_sets (session_exercise_id, set_index, set_type)
    select
      exercise.id,
      series_number - 1,
      'working'::set_type
    from created_exercises exercise
    join program_day_slots slot on slot.id = exercise.slot_id
    cross join lateral generate_series(1, greatest(slot.target_sets, 1)) as series(series_number);
  end if;

  return query select v_session_id, true;
end;
$$;

revoke all on function start_or_resume_session(uuid, timestamptz, date, boolean, integer)
  from public;
grant execute on function start_or_resume_session(uuid, timestamptz, date, boolean, integer)
  to authenticated, service_role;

comment on index sessions_one_open_per_user_idx is
  'Niezmiennik R1b: użytkownik może mieć najwyżej jedną sesję bez finished_at.';
comment on function start_or_resume_session(uuid, timestamptz, date, boolean, integer) is
  'Atomowo wznawia otwartą sesję albo tworzy kompletny szkic loggera.';
