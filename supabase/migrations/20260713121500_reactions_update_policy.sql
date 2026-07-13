-- Reakcja jest pojedynczym sygnałem od jednej osoby; upsert pozwala zmienić emoji.
create policy "reactions_update_own" on reactions for update to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from activity_events e
      where e.id = activity_event_id and can_view_pod_activity(e.user_id, e.occurred_on)
    )
  );
