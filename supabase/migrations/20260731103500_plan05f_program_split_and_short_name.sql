-- PLAN-05F: struktura podziału treningowego + nazwa prezentacyjna programu.
--
-- `split_key` to DANE STRUKTURALNE, nie etykieta. Zasila tag metody na karcie biblioteki
-- (FBW / Upper/Lower / Push/Pull/Legs / nacisk na dół) i odblokowuje filtr po metodzie
-- w R2.2. Do tej pory tę informację dawało się wyłącznie sparsować z `name` — parser
-- stringa był jedynym źródłem prawdy o metodzie, co jest długiem, nie rozwiązaniem.
--
-- `short_name` to treść: krótka nazwa prezentacyjna. Kanoniczne `name` zostaje bez zmian
-- (szczegół planu, historia, wyszukiwanie), więc żadna istniejąca ścieżka nie traci nazwy.
-- Obie kolumny są nullable — własne programy użytkownika ich nie mają i mieć nie muszą.

alter table public.programs
  add column if not exists split_key text,
  add column if not exists short_name text;

alter table public.programs
  drop constraint if exists programs_split_key_check;

alter table public.programs
  add constraint programs_split_key_check
    check (
      split_key is null
      or split_key in ('fbw', 'upper_lower', 'ppl', 'lower_body_focus')
    );

-- Backfill presetów. Guard na pusty stan wg `arco-migration` §2: na świeżej bazie CI
-- programy systemowe powstają dopiero w kroku seeda, więc update trafiłby w zero wierszy.
-- Seed (`scripts/seed.ts`) ustawia te same wartości — migracja i seed to dwie drogi do
-- tego samego stanu, nie dwa różne stany.
do $tag$
begin
  if not exists (
    select 1 from public.programs where user_id is null and slug is not null
  ) then
    raise notice 'Pomijam backfill PLAN-05F: brak programow systemowych (seed wejdzie pozniej).';
    return;
  end if;

  update public.programs as p
  set
    split_key = v.split_key,
    short_name = v.short_name
  from (values
    ('beginner-gym-fbw2',                'fbw',              'Spokojny start'),
    ('beginner-gym-fbw3',                'fbw',              'Poznaj sztangę'),
    ('beginner-home-fbw2',               'fbw',              'Start bez siłowni'),
    ('beginner-home-fbw3',               'fbw',              'Domowe podstawy'),
    ('beginner-bodyweight-fbw3',         'fbw',              'Ty i drążek'),
    ('lower-body-gym3',                  'lower_body_focus', 'Mocne nogi'),
    ('lower-body-home3',                 'lower_body_focus', 'Pośladki na hantlach'),
    ('intermediate-gym-fbw2',            'fbw',              'Mało czasu, pełny plan'),
    ('intermediate-home-fbw2',           'fbw',              'Hantle i kettle'),
    ('intermediate-bodyweight-fbw3',     'fbw',              'Siła bez ciężarów'),
    ('intermediate-gym-upper-lower4',    'upper_lower',      'Rozkręcamy objętość'),
    ('intermediate-home-upper-lower4',   'upper_lower',      'Cztery dni z hantlami'),
    ('advanced-home-upper-lower4',       'upper_lower',      'Siłownia w domu'),
    ('advanced-bodyweight-upper-lower4', 'upper_lower',      'Dźwignia i kontrola'),
    ('advanced-gym-ppl6',                'ppl',              'Pełen gaz')
  ) as v(slug, split_key, short_name)
  where p.slug = v.slug
    and p.user_id is null;
end
$tag$;

-- Bez zmiany RLS: `programs` ma politykę na całą tabelę, a obie kolumny opisują program
-- systemowy — nie odsłaniają niczego ponad to, co już było czytelne (precedens PLAN-05A).
