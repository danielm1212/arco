-- Ekipa v0 (tryb developerski): prywatne grupy istniejących kont testowych.
-- Publiczny signup, e-mail/push i rozliczenia świadomie NIE są częścią tej migracji.

create table pods (
  id uuid primary key default gen_random_uuid(),
  name text,
  invite_code text not null unique,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint pods_name_length check (name is null or char_length(name) between 1 and 48),
  constraint pods_invite_code_length check (char_length(invite_code) >= 12)
);

create table pod_members (
  pod_id uuid not null references pods (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  -- W dev potwierdzane wprost przy utworzeniu/dołączeniu. Pełny rejestr zgód
  -- dojdzie z bramką RODO, ale model nie wymaga wtedy zmiany relacji Ekipy.
  consented_at timestamptz not null default now(),
  primary key (pod_id, user_id)
);

create table activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null default 'workout_done' check (kind in ('workout_done')),
  occurred_on date not null,
  streak_weeks integer not null default 0 check (streak_weeks >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, kind, occurred_on)
);

create index activity_events_user_day_idx on activity_events (user_id, occurred_on desc);

create table reactions (
  id uuid primary key default gen_random_uuid(),
  activity_event_id uuid not null references activity_events (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  emoji text not null check (emoji in ('💪', '🔥', '👏', '🎯')),
  created_at timestamptz not null default now(),
  unique (activity_event_id, user_id)
);

create table nudges (
  id uuid primary key default gen_random_uuid(),
  pod_id uuid not null references pods (id) on delete cascade,
  from_user_id uuid not null references auth.users (id) on delete cascade,
  to_user_id uuid not null references auth.users (id) on delete cascade,
  sent_on date not null default current_date,
  created_at timestamptz not null default now(),
  check (from_user_id <> to_user_id)
);

create unique index nudges_one_per_pair_per_day_idx
  on nudges (from_user_id, to_user_id, sent_on);

-- Dwa advisory locki zamykają wyścig dwóch równoczesnych zaproszeń.
create or replace function enforce_pod_member_limits()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(hashtext(new.pod_id::text));
  perform pg_advisory_xact_lock(hashtext(new.user_id::text));

  if (select count(*) from pod_members where pod_id = new.pod_id) >= 6 then
    raise exception 'Ta ekipa ma już maksymalną liczbę 6 osób.';
  end if;
  if (select count(*) from pod_members where user_id = new.user_id) >= 3 then
    raise exception 'Możesz należeć maksymalnie do 3 ekip.';
  end if;
  return new;
end;
$$;

create trigger pod_members_enforce_limits
before insert on pod_members
for each row execute function enforce_pod_member_limits();

-- Te funkcje rozbijają rekursję RLS na pod_members. Wszystkie polityki dalej
-- filtrują po auth.uid(), a funkcje nie przyjmują user_id od klienta.
create or replace function my_pod_ids()
returns setof uuid
language sql stable security definer
set search_path = public
as $$
  select pod_id from pod_members where user_id = auth.uid();
$$;

create or replace function can_view_pod_activity(p_user_id uuid, p_occurred_on date)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select p_user_id = auth.uid() or exists (
    select 1
    from pod_members mine
    join pod_members peer on peer.pod_id = mine.pod_id
    where mine.user_id = auth.uid()
      and peer.user_id = p_user_id
      and p_occurred_on >= mine.joined_at::date
  );
$$;

create or replace function create_pod(p_name text default null)
returns table (pod_id uuid, invite_code text)
language plpgsql security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_name text := nullif(btrim(p_name), '');
  v_pod pods;
begin
  if v_user is null then raise exception 'Brak sesji.'; end if;
  if v_name is not null and char_length(v_name) > 48 then
    raise exception 'Nazwa ekipy może mieć maksymalnie 48 znaków.';
  end if;

  insert into pods (name, invite_code, created_by)
  values (v_name, encode(gen_random_bytes(12), 'hex'), v_user)
  returning * into v_pod;
  insert into pod_members (pod_id, user_id) values (v_pod.id, v_user);
  return query select v_pod.id, v_pod.invite_code;
end;
$$;

create or replace function join_pod_by_invite(p_invite_code text)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_pod_id uuid;
begin
  if v_user is null then raise exception 'Brak sesji.'; end if;
  select id into v_pod_id from pods where invite_code = btrim(p_invite_code);
  if v_pod_id is null then raise exception 'Nie znaleziono ekipy dla tego kodu.'; end if;
  insert into pod_members (pod_id, user_id) values (v_pod_id, v_user)
  on conflict (pod_id, user_id) do nothing;
  return v_pod_id;
end;
$$;

create or replace function get_pod_members(p_pod_id uuid)
returns table (
  member_id uuid,
  display_name text,
  joined_at timestamptz,
  weekly_done bigint,
  last_workout date,
  latest_event_id uuid,
  streak_weeks integer
)
language sql stable security definer
set search_path = public
as $$
  with requester as (
    select joined_at::date as visible_from
    from pod_members
    where pod_id = p_pod_id and user_id = auth.uid()
  ), members as (
    select m.user_id, m.joined_at
    from pod_members m
    where m.pod_id = p_pod_id and exists (select 1 from requester)
  )
  select
    m.user_id,
    coalesce(nullif(s.display_name, ''), split_part(u.email, '@', 1), 'Ktoś') as display_name,
    m.joined_at,
    count(e.id) filter (where e.occurred_on >= date_trunc('week', current_date)::date)::bigint,
    max(e.occurred_on),
    (array_agg(e.id order by e.occurred_on desc, e.created_at desc) filter (where e.id is not null))[1],
    coalesce(max(e.streak_weeks), 0)
  from members m
  cross join requester r
  left join user_settings s on s.user_id = m.user_id
  left join auth.users u on u.id = m.user_id
  left join activity_events e on e.user_id = m.user_id and e.occurred_on >= r.visible_from
  group by m.user_id, m.joined_at, s.display_name, u.email;
$$;

create or replace function send_pod_nudge(p_pod_id uuid, p_to_user_id uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_from uuid := auth.uid();
  v_last date;
begin
  if v_from is null then raise exception 'Brak sesji.'; end if;
  if not exists (select 1 from pod_members where pod_id = p_pod_id and user_id = v_from)
    or not exists (select 1 from pod_members where pod_id = p_pod_id and user_id = p_to_user_id) then
    raise exception 'Nie należysz do tej ekipy.';
  end if;
  select max(occurred_on) into v_last from activity_events where user_id = p_to_user_id;
  if v_last is not null and v_last > current_date - 3 then
    raise exception 'Ta osoba trenowała niedawno — nie trzeba jej jeszcze szturchać.';
  end if;
  insert into nudges (pod_id, from_user_id, to_user_id)
  values (p_pod_id, v_from, p_to_user_id);
exception when unique_violation then
  raise exception 'Już dziś wysłałeś tej osobie szturchnięcie.';
end;
$$;

alter table pods enable row level security;
alter table pod_members enable row level security;
alter table activity_events enable row level security;
alter table reactions enable row level security;
alter table nudges enable row level security;

create policy "pods_select_member" on pods for select to authenticated
  using (id in (select my_pod_ids()));
create policy "pods_update_creator" on pods for update to authenticated
  using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy "pods_delete_creator" on pods for delete to authenticated
  using (created_by = auth.uid());

create policy "pod_members_select_member" on pod_members for select to authenticated
  using (pod_id in (select my_pod_ids()));
create policy "pod_members_leave_own" on pod_members for delete to authenticated
  using (user_id = auth.uid());

create policy "activity_events_select_peers" on activity_events for select to authenticated
  using (can_view_pod_activity(user_id, occurred_on));
create policy "activity_events_insert_own" on activity_events for insert to authenticated
  with check (user_id = auth.uid());

create policy "reactions_select_visible" on reactions for select to authenticated
  using (exists (select 1 from activity_events e where e.id = activity_event_id and can_view_pod_activity(e.user_id, e.occurred_on)));
create policy "reactions_insert_own" on reactions for insert to authenticated
  with check (user_id = auth.uid() and exists (
    select 1 from activity_events e where e.id = activity_event_id and can_view_pod_activity(e.user_id, e.occurred_on)
  ));

create policy "nudges_select_participant" on nudges for select to authenticated
  using (from_user_id = auth.uid() or to_user_id = auth.uid());

grant select, insert, update, delete on pods, pod_members, activity_events, reactions, nudges to authenticated;
revoke all on function create_pod(text), join_pod_by_invite(text), get_pod_members(uuid), send_pod_nudge(uuid, uuid) from public;
grant execute on function create_pod(text), join_pod_by_invite(text), get_pod_members(uuid), send_pod_nudge(uuid, uuid) to authenticated;
