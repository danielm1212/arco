-- Ekipa dev-v0: korekta spike'a do kontraktu z ekipa-blueprint-wdrozeniowy.md.

create table team_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 32),
  avatar text not null check (avatar in ('🐻', '🦊', '🐯', '🐼', '🦁', '🐸', '🐙', '🦦', '🦄', '🏋️', '💪', '⚡')),
  updated_at timestamptz not null default now()
);

alter table pod_members alter column consented_at drop default;
alter table pod_members add column consent_version text;

create table inbox_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('nudge', 'reaction')),
  payload jsonb not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index inbox_items_user_created_idx on inbox_items (user_id, created_at desc);

alter table team_profiles enable row level security;
alter table inbox_items enable row level security;

create policy "team_profiles_own" on team_profiles for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "inbox_items_own" on inbox_items for select to authenticated
  using (user_id = auth.uid());
create policy "inbox_items_mark_read_own" on inbox_items for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select, insert, update, delete on team_profiles, inbox_items to authenticated;

drop function create_pod(text);
drop function join_pod_by_invite(text);

create function create_pod(p_name text, p_display_name text, p_avatar text, p_confirmed boolean)
returns table (pod_id uuid, invite_code text)
language plpgsql security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_name text := nullif(btrim(p_name), '');
  v_profile_name text := btrim(p_display_name);
  v_pod pods;
begin
  if v_user is null then raise exception 'Brak sesji.'; end if;
  if not p_confirmed then raise exception 'Potwierdź, co zobaczy Twoja ekipa.'; end if;
  if char_length(v_profile_name) not between 1 and 32 then raise exception 'Podaj nazwę widoczną dla ekipy (1–32 znaki).'; end if;
  if p_avatar not in ('🐻', '🦊', '🐯', '🐼', '🦁', '🐸', '🐙', '🦦', '🦄', '🏋️', '💪', '⚡') then raise exception 'Wybierz avatar z listy.'; end if;
  if v_name is not null and char_length(v_name) > 48 then raise exception 'Nazwa ekipy może mieć maksymalnie 48 znaków.'; end if;

  insert into team_profiles (user_id, display_name, avatar)
  values (v_user, v_profile_name, p_avatar)
  on conflict (user_id) do update set display_name = excluded.display_name, avatar = excluded.avatar, updated_at = now();

  insert into pods (name, invite_code, created_by)
  values (v_name, encode(gen_random_bytes(12), 'hex'), v_user)
  returning * into v_pod;
  insert into pod_members (pod_id, user_id, consented_at, consent_version)
  values (v_pod.id, v_user, now(), 'team-activity-v1');
  return query select v_pod.id, v_pod.invite_code;
end;
$$;

create function join_pod_by_invite(p_invite_code text, p_display_name text, p_avatar text, p_confirmed boolean)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_pod_id uuid;
  v_profile_name text := btrim(p_display_name);
begin
  if v_user is null then raise exception 'Brak sesji.'; end if;
  if not p_confirmed then raise exception 'Potwierdź, co zobaczy Twoja ekipa.'; end if;
  if char_length(v_profile_name) not between 1 and 32 then raise exception 'Podaj nazwę widoczną dla ekipy (1–32 znaki).'; end if;
  if p_avatar not in ('🐻', '🦊', '🐯', '🐼', '🦁', '🐸', '🐙', '🦦', '🦄', '🏋️', '💪', '⚡') then raise exception 'Wybierz avatar z listy.'; end if;
  select id into v_pod_id from pods where invite_code = btrim(p_invite_code);
  if v_pod_id is null then raise exception 'Nie znaleziono ekipy dla tego kodu.'; end if;

  insert into team_profiles (user_id, display_name, avatar)
  values (v_user, v_profile_name, p_avatar)
  on conflict (user_id) do update set display_name = excluded.display_name, avatar = excluded.avatar, updated_at = now();
  insert into pod_members (pod_id, user_id, consented_at, consent_version)
  values (v_pod_id, v_user, now(), 'team-activity-v1')
  on conflict (pod_id, user_id) do update set consented_at = excluded.consented_at, consent_version = excluded.consent_version;
  return v_pod_id;
end;
$$;

