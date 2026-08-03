-- Dwa jawne warianty okładki: 16:9 dla detalu (i przyszłego Home) oraz 1:1 dla list.
-- Własne programy pozostają bez obrazu i korzystają z istniejącego fallbacku.
alter table public.programs
  add column cover_thumbnail_url text;

comment on column public.programs.cover_image_url is
  'Okładka programu 16:9 używana w detalu; przygotowana także pod przyszły projekt Home.';

comment on column public.programs.cover_thumbnail_url is
  'Kwadratowa miniatura 1:1 używana na listach programów.';

do $program_covers$
declare
  matched_programs integer;
begin
  -- Na świeżej bazie migracje wykonują się przed seedem. Seed zapisuje te same URL-e później.
  if not exists (select 1 from public.programs where user_id is null) then
    raise notice 'Pomijam okładki programów: katalog systemowy jest jeszcze pusty.';
    return;
  end if;

  select count(*)
    into matched_programs
    from public.programs
   where user_id is null
     and slug = any (array[
       'beginner-gym-fbw2',
       'beginner-gym-fbw3',
       'beginner-home-fbw2',
       'beginner-home-fbw3',
       'lower-body-gym3',
       'lower-body-home3',
       'beginner-bodyweight-fbw3',
       'intermediate-bodyweight-fbw3',
       'intermediate-gym-upper-lower4',
       'intermediate-home-upper-lower4',
       'advanced-home-upper-lower4',
       'advanced-bodyweight-upper-lower4',
       'advanced-gym-ppl6',
       'intermediate-gym-fbw2',
       'intermediate-home-fbw2'
     ]);

  if matched_programs <> 15 then
    raise exception
      'Okładki programów: znaleziono % z 15 oczekiwanych systemowych slugów.',
      matched_programs;
  end if;

  update public.programs
     set cover_image_url = '/program-covers/' || slug || '.webp',
         cover_thumbnail_url = '/program-covers-square/' || slug || '.webp'
   where user_id is null
     and slug = any (array[
       'beginner-gym-fbw2',
       'beginner-gym-fbw3',
       'beginner-home-fbw2',
       'beginner-home-fbw3',
       'lower-body-gym3',
       'lower-body-home3',
       'beginner-bodyweight-fbw3',
       'intermediate-bodyweight-fbw3',
       'intermediate-gym-upper-lower4',
       'intermediate-home-upper-lower4',
       'advanced-home-upper-lower4',
       'advanced-bodyweight-upper-lower4',
       'advanced-gym-ppl6',
       'intermediate-gym-fbw2',
       'intermediate-home-fbw2'
     ]);
end
$program_covers$;
