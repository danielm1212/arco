-- CLEANUP: usunięcie jednej porzuconej, pustej sesji na `lower-body-gym3`.
--
-- Sesja `fa5b83b0-d612-4fc2-8fea-a44dfc2d982c` została rozpoczęta 2026-07-19 i nigdy nie
-- zakończona: 7 wygenerowanych pozycji, zero zapisanych serii. Blokuje bramki „zero otwartych
-- sesji" w migracjach PLAN-C3 i PLAN-C4, więc musi zniknąć przed nimi — stąd timestamp
-- sprzed 20260728213337, a po ostatniej zastosowanej 20260727134500.
--
-- Usunięcie zlecone jawnie przez właściciela 2026-07-29. Kasujemy wyłącznie po znanym ID
-- i wyłącznie wtedy, gdy sesja nadal jest pusta i niezakończona — jeżeli ktoś w międzyczasie
-- cokolwiek w niej zapisał albo ją domknął, migracja przerywa zamiast niszczyć pracę.
--
-- `session_exercises` i `session_sets` znikają kaskadowo (on delete cascade w init_schema).

do $cleanup$
declare
  v_id constant uuid := 'fa5b83b0-d612-4fc2-8fea-a44dfc2d982c';
  v_serie integer;
begin
  if not exists (select 1 from public.sessions where id = v_id) then
    raise notice 'CLEANUP: sesja % nie istnieje, pomijam.', v_id;
    return;
  end if;

  if exists (select 1 from public.sessions where id = v_id and finished_at is not null) then
    raise exception using
      errcode = '55000',
      message = 'CLEANUP: sesja ' || v_id || ' jest zakończona — nie usuwamy wykonanej pracy.';
  end if;

  select count(*) into v_serie
  from public.session_sets zestaw
  join public.session_exercises pozycja on pozycja.id = zestaw.session_exercise_id
  where pozycja.session_id = v_id;

  if v_serie > 0 then
    raise exception using
      errcode = '55000',
      message = 'CLEANUP: sesja ' || v_id || ' ma ' || v_serie
                || ' zapisanych serii — nie jest już pusta, przerywam.';
  end if;

  delete from public.sessions where id = v_id;

  raise notice 'CLEANUP: usunięto porzuconą pustą sesję %.', v_id;
end
$cleanup$;
