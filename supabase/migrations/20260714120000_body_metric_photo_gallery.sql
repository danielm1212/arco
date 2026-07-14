-- Arco — galeria maksymalnie dwóch zdjęć przy pomiarze ciała.
-- `body_metrics.photo_path` zostaje tymczasowo dla zgodności wstecznej; istniejące
-- zdjęcia przenosimy do pozycji 1, a nowy kod zapisuje wyłącznie relację poniżej.

create table body_metric_photos (
  id             uuid primary key default gen_random_uuid(),
  body_metric_id uuid not null references body_metrics (id) on delete cascade,
  user_id        uuid not null references auth.users (id) on delete cascade,
  path           text not null,
  position       smallint not null check (position between 1 and 2),
  created_at     timestamptz not null default now(),
  unique (body_metric_id, position),
  unique (path)
);

create index body_metric_photos_metric_position_idx
  on body_metric_photos (body_metric_id, position);
create index body_metric_photos_user_idx on body_metric_photos (user_id);

alter table body_metric_photos enable row level security;

create policy "body_metric_photos_own"
  on body_metric_photos for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update, delete on body_metric_photos to authenticated;
grant all on body_metric_photos to service_role;

-- Zachowaj wszystkie istniejące zdjęcia jako pierwsze zdjęcie pomiaru.
insert into body_metric_photos (body_metric_id, user_id, path, position)
select id, user_id, photo_path, 1
from body_metrics
where photo_path is not null
on conflict (path) do nothing;
