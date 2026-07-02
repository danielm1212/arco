-- Arco Sprint 6 — własne ćwiczenia usera (custom exercises).
-- Decyzja architektoniczna: nullable user_id na exercises (wzorzec jak programs),
-- NIE osobna tabela — session_exercises/program_day_slots/personal_records mają FK
-- do exercises.id; osobna tabela wymagałaby polimorficznych FK i UNION-ów wszędzie.
-- user_id null = seed (read-only) · user_id = auth.uid() = własne (pełny CRUD).

alter table exercises
  add column user_id uuid references auth.users (id) on delete cascade;

-- RLS: seed + własne widoczne; zapis tylko własnych.
drop policy "exercises_select_authenticated" on exercises;

create policy "exercises_select"
  on exercises for select to authenticated
  using (user_id is null or user_id = (select auth.uid()));

create policy "exercises_insert_own"
  on exercises for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "exercises_update_own"
  on exercises for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "exercises_delete_own"
  on exercises for delete to authenticated
  using (user_id = (select auth.uid()));

-- Zdjęcia własnych ćwiczeń: bucket PUBLICZNY (inaczej niż body-photos) —
-- exercises.images[] to pełne URL-e konsumowane wprost przez <img> w całej apce
-- (picker, swap, info-sheet); signed URLs wygasałyby w zapisanych wierszach.
-- Zdjęcie ćwiczenia nie jest daną wrażliwą (w przeciwieństwie do zdjęć sylwetki).
insert into storage.buckets (id, name, public)
values ('exercise-photos', 'exercise-photos', true)
on conflict (id) do nothing;

-- Zapis/kasowanie tylko we własnym folderze (pierwszy segment ścieżki = auth.uid()).
create policy "exercise_photos_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'exercise-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "exercise_photos_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'exercise-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
