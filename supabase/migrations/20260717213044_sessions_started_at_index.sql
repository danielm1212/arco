-- Audyt kodu 2026-07, P1.4 (wydajność): wszystkie gorące trasy (home, historia,
-- postępy, strona ćwiczenia) filtrują i sortują sesje po started_at, a jedynym
-- indeksem złożonym było (user_id, date). Zysk rośnie ze stażem konta.
create index if not exists sessions_user_started_at_idx
  on public.sessions (user_id, started_at desc);
