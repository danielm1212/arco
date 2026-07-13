-- S11: własna kopia publicznych zdjęć ćwiczeń, bez zależności od GitHuba upstream.
-- Bucket jest publiczny tylko do odczytu po URL. Zapis wykonuje wyłącznie
-- kontrolowany skrypt z service-role, dlatego nie dodajemy polityk INSERT/UPDATE.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'exercise-images',
  'exercise-images',
  true,
  5242880,
  array['image/jpeg']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
