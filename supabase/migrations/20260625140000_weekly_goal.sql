-- Arco: cel tygodniowy (liczba treningów / tydzień) — pod pętlę retencji.
alter table user_settings add column weekly_goal int not null default 2;
