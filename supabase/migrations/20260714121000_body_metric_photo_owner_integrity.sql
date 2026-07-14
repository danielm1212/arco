-- Integralność własności: rekord galerii nie może wskazać pomiaru innego użytkownika.
-- Sama polityka RLS chroni odczyt, ale ten klucz blokuje również niepoprawne powiązanie danych.

alter table body_metrics
  add constraint body_metrics_id_user_id_key unique (id, user_id);

alter table body_metric_photos
  drop constraint body_metric_photos_body_metric_id_fkey,
  add constraint body_metric_photos_metric_owner_fkey
    foreign key (body_metric_id, user_id)
    references body_metrics (id, user_id)
    on delete cascade;
