-- L9/L10 — Ekipa ma liczyć dokładnie ten sam cel i tydzień co reszta Arco.
-- `sessions`, nie dzienne check-iny, są źródłem liczby treningów: dwa treningi
-- jednego dnia nadal liczą się jako dwa wobec celu tygodniowego.

create or replace function team_member_streak_weeks(p_pod_id uuid, p_member_id uuid)
returns integer
language plpgsql stable security definer
set search_path = public
as $$
declare
  v_requester uuid := auth.uid();
  v_visible_from date;
  v_goal integer;
  v_today date := (now() at time zone 'Europe/Warsaw')::date;
  v_week date;
  v_streak integer;
begin
  if v_requester is null then return 0; end if;

  -- Nie ujawniamy liczby treningów sprzed wspólnego członkostwa w tej Ekipie.
  select greatest(mine.joined_at::date, peer.joined_at::date)
  into v_visible_from
  from pod_members mine
  join pod_members peer on peer.pod_id = mine.pod_id
  where mine.pod_id = p_pod_id
    and mine.user_id = v_requester
    and mine.consented_at is not null
    and peer.user_id = p_member_id
    and peer.consented_at is not null;
  if v_visible_from is null then return 0; end if;

  select coalesce(weekly_goal, 2) into v_goal
  from user_settings where user_id = p_member_id;
  v_goal := coalesce(v_goal, 2);
  v_week := v_today - (extract(isodow from v_today)::integer - 1);

  with recursive weekly as (
    select
      s.date - (extract(isodow from s.date)::integer - 1) as week_start,
      count(*)::integer as sessions_done
    from sessions s
    where s.user_id = p_member_id
      and s.finished_at is not null
      and s.date >= v_visible_from
    group by 1
  ), qualifying as (
    select week_start from weekly where sessions_done >= v_goal
  ), candidate as (
    -- Ten sam kontrakt co lib/week.ts: niedokończony bieżący tydzień nie kasuje
    -- passy; dopiero brak spełnionego poprzedniego tygodnia ją kończy.
    select case
      when exists (select 1 from qualifying where week_start = v_week) then v_week
      else v_week - 7
    end as week_start
  ), contiguous as (
    select c.week_start from candidate c
    where exists (select 1 from qualifying q where q.week_start = c.week_start)
    union all
    select c.week_start - 7
    from contiguous c
    where exists (select 1 from qualifying q where q.week_start = c.week_start - 7)
  )
  select count(*)::integer into v_streak from contiguous;

  return coalesce(v_streak, 0);
end;
$$;

