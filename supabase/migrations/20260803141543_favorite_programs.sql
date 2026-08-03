-- F2: prywatne skróty do całych planów. Para użytkownik–plan jest unikalna,
-- a RLS pozwala dodać wyłącznie plan systemowy albo własny plan użytkownika.

create table public.favorite_programs (
  user_id uuid not null
    references auth.users (id) on delete cascade,
  program_id uuid not null
    references public.programs (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, program_id)
);

create index favorite_programs_user_created_idx
  on public.favorite_programs (user_id, created_at desc);

alter table public.favorite_programs enable row level security;

create policy "favorite_programs_select_own"
  on public.favorite_programs
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.programs as program
      where program.id = program_id
        and (
          program.user_id is null
          or program.user_id = (select auth.uid())
        )
    )
  );

create policy "favorite_programs_insert_own_visible"
  on public.favorite_programs
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.programs as program
      where program.id = program_id
        and (
          program.user_id is null
          or program.user_id = (select auth.uid())
        )
    )
  );

create policy "favorite_programs_delete_own"
  on public.favorite_programs
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

grant select, insert, delete
  on public.favorite_programs
  to authenticated;

grant all
  on public.favorite_programs
  to service_role;

comment on table public.favorite_programs is
  'F2: prywatne ulubione plany użytkownika; cały plan, nie pojedynczy dzień.';
