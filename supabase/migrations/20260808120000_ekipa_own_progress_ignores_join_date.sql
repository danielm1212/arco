-- Bug zgłoszony przez właściciela (dogfood): dołączenie do Ekipy w środku
-- tygodnia z już ukończonym treningiem pokazywało 0/2 zamiast 1/2 — po drugim
-- treningu 1/2 zamiast 2/2.
--
-- Przyczyna: `get_pod_members`/`team_member_streak_weeks` liczyły „widoczność"
-- treningów jako `greatest(mine.joined_at, peer.joined_at)` — poprawna reguła
-- prywatności DLA PODGLĄDU INNEGO CZŁONKA („nie ujawniamy jego treningów
-- sprzed wspólnego członkostwa"), ale ta sama reguła stosowała się też do
-- WŁASNEGO wiersza requestera (`m.user_id = r.user_id` → `greatest` zwija się
-- do własnego `joined_at`). L9/L10 mówi wprost: „Ekipa ma liczyć dokładnie
-- ten sam cel i tydzień co reszta Arco" — własny licznik nie powinien mieć
-- żadnej dolnej granicy poza początkiem tygodnia, bo nie chowamy przed sobą
-- własnych treningów.
--
-- Naprawa: dla własnego wiersza (`m.user_id = auth.uid()`) pomijamy próg
-- `joined_on` całkowicie — zarówno w `weekly_done`, jak i w `last_workout`
-- (ten sam wzorzec buga w `ef`) oraz w `team_member_streak_weeks` (ta sama
-- funkcja liczy WŁASNĄ passę, wywoływana per-member z `p_member_id = auth.uid()`
-- dla własnego wiersza). Widoczność cudzych treningów wobec peera — bez zmian.

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

  -- Własna passa: brak dolnej granicy (sentinel '-infinity', nie NULL —
  -- NULL dalej znaczy „brak wspólnego, potwierdzonego członkostwa" niżej).
  -- Cudza passa: nadal nie ujawniamy treningów sprzed wspólnego członkostwa.
  select case
    when p_member_id = v_requester then date '-infinity'
    else greatest(mine.joined_at::date, peer.joined_at::date)
  end
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
        and s.date >= c.week_start
        -- Własny wiersz: bez dolnej granicy poza początkiem tygodnia (wyżej).
        -- Cudzy wiersz: nie ujawniamy treningów sprzed wspólnego członkostwa.
        and (m.user_id = auth.uid() or s.date >= greatest(m.joined_on, r.joined_on))
    ) sf on true
    left join lateral (
      select
        max(e.occurred_on) as last_workout,
        (array_agg(e.id order by e.occurred_on desc, e.created_at desc))[1] as latest_event_id
      from activity_events e
      where e.user_id = m.user_id
        and (m.user_id = auth.uid() or e.occurred_on >= greatest(m.joined_on, r.joined_on))
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

revoke all on function team_member_streak_weeks(uuid, uuid) from public;
grant execute on function team_member_streak_weeks(uuid, uuid) to authenticated;
revoke all on function get_pod_members(uuid) from public;
grant execute on function get_pod_members(uuid) to authenticated;