-- Snapshot przy check-inie zostaje zgodny z tym samym celem. Ekran Ekipy liczy
-- wartość dynamicznie (funkcja wyżej), więc korekta daty treningu nie zostawia
-- starego snapshotu jako źródła prawdy.
create or replace function emit_workout_activity(p_session_id uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_day date;
  v_goal integer;
  v_today date := (now() at time zone 'Europe/Warsaw')::date;
  v_week date;
  v_streak integer;
begin
  if v_user is null then raise exception 'Brak sesji.'; end if;
  select date into v_day from sessions where id = p_session_id and user_id = v_user and finished_at is not null;
  if v_day is null then raise exception 'Nie znaleziono ukończonego treningu.'; end if;
  if not exists (select 1 from pod_members where user_id = v_user and consented_at is not null) then return; end if;

  insert into activity_events (user_id, kind, occurred_on, streak_weeks)
  values (v_user, 'workout_done', v_day, 0)
  on conflict (user_id, kind, occurred_on) do nothing;

  select coalesce(weekly_goal, 2) into v_goal from user_settings where user_id = v_user;
  v_goal := coalesce(v_goal, 2);
  v_week := v_today - (extract(isodow from v_today)::integer - 1);

  with recursive weekly as (
    select
      s.date - (extract(isodow from s.date)::integer - 1) as week_start,
      count(*)::integer as sessions_done
    from sessions s
    where s.user_id = v_user and s.finished_at is not null
    group by 1
  ), qualifying as (
    select week_start from weekly where sessions_done >= v_goal
  ), candidate as (
    select case
      when exists (select 1 from qualifying where week_start = v_week) then v_week
      else v_week - 7
    end as week_start
  ), contiguous as (
    select c.week_start from candidate c
    where exists (select 1 from qualifying q where q.week_start = c.week_start)
    union all
    select c.week_start - 7
    from contiguous c
    where exists (select 1 from qualifying q where q.week_start = c.week_start - 7)
  )
  select count(*)::integer into v_streak from contiguous;

  update activity_events
  set streak_weeks = coalesce(v_streak, 0)
  where user_id = v_user and kind = 'workout_done' and occurred_on = v_day;
end;
$$;

create or replace function get_pod_members(p_pod_id uuid)
returns table (
  member_id uuid,
  display_name text,
  avatar text,
  joined_at timestamptz,
  weekly_done bigint,
  weekly_goal integer,
  last_workout date,
  latest_event_id uuid,
  reaction_count bigint,
  my_reaction text,
  streak_weeks integer,
  can_nudge boolean
)
language sql stable security definer
set search_path = public
as $$
  with requester as (
    select joined_at::date as joined_on
    from pod_members
    where pod_id = p_pod_id and user_id = auth.uid() and consented_at is not null
  ), members as (
    select m.user_id, m.joined_at::date as joined_on, m.joined_at
    from pod_members m
    where m.pod_id = p_pod_id and m.consented_at is not null
      and exists (select 1 from requester)
  ), clock as (
    select
      (now() at time zone 'Europe/Warsaw')::date as today,
      ((now() at time zone 'Europe/Warsaw')::date
        - (extract(isodow from (now() at time zone 'Europe/Warsaw')::date)::integer - 1)) as week_start
  ), facts as (
    select
      m.user_id,
      sf.weekly_done,
      ef.last_workout,
      ef.latest_event_id,
      greatest(m.joined_on, r.joined_on) as visible_from
    from members m
    cross join requester r
    cross join clock c
    left join lateral (
      select count(*)::bigint as weekly_done
      from sessions s
      where s.user_id = m.user_id
        and s.finished_at is not null
        and s.date >= greatest(m.joined_on, r.joined_on)
        and s.date >= c.week_start
    ) sf on true
    left join lateral (
      select
        max(e.occurred_on) as last_workout,
        (array_agg(e.id order by e.occurred_on desc, e.created_at desc))[1] as latest_event_id
      from activity_events e
      where e.user_id = m.user_id
        and e.occurred_on >= greatest(m.joined_on, r.joined_on)
    ) ef on true
  )
  select
    m.user_id,
    p.display_name,
    p.avatar,
    m.joined_at,
    f.weekly_done,
    coalesce(s.weekly_goal, 2),
    f.last_workout,
    f.latest_event_id,
    coalesce((select count(*) from reactions r where r.activity_event_id = f.latest_event_id), 0)::bigint,
    (select r.emoji from reactions r where r.activity_event_id = f.latest_event_id and r.user_id = auth.uid()),
    team_member_streak_weeks(p_pod_id, m.user_id),
    (
      m.user_id <> auth.uid()
      and (f.last_workout is null or f.last_workout <= c.today - 3)
      and greatest(coalesce(s.weekly_goal, 2) - f.weekly_done, 0)
        > 7 - extract(isodow from c.today)::integer
    )
  from members m
  cross join clock c
  join team_profiles p on p.user_id = m.user_id
  left join user_settings s on s.user_id = m.user_id
  join facts f on f.user_id = m.user_id;
$$;

create or replace function send_pod_nudge(p_pod_id uuid, p_to_user_id uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_from uuid := auth.uid();
  v_from_name text;
  v_last date;
  v_goal integer;
  v_done integer;
  v_visible_from date;
  v_today date := (now() at time zone 'Europe/Warsaw')::date;
  v_week date;
begin
  if v_from is null then raise exception 'Brak sesji.'; end if;
  select greatest(mine.joined_at::date, peer.joined_at::date)
  into v_visible_from
  from pod_members mine
  join pod_members peer on peer.pod_id = mine.pod_id
  where mine.pod_id = p_pod_id
    and mine.user_id = v_from
    and mine.consented_at is not null
    and peer.user_id = p_to_user_id
    and peer.consented_at is not null;
  if v_visible_from is null then raise exception 'Nie należysz do tej ekipy.'; end if;

  v_week := v_today - (extract(isodow from v_today)::integer - 1);
  select max(occurred_on) into v_last
  from activity_events
  where user_id = p_to_user_id and occurred_on >= v_visible_from;
  select coalesce(weekly_goal, 2) into v_goal from user_settings where user_id = p_to_user_id;
  select count(*) into v_done
  from sessions
  where user_id = p_to_user_id
    and finished_at is not null
    and date >= v_visible_from
    and date >= v_week;

  if v_last is not null and v_last > v_today - 3 then raise exception 'Ta osoba trenowała niedawno.'; end if;
  if greatest(coalesce(v_goal, 2) - v_done, 0) <= 7 - extract(isodow from v_today)::integer then
    raise exception 'Jej cel tygodniowy nie jest jeszcze zagrożony.';
  end if;
  select display_name into v_from_name from team_profiles where user_id = v_from;
  insert into nudges (pod_id, from_user_id, to_user_id, sent_on)
  values (p_pod_id, v_from, p_to_user_id, v_today);
  insert into inbox_items (user_id, kind, payload)
  values (p_to_user_id, 'nudge', jsonb_build_object('from_name', coalesce(v_from_name, 'Ktoś'), 'pod_id', p_pod_id));
exception when unique_violation then raise exception 'Już dziś wysłałeś tej osobie szturchnięcie.';
end;
$$;

revoke all on function team_member_streak_weeks(uuid, uuid) from public;
grant execute on function team_member_streak_weeks(uuid, uuid) to authenticated;
revoke all on function emit_workout_activity(uuid), get_pod_members(uuid), send_pod_nudge(uuid, uuid) from public;
grant execute on function emit_workout_activity(uuid), get_pod_members(uuid), send_pod_nudge(uuid, uuid) to authenticated;
