-- Kody zaproszeń są wpisywane ręcznie. Osiem znaków Crockford Base32 daje
-- 40 bitów entropii. Kod nie zawiera I, L, O ani U; przy wpisywaniu O, I i L
-- są tolerowane odpowiednio jako 0 i 1.
alter table pods drop constraint pods_invite_code_length;

create or replace function generate_pod_invite_code()
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  v_alphabet constant text := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  v_bytes bytea := uuid_send(gen_random_uuid());
  v_code text := '';
  v_index integer;
begin
  -- Bajty 8–15 UUID v4 mają wystarczającą losowość; modulo 32 zachowuje
  -- równomierny rozkład, bo 256 jest podzielne przez 32.
  for v_index in 8..15 loop
    v_code := v_code || substr(v_alphabet, (get_byte(v_bytes, v_index) % 32) + 1, 1);
  end loop;
  return v_code;
end;
$$;

-- W środowisku dev istniała jedna ekipa. Celowo wymieniamy wszystkie stare
-- kody, bo właściciel zaakceptował zerwanie kompatybilności.
do $$
declare
  v_pod record;
  v_code text;
begin
  for v_pod in select id from pods order by created_at loop
    loop
      v_code := generate_pod_invite_code();
      begin
        update pods set invite_code = v_code where id = v_pod.id;
        exit;
      exception when unique_violation then
        -- Kolizja jest skrajnie mało prawdopodobna, ale generator zawsze retryuje.
      end;
    end loop;
  end loop;
end;
$$;

alter table pods
  add constraint pods_invite_code_length
  check (invite_code ~ '^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{8}$');

create or replace function create_pod(p_name text, p_display_name text, p_avatar text, p_confirmed boolean)
returns table (pod_id uuid, invite_code text)
language plpgsql security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_name text := nullif(btrim(p_name), '');
  v_profile_name text := btrim(p_display_name);
  v_pod pods;
  v_attempts integer := 0;
begin
  if v_user is null then raise exception 'Brak sesji.'; end if;
  if not p_confirmed then raise exception 'Potwierdź, co zobaczy Twoja ekipa.'; end if;
  if char_length(v_profile_name) not between 1 and 32 then raise exception 'Podaj nazwę widoczną dla ekipy (1–32 znaki).'; end if;
  if p_avatar not in ('🐻', '🦊', '🐯', '🐼', '🦁', '🐸', '🐙', '🦦', '🦄', '🏋️', '💪', '⚡') then raise exception 'Wybierz avatar z listy.'; end if;
  if v_name is not null and char_length(v_name) > 48 then raise exception 'Nazwa ekipy może mieć maksymalnie 48 znaków.'; end if;

  insert into team_profiles (user_id, display_name, avatar)
  values (v_user, v_profile_name, p_avatar)
  on conflict (user_id) do update set display_name = excluded.display_name, avatar = excluded.avatar, updated_at = now();

  loop
    begin
      insert into pods (name, invite_code, created_by)
      values (v_name, generate_pod_invite_code(), v_user)
      returning * into v_pod;
      exit;
    exception when unique_violation then
      v_attempts := v_attempts + 1;
      if v_attempts >= 5 then raise exception 'Nie udało się utworzyć kodu zaproszenia. Spróbuj ponownie.'; end if;
    end;
  end loop;

  insert into pod_members (pod_id, user_id, consented_at, consent_version)
  values (v_pod.id, v_user, now(), 'team-activity-v1');
  return query select v_pod.id, v_pod.invite_code;
end;
$$;

create or replace function join_pod_by_invite(p_invite_code text, p_display_name text, p_avatar text, p_confirmed boolean)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_pod_id uuid;
  v_profile_name text := btrim(p_display_name);
  v_code text := translate(
    upper(regexp_replace(btrim(p_invite_code), '[^A-Za-z0-9]', '', 'g')),
    'OIL',
    '011'
  );
begin
  if v_user is null then raise exception 'Brak sesji.'; end if;
  if not p_confirmed then raise exception 'Potwierdź, co zobaczy Twoja ekipa.'; end if;
  if char_length(v_profile_name) not between 1 and 32 then raise exception 'Podaj nazwę widoczną dla ekipy (1–32 znaki).'; end if;
  if p_avatar not in ('🐻', '🦊', '🐯', '🐼', '🦁', '🐸', '🐙', '🦦', '🦄', '🏋️', '💪', '⚡') then raise exception 'Wybierz avatar z listy.'; end if;
  if v_code !~ '^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{8}$' then raise exception 'Wpisz pełny 8-znakowy kod zaproszenia.'; end if;

  select id into v_pod_id from pods where invite_code = v_code;
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

revoke all on function generate_pod_invite_code() from public;
