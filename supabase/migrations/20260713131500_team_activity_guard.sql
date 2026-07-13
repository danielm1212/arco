-- Check-in Ekipy może powstać wyłącznie przez emit_workout_activity().
-- Klient nie ma prawa tworzyć własnych, wstecznych ani dowolnych zdarzeń.

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
      and mine.consented_at is not null
      and peer.user_id = p_user_id
      and peer.consented_at is not null
      and p_occurred_on >= greatest(mine.joined_at::date, peer.joined_at::date)
  );
$$;

drop policy "activity_events_insert_own" on activity_events;
revoke insert on activity_events from authenticated;
