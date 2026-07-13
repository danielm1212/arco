-- Lokalny Postgres nie ma gen_random_bytes(), choć ma gen_random_uuid().
-- UUID bez myślników daje bezpieczny, 32-znakowy kod zaproszenia bez dodatkowego rozszerzenia.

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
  values (v_name, replace(gen_random_uuid()::text, '-', ''), v_user)
  returning * into v_pod;
  insert into pod_members (pod_id, user_id, consented_at, consent_version)
  values (v_pod.id, v_user, now(), 'team-activity-v1');
  return query select v_pod.id, v_pod.invite_code;
end;
$$;
