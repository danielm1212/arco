-- R4 audytu wyszukiwarki: wyszukiwanie niewrażliwe na polskie diakrytyki.
-- „lawka" ma znaleźć „ławkę", „zolnierskie" — „żołnierskie".
-- Lustrzana normalizacja po stronie klienta: normalizePolish() w lib/exerciseSearch.ts —
-- obie strony MUSZĄ mapować identycznie (ą→a, ć→c, ę→e, ł→l, ń→n, ó→o, ś→s, ź→z, ż→z).

-- 1. Schemat: znormalizowana nazwa PL jako kolumna generowana (translate jest immutable).
-- Mapujemy też wielkie litery jawnie — lower() w kolacji C nie obniża znaków spoza ASCII.
alter table public.exercises
  add column if not exists name_pl_norm text
  generated always as (
    translate(lower(name_pl), 'ąćęłńóśźżĄĆĘŁŃÓŚŹŻ', 'acelnoszzacelnoszz')
  ) stored;

comment on column public.exercises.name_pl_norm is
  'Nazwa PL bez diakrytyk do wyszukiwania (generowana). Mapowanie musi być zgodne z normalizePolish() w lib/exerciseSearch.ts.';

-- 2. Dane: dopisz do search_aliases warianty bez diakrytyk obok oryginałów
-- („żołnierskie" + „zolnierskie"). Idempotentne (unnest + distinct). Guard na pusty
-- stan wg wzorca 20260716141007 — na świeżej bazie CI aliasy wypełnia seed, który
-- sam dopisuje warianty (withNormalizedAliases w scripts/seed.ts).
do $tag$
begin
  if not exists (select 1 from public.exercises) then
    raise notice 'Pomijam warianty aliasów: baza referencyjna jest jeszcze pusta.';
    return;
  end if;

  update public.exercises
  set search_aliases = (
    select coalesce(array_agg(distinct v order by v), '{}')
    from unnest(
      search_aliases ||
      (
        select coalesce(array_agg(translate(a, 'ąćęłńóśźż', 'acelnoszz')), '{}')
        from unnest(search_aliases) a
        where translate(a, 'ąćęłńóśźż', 'acelnoszz') <> a
      )
    ) v
  )
  where exists (
    select 1 from unnest(search_aliases) a
    where translate(a, 'ąćęłńóśźż', 'acelnoszz') <> a
  );
end
$tag$;
