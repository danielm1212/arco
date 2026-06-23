-- Arco — zdjęcia postępu przy pomiarach ciała. Prywatny bucket + RLS po folderze = user_id.

insert into storage.buckets (id, name, public)
values ('body-photos', 'body-photos', false)
on conflict (id) do nothing;

-- Dostęp tylko do własnego folderu (pierwszy segment ścieżki = auth.uid())
create policy "body_photos_select_own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'body-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "body_photos_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'body-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "body_photos_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'body-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Ścieżka zdjęcia powiązana z pomiarem
alter table body_metrics add column photo_path text;
