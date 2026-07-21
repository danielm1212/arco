-- CONTENT-02: zatwierdzony tekst Chin-Up i wycofanie niejednoznacznych zdjęć.
-- Seed i punktowy sync czytają tę samą decyzję z exercise-content-reviews.json.
-- Programy, historia i już utworzone session_exercises pozostają bez zmian.

do $content02$
declare
  v_updated integer;
begin
  if not exists (select 1 from public.exercises) then
    raise notice 'CONTENT-02 pominięte: baza referencyjna jest jeszcze pusta.';
    return;
  end if;

  if not exists (
    select 1 from public.exercises where id = 'Chin-Up' and user_id is null
  ) then
    raise exception 'CONTENT-02: brak systemowego Chin-Up; przerywam punktową aktualizację.';
  end if;

  update public.exercises
  set hidden = false,
      content_blocked = false,
      images = array['/exercise-placeholder.svg']::text[],
      instructions = array[
        'Złap stabilny drążek podchwytem — dłonie skieruj do twarzy i ustaw na szerokość barków lub nieco węziej. Zawiśnij z napiętym brzuchem.',
        'Rozpocznij ruch łopatkami, a następnie prowadź łokcie w dół i przyciągaj klatkę w stronę drążka. Nie kołysz się i nie wyginaj dolnych pleców.',
        'Unieś brodę wyraźnie ponad drążek bez wyciągania głowy do przodu. Utrzymaj szyję neutralnie.',
        'Opuść ciało powoli do kontrolowanego wyprostu ramion — bez gwałtownego opadania.'
      ]::text[]
  where id = 'Chin-Up' and user_id is null;

  get diagnostics v_updated = row_count;
  if v_updated <> 1 then
    raise exception 'CONTENT-02: oczekiwano jednego systemowego Chin-Up, zaktualizowano %.', v_updated;
  end if;
end
$content02$;