create function emit_workout_activity(p_session_id uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_day date;
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

  v_week := date_trunc('week', v_day)::date;
  with recursive contiguous as (
    select v_week as week_start
    union all
    select c.week_start - 7
    from contiguous c
    where exists (
      select 1 from activity_events e
      where e.user_id = v_user and date_trunc('week', e.occurred_on)::date = c.week_start - 7
    )
  )
  select count(*) into v_streak from contiguous;

  update activity_events
  set streak_weeks = v_streak
  where user_id = v_user and kind = 'workout_done' and occurred_on = v_day;
end;
$$;

drop function get_pod_members(uuid);
create function get_pod_members(p_pod_id uuid)
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
    select joined_at::date as visible_from
    from pod_members where pod_id = p_pod_id and user_id = auth.uid() and consented_at is not null
  ), members as (
    select m.user_id, m.joined_at
    from pod_members m where m.pod_id = p_pod_id and m.consented_at is not null and exists (select 1 from requester)
  ), facts as (
    select
      m.user_id,
      count(e.id) filter (where e.occurred_on >= date_trunc('week', current_date)::date)::bigint as weekly_done,
      max(e.occurred_on) as last_workout,
      (array_agg(e.id order by e.occurred_on desc, e.created_at desc) filter (where e.id is not null))[1] as latest_event_id,
      coalesce(max(e.streak_weeks), 0) as streak_weeks
    from members m cross join requester r
    left join activity_events e on e.user_id = m.user_id and e.occurred_on >= r.visible_from
    group by m.user_id
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
    f.streak_weeks,
    (
      m.user_id <> auth.uid()
      and (f.last_workout is null or f.last_workout <= current_date - 3)
      and greatest(coalesce(s.weekly_goal, 2) - f.weekly_done, 0) > 7 - extract(isodow from current_date)::integer
    )
  from members m
  join team_profiles p on p.user_id = m.user_id
  left join user_settings s on s.user_id = m.user_id
  join facts f on f.user_id = m.user_id;
$$;

create function remove_pod_member(p_pod_id uuid, p_user_id uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if not exists (select 1 from pods where id = p_pod_id and created_by = auth.uid()) then
    raise exception 'Tylko twórca może usunąć członka.';
  end if;
  if p_user_id = auth.uid() then raise exception 'Twórca nie może usunąć siebie; użyj opcji wyjścia.'; end if;
  delete from pod_members where pod_id = p_pod_id and user_id = p_user_id;
end;
$$;

create function rename_pod(p_pod_id uuid, p_name text)
returns void
language plpgsql security definer
set search_path = public
as $$
declare v_name text := nullif(btrim(p_name), '');
begin
  if v_name is not null and char_length(v_name) > 48 then raise exception 'Nazwa ekipy może mieć maksymalnie 48 znaków.'; end if;
  update pods set name = v_name where id = p_pod_id and created_by = auth.uid();
  if not found then raise exception 'Tylko twórca może zmienić nazwę.'; end if;
end;
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
begin
  if v_from is null then raise exception 'Brak sesji.'; end if;
  if not exists (select 1 from pod_members where pod_id = p_pod_id and user_id = v_from and consented_at is not null)
    or not exists (select 1 from pod_members where pod_id = p_pod_id and user_id = p_to_user_id and consented_at is not null) then
    raise exception 'Nie należysz do tej ekipy.';
  end if;
  select max(occurred_on) into v_last from activity_events where user_id = p_to_user_id;
  select weekly_goal into v_goal from user_settings where user_id = p_to_user_id;
  select count(*) into v_done from activity_events where user_id = p_to_user_id and occurred_on >= date_trunc('week', current_date)::date;
  if v_last is not null and v_last > current_date - 3 then raise exception 'Ta osoba trenowała niedawno.'; end if;
  if greatest(coalesce(v_goal, 2) - v_done, 0) <= 7 - extract(isodow from current_date)::integer then
    raise exception 'Jej cel tygodniowy nie jest jeszcze zagrożony.';
  end if;
  select display_name into v_from_name from team_profiles where user_id = v_from;
  insert into nudges (pod_id, from_user_id, to_user_id) values (p_pod_id, v_from, p_to_user_id);
  insert into inbox_items (user_id, kind, payload)
  values (p_to_user_id, 'nudge', jsonb_build_object('from_name', coalesce(v_from_name, 'Ktoś'), 'pod_id', p_pod_id));
exception when unique_violation then raise exception 'Już dziś wysłałeś tej osobie szturchnięcie.';
end;
$$;

revoke all on function create_pod(text, text, text, boolean), join_pod_by_invite(text, text, text, boolean), emit_workout_activity(uuid), get_pod_members(uuid), remove_pod_member(uuid, uuid), rename_pod(uuid, text) from public;
grant execute on function create_pod(text, text, text, boolean), join_pod_by_invite(text, text, text, boolean), emit_workout_activity(uuid), get_pod_members(uuid), remove_pod_member(uuid, uuid), rename_pod(uuid, text) to authenticated;
